import { Link } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import {
  Code2,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Play,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { courseApi } from '@/app/lib/api';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
} as const;

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function Home() {
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    courseApi.list({ limit: 3, sortBy: 'popular' })
      .then(res => setFeaturedCourses(res.data.courses || []))
      .catch(err => console.error("API Error:", err));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-background pt-20 pb-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Blue blob - top right */}
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 40%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Purple blob - center */}
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, rgba(219, 39, 119, 0.15) 50%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          {/* Red blob - bottom left */}
          <motion.div
            className="absolute top-60 -left-40 w-[450px] h-[450px] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(220, 38, 38, 0.25) 0%, rgba(239, 68, 68, 0.15) 50%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.35, 0.2],
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />

          {/* Orange accent - bottom right */}
          <motion.div
            className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(234, 88, 12, 0.2) 0%, rgba(249, 115, 22, 0.1) 50%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-6"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Học lập trình online #1 Việt Nam</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight"
              >
                Học Lập Trình
                <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Từ Số 0
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              >
                Khởi đầu sự nghiệp lập trình của bạn với các khóa học chất lượng cao,
                được thiết kế cho người học ban đêm.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap gap-4 justify-center md:justify-start"
              >
                <Link
                  to="/courses"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center space-x-2 hover:scale-105 active:scale-95 btn-shine border-2 border-blue-500/20"
                >
                  <span>Khám phá khóa học</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => setShowDemoModal(true)}
                  className="group px-8 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 text-white rounded-lg hover:shadow-2xl hover:shadow-red-500/30 transition-all flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 btn-shine border-2 border-red-500/20"
                >
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Xem demo</span>
                </button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { icon: BookOpen, label: 'Khóa học', value: '50+' },
                { icon: Users, label: 'Học viên', value: '10K+' },
                { icon: Award, label: 'Giảng viên', value: '20+' },
                { icon: Star, label: 'Đánh giá', value: '4.9/5' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <AnimatedSection className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Khóa Học <span className="text-primary">Nổi Bật</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Những khóa học được yêu thích nhất, giúp bạn nắm vững kiến thức và kỹ năng lập trình
              </p>
            </motion.div>
          </div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredCourses.map((course, index) => (
              <motion.div
                key={course._id ?? index}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  to={`/courses/${course._id}`}
                  className="group block bg-card border border-border hover:border-primary/50 rounded-xl overflow-hidden transition-all shadow-lg hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={
                        course.thumbnail ||
                        course.image ||
                        'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {course.level || 'Tất cả trình độ'}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-primary font-medium">
                        {course.categoryId?.name || course.category || 'Lập trình'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">
                          {course.rating ?? 4.9}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({course.totalEnrolled ?? course.students ?? 0})
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description || 'Khóa học thực chiến giúp bạn nâng cao kỹ năng lập trình qua dự án thực tế.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{course.totalLessons ?? course.lessons ?? 0} bài học</span>
                        <span>{course.duration ?? 'Tùy khóa học'}</span>
                      </div>
                      <div className="text-right">
                        {course.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            {course.originalPrice.toLocaleString('vi-VN')}đ
                          </div>
                        )}
                        <div className="text-lg font-bold text-primary">
                          {course.price === 0 || course.price === '0'
                            ? 'Miễn phí'
                            : `${Number(course.price || course.priceSale || 0).toLocaleString('vi-VN')}đ`}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mt-12"
          >
            <Link
              to="/courses"
              className="inline-flex items-center space-x-2 px-8 py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
            >
              <span>Xem tất cả khóa học</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Features */}
      <AnimatedSection className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tại Sao Chọn <span className="text-primary">Jncoding</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chúng tôi mang đến trải nghiệm học tập tốt nhất cho lập trình viên
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Code2,
                title: 'Học Thực Hành',
                description:
                  'Coding ngay trên trình duyệt, thực hành là cách tốt nhất để học lập trình',
              },
              {
                icon: BookOpen,
                title: 'Nội Dung Chất Lượng',
                description:
                  'Khóa học được biên soạn bởi các chuyên gia với kinh nghiệm thực tế',
              },
              {
                icon: Users,
                title: 'Cộng Đồng Hỗ Trợ',
                description:
                  'Tham gia cộng đồng học viên, hỏi đáp và chia sẻ kinh nghiệm',
              },
              {
                icon: Award,
                title: 'Chứng Chỉ Hoàn Thành',
                description:
                  'Nhận chứng chỉ sau khi hoàn thành khóa học để chứng minh kỹ năng',
              },
              {
                icon: Play,
                title: 'Học Mọi Lúc Mọi Nơi',
                description:
                  'Truy cập khóa học 24/7, học theo tốc độ của riêng bạn',
              },
              {
                icon: TrendingUp,
                title: 'Cập Nhật Liên Tục',
                description:
                  'Nội dung được cập nhật theo xu hướng công nghệ mới nhất',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Bắt Đầu Hành Trình Lập Trình Của Bạn
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Tham gia cùng hàng nghìn học viên đã thay đổi sự nghiệp với Jncoding
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              >
                <span>Khám phá ngay</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Demo Modal */}
      {showDemoModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDemoModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Jncoding Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">Khám phá Jncoding</h3>
              <p className="text-muted-foreground">
                Xem video giới thiệu để hiểu hơn về nền tảng học lập trình của chúng tôi
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}