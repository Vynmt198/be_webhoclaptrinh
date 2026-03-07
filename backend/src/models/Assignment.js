const mongoose = require('mongoose');

/**
 * Assignment - UC21 Create Assessments, UC22 Grade Assignments
 * Bài tập cần instructor chấm điểm (khác với Quiz auto-grade)
 */
const assignmentSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            default: null,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        maxScore: {
            type: Number,
            default: 100,
        },
        dueDate: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

assignmentSchema.index({ courseId: 1 });
assignmentSchema.index({ lessonId: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
