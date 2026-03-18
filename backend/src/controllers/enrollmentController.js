const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const mongoose = require('mongoose');

/**
 * @route GET /api/enrollments
 * @desc List current user's active enrollments with course details and progress
 */
exports.getMyEnrollments = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const enrollments = await Enrollment.find({ userId, status: 'active' })
            .populate('courseId')
            .sort({ updatedAt: -1 })
            .lean();

        if (enrollments.length === 0) {
            return res.status(200).json({
                success: true,
                data: { enrollments: [] },
            });
        }

        const courseIds = enrollments.map((e) => e.courseId?._id).filter(Boolean);
        if (courseIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: { enrollments: enrollments.map((e) => ({ ...e, progress: 0, completedLessons: 0, totalLessons: 0 })) },
            });
        }

        const [lessonCounts, progressCounts] = await Promise.all([
            Lesson.aggregate([
                { $match: { courseId: { $in: courseIds } } },
                { $group: { _id: '$courseId', total: { $sum: 1 } } },
            ]),
            Progress.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId), courseId: { $in: courseIds }, isCompleted: true } },
                { $group: { _id: '$courseId', completed: { $sum: 1 } } },
            ]),
        ]);

        const totalByCourse = Object.fromEntries(lessonCounts.map((l) => [l._id.toString(), l.total]));
        const completedByCourse = Object.fromEntries(progressCounts.map((p) => [p._id.toString(), p.completed]));

        const enrollmentsWithProgress = enrollments.map((e) => {
            const cid = e.courseId?._id?.toString();
            const totalLessons = totalByCourse[cid] ?? 0;
            const completedLessons = completedByCourse[cid] ?? 0;
            const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            return {
                ...e,
                progress,
                completedLessons,
                totalLessons,
            };
        });

        res.status(200).json({
            success: true,
            data: { enrollments: enrollmentsWithProgress },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route POST /api/enrollments/free
 * @desc Enroll current user into free courses (price = 0) without payment.
 * Body: { courseIds: string[] }
 */
exports.enrollFreeCourses = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { courseIds } = req.body || {};

        if (!Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({ success: false, message: 'courseIds is required (non-empty array).' });
        }

        const uniqueIds = Array.from(new Set(courseIds.map((x) => String(x)).filter(Boolean)));
        const courseObjIds = uniqueIds
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => new mongoose.Types.ObjectId(id));

        if (courseObjIds.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid courseIds provided.' });
        }

        const courses = await Course.find({
            _id: { $in: courseObjIds },
            status: 'active',
            price: 0,
        }).select('_id').lean();

        const freeCourseIds = new Set(courses.map((c) => c._id.toString()));

        const results = await Promise.all(
            courseObjIds.map(async (cid) => {
                const courseIdStr = cid.toString();
                if (!freeCourseIds.has(courseIdStr)) {
                    return { courseId: courseIdStr, ok: false, reason: 'not_free_or_not_active' };
                }

                // Upsert enrollment: if exists, set to active; if new, create active and increment count.
                const existing = await Enrollment.findOne({ userId, courseId: cid }).select('_id status').lean();
                if (!existing) {
                    await Enrollment.create({ userId, courseId: cid, status: 'active' });
                    await Course.findByIdAndUpdate(cid, { $inc: { enrollmentCount: 1 } });
                    return { courseId: courseIdStr, ok: true, action: 'created' };
                }

                if (existing.status === 'active') {
                    return { courseId: courseIdStr, ok: true, action: 'already_active' };
                }

                await Enrollment.updateOne({ _id: existing._id }, { $set: { status: 'active' } });
                return { courseId: courseIdStr, ok: true, action: 'reactivated' };
            })
        );

        return res.status(200).json({
            success: true,
            data: {
                results,
            },
        });
    } catch (error) {
        next(error);
    }
};
