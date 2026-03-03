const mongoose = require('mongoose');

/**
 * Certificate - UC17 View Certificate
 * BR16: Chỉ cấp khi hoàn thành 100% khóa học và pass assessments
 */
const certificateSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        certificateNo: {
            type: String,
            unique: true,
            required: true,
        },
        issuedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });
certificateSchema.index({ certificateNo: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
