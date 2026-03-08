import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, TrendingUp, Play, CheckCircle, Loader2, Settings } from 'lucide-react';
import { courses } from '@/app/data/courses';
import { useAuth } from '@/app/context/AuthContext';
import { instructorApi, type Course } from '@/app/lib/api';

// Mock enrolled courses - for learner
const enrolledCourses = courses.slice(0, 3).map((course, index) => ({
  ...course,
  progress: [75, 30, 90][index],
  lastAccessed: ['2 giờ trước', '1 ngày trước', '3 ngày trước'][index],
  completedLessons: Math.floor(course.lessons * ([75, 30, 90][index] / 100))
}));

function formatLevel(level?: string) {
  const map: Record<string, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
    'all-levels': 'Mọi cấp độ',
  };
  return map[level || ''] || level;
}

function formatStatus(status?: string) {
  const map: Record<string, string> = {
    draft: 'Nháp',
    pending: 'Chờ duyệt',
    active: 'Đã duyệt',
    rejected: 'Đã từ chối',
  };
  return map[status || ''] || status;
}

export function MyCourses() {
  const { user } = useAuth();
  const [teachingCourses, setTeachingCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const isInstructor = user?.role === 'instructor';

  useEffect(() => {
    if (isInstructor) {
      setLoading(true);
      instructorApi
        .listMyCourses({ page: 1, limit: 50 })
        .then((res) => setTeachingCourses(res.data?.courses ?? []))
        .catch(() => setTeachingCourses([]))
        .finally(() => setLoading(false));
    }
  }, [isInstructor]);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Khóa Học Của Tôi
          </h1>
          <p className="text-muted-foreground">
            {isInstructor ? 'Các khóa học bạn đang dạy' : 'Tiếp tục học tập và hoàn thành các khóa học đã đăng ký'}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isInstructor ? teachingCourses.length : enrolledCourses.length}</p>
                <p className="text-sm text-muted-foreground">{isInstructor ? 'Khóa đang dạy' : 'Khóa học'}</p>
              </div>
            </div>
          </div>

          {!isInstructor && (
            <>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-muted-foreground">Hoàn thành</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">65%</p>
                    <p className="text-sm text-muted-foreground">Tiến độ TB</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">32h</p>
                    <p className="text-sm text-muted-foreground">Học tháng này</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Content: Instructor = API courses they teach, Learner = enrolled (mock) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">
            {isInstructor ? 'Khóa học tôi dạy' : 'Tiếp tục học'}
          </h2>

          {isInstructor ? (
            loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            ) : teachingCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachingCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    whileHover={{ y: -4 }}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all shadow-lg hover:shadow-xl flex flex-col h-full"
                  >
                    <div className="relative aspect-video overflow-hidden flex-shrink-0">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium bg-muted/90">
                        {formatStatus(course.status)}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1 min-h-0">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-primary font-medium">{course.categoryId?.name || '-'}</span>
                        <span className="text-sm text-muted-foreground">{formatLevel(course.level)}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{course.description || ''}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>{course.totalLessons || 0} bài · {(course.enrollmentCount || 0).toLocaleString()} học viên</span>
                        <span className="font-semibold text-primary">
                          {course.price === 0 ? 'Miễn phí' : `${(course.price || 0).toLocaleString('vi-VN')}đ`}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-auto pt-2">
                        <Link
                          to={`/courses/${course._id}`}
                          state={{ from: 'my-courses' }}
                          className="flex-1 py-2 text-center border border-border rounded-lg hover:bg-muted transition-colors text-sm"
                        >
                          Xem chi tiết
                        </Link>
                        <Link
                          to="/instructor/courses"
                          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm text-center flex items-center justify-center gap-1"
                        >
                          <Settings className="w-4 h-4" />
                          Quản lý
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Bạn chưa có khóa học nào. Hãy tạo khóa học mới.
                <div className="mt-4">
                  <Link to="/instructor/courses/new" className="text-primary hover:underline">
                    Tạo khóa học
                  </Link>
                </div>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all shadow-lg hover:shadow-xl flex flex-col h-full"
                >
                  <div className="relative aspect-video overflow-hidden flex-shrink-0">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Link
                        to={`/learn/${course.id}`}
                        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Play className="w-8 h-8 text-white ml-1" />
                      </Link>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1 min-h-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-primary font-medium">{course.category}</span>
                      <span className="text-sm text-muted-foreground">{course.lastAccessed}</span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Tiến độ</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{course.completedLessons}/{course.lessons} bài học</span>
                      <span>{course.duration}</span>
                    </div>

                    <Link
                      to={`/learn/${course.id}`}
                      className="mt-auto pt-4 w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 btn-shine border-2 border-blue-500/20 hover:scale-[1.02] active:scale-95"
                    >
                      <Play className="w-4 h-4" />
                      <span>Tiếp tục học</span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recommended Courses - only for learner */}
        {!isInstructor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Khóa học đề xuất</h2>
              <Link to="/courses" className="text-primary hover:underline">
                Xem thêm
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(3, 6).map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {course.level}
                    </div>
                  </div>

                  <div className="p-6">
                    <span className="text-sm text-primary font-medium">{course.category}</span>
                    <h3 className="text-lg font-semibold mt-2 mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{course.lessons} bài</span>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {course.price.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
