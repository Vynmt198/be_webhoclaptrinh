const mongoose = require('mongoose');

exports.validateCreatePayment = (req, res, next) => {
    const { amount, courseId, courseIds } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Amount must be a positive number',
        });
    }

    if (courseId && !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid courseId format',
        });
    }

    if (courseIds !== undefined) {
        if (!Array.isArray(courseIds)) {
            return res.status(400).json({
                success: false,
                message: 'courseIds must be an array',
            });
        }
        const invalid = courseIds.some((id) => !mongoose.Types.ObjectId.isValid(id));
        if (invalid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid courseId in courseIds',
            });
        }
    }

    next();
};
