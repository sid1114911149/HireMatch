const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Notification = require('../models/Notification');

// @route  GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, candidates, recruiters, totalJobs, activeJobs, totalApplications] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'CANDIDATE' }),
      User.countDocuments({ role: 'RECRUITER' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments(),
    ]);

    const selectedApps = await Application.countDocuments({ status: 'Selected' });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt');
    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5).select('title company status applicationsCount');

    // Monthly new users (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyUsers = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers, candidates, recruiters, totalJobs, activeJobs, totalApplications, selectedApps,
        placementRate: totalApplications > 0 ? Math.round((selectedApps / totalApplications) * 100) : 0,
      },
      recentUsers,
      recentJobs,
      monthlyUsers,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({ success: true, count: users.length, total, users });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/admin/users/:id/toggle
exports.toggleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/admin/jobs
exports.getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate('recruiterId', 'name company')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
};
