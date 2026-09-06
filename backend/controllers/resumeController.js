const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');

// Simple text extraction from file (reads raw file)
const extractTextFromFile = (filePath, fileType) => {
  try {
    const buffer = fs.readFileSync(filePath);
    // For txt files, read directly
    if (fileType === 'text/plain') {
      return buffer.toString('utf-8');
    }
    // For PDF/DOCX we return a placeholder - in production use pdf-parse / mammoth
    return buffer.toString('utf-8', 0, Math.min(buffer.length, 5000));
  } catch {
    return '';
  }
};

// Basic skill extraction from text
const extractSkills = (text) => {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
    'Git', 'CI/CD', 'REST API', 'GraphQL',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'SASS',
    'Agile', 'Scrum', 'Jira', 'Linux', 'Bash',
  ];

  const textLower = text.toLowerCase();
  return commonSkills.filter(skill => textLower.includes(skill.toLowerCase()));
};

// Score resume based on parsed data
const calculateResumeScore = (parsedData) => {
  let skillsScore = Math.min((parsedData.skills?.length || 0) * 5, 100);
  let experienceScore = Math.min((parsedData.experience?.length || 0) * 20, 100);
  let projectsScore = Math.min((parsedData.projects?.length || 0) * 20, 100);
  let educationScore = (parsedData.education?.length || 0) > 0 ? 100 : 0;
  let completeness = 0;
  if (parsedData.name) completeness += 20;
  if (parsedData.email) completeness += 20;
  if (parsedData.phone) completeness += 20;
  if (parsedData.skills?.length > 0) completeness += 20;
  if (parsedData.education?.length > 0) completeness += 20;

  const overall = Math.round(
    skillsScore * 0.3 + experienceScore * 0.25 + projectsScore * 0.2 +
    educationScore * 0.15 + completeness * 0.1
  );

  const suggestions = [];
  if ((parsedData.skills?.length || 0) < 5) suggestions.push('Add more skills to improve visibility');
  if ((parsedData.experience?.length || 0) === 0) suggestions.push('Add work experience or internships');
  if ((parsedData.projects?.length || 0) === 0) suggestions.push('Include personal or academic projects');
  if ((parsedData.education?.length || 0) === 0) suggestions.push('Add your education details');

  return {
    score: { overall, skills: skillsScore, experience: experienceScore, projects: projectsScore, education: educationScore, completeness },
    suggestions,
  };
};

// @route  POST /api/resumes/upload
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const extractedText = extractTextFromFile(req.file.path, req.file.mimetype);
    const skills = extractSkills(extractedText);

    const parsedData = {
      name: req.user.name,
      email: req.user.email,
      phone: '',
      skills,
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      totalExperience: 0,
    };

    const { score, suggestions } = calculateResumeScore(parsedData);

    const resume = await Resume.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText,
      parsedData,
      score,
      suggestions,
      isAnalyzed: true,
    });

    res.status(201).json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/resumes
exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: resumes.length, resumes });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/resumes/:id
exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.status(200).json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/resumes/:id
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Delete file from disk
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await resume.deleteOne();
    res.status(200).json({ success: true, message: 'Resume deleted' });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/resumes/:id/analyze
exports.analyzeResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const { score, suggestions } = calculateResumeScore(resume.parsedData);
    resume.score = score;
    resume.suggestions = suggestions;
    resume.isAnalyzed = true;
    await resume.save();

    res.status(200).json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};
