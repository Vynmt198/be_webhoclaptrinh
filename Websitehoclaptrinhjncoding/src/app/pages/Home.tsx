import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { 
  Code2, BookOpen, Users, Award, ArrowRight, Play, Star, TrendingUp, X,
  HelpCircle, Mail, Phone, ChevronRight, ExternalLink 
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { courseApi } from '@/app/lib/api';

// --- ANIMATION CONFIG ---
const fadeInUpVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
} as const;

const transitionConfig = { duration: 0.6, ease: 'easeOut' } as const;

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
    <div className="min-h-screen bg-background text-foreground">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 bg-blue-600" />
           <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 bg-red-600" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={fadeInUpVariants.initial} 
            animate={fadeInUpVariants.animate} 
            transition={transitionConfig}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-600 mb-6 font-medium"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Nền tảng học lập trình thực chiến #1</span>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Làm Chủ <span className="text-blue-600">Code</span><br />
            Kiến Tạo <span className="bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">Tương Lai</span>
          </motion.h1>

          <motion.div 
            className="flex flex-wrap gap-4 justify-center"
            initial={fadeInUpVariants.initial} 
            animate={fadeInUpVariants.animate} 
            transition={{ ...transitionConfig, delay: 0.4 }}
          >
            <Link to="/courses" className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center space-x-2 font-bold hover:scale-105">
              <span>Bắt đầu học ngay</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => setShowDemoModal(true)} 
              className="px-8 py-4 bg-secondary text-secondary-foreground rounded-xl flex items-center space-x-2 font-bold border border-border"
            >
              <Play className="w-5 h-5 fill-current text-red-600" />
              <span>Xem giới thiệu</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED COURSES */}
      <AnimatedSection className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12 border-l-4 border-blue-600 pl-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Khóa Học <span className="text-blue-600">Tiêu Biểu</span></h2>
              <p className="text-muted-foreground mt-2">Được thiết kế bởi các Senior giàu kinh nghiệm.</p>
            </div>
            <Link to="/courses" className="hidden md:flex items-center gap-2 font-bold text-blue-600 hover:gap-3 transition-all">
              Tất cả khóa học <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <motion.div 
                key={course._id} 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUpVariants}
                transition={transitionConfig}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all h-full"
              >
                <Link to={`/courses/${course._id}`} className="flex flex-col h-full">
                  <div className="aspect-video relative overflow-hidden bg-zinc-100">
                    <img 
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={course.title}
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{course.categoryId?.name || 'Developer'}</span>
                    <h3 className="text-xl font-bold mt-2 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" /> <span>{course.totalEnrolled || 0} học viên</span>
                       </div>
                       <div className="font-bold text-blue-600 text-lg">
                          {course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString()}đ`}
                       </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* 3. ABOUT SECTION */}
      <AnimatedSection className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/10 rounded-3xl blur-3xl pointer-events-none" />
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800" className="relative rounded-3xl shadow-2xl border border-border z-10" alt="Jncoding" />
            </div>
            
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-lg font-bold text-xs uppercase tracking-wider">Câu chuyện Jncoding</div>
              <h2 className="text-4xl font-bold leading-tight text-foreground">Xây dựng tư duy <br/><span className="text-blue-600">Lập trình thực chiến</span></h2>
              <p className="text-lg text-muted-foreground border-l-4 border-red-600 pl-4 italic">"Chúng tôi tin rằng code giỏi đến từ việc giải quyết vấn đề thực tế mỗi ngày."</p>
              <p className="text-muted-foreground leading-relaxed">Jncoding cung cấp các lộ trình từ Java, React đến DevOps với giáo trình bám sát yêu cầu tuyển dụng thực tế của các doanh nghiệp lớn.</p>
              <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-bold hover:shadow-lg transition-all group">
                Bạn có muốn tìm hiểu thêm về chúng tôi?
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* 4. FAQ SECTION - Cập nhật Link /faq đầy đủ */}
      <AnimatedSection className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Giải đáp <span className="text-red-600">Thắc mắc</span></h2>
          <div className="space-y-4 text-left mb-10">
            {[
              { q: "Tôi không biết gì về code có học được không?", a: "Hoàn toàn được! Lộ trình của chúng tôi bắt đầu từ con số 0, đi từ tư duy logic đến kỹ thuật chuyên sâu." },
              { q: "Hình thức hỗ trợ học viên như thế nào?", a: "Mentor hỗ trợ 1:1 qua Discord và chữa bài tập trực tiếp trên hệ thống bài tập 24/7." }
            ].map((faq, i) => (
              <div key={i} className="bg-background border border-border p-6 rounded-2xl hover:border-blue-500/50 transition-colors">
                <h3 className="font-bold text-lg flex gap-3 text-foreground"><HelpCircle className="text-blue-600 shrink-0" /> {faq.q}</h3>
                <p className="mt-3 text-muted-foreground pl-9">{faq.a}</p>
              </div>
            ))}
          </div>
          <Link to="/faq" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline decoration-2 underline-offset-4">
            Bạn còn thắc mắc khác? Xem tất cả câu hỏi tại đây 
          </Link>
        </div>
      </AnimatedSection>

      {/* MODAL DEMO */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4" 
            onClick={() => setShowDemoModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-card w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl relative" 
              onClick={e => e.stopPropagation()}
            >
              <div className="aspect-video bg-black">
                <iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Demo Video" allowFullScreen />
                <button onClick={() => setShowDemoModal(false)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}