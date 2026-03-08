import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { instructorApi } from '@/app/lib/api';

function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds} giây`;
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs} giờ ${mins % 60} phút`;
  return `${mins} phút`;
}

export function InstructorAnalytics() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{
    totalEnrollments: number;
    totalTimeSpentSeconds: number;
    totalCompletedLessons: number;
    courseTitle: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    instructorApi
      .getAnalytics(id)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Không thể tải thống kê.</p>
        <Link to="/instructor/courses" className="text-primary hover:underline">
          Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  const cards = [
    { icon: Users, label: 'Học viên đăng ký', value: data.totalEnrollments.toLocaleString() },
    { icon: Clock, label: 'Tổng thời gian học', value: formatTime(data.totalTimeSpentSeconds) },
    { icon: CheckCircle, label: 'Bài học hoàn thành', value: data.totalCompletedLessons.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/instructor/analytics"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại thống kê
      </Link>

      <div>
        <h1 className="text-3xl font-bold mb-2">Thống kê khóa học</h1>
        <p className="text-muted-foreground">{data.courseTitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <card.icon className="w-10 h-10 text-primary mb-4" />
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="pt-4">
        <Link
          to={`/courses/${id}`}
          className="text-primary hover:underline"
        >
          Xem chi tiết khóa học →
        </Link>
      </div>
    </div>
  );
}
