const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const auth = require('../middleware/auth');
const isEnrolled = require('../middleware/isEnrolled');

// Lesson content (Mounted at /api/lessons)
router.get('/:id/content', auth, isEnrolled, learningController.getLessonContent);

module.exports = router;
