import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

const quickReplies = [
  "Khóa học nào phù hợp cho người mới?",
  "Giá khóa học như thế nào?",
  "Có chứng chỉ không?",
  "Hỗ trợ học viên ra sao?",
];

const botResponses = {
  default:
    "Xin chào! Tôi là trợ lý AI của Jncoding. Tôi có thể giúp gì cho bạn?",
  "khóa học":
    "Chúng tôi có nhiều khóa học từ Frontend, Backend đến Full Stack. Bạn quan tâm lĩnh vực nào nhất?",
  "người mới":
    'Với người mới, bạn nên bắt đầu với "HTML, CSS cơ bản" hoặc "JavaScript cho người mới". Các khóa này dành cho người chưa có nền tảng.',
  "giá":
    "Giá khóa học dao động từ 299,000đ đến 1,999,000đ. Hiện có ưu đãi giảm đến 50% cho học viên mới!",
  "chứng chỉ":
    "Có! Sau khi hoàn thành 100% khóa học, bạn sẽ nhận được chứng chỉ hoàn thành từ Jncoding.",
  "hỗ trợ":
    "Chúng tôi hỗ trợ 24/7 qua chat, email và cộng đồng. Bạn cũng có thể đặt câu hỏi trực tiếp cho giảng viên.",
  "đăng ký":
    "Để đăng ký: 1) Tạo tài khoản 2) Chọn khóa học 3) Thanh toán. Bạn muốn hướng dẫn chi tiết không?",
};

export function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: "1",
      text:
        "Xin chào! Tôi là trợ lý AI của Jncoding 🤖\n\n" +
        "Tôi có thể giúp bạn:\n" +
        "• Tư vấn khóa học phù hợp\n" +
        "• Hướng dẫn đăng ký\n" +
        "• Giải đáp thắc mắc\n" +
        "• Hỗ trợ thanh toán\n\n" +
        "Bạn cần tôi giúp gì?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const listRef = useRef(null);

  useEffect(() => {
    // auto scroll xuống cuối
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const getBotResponse = (userMessage) => {
    const lowerMessage = String(userMessage || "").toLowerCase();
    for (const key of Object.keys(botResponses)) {
      if (key !== "default" && lowerMessage.includes(key)) {
        return botResponses[key];
      }
    }
    return (
      "Cảm ơn câu hỏi của bạn! Để hỗ trợ tốt hơn, bạn có thể liên hệ:\n" +
      "• Email: support@jncoding.com\n" +
      "• Hotline: 0123 456 789"
    );
  };

  const handleSendMessage = (text) => {
    const messageText = (text || inputValue).trim();
    if (!messageText) return;

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const delay = 900 + Math.random() * 900;
    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(messageText),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, delay);
  };

  const handleQuickReply = (reply) => handleSendMessage(reply);

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full shadow-2xl shadow-primary/25 flex items-center justify-center group"
            type="button"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <MessageCircle className="w-7 h-7 text-white" />
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.85 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                  <Bot className="w-6 h-6 text-white" />
                </motion.div>

                <div>
                  <h3 className="text-white font-semibold">AI Trợ Lý</h3>
                  <div className="flex items-center space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                    <span className="text-xs text-white/80">Đang hoạt động</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`flex items-end space-x-2 max-w-[80%] ${message.sender === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === "user"
                          ? "bg-primary"
                          : "bg-gradient-to-br from-primary to-accent"
                        }`}
                    >
                      {message.sender === "user" ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>

                    <div>
                      <div
                        className={`px-4 py-2 rounded-2xl ${message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border"
                          }`}
                      >
                        <p className="text-sm whitespace-pre-line">
                          {message.text}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-2">
                        {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end space-x-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>

                  <div className="px-4 py-3 bg-card border border-border rounded-2xl">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Replies */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  Câu hỏi gợi ý:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.06 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors"
                      type="button"
                    >
                      {reply}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-10 h-10 bg-gradient-to-br from-primary to-accent text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
