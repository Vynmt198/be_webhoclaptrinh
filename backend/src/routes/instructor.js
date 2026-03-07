const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Only instructor or admin can access instructor analytics
router.get('/courses/:id/analytics', auth, roleCheck.requireRole('instructor', 'admin'), instructorController.getCourseAnalytics);

module.exports = router;
