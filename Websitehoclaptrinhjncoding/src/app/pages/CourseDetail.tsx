import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Star,
  Clock,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  Play,
  ArrowLeft,
  ShoppingCart,
  ThumbsUp,
  Globe,
  Github,
  Linkedin
} from 'lucide-react';
import { getCourseById } from '@/app/data/courses';
import { useState } from 'react';
import { useCart } from '@/app/context/CartContext';

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const course = getCourseById(id || '');
  const [showCheckout, setShowCheckout] = useState(false);
  const { addToCart, items } = useCart();

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h2>
          <Link to="/courses" className="text-primary hover:underline">
            Quay lại danh sách khóa học
          </Link>
        </div>
      </div>
    );
  }

  const handleEnroll = () => {
    if (course) {
      addToCart(course);
      navigate('/checkout');
    }
  };

  const handleAddToCart = () => {
    if (course) {
      addToCart(course);
    }
  };

  const isInCart = course ? items.some(item => item.id === course.id) : false;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-primary/5 to-accent/5 py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate('/courses')}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại khóa học</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Course Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                {course.category}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>

              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-muted-foreground">({course.students} đánh giá)</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>{course.students.toLocaleString()} học viên</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <BookOpen className="w-5 h-5" />
                  <span>{course.lessons} bài học</span>
                </div>
              </div>

              {/* Instructor Info */}
              {course.instructorInfo ? (
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={course.instructorInfo.avatar}
                      alt={course.instructorInfo.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Giảng viên</p>
                      <h3 className="text-lg font-bold mb-1">{course.instructorInfo.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{course.instructorInfo.title}</p>
                      
                      {/* Social Links */}
                      {course.instructorInfo.social && (
                        <div className="flex items-center space-x-2">
                          {course.instructorInfo.social.website && (
                            <a
                              href={course.instructorInfo.social.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                          {course.instructorInfo.social.github && (
                            <a
                              href={course.instructorInfo.social.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {course.instructorInfo.social.linkedin && (
                            <a
                              href={course.instructorInfo.social.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instructor Stats */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-3 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                      <div className="text-xl font-bold text-primary mb-0.5">
                        {course.instructorInfo.stats.courses}
                      </div>
                      <div className="text-xs text-muted-foreground">Khóa học</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                      <div className="text-xl font-bold text-primary mb-0.5">
                        {(course.instructorInfo.stats.students / 1000).toFixed(1)}K+
                      </div>
                      <div className="text-xs text-muted-foreground">Học viên</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                      <div className="text-xl font-bold text-primary mb-0.5 flex items-center justify-center">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 mr-0.5" />
                        {course.instructorInfo.stats.rating}
                      </div>
                      <div className="text-xs text-muted-foreground">Đánh giá</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                      <div className="text-xl font-bold text-primary mb-0.5">
                        {(course.instructorInfo.stats.reviews / 1000).toFixed(1)}K+
                      </div>
                      <div className="text-xs text-muted-foreground">Reviews</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {course.instructorInfo.bio}
                  </p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2">
                    {course.instructorInfo.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary rounded text-xs font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor)}&background=3b82f6&color=fff`}
                    alt={course.instructor}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">Giảng viên</p>
                    <p className="font-medium">{course.instructor}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Column - Course Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="lg:sticky lg:top-24 h-fit"
            >
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
                <div className="relative aspect-video">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  <button className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/40 transition-colors group">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    {course.originalPrice && (
                      <div className="text-muted-foreground line-through mb-1">
                        {course.originalPrice.toLocaleString('vi-VN')}đ
                      </div>
                    )}
                    <div className="text-3xl font-bold text-primary">
                      {course.price.toLocaleString('vi-VN')}đ
                    </div>
                    {course.originalPrice && (
                      <div className="inline-block mt-2 px-2 py-1 bg-green-500/10 text-green-500 rounded text-sm font-medium">
                        Giảm {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleEnroll}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all font-semibold flex items-center justify-center space-x-2 mb-3 btn-shine border-2 border-blue-500/20 hover:scale-[1.02] active:scale-95"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Đăng ký ngay</span>
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={isInCart}
                    className="w-full py-4 border-2 border-primary/50 hover:border-primary bg-gradient-to-r from-primary/10 to-accent/10 text-foreground rounded-lg hover:bg-primary/20 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed btn-shine"
                  >
                    {isInCart ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
                  </button>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Truy cập trọn đời</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Chứng chỉ hoàn thành</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Hỗ trợ trực tuyến</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* What You'll Learn */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <h2 className="text-2xl font-bold mb-6">Bạn sẽ học được gì</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Curriculum */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <h2 className="text-2xl font-bold mb-6">Nội dung khóa học</h2>
                <div className="space-y-4">
                  {course.curriculum.map((section, index) => (
                    <div key={index} className="border border-border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 p-4 flex items-center justify-between">
                        <h3 className="font-semibold">{section.section}</h3>
                        <span className="text-sm text-muted-foreground">
                          {section.lessons.length} bài học
                        </span>
                      </div>
                      <div className="divide-y divide-border">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="p-4 flex items-center space-x-3 hover:bg-muted/30 transition-colors">
                            <Play className="w-4 h-4 text-muted-foreground" />
                            <span className="flex-1">{lesson}</span>
                            <span className="text-sm text-muted-foreground">10:00</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Requirements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <h2 className="text-2xl font-bold mb-6">Yêu cầu</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>Kiến thức cơ bản về HTML, CSS, JavaScript</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>Máy tính có kết nối internet</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>Tinh thần học hỏi và thực hành</span>
                  </li>
                </ul>
              </motion.div>

              {/* Student Reviews */}
              {course.reviews && course.reviews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Đánh giá của học viên</h2>
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      <span className="text-xl font-bold">{course.rating}</span>
                      <span className="text-muted-foreground">({course.reviews.length} đánh giá)</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {course.reviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="border-b border-border last:border-0 pb-6 last:pb-0"
                      >
                        <div className="flex items-start space-x-4">
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{review.userName}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating
                                            ? 'fill-yellow-500 text-yellow-500'
                                            : 'text-muted-foreground/30'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(review.date).toLocaleDateString('vi-VN', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-muted-foreground mb-3 leading-relaxed">
                              {review.comment}
                            </p>
                            <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                              <ThumbsUp className="w-4 h-4 group-hover:fill-primary/20" />
                              <span>Hữu ích ({review.helpful})</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {course.reviews.length > 5 && (
                    <button className="w-full mt-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium">
                      Xem tất cả {course.reviews.length} đánh giá
                    </button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sidebar - Level Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Thông tin khóa học</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cấp độ</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tổng thời lượng</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Số bài học</span>
                    <span className="font-medium">{course.lessons}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Học viên</span>
                    <span className="font-medium">{course.students.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
                <Award className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Nhận chứng chỉ</h3>
                <p className="text-sm text-muted-foreground">
                  Hoàn thành khóa học để nhận chứng chỉ chính thức từ Jncoding
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-xl max-w-md w-full p-6"
          >
            <h3 className="text-2xl font-bold mb-4">Thanh toán</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <img src={course.image} alt={course.title} className="w-20 h-14 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-semibold line-clamp-2">{course.title}</h4>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Giá gốc</span>
                  <span className="line-through">{course.originalPrice?.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{course.price.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold mb-3">
              Xác nhận thanh toán
            </button>
            <button
              onClick={() => setShowCheckout(false)}
              className="w-full py-3 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Hủy
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}