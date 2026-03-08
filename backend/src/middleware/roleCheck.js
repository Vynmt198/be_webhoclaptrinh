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

/**
 * Check if user is owner of course (instructor) or admin
 */
const isCourseOwner = (idParam = 'id') => {
    return async (req, res, next) => {
        try {
            const Course = require('../models/Course');
            const courseId = req.params[idParam];
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ success: false, message: 'Course not found.' });
            }
            const isOwner = course.instructorId.toString() === req.user._id.toString();
            const isAdminUser = req.user.role === 'admin';
            if (!isOwner && !isAdminUser) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only manage your own courses.',
                });
            }
            req.course = course;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Check if user is owner of the lesson's course
 */
const isLessonOwner = async (req, res, next) => {
    try {
        const Lesson = require('../models/Lesson');
        const Course = require('../models/Course');
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found.' });
        }
        const course = await Course.findById(lesson.courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }
        const instructorIdStr = course.instructorId?.toString?.() ?? String(course.instructorId);
        const userIdStr = req.user?._id?.toString?.() ?? String(req.user?._id);
        const isOwner = instructorIdStr === userIdStr;
        const isAdminUser = req.user.role === 'admin';
        if (!isOwner && !isAdminUser) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only manage lessons in your own courses.',
            });
        }
        req.lesson = lesson;
        req.course = course;
        next();
    } catch (error) {
        next(error);
    }
};

/** Same as isLessonOwner but use req.params[paramName] as lesson id (e.g. lessonId) */
const isLessonOwnerParam = (paramName = 'lessonId') => {
    return async (req, res, next) => {
        try {
            const Lesson = require('../models/Lesson');
            const Course = require('../models/Course');
            const lessonId = req.params[paramName];
            if (!lessonId) return res.status(400).json({ success: false, message: 'Lesson ID required.' });
            const lesson = await Lesson.findById(lessonId);
            if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });
            const course = await Course.findById(lesson.courseId);
            if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
            const instructorIdStr = course.instructorId?.toString?.() ?? String(course.instructorId);
            const userIdStr = req.user?._id?.toString?.() ?? String(req.user?._id);
            if (instructorIdStr !== userIdStr && req.user?.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only manage lessons in your own courses.',
                });
            }
            req.lesson = lesson;
            req.course = course;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/** Check if user is owner of the quiz's lesson's course (for instructor quiz management) */
const isQuizOwner = (quizIdParam = 'quizId') => {
    return async (req, res, next) => {
        try {
            const Quiz = require('../models/Quiz');
            const Lesson = require('../models/Lesson');
            const Course = require('../models/Course');
            const quiz = await Quiz.findById(req.params[quizIdParam]);
            if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
            const lesson = await Lesson.findById(quiz.lessonId);
            if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });
            const course = await Course.findById(lesson.courseId);
            if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
            const instructorIdStr = course.instructorId?.toString?.() ?? String(course.instructorId);
            const userIdStr = req.user?._id?.toString?.() ?? String(req.user?._id);
            if (instructorIdStr !== userIdStr && req.user?.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Access denied.' });
            }
            req.quiz = quiz;
            next();
        } catch (error) {
            next(error);
        }
    };
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

module.exports = {
    isAdmin,
    isInstructor,
    requireRole,
    isEnrolled,
    isCourseOwner,
    isLessonOwner,
    isLessonOwnerParam,
    isQuizOwner,
    isReviewOwner,
    isReviewOwnerOrAdmin,
};
