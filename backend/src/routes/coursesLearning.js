const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const auth = require('../middleware/auth');
const isEnrolled = require('../middleware/isEnrolled');

// Course learning data (Mounted at /api/courses)
router.get('/:id/learn', auth, isEnrolled, learningController.getCourseLearningData);

module.exports = router;
