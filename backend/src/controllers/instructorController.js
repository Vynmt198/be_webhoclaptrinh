const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const mongoose = require('mongoose');

/**
 * @route GET /api/instructor/courses
 * @desc List courses of the current instructor
 */
exports.listMyCourses = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;
        const filter = { instructorId: req.user._id };
        if (status) filter.status = status;
        const [courses, total] = await Promise.all([
            Course.find(filter)
                .populate('categoryId', 'name slug')
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Course.countDocuments(filter),
        ]);
        return res.status(200).json({
            success: true,
            data: {
                courses,
                pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route GET /api/instructor/courses/:id/analytics
 * @desc Get course analytics for instructor (BR19 - instructors manage own courses)
 */
exports.getCourseAnalytics = async (req, res, next) => {
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Verify ownership
        if (course.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view analytics for this course' });
        }

        // Active enrollments
        const totalEnrollments = await Enrollment.countDocuments({ courseId, status: 'active' });

        // Total time spent by all learners
        const progressStats = await Progress.aggregate([
            { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
            {
                $group: {
                    _id: null,
                    totalTimeSpent: { $sum: '$timeSpent' },
                    completedLessons: {
                        $sum: { $cond: ['$isCompleted', 1, 0] }
                    }
                }
            }
        ]);

        const stats = progressStats.length > 0 ? progressStats[0] : { totalTimeSpent: 0, completedLessons: 0 };

        res.status(200).json({
            success: true,
            data: {
                totalEnrollments,
                totalTimeSpentSeconds: stats.totalTimeSpent,
                totalCompletedLessons: stats.completedLessons,
                courseId: course._id,
                courseTitle: course.title
            }
        });
    } catch (error) {
        next(error);
    }
};
