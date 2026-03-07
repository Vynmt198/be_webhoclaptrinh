import { motion } from 'motion/react';
import { FileText } from 'lucide-react';

export function Terms() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Điều Khoản Sử Dụng</h1>
            <p className="text-muted-foreground">Cập nhật lần cuối: 14/01/2026</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Chấp Nhận Điều Khoản</h2>
              <p className="text-muted-foreground">
                Bằng việc truy cập và sử dụng nền tảng Jncoding, bạn đồng ý tuân thủ và bị ràng buộc bởi các 
                điều khoản và điều kiện sau đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này,
                vui lòng không sử dụng dịch vụ của chúng tôi.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Sử Dụng Dịch Vụ</h2>
              <p className="text-muted-foreground mb-4">
                Khi sử dụng dịch vụ của Jncoding, bạn đồng ý:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Cung cấp thông tin chính xác và đầy đủ khi đăng ký</li>
                <li>Bảo mật thông tin tài khoản và mật khẩu của bạn</li>
                <li>Không chia sẻ tài khoản với người khác</li>
                <li>Không sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                <li>Không sao chép, phân phối hoặc bán lại nội dung khóa học</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Thanh Toán và Hoàn Tiền</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Thanh toán:</strong> Tất cả các khoản thanh toán phải được thực hiện qua các phương thức 
                thanh toán được hỗ trợ trên nền tảng.
              </p>
              <p className="text-muted-foreground">
                <strong>Hoàn tiền:</strong> Bạn có thể yêu cầu hoàn tiền trong vòng 7 ngày kể từ ngày mua nếu 
                bạn không hài lòng với khóa học. Sau thời gian này, chúng tôi không chấp nhận hoàn tiền trừ khi 
                có lỗi từ phía chúng tôi.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Quyền Sở Hữu Trí Tuệ</h2>
              <p className="text-muted-foreground">
                Tất cả nội dung trên nền tảng Jncoding bao gồm nhưng không giới hạn ở văn bản, hình ảnh, video,
                mã nguồn và logo đều thuộc quyền sở hữu của Jncoding và được bảo vệ bởi luật bản quyền. Bạn không 
                được phép sử dụng, sao chép hoặc phân phối nội dung này mà không có sự cho phép bằng văn bản.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Hành Vi Cấm</h2>
              <p className="text-muted-foreground mb-4">
                Người dùng không được:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Sử dụng dịch vụ để vi phạm pháp luật</li>
                <li>Tải lên hoặc chia sẻ nội dung vi phạm bản quyền</li>
                <li>Gây nhiễu, làm gián đoạn hoặc phá hoại hệ thống</li>
                <li>Thu thập thông tin người dùng khác trái phép</li>
                <li>Mạo danh người khác hoặc tổ chức</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Giới Hạn Trách Nhiệm</h2>
              <p className="text-muted-foreground">
                Jncoding không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên hoặc hậu quả
                nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ của chúng tôi. Chúng tôi không đảm bảo
                rằng dịch vụ sẽ không bị gián đoạn hoặc không có lỗi.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Thay Đổi Điều Khoản</h2>
              <p className="text-muted-foreground">
                Jncoding có quyền thay đổi các điều khoản này bất kỳ lúc nào. Chúng tôi sẽ thông báo về những thay đổi
                quan trọng qua email hoặc thông báo trên website. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi
                được coi là bạn chấp nhận các điều khoản mới.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Liên Hệ</h2>
              <p className="text-muted-foreground">
                Nếu bạn có bất kỳ câu hỏi nào về điều khoản sử dụng, vui lòng liên hệ:
                <br />
                <br />
                <strong>Email:</strong> legal@jncoding.com<br />
                <strong>Điện thoại:</strong> +84 123 456 789<br />
                <strong>Địa chỉ:</strong> 123 Nguyễn Huệ, Q.1, TP.HCM
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
