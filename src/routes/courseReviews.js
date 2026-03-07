/**
 * ============================================================
 * COURSE REVIEWS ROUTE - Module 5 (Reviews & Ratings)
 * ============================================================
 * 
 * NOTE FOR MERGE: Khi module Course (Module 2) được triển khai:
 * 1. Move endpoint GET /:id/reviews vào file routes/courses.js
 * 2. Xóa file này (courseReviews.js)
 * 3. Xóa import courseReviewRoutes trong app.js
 * 4. Xóa dòng: app.use('/api/courses', courseReviewRoutes);
 * 
 * ============================================================
 */

const express = require('express');
const router = express.Router();

const { getCourseReviews } = require('../controllers/reviewController');

/**
 * @swagger
 * /api/courses/{id}/reviews:
 *   get:
 *     summary: Get all reviews for a course
 *     description: Public endpoint to get paginated reviews with sorting options.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ObjectId
 *         example: "507f1f77bcf86cd799439013"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reviews per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, highest, lowest]
 *           default: newest
 *         description: Sort order for reviews
 *     responses:
 *       200:
 *         description: List of reviews for the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Server error
 */
router.get('/:id/reviews', getCourseReviews);

module.exports = router;
