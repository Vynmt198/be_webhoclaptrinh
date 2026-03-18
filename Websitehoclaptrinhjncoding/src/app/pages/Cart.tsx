import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useMemo, useState } from 'react';

export function Cart() {
  const { items, removeFromCart, removeManyFromCart, clearCart, getTotalPrice } = useCart();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = useMemo(
    () => items.length > 0 && selectedIds.size === items.length,
    [items.length, selectedIds.size]
  );
  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (items.length === 0) return prev;
      if (prev.size === items.length) return new Set();
      return new Set(items.map((i) => i.id));
    });
  };
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const total = getTotalPrice();
  const discount = total > 0 ? Math.round(total * 0.1) : 0; // 10% discount
  const finalTotal = total - discount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Giỏ hàng trống</h1>
            <p className="text-muted-foreground mb-8">
              Bạn chưa thêm khóa học nào vào giỏ hàng
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span>Khám phá khóa học</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Giỏ Hàng</h1>
          <p className="text-muted-foreground">{items.length} khóa học trong giỏ</p>
          <p className="text-xs text-muted-foreground mt-2">
            Khóa <strong>miễn phí</strong> sẽ được <strong>đăng ký ngay</strong> khi bạn bấm Thanh toán. Khóa <strong>trả phí</strong> sẽ chuyển qua VNPay.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
              <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4"
                />
                Chọn tất cả
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={selectedIds.size === 0}
                  onClick={() => {
                    removeManyFromCart(Array.from(selectedIds));
                    setSelectedIds(new Set());
                  }}
                  className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  Xóa đã chọn
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setSelectedIds(new Set());
                  }}
                  className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-destructive/10 text-destructive"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                className="bg-card border border-border rounded-xl p-4 flex gap-4"
              >
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelectOne(item.id)}
                    className="h-4 w-4"
                    aria-label="Chọn khóa học"
                  />
                </div>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.instructor}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{item.duration}</span>
                    <span>•</span>
                    <span>{item.lessons} bài học</span>
                    <span>•</span>
                    <span>{item.level}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => {
                      removeFromCart(item.id);
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        next.delete(item.id);
                        return next;
                      });
                    }}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground hover:text-destructive" />
                  </button>
                  <div className="text-right">
                    {item.originalPrice && (
                      <div className="text-sm text-muted-foreground line-through">
                        {item.originalPrice.toLocaleString('vi-VN')}đ
                      </div>
                    )}
                    <div className="text-lg font-bold text-primary">
                      {item.price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">Tổng quan đơn hàng</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{total.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Giảm giá</span>
                  <span className="text-green-500">-{discount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{finalTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all font-semibold flex items-center justify-center space-x-2 mb-3 btn-shine border-2 border-blue-500/20 hover:scale-[1.02] active:scale-95"
              >
                <span>Thanh toán</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/courses"
                className="w-full py-4 border border-border rounded-lg hover:bg-muted transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <span>Tiếp tục mua sắm</span>
              </Link>

              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <ShoppingBag className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Ưu đãi đặc biệt</p>
                    <p className="text-muted-foreground">
                      Giảm thêm 5% khi mua từ 3 khóa học trở lên
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}