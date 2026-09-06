const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStats, getUsers, toggleUser, getAllJobs } = require('../controllers/adminController');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUser);
router.get('/jobs', getAllJobs);

module.exports = router;
