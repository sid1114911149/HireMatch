const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobs, getJob, createJob, updateJob, deleteJob, getRecruiterJobs,
} = require('../controllers/jobController');

router.get('/', getJobs);
router.get('/recruiter/my-jobs', protect, authorize('RECRUITER'), getRecruiterJobs);
router.get('/:id', getJob);
router.post('/', protect, authorize('RECRUITER', 'ADMIN'), createJob);
router.put('/:id', protect, authorize('RECRUITER', 'ADMIN'), updateJob);
router.delete('/:id', protect, authorize('RECRUITER', 'ADMIN'), deleteJob);

module.exports = router;
