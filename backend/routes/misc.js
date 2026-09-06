const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { saveJob, unsaveJob, getSavedJobs } = require('../controllers/savedJobController');
const Notification = require('../models/Notification');

// Saved Jobs
router.post('/saved-jobs/:jobId', protect, authorize('CANDIDATE'), saveJob);
router.delete('/saved-jobs/:jobId', protect, authorize('CANDIDATE'), unsaveJob);
router.get('/saved-jobs', protect, authorize('CANDIDATE'), getSavedJobs);

// Notifications
router.get('/notifications', protect, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
});

router.put('/notifications/:id/read', protect, async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.put('/notifications/read-all', protect, async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
