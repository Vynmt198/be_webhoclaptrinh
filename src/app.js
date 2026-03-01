require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const reviewRoutes = require('./routes/reviews');
const coursesLearningRoutes = require('./routes/coursesLearning');
const lessonsLearningRoutes = require('./routes/lessonsLearning');
const progressRoutes = require('./routes/progress');
const quizzesRoutes = require('./routes/quizzes');
const instructorRoutes = require('./routes/instructor');
const { getCourseReviews } = require('./controllers/reviewController');

const app = express();

connectDB();

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(passport.initialize());


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/courses', coursesLearningRoutes);
app.use('/api/lessons', lessonsLearningRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/instructor', instructorRoutes);
app.get('/api/courses/:id/reviews', getCourseReviews);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'OPLW API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found.`,
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[Server] OPLW API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;
