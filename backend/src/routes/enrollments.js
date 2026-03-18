const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');

router.get('/', auth, enrollmentController.getMyEnrollments);
router.post('/free', auth, enrollmentController.enrollFreeCourses);

module.exports = router;
