const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { applyToJob, getApplications, updateApplicationStatus, getApplication } = require('../controllers/applicationController');

router.use(protect);
router.post('/', applyToJob);
router.get('/', getApplications);
router.get('/:id', getApplication);
router.put('/:id/status', updateApplicationStatus);

module.exports = router;
