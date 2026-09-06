const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Notification = require('../models/Notification');

// @route  POST /api/applications
exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId, resumeId, coverLetter } = req.body;

    const [job, resume] = await Promise.all([
      Job.findById(jobId),
      Resume.findOne({ _id: resumeId, userId: req.user._id }),
    ]);

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    const existing = await Application.findOne({ candidateId: req.user._id, jobId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied to this job' });
    }

    const application = await Application.create({
      candidateId: req.user._id,
      jobId,
      resumeId,
      coverLetter,
      timeline: [{ status: 'Applied', note: 'Application submitted', updatedBy: req.user._id }],
    });

    // Increment job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    // Notify recruiter
    await Notification.create({
      userId: job.recruiterId,
      type: 'application_status',
      title: 'New Application',
      message: `${req.user.name} applied for ${job.title}`,
      link: `/recruiter/applications`,
    });

    const populated = await application.populate([
      { path: 'jobId', select: 'title company location type' },
      { path: 'resumeId', select: 'originalName score' },
    ]);

    res.status(201).json({ success: true, application: populated });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/applications (candidate gets own, recruiter gets by job)
exports.getApplications = async (req, res, next) => {
  try {
    const { jobId, status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (req.user.role === 'CANDIDATE') {
      query.candidateId = req.user._id;
    } else if (req.user.role === 'RECRUITER') {
      // Get jobs that belong to this recruiter
      const recruiterJobs = await Job.find({ recruiterId: req.user._id }).select('_id');
      query.jobId = { $in: recruiterJobs.map(j => j._id) };
      if (jobId) query.jobId = jobId;
    }

    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('jobId', 'title company location type')
        .populate('candidateId', 'name email avatar profile')
        .populate('resumeId', 'originalName score parsedData')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Application.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/applications/:id/status
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Only recruiter of the job or admin can update
    const job = application.jobId;
    if (
      req.user.role === 'RECRUITER' &&
      job.recruiterId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    application.timeline.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id,
    });

    await application.save();

    // Notify candidate
    await Notification.create({
      userId: application.candidateId,
      type: 'application_status',
      title: 'Application Update',
      message: `Your application for ${job.title} at ${job.company} is now: ${status}`,
      link: `/candidate/applications`,
    });

    res.status(200).json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/applications/:id
exports.getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('candidateId', 'name email avatar profile')
      .populate('resumeId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ success: true, application });
  } catch (err) {
    next(err);
  }
};
