const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Progress = require('../models/Progress');

/** Kiểm tra học viên đã hoàn thành bài học (lesson) chứa quiz chưa. Chỉ khi hoàn thành mới được làm quiz. */
const canAttemptQuiz = async (userId, lessonId) => {
    const progress = await Progress.findOne({
        userId,
        lessonId,
        isCompleted: true,
    });
    return !!progress;
};

/**
 * @route GET /api/quizzes/:id
 * @desc Get quiz questions (chỉ khi đã hoàn thành bài học chứa quiz)
 */
exports.getQuiz = async (req, res, next) => {
    try {
        const quizId = req.params.id;
        const userId = req.user._id;

        const quiz = await Quiz.findById(quizId).select('-questions.correctAnswer -questions.explanation');
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        const allowed = await canAttemptQuiz(userId, quiz.lessonId);
        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: 'Bạn cần hoàn thành bài học trước khi làm quiz.',
            });
        }

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route POST /api/quizzes/:id/attempt
 * @desc Submit quiz attempt (chỉ khi đã hoàn thành bài học; có thể làm lại nhiều lần)
 */
exports.submitAttempt = async (req, res, next) => {
    try {
        const quizId = req.params.id;
        const userId = req.user._id;
        const { answers, timeSpent } = req.body; // answers is an array corresponding to questions

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        const allowed = await canAttemptQuiz(userId, quiz.lessonId);
        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: 'Bạn cần hoàn thành bài học trước khi làm quiz.',
            });
        }

        let totalScore = 0;
        let maxScore = 0;

        // Calculate score
        quiz.questions.forEach((q, index) => {
            maxScore += q.points;
            const submittedAnswer = answers[index];

            // Basic equality check. For complex types or multiple-choice arrays, 
            // a deeper comparison might be needed.
            // Converting to string for simple comparison in this generic implementation.
            if (submittedAnswer !== undefined &&
                String(submittedAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
                totalScore += q.points;
            }
        });

        const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        const isPassed = scorePercentage >= quiz.passingScore;

        const attempt = await QuizAttempt.create({
            userId: req.user._id,
            quizId,
            answers,
            score: scorePercentage,
            isPassed,
            submittedAt: new Date(),
            timeSpent: timeSpent || 0
        });

        res.status(200).json({
            success: true,
            data: {
                attemptId: attempt._id,
                score: scorePercentage,
                isPassed,
                timeSpent: attempt.timeSpent
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route GET /api/quizzes/:id/results
 * @desc Get quiz results including correct answers and user's score
 */
exports.getQuizResults = async (req, res, next) => {
    try {
        const attemptId = req.params.id; // Using attempt ID to get specific result

        const attempt = await QuizAttempt.findById(attemptId).populate('quizId');
        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Quiz attempt not found' });
        }

        if (attempt.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this result' });
        }

        res.status(200).json({
            success: true,
            data: attempt
        });
    } catch (error) {
        next(error);
    }
};
