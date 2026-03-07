const mongoose = require('mongoose');

exports.validateCreatePayment = (req, res, next) => {
    const { amount, courseId } = req.body;

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

    next();
};
