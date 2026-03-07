import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CreditCard, Building2, Wallet, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';

type PaymentMethod = 'credit-card' | 'bank-transfer' | 'e-wallet';

export function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);

  const total = getTotalPrice();
  const discount = Math.round(total * 0.1);
  const finalTotal = total - discount;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    bankName: '',
    accountNumber: '',
    walletPhone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    clearCart();
    navigate('/order-success');
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
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Thông tin liên hệ</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Họ và tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Phương thức thanh toán</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit-card')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'credit-card'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <CreditCard className={`w-8 h-8 mx-auto mb-2 ${
                      paymentMethod === 'credit-card' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <p className="text-sm font-medium">Thẻ tín dụng</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank-transfer')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'bank-transfer'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Building2 className={`w-8 h-8 mx-auto mb-2 ${
                      paymentMethod === 'bank-transfer' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <p className="text-sm font-medium">Chuyển khoản</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('e-wallet')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'e-wallet'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Wallet className={`w-8 h-8 mx-auto mb-2 ${
                      paymentMethod === 'e-wallet' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <p className="text-sm font-medium">Ví điện tử</p>
                  </button>
                </div>

                {/* Payment Details */}
                {paymentMethod === 'credit-card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Số thẻ</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Ngày hết hạn</label>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV</label>
                        <input
                          type="text"
                          name="cardCVV"
                          value={formData.cardCVV}
                          onChange={handleChange}
                          placeholder="123"
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank-transfer' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ngân hàng</label>
                      <select
                        name="bankName"
                        value={formData.bankName}
                        onChange={(e: any) => handleChange(e)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      >
                        <option value="">Chọn ngân hàng</option>
                        <option value="vietcombank">Vietcombank</option>
                        <option value="techcombank">Techcombank</option>
                        <option value="vcb">VCB</option>
                        <option value="acb">ACB</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Số tài khoản</label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        placeholder="1234567890"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'e-wallet' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Số điện thoại ví</label>
                    <input
                      type="tel"
                      name="walletPhone"
                      value={formData.walletPhone}
                      onChange={handleChange}
                      placeholder="0123456789"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Hỗ trợ: MoMo, ZaloPay, VNPay
                    </p>
                  </div>
                )}
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