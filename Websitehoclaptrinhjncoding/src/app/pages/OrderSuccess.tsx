import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Download, Mail, ArrowRight } from 'lucide-react';

export function OrderSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-card border border-border rounded-2xl p-8 md:p-12 relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-16 h-16 text-green-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Thanh toán thành công!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Cảm ơn bạn đã mua khóa học tại Jncoding. Chúng tôi đã gửi xác nhận đến email của bạn.
          </p>

          {/* Order Info */}
          <div className="bg-muted/50 border border-border rounded-xl p-6 mb-8 text-left">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
                <p className="font-semibold">JN{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ngày mua</p>
                <p className="font-semibold">{new Date().toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-primary">
                  {(Math.random() * 5000000 + 1000000).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              to="/my-courses"
              className="w-full flex items-center justify-center space-x-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              <span>Bắt đầu học ngay</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors">
                <Download className="w-5 h-5" />
                <span>Tải hóa đơn</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors">
                <Mail className="w-5 h-5" />
                <span>Gửi lại email</span>
              </button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="font-semibold mb-4">Bước tiếp theo</h3>
            <div className="grid gap-3 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Kiểm tra email</p>
                  <p className="text-sm text-muted-foreground">
                    Xác nhận đơn hàng và hướng dẫn truy cập khóa học
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Truy cập khóa học</p>
                  <p className="text-sm text-muted-foreground">
                    Vào mục "Khóa học của tôi" để bắt đầu học
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Tham gia cộng đồng</p>
                  <p className="text-sm text-muted-foreground">
                    Kết nối với học viên khác và giảng viên
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
