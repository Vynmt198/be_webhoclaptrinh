import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart2, Loader2, ArrowRight } from 'lucide-react';
import { instructorApi, type Course } from '@/app/lib/api';

export function InstructorAnalyticsList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instructorApi
      .listMyCourses({ limit: 100 })
      .then((res) => setCourses(res.data.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Thống kê khóa học</h1>
        <p className="text-muted-foreground">
          Chọn khóa học để xem số học viên đăng ký, thời gian học và bài học hoàn thành.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <BarChart2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Bạn chưa có khóa học nào.</p>
          <Link
            to="/instructor/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Tạo khóa học mới
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {courses.map((course, i) => (
            <motion.li
              key={course._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/instructor/analytics/${course._id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BarChart2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.enrollmentCount ?? 0} học viên · {course.status === 'active' ? 'Đã duyệt' : course.status === 'draft' ? 'Nháp' : course.status}
                    </p>
                  </div>
                </div>
                <span className="text-primary text-sm font-medium flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                  Xem thống kê
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
