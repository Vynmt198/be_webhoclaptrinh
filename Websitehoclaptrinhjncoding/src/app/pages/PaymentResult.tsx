import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SuccessPage from './payment_result/Success';
import FailPage from './payment_result/Fail';
import ErrorPage from './payment_result/Error';
import InvalidPage from './payment_result/Invalid';

const BASE_URL = 'http://localhost:3000/api';

export function PaymentResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [responseCode, setResponseCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaymentResult = async () => {
            try {
                // Lấy tất cả query params từ URL (VNPay sẽ trả về các params này)
                const queryString = window.location.search;
                
                // Kiểm tra xem có query params từ VNPay không (có vnp_ResponseCode)
                const hasVnpayParams = searchParams.has('vnp_ResponseCode');
                
                if (!queryString || queryString.length === 0 || !hasVnpayParams) {
                    // Nếu không có query params từ VNPay, kiểm tra xem có status trong URL không (fallback)
                    const status = searchParams.get('status');
                    if (status === 'success') {
                        setResponseCode('00');
                        setLoading(false);
                        return;
                    } else if (status === 'failed') {
                        setResponseCode('11');
                        setLoading(false);
                        return;
                    }
                    // Nếu không có gì, điều hướng về trang chủ
                    navigate('/');
                    return;
                }

                // Nếu có mã trả về của VNPay thì có thể hiển thị trạng thái ngay.
                // (Backend/API verify chữ ký là tốt nhất, nhưng UI không nên "fail" chỉ vì thiếu hash trên URL.)
                const vnpResponseCode = searchParams.get('vnp_ResponseCode');

                // VNPay return thường có vnp_SecureHash. Nếu thiếu, ta fallback dùng vnp_ResponseCode để hiển thị.
                const hasSecureHash = searchParams.has('vnp_SecureHash');
                if (!hasSecureHash) {
                    console.warn('[PaymentResult] Missing vnp_SecureHash in URL. Fallback to vnp_ResponseCode for UI.');
                    setResponseCode(vnpResponseCode || '97');
                    setLoading(false);
                    return;
                }

                // Gọi API để lấy kết quả thanh toán với query params từ VNPay
                // Tránh bị browser cache (ảnh của bạn đang hiện "from disk cache")
                const apiUrl = new URL(`${BASE_URL}/payments/vnpay-return-api${queryString}`);
                apiUrl.searchParams.set('_ts', Date.now().toString());

                const response = await fetch(apiUrl.toString(), {
                    method: 'GET',
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.responseCode) {
                    setResponseCode(data.responseCode);
                } else {
                    // Nếu không có responseCode, mặc định là lỗi
                    setResponseCode('97');
                }
            } catch (error) {
                console.error('Error fetching payment result:', error);
                setResponseCode('97'); // Lỗi khi gọi API
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentResult();
    }, [navigate, searchParams]);

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ 
                        width: 40, 
                        height: 40, 
                        border: "4px solid #f3f3f3",
                        borderTop: "4px solid #3498db",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 16px"
                    }}></div>
                    <p style={{ color: "#475569" }}>Đang xử lý kết quả thanh toán...</p>
                </div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Điều hướng theo responseCode
    // 00: Success
    // 24: Invalid
    // 97: Error
    // 11: Fail
    switch (responseCode) {
        case '00':
            return <SuccessPage />;
        case '24':
            return <InvalidPage />;
        case '97':
            return <ErrorPage />;
        case '11':
            return <FailPage />;
        default:
            // Mặc định là Fail cho các mã lỗi khác
            return <FailPage />;
    }
}
