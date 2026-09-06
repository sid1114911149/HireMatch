const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// @route  POST /api/saved-jobs/:jobId
exports.saveJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const existing = await SavedJob.findOne({ userId: req.user._id, jobId: req.params.jobId });
    if (existing) return res.status(400).json({ success: false, message: 'Job already saved' });

    await SavedJob.create({ userId: req.user._id, jobId: req.params.jobId });
    res.status(201).json({ success: true, message: 'Job saved' });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/saved-jobs/:jobId
exports.unsaveJob = async (req, res, next) => {
  try {
    await SavedJob.findOneAndDelete({ userId: req.user._id, jobId: req.params.jobId });
    res.status(200).json({ success: true, message: 'Job removed from saved' });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/saved-jobs
exports.getSavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ userId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: saved.length, savedJobs: saved });
  } catch (err) {
    next(err);
  }
};
