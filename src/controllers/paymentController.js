const Payment = require('../models/Payment');
const vnpayService = require('../services/vnpayService');
const vnpayBanks = require('../utils/vnpayBanks');

exports.getBankList = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: vnpayBanks,
        });
    } catch (error) {
        next(error);
    }
};

exports.createPayment = async (req, res, next) => {
    try {
        const { amount, orderInfo, bankCode } = req.body;
        const userId = req.user._id;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount',
            });
        }

        const orderId = `${Date.now()}_${userId}`;
        const ipAddr = req.headers['x-forwarded-for'] || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress || 
                       '127.0.0.1';

        const payment = await Payment.create({
            userId,
            orderId,
            amount,
            orderInfo: orderInfo || 'Payment for course',
            bankCode: bankCode || null,
        });

        const paymentUrl = vnpayService.createPaymentUrl(
            orderId,
            amount,
            orderInfo || 'Payment for course',
            ipAddr,
            bankCode
        );

        res.status(200).json({
            success: true,
            message: 'Payment URL created successfully',
            data: {
                paymentUrl,
                orderId,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.vnpayReturn = async (req, res, next) => {
    try {
        const vnp_Params = req.query;

        const isValid = vnpayService.verifyReturnUrl(vnp_Params);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature',
            });
        }

        const orderId = vnp_Params.vnp_TxnRef;
        const responseCode = vnp_Params.vnp_ResponseCode;

        const payment = await Payment.findOne({ orderId });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        payment.transactionNo = vnp_Params.vnp_TransactionNo;
        payment.bankCode = vnp_Params.vnp_BankCode;
        payment.cardType = vnp_Params.vnp_CardType;
        payment.vnpayData = vnp_Params;

        if (responseCode === '00') {
            payment.paymentStatus = 'success';
        } else {
            payment.paymentStatus = 'failed';
        }

        await payment.save();

        res.status(200).json({
            success: responseCode === '00',
            message: vnpayService.getPaymentStatus(responseCode),
            data: {
                orderId,
                amount: payment.amount,
                status: payment.paymentStatus,
                transactionNo: payment.transactionNo,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.vnpayIPN = async (req, res, next) => {
    try {
        const vnp_Params = req.query;

        const isValid = vnpayService.verifyReturnUrl(vnp_Params);

        if (!isValid) {
            return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
        }

        const orderId = vnp_Params.vnp_TxnRef;
        const payment = await Payment.findOne({ orderId });

        if (!payment) {
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }

        if (payment.amount !== parseInt(vnp_Params.vnp_Amount) / 100) {
            return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
        }

        if (payment.paymentStatus === 'success') {
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        const responseCode = vnp_Params.vnp_ResponseCode;

        if (responseCode === '00') {
            payment.paymentStatus = 'success';
            payment.transactionNo = vnp_Params.vnp_TransactionNo;
            payment.bankCode = vnp_Params.vnp_BankCode;
            payment.cardType = vnp_Params.vnp_CardType;
            payment.vnpayData = vnp_Params;
            await payment.save();

            return res.status(200).json({ RspCode: '00', Message: 'Success' });
        } else {
            payment.paymentStatus = 'failed';
            await payment.save();

            return res.status(200).json({ RspCode: '00', Message: 'Success' });
        }
    } catch (error) {
        console.error('VNPay IPN Error:', error);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

exports.getPaymentHistory = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;

        const query = { userId };
        if (status) {
            query.paymentStatus = status;
        }

        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-vnpayData');

        const count = await Payment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                payments,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.getPaymentDetail = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const payment = await Payment.findOne({ orderId, userId });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (error) {
        next(error);
    }
};


exports.getPaymentStats = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate } = req.query;

        const query = { userId };
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const stats = await Payment.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                },
            },
        ]);

        const total = await Payment.countDocuments(query);
        const totalAmount = await Payment.aggregate([
            { $match: { ...query, paymentStatus: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        res.status(200).json({
            success: true,
            data: {
                stats,
                total,
                totalSuccessAmount: totalAmount[0]?.total || 0,
            },
        });
    } catch (error) {
        next(error);
    }
};
