const crypto = require('crypto');
const querystring = require('querystring');
const vnpayConfig = require('../config/vnpay');

class VNPayService {
    sortObject(obj) {
        const sorted = {};
        const keys = Object.keys(obj).sort();
        keys.forEach(key => {
            sorted[key] = obj[key];
        });
        return sorted;
    }

    createPaymentUrl(orderId, amount, orderInfo, ipAddr, bankCode = '') {
        const date = new Date();
        const createDate = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
        
        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: vnpayConfig.vnp_TmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
        };

        if (bankCode) {
            vnp_Params.vnp_BankCode = bankCode;
        }

        vnp_Params = this.sortObject(vnp_Params);

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params.vnp_SecureHash = signed;

        return vnpayConfig.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });
    }

    verifyReturnUrl(vnp_Params) {
        const secureHash = vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHashType;

        const sortedParams = this.sortObject(vnp_Params);
        const signData = querystring.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        return secureHash === signed;
    }

    async queryTransaction(orderId, transDate) {
        const date = new Date();
        const requestId = date.getTime().toString();
        const createDate = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

        const data = {
            vnp_RequestId: requestId,
            vnp_Version: '2.1.0',
            vnp_Command: 'querydr',
            vnp_TmnCode: vnpayConfig.vnp_TmnCode,
            vnp_TxnRef: orderId,
            vnp_OrderInfo: 'Query transaction ' + orderId,
            vnp_TransactionDate: transDate,
            vnp_CreateDate: createDate,
            vnp_IpAddr: '127.0.0.1',
        };

        const sortedData = this.sortObject(data);
        const signData = querystring.stringify(sortedData, { encode: false });
        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        return {
            ...data,
            vnp_SecureHash: signed,
        };
    }
}

module.exports = new VNPayService();
