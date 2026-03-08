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

    createPaymentUrl(orderId, amount, orderInfo, ipAddr) {
        const date = new Date();
        const createDate = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

        // Thêm 15 phút cho expire date (bắt buộc theo tài liệu VNPay)
        const expireDate = new Date(date.getTime() + 15 * 60 * 1000);
        const vnp_ExpireDate = expireDate.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: vnpayConfig.vnp_TmnCode,
            vnp_Amount: amount * 100,
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'other',
            vnp_Locale: 'vn',
            vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: vnp_ExpireDate,
        };

        vnp_Params = this.sortObject(vnp_Params);

        // Tạo chuỗi hash data theo chuẩn VNPay 2.1.0
        let signData = '';
        const sortedKeys = Object.keys(vnp_Params);
        sortedKeys.forEach((key, index) => {
            const value = vnp_Params[key];
            if (index > 0) {
                signData += '&';
            }
            signData += encodeURIComponent(key) + '=' + encodeURIComponent(value);
        });

        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params.vnp_SecureHash = signed;

        const paymentUrl = vnpayConfig.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: true });

        console.log('VNPay Parameters:', vnp_Params);
        console.log('Sign Data:', signData);
        console.log('Secure Hash:', signed);
        console.log('Payment URL:', paymentUrl);

        return paymentUrl;
    }

    verifyReturnUrl(vnp_Params) {
        const secureHash = vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHashType;

        const sortedParams = this.sortObject(vnp_Params);

        // Tạo chuỗi hash data theo chuẩn VNPay 2.1.0
        let signData = '';
        const sortedKeys = Object.keys(sortedParams);
        sortedKeys.forEach((key, index) => {
            const value = sortedParams[key];
            if (index > 0) {
                signData += '&';
            }
            signData += encodeURIComponent(key) + '=' + encodeURIComponent(value);
        });

        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        return secureHash === signed;
    }

    getPaymentStatus(responseCode) {
        const statusMap = {
            '00': 'Giao dịch thành công',
            '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
            '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
            '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
            '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
            '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
            '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
            '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
            '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
            '75': 'Ngân hàng thanh toán đang bảo trì',
            '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
            '99': 'Các lỗi khác',
        };

        return statusMap[responseCode] || 'Lỗi không xác định';
    }
}

module.exports = new VNPayService();
