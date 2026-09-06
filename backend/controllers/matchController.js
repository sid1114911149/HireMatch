const axios = require('axios');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Match = require('../models/Match');

// Compute match score locally (fallback when ML service is down)
const computeMatchLocally = (resume, job) => {
  const resumeSkills = (resume.parsedData?.skills || []).map(s => s.toLowerCase());
  const requiredSkills = (job.requiredSkills || []).map(s => s.toLowerCase());
  const preferredSkills = (job.preferredSkills || []).map(s => s.toLowerCase());

  // Skill match
  const matchedRequired = requiredSkills.filter(s => resumeSkills.includes(s));
  const matchedPreferred = preferredSkills.filter(s => resumeSkills.includes(s));
  const missingRequired = requiredSkills.filter(s => !resumeSkills.includes(s));

  const skillScore = requiredSkills.length > 0
    ? Math.round((matchedRequired.length / requiredSkills.length) * 100)
    : 50;

  // Experience match
  const candidateExp = resume.parsedData?.totalExperience || 0;
  const expScore = candidateExp >= job.experienceMin ? 100 : Math.round((candidateExp / Math.max(job.experienceMin, 1)) * 100);

  // Education match (simple heuristic)
  const educationScore = resume.parsedData?.education?.length > 0 ? 85 : 50;

  // Text similarity (simple keyword overlap)
  const jdWords = new Set(job.description.toLowerCase().split(/\W+/));
  const resumeWords = new Set(resume.extractedText.toLowerCase().split(/\W+/));
  const intersection = [...jdWords].filter(w => resumeWords.has(w) && w.length > 3);
  const similarity = Math.min(Math.round((intersection.length / Math.max(jdWords.size, 1)) * 100), 100);

  const overall = Math.round(
    skillScore * 0.40 + expScore * 0.25 + educationScore * 0.15 + similarity * 0.20
  );

  const recommendation =
    overall >= 85 ? 'Excellent Match' :
    overall >= 70 ? 'Strong Match' :
    overall >= 55 ? 'Good Match' :
    overall >= 40 ? 'Partial Match' : 'Weak Match';

  const skillGap = missingRequired.slice(0, 8).map(skill => ({
    skill,
    priority: matchedRequired.length < 3 ? 'high' : 'medium',
    reason: `${skill} is listed as a required skill for this role`,
    learningDirection: `Study ${skill} through online courses, documentation, and hands-on projects`,
  }));

  return {
    scores: { overall, skills: skillScore, experience: expScore, education: educationScore, similarity },
    matchedSkills: matchedRequired.map(s => requiredSkills[requiredSkills.indexOf(s)] || s),
    missingSkills: missingRequired,
    preferredSkillsMatched: matchedPreferred,
    recommendation,
    skillGap,
  };
};

// @route  POST /api/matches/analyze
exports.analyzeMatch = async (req, res, next) => {
  try {
    const { jobId, resumeId } = req.body;

    const [job, resume] = await Promise.all([
      Job.findById(jobId),
      Resume.findOne({ _id: resumeId, userId: req.user._id }),
    ]);

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    let matchData;

    // Try ML service first
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/ml/analyze`,
        {
          resume_text: resume.extractedText,
          skills: resume.parsedData?.skills || [],
          experience_years: resume.parsedData?.totalExperience || 0,
          education: resume.parsedData?.education?.[0]?.degree || '',
          job_title: job.title,
          job_description: job.description,
          required_skills: job.requiredSkills,
          preferred_skills: job.preferredSkills,
          experience_min: job.experienceMin,
        },
        { timeout: 10000 }
      );
      matchData = mlResponse.data;
    } catch {
      // Fallback to local computation
      matchData = computeMatchLocally(resume, job);
    }

    // Upsert match document
    const match = await Match.findOneAndUpdate(
      { candidateId: req.user._id, jobId, resumeId },
      {
        candidateId: req.user._id,
        jobId,
        resumeId,
        ...matchData,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, match });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/matches/:jobId
exports.getMatch = async (req, res, next) => {
  try {
    const match = await Match.findOne({
      candidateId: req.user._id,
      jobId: req.params.jobId,
    }).populate('jobId', 'title company location type requiredSkills');

    if (!match) {
      return res.status(404).json({ success: false, message: 'No match analysis found for this job' });
    }

    res.status(200).json({ success: true, match });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/matches/all
exports.getAllMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({ candidateId: req.user._id })
      .populate('jobId', 'title company location type requiredSkills status')
      .sort({ 'scores.overall': -1 });

    res.status(200).json({ success: true, count: matches.length, matches });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id, isAnalyzed: true })
      .sort({ createdAt: -1 });

    if (!resume) {
      return res.status(200).json({
        success: true,
        message: 'Upload and analyze your resume to get recommendations',
        recommendations: [],
      });
    }

    // Find active jobs and compute match for top results
    const jobs = await Job.find({ status: 'active' }).limit(50);

    const scored = jobs.map(job => {
      const match = computeMatchLocally(resume, job);
      return { job, match };
    });

    // Sort by overall score
    scored.sort((a, b) => b.match.scores.overall - a.match.scores.overall);
    const top = scored.slice(0, 10);

    const recommendations = top.map(({ job, match }) => ({
      job: {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        requiredSkills: job.requiredSkills,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
      },
      matchScore: match.scores.overall,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills.slice(0, 3),
      recommendation: match.recommendation,
    }));

    res.status(200).json({ success: true, count: recommendations.length, recommendations });
  } catch (err) {
    next(err);
  }
};
