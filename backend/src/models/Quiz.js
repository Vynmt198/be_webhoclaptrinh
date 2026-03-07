const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    questions: [{
        questionText: String,
        type: {
            type: String,
            enum: ['multiple-choice', 'true-false', 'coding'],
            required: true,
        },
        options: [String],
        correctAnswer: mongoose.Schema.Types.Mixed,
        explanation: String,
        points: {
            type: Number,
            default: 1,
        }
    }],
    passingScore: {
        type: Number,
        required: true,
        default: 80, // %
    },
    timeLimit: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Quiz', quizSchema);
