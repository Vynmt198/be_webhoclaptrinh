/**
 * Role-based access control middleware (BR22)
 */

/**
 * Restrict access to admin users only
 */
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
    }
    next();
};

/**
 * Restrict access to instructors and admins
 */
const isInstructor = (req, res, next) => {
    if (!req.user || !['instructor', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Instructor privileges required.',
        });
    }
    next();
};

/**
 * Factory: allow access for specified roles
 * Usage: requireRole('admin', 'instructor')
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${roles.join(', ')}.`,
            });
        }
        next();
    };
};

/**
 * Check if user is enrolled in a course
 * Requires Enrollment model to be implemented
 */
const isEnrolled = (courseIdParam = 'courseId') => {
    return async (req, res, next) => {
        try {
            let Enrollment;
            try {
                Enrollment = require('../models/Enrollment');
            } catch (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Enrollment check is not available. Enrollment model is missing.',
                });
            }

            const courseId = req.params[courseIdParam] || req.body.courseId;
            const userId = req.user._id;

            const enrollment = await Enrollment.findOne({
                userId,
                courseId,
                status: 'active',
            });

            if (!enrollment) {
                return res.status(403).json({
                    success: false,
                    message: 'You must be enrolled in this course to access this resource.',
                });
            }

            req.enrollment = enrollment;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Check if user is the owner of a review
 * Requires id and userId fields to be populated in req
 */
const isReviewOwner = async (req, res, next) => {
    try {
        const Review = require('../models/Review');
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.',
            });
        }

        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only access your own review.',
            });
        }

        req.review = review;
        next();
    } catch (error) {
        next(error);
    }
};

const isReviewOwnerOrAdmin = async (req, res, next) => {
    try {
        const Review = require('../models/Review');
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.',
            });
        }

        const isOwnerUser = review.userId.toString() === req.user._id.toString();
        const isAdminUser = req.user.role === 'admin';

        if (!isOwnerUser && !isAdminUser) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Owner or admin privileges required.',
            });
        }

        req.review = review;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { isAdmin, isInstructor, requireRole, isEnrolled, isReviewOwner, isReviewOwnerOrAdmin };
