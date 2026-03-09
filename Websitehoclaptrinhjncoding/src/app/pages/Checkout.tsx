import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wallet, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { paymentApi } from '@/app/lib/api';
import { toast } from 'sonner';

export function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalPrice } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const total = getTotalPrice();
  const discount = Math.round(total * 0.1);
  const finalTotal = total - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    console.log("Submit clicked. Processing VNPay redirect");

    try {
      const courseIds = items.map(item => item.id);
      console.log("Calling paymentApi with:", { amount: finalTotal, courseIds });
      const res = await paymentApi.create({ amount: finalTotal, courseIds });
      console.log("paymentApi response:", res);
      if (res.success && res.data?.paymentUrl) {
        console.log("Redirecting to:", res.data.paymentUrl);
        window.location.href = res.data.paymentUrl;
        return;
      } else {
        console.error("Payment API returned success but no paymentUrl", res);
        toast.error('Lỗi khi thanh toán: Không nhận được URL thanh toán');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || 'Lỗi khi thanh toán');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại giỏ hàng</span>
          </button>

          <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Information Banner */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center h-[calc(100%-1.5rem)]">
                <Wallet className="w-20 h-20 text-blue-500 mb-6" />
                <h2 className="text-2xl font-bold mb-4">Thanh toán qua VNPay</h2>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Bạn sẽ được chuyển hướng an toàn tới cổng thanh toán VNPay.
                  Hỗ trợ thanh toán qua quét mã QR, thẻ ATM nội địa, và các ví điện tử.
                </p>

                <div className="mt-8 flex gap-4 items-center justify-center opacity-60">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Bảo mật</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Nhanh chóng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Đơn hàng</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-12 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                        <p className="text-sm text-primary font-semibold">
                          {item.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tạm tính</span>
                    <span>{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Giảm giá</span>
                    <span className="text-green-500">-{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{finalTotal.toLocaleString('vi-VN')}đ</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 btn-shine border-2 border-blue-500/20 hover:scale-[1.02] active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Hoàn tất thanh toán</span>
                    </>
                  )}
                </button>

                <p className="mt-4 text-xs text-center text-muted-foreground">
                  Bằng việc thanh toán, bạn đồng ý với điều khoản sử dụng
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}