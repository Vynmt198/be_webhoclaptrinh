const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const lessonController = require('../controllers/lessonController');
const learningController = require('../controllers/learningController');
const { getCourseReviews } = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const { isCourseOwner, isInstructor } = require('../middleware/roleCheck');
const isEnrolled = require('../middleware/isEnrolled');

router.get('/', courseController.listCourses);
router.get('/search', courseController.searchCourses);
router.get('/autocomplete', courseController.autocomplete);
router.get('/:id', courseController.getCourseById);
router.get('/:id/curriculum', courseController.getCurriculum);
router.get('/:id/reviews', getCourseReviews);
router.get('/:id/learn', auth, isEnrolled, learningController.getCourseLearningData);
router.post('/', auth, isInstructor, courseController.createCourse);
router.put('/:id', auth, isCourseOwner('id'), courseController.updateCourse);
router.delete('/:id', auth, isCourseOwner('id'), courseController.deleteCourse);
router.post('/:id/lessons', auth, isCourseOwner('id'), lessonController.createLesson);

module.exports = router;
