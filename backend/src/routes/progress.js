const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Note: checking 'isEnrolled' might not be strictly necessary here if we just handle progress tracking,
// but it adds security. Our progress routes mostly take lessonId.
// For simplicity, we just use auth here as the controller fetches the lesson and checks things.

// Progress belongs to learners; instructors/admin can view course content but should not mutate learner progress.
router.post('/mark-complete', auth, roleCheck.requireRole('learner'), progressController.markLessonComplete);
router.put('/update-position', auth, roleCheck.requireRole('learner'), progressController.updateVideoPosition);
router.get('/monthly-time', auth, roleCheck.requireRole('learner'), progressController.getMonthlyTimeSpent);
router.get('/:courseId', auth, roleCheck.requireRole('learner'), progressController.getCourseProgress);

module.exports = router;
