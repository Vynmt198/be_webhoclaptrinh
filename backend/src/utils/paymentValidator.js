const { body, validationResult } = require('express-validator');

exports.validateCreatePayment = [
    body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom((value) => {
            if (value < 10000) {
                throw new Error('Amount must be at least 10,000 VND');
            }
            if (value > 500000000) {
                throw new Error('Amount must not exceed 500,000,000 VND');
            }
            return true;
        }),
    body('orderInfo')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Order info must not exceed 255 characters'),
    body('bankCode')
        .optional()
        .isString()
        .trim(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        next();
    },
];
