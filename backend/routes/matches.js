const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { analyzeMatch, getMatch, getAllMatches, getRecommendations } = require('../controllers/matchController');

router.use(protect);
router.post('/analyze', authorize('CANDIDATE'), analyzeMatch);
router.get('/all', authorize('CANDIDATE'), getAllMatches);
router.get('/recommendations', authorize('CANDIDATE'), getRecommendations);
router.get('/:jobId', authorize('CANDIDATE'), getMatch);

module.exports = router;
