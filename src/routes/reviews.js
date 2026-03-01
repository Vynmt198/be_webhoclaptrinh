const express = require('express');
const router = express.Router();

const {
    getUserReviewForCourse,
    createReview,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');

const auth = require('../middleware/auth');
const { isEnrolled, isReviewOwner, isReviewOwnerOrAdmin } = require('../middleware/roleCheck');
const { validateCreateReview, validateUpdateReview } = require('../utils/validators');

/**
 * @route   GET /api/reviews/my-review/:courseId
 * @desc    Get current user's review for a specific course
 * @access  Private (auth required)
 */
router.get('/my-review/:courseId', auth, getUserReviewForCourse);

/**
 * @route   POST /api/reviews
 * @desc    Create a new review (only enrolled learners)
 * @access  Private (auth, isEnrolled)
 */
router.post('/', auth, isEnrolled('courseId'), validateCreateReview, createReview);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review (only owner)
 * @access  Private (auth, isReviewOwner)
 */
router.put('/:id', auth, isReviewOwner, validateUpdateReview, updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review (owner or admin)
 * @access  Private (auth, isReviewOwnerOrAdmin)
 */
router.delete('/:id', auth, isReviewOwnerOrAdmin, deleteReview);

module.exports = router;