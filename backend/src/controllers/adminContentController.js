const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const Discussion = require('../models/Discussion');
const Review = require('../models/Review');

/**
 * @route GET /api/admin/content/lessons
 * @desc List lessons for admin moderation (with course + instructor + views)
 */
exports.listLessons = async (req, res, next) => {
    try {
        const { search = '', page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;

        const searchStr = String(search || '').trim();
        const titleMatch = searchStr ? { title: { $regex: searchStr, $options: 'i' } } : {};

        const pipeline = [
            { $match: titleMatch },
            { $sort: { updatedAt: -1 } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'course.instructorId',
                    foreignField: '_id',
                    as: 'instructor',
                },
            },
            { $unwind: { path: '$instructor', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'progresses',
                    let: { lid: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$lessonId', '$$lid'] } } },
                        { $group: { _id: null, views: { $addToSet: '$userId' } } },
                        { $project: { _id: 0, viewsCount: { $size: '$views' } } },
                    ],
                    as: 'viewsAgg',
                },
            },
            { $unwind: { path: '$viewsAgg', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    isHidden: { $ifNull: ['$isHidden', false] },
                    courseTitle: { $ifNull: ['$course.title', '—'] },
                    instructorName: { $ifNull: ['$instructor.fullName', '—'] },
                    views: { $ifNull: ['$viewsAgg.viewsCount', 0] },
                    updatedAt: 1,
                },
            },
            { $skip: skip },
            { $limit: limitNum },
        ];

        const countPipeline = [{ $match: titleMatch }, { $count: 'total' }];

        const [items, countResult] = await Promise.all([
            Lesson.aggregate(pipeline),
            Lesson.aggregate(countPipeline),
        ]);

        const total = countResult[0]?.total ?? 0;

        res.status(200).json({
            success: true,
            data: {
                lessons: items,
                pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route PATCH /api/admin/content/lessons/:id/visibility
 * @desc Toggle lesson visibility (isHidden)
 */
exports.toggleLessonVisibility = async (req, res, next) => {
    try {
        const lessonId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({ success: false, message: 'Invalid lesson id' });
        }

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

        lesson.isHidden = !lesson.isHidden;
        await lesson.save();

        res.status(200).json({
            success: true,
            data: { lessonId: lesson._id, isHidden: lesson.isHidden },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route GET /api/admin/content/comments
 * @desc List discussions (posts + replies) for admin moderation
 */
exports.listComments = async (req, res, next) => {
    try {
        const { search = '', page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;

        const searchStr = String(search || '').trim();
        const filter = { status: { $ne: 'deleted' } };
        if (searchStr) {
            filter.content = { $regex: searchStr, $options: 'i' };
        }

        const [items, total] = await Promise.all([
            Discussion.find(filter)
                .populate('userId', 'fullName')
                .populate('courseId', 'title')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Discussion.countDocuments(filter),
        ]);

        const comments = items.map((d) => ({
            _id: d._id,
            parentId: d.parentId ? d.parentId.toString() : null,
            user: d.userId?.fullName ?? '—',
            content: d.content,
            target: d.courseId?.title ?? '—',
            date: d.createdAt,
            status: d.status,
            isReply: Boolean(d.parentId),
            likesCount: d.likesCount ?? 0,
            repliesCount: d.repliesCount ?? 0,
        }));

        res.status(200).json({
            success: true,
            data: {
                comments,
                pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route DELETE /api/admin/content/comments/:id
 * @desc Soft-delete discussion (admin)
 */
exports.deleteComment = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid comment id' });
        }
        const discussion = await Discussion.findById(id);
        if (!discussion || discussion.status === 'deleted') {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }
        discussion.status = 'deleted';
        await discussion.save();

        // keep repliesCount consistent
        if (discussion.parentId) {
            await Discussion.findByIdAndUpdate(discussion.parentId, { $inc: { repliesCount: -1 } });
        }

        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) {
        next(error);
    }
};

/**
 * @route GET /api/admin/content/reviews
 * @desc List all course reviews (đánh giá khóa học) for admin
 */
exports.listReviews = async (req, res, next) => {
    try {
        const { search = '', page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;

        const searchStr = String(search || '').trim();
        const filter = {};
        if (searchStr) {
            filter.$or = [
                { reviewText: { $regex: searchStr, $options: 'i' } },
            ];
        }

        const [items, total] = await Promise.all([
            Review.find(filter)
                .populate('userId', 'fullName')
                .populate('courseId', 'title')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Review.countDocuments(filter),
        ]);

        const reviews = items.map((r) => ({
            _id: r._id,
            user: r.userId?.fullName ?? '—',
            courseTitle: r.courseId?.title ?? '—',
            courseId: r.courseId?._id ?? r.courseId,
            rating: r.rating,
            reviewText: r.reviewText ?? '',
            date: r.createdAt,
        }));

        res.status(200).json({
            success: true,
            data: {
                reviews,
                pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
            },
        });
    } catch (error) {
        next(error);
    }
};

