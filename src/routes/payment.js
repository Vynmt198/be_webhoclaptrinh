const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     summary: Tạo payment URL VNPay
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100000
 *               orderInfo:
 *                 type: string
 *                 example: "Thanh toán khóa học"
 *               bankCode:
 *                 type: string
 *                 example: "NCB"
 *     responses:
 *       200:
 *         description: Payment URL created successfully
 */
router.post('/create', auth, paymentController.createPayment);

/**
 * @swagger
 * /api/payment/vnpay-return:
 *   get:
 *     summary: VNPay return callback
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment result
 */
router.get('/vnpay-return', paymentController.vnpayReturn);

/**
 * @swagger
 * /api/payment/vnpay-ipn:
 *   get:
 *     summary: VNPay IPN callback
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: IPN processed
 */
router.get('/vnpay-ipn', paymentController.vnpayIPN);

/**
 * @swagger
 * /api/payment/history:
 *   get:
 *     summary: Lấy lịch sử thanh toán
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed, cancelled]
 *     responses:
 *       200:
 *         description: Payment history
 */
router.get('/history', auth, paymentController.getPaymentHistory);

/**
 * @swagger
 * /api/payment/{orderId}:
 *   get:
 *     summary: Lấy chi tiết thanh toán
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment detail
 */
router.get('/:orderId', auth, paymentController.getPaymentDetail);

module.exports = router;
