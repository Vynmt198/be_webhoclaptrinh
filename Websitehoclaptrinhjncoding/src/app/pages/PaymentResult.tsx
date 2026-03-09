import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';

export function PaymentResult() {
    const [searchParams] = useSearchParams();
    const { clearCart } = useCart();
    const [loading, setLoading] = useState(true);

    const status = searchParams.get('status');
    const amount = searchParams.get('amount');
    const orderId = searchParams.get('orderId');
    const message = searchParams.get('message');

    useEffect(() => {
        if (status === 'success') {
            clearCart();
        }
        // Simulate minor loading to ensure cart clear effect is registered before show
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [status, clearCart]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    const isSuccess = status === 'success';

    return (
        <div className="min-h-screen py-16 bg-muted/20 flex flex-col items-center justify-center px-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center shadow-lg"
            >
                {isSuccess ? (
                    <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                ) : (
                    <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                )}

                <h1 className="text-3xl font-bold mb-4">
                    {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
                </h1>

                <p className="text-muted-foreground mb-8">
                    {message || (isSuccess
                        ? 'Cảm ơn bạn đã mua khóa học. Bạn có thể bắt đầu học ngay bây giờ.'
                        : 'Giao dịch của bạn không thể hoàn thành hoặc đã bị hủy.')}
                </p>

                <div className="space-y-4 text-left border-t border-b border-border py-4 mb-8">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Mã đơn hàng:</span>
                        <span className="font-medium">{orderId || '-'}</span>
                    </div>
                    {amount && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Số tiền:</span>
                            <span className="font-medium">{parseInt(amount).toLocaleString('vi-VN')} đ</span>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {isSuccess ? (
                        <Link
                            to="/my-courses"
                            className="w-full py-4 bg-primary text-primary-foreground rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 hover:bg-primary/90"
                        >
                            Vào khóa học của tôi
                        </Link>
                    ) : (
                        <Link
                            to="/cart"
                            className="w-full py-4 bg-primary text-primary-foreground rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 hover:bg-primary/90"
                        >
                            Thử thanh toán lại
                        </Link>
                    )}

                    <Link
                        to="/courses"
                        className="w-full py-4 border border-border text-foreground hover:bg-muted rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Về danh sách khóa học
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
