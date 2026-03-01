const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        default: '',
    },
    videoUrl: {
        type: String,
        default: '',
    },
    order: {
        type: Number,
        required: true,
        default: 1,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Lesson', lessonSchema);
