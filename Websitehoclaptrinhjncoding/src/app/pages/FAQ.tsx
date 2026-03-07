import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';

const faqData = [
  {
    category: 'Chung',
    questions: [
      {
        q: 'Jncoding là gì?',
        a: 'Jncoding là nền tảng học lập trình trực tuyến cung cấp các khóa học chất lượng cao từ cơ bản đến nâng cao.'
      },
      {
        q: 'Tôi có cần kiến thức nền tảng không?',
        a: 'Không nhất thiết! Chúng tôi có khóa học cho mọi cấp độ, từ người mới bắt đầu đến chuyên gia.'
      }
    ]
  },
  {
    category: 'Khóa học',
    questions: [
      {
        q: 'Tôi có thể truy cập khóa học bao lâu?',
        a: 'Bạn có quyền truy cập trọn đời vào khóa học đã mua, không giới hạn thời gian.'
      },
      {
        q: 'Khóa học có bao gồm chứng chỉ không?',
        a: 'Có, bạn sẽ nhận được chứng chỉ hoàn thành sau khi hoàn tất 100% nội dung khóa học.'
      },
      {
        q: 'Tôi có thể học trên thiết bị di động không?',
        a: 'Có, nền tảng của chúng tôi hỗ trợ đầy đủ trên máy tính, tablet và điện thoại.'
      }
    ]
  },
  {
    category: 'Thanh toán',
    questions: [
      {
        q: 'Các phương thức thanh toán được hỗ trợ?',
        a: 'Chúng tôi hỗ trợ thẻ tín dụng, chuyển khoản ngân hàng và ví điện tử (MoMo, ZaloPay, VNPay).'
      },
      {
        q: 'Tôi có thể hoàn tiền không?',
        a: 'Có, chúng tôi có chính sách hoàn tiền trong vòng 7 ngày nếu bạn không hài lòng với khóa học.'
      },
      {
        q: 'Có giảm giá cho sinh viên không?',
        a: 'Có, chúng tôi cung cấp giảm giá đặc biệt cho sinh viên. Vui lòng liên hệ support để biết thêm chi tiết.'
      }
    ]
  },
  {
    category: 'Kỹ thuật',
    questions: [
      {
        q: 'Tôi gặp vấn đề kỹ thuật, phải làm sao?',
        a: 'Vui lòng liên hệ với đội ngũ support qua email hoặc chat trực tuyến. Chúng tôi sẽ hỗ trợ trong vòng 24h.'
      },
      {
        q: 'Video không tải được, làm thế nào?',
        a: 'Thử làm mới trang hoặc xóa cache trình duyệt. Nếu vẫn gặp vấn đề, hãy liên hệ support.'
      }
    ]
  }
];

export function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (key: string) => {
    setExpandedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const filteredFaqs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      item =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Câu Hỏi <span className="text-primary">Thường Gặp</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Tìm câu trả lời nhanh chóng cho các thắc mắc của bạn
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-12">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredFaqs.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1, duration: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((item, questionIndex) => {
                    const key = `${categoryIndex}-${questionIndex}`;
                    const isExpanded = expandedItems.includes(key);

                    return (
                      <div
                        key={questionIndex}
                        className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all"
                      >
                        <button
                          onClick={() => toggleItem(key)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left"
                        >
                          <span className="font-medium pr-4">{item.q}</span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="px-6 pb-4 text-muted-foreground">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Không tìm thấy câu hỏi phù hợp
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-primary hover:underline"
              >
                Xóa tìm kiếm
              </button>
            </div>
          )}

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-8 text-center"
          >
            <h3 className="text-2xl font-bold mb-4">Vẫn còn thắc mắc?</h3>
            <p className="text-muted-foreground mb-6">
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Liên hệ với chúng tôi
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
