import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Clock, CheckCircle, Loader2, X } from 'lucide-react';
import { instructorApi } from '@/app/lib/api';
import { toast } from 'sonner';

type EnrollmentRow = {
  userId: string;
  fullName: string;
  email: string;
  completedLessons: number;
  totalLessons: number;
  incompleteLessons: number;
  timeSpentSeconds: number;
  timeSpentRatePercent: number;
};

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
    totalLessons?: number;
    expectedTimeSeconds?: number;
    completionRatePercent?: number;
    timeSpentRatePercent?: number;
    courseTitle: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [completedModalOpen, setCompletedModalOpen] = useState(false);
  const [enrollmentsList, setEnrollmentsList] = useState<EnrollmentRow[]>([]);
  const [timeList, setTimeList] = useState<EnrollmentRow[]>([]);
  const [completedList, setCompletedList] = useState<EnrollmentRow[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingTimeList, setLoadingTimeList] = useState(false);
  const [loadingCompletedList, setLoadingCompletedList] = useState(false);

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

  const openStudentsModal = () => {
    if (!id) return;
    setStudentsModalOpen(true);
    setLoadingEnrollments(true);
    setEnrollmentsList([]);
    instructorApi
      .getCourseEnrollments(id)
      .then((res) => {
        const list = res.data?.enrollments;
        setEnrollmentsList(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        toast.error(err?.message ?? 'Không tải được danh sách học viên.');
        setEnrollmentsList([]);
      })
      .finally(() => setLoadingEnrollments(false));
  };

  const openTimeModal = () => {
    if (!id) return;
    setTimeModalOpen(true);
    setLoadingTimeList(true);
    setTimeList([]);
    instructorApi
      .getCourseEnrollments(id)
      .then((res) => {
        const list = res.data?.enrollments;
        setTimeList(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        toast.error(err?.message ?? 'Không tải được danh sách thời gian học.');
        setTimeList([]);
      })
      .finally(() => setLoadingTimeList(false));
  };

  const openCompletedModal = () => {
    if (!id) return;
    setCompletedModalOpen(true);
    setLoadingCompletedList(true);
    setCompletedList([]);
    instructorApi
      .getCourseEnrollments(id)
      .then((res) => {
        const list = res.data?.enrollments;
        setCompletedList(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        toast.error(err?.message ?? 'Không tải được danh sách bài học hoàn thành.');
        setCompletedList([]);
      })
      .finally(() => setLoadingCompletedList(false));
  };

  const formatPercent = (p: number | undefined | null) => {
    const n = Number(p);
    if (Number.isNaN(n) || n < 0) return '0%';
    return `${Math.min(100, Math.round(n))}%`;
  };

  const completionRate = data.completionRatePercent ?? 0;
  const timeSpentRate = data.timeSpentRatePercent ?? 0;

  const cards = [
    { icon: Users, label: 'Học viên đăng ký', value: data.totalEnrollments.toLocaleString(), onClick: openStudentsModal },
    {
      icon: Clock,
      label: 'Tổng thời gian học',
      value: `${formatTime(data.totalTimeSpentSeconds ?? 0)} (${formatPercent(timeSpentRate)})`,
      onClick: openTimeModal,
    },
    {
      icon: CheckCircle,
      label: 'Bài học hoàn thành',
      value: `${(data.totalCompletedLessons ?? 0).toLocaleString()} (${formatPercent(completionRate)})`,
      onClick: openCompletedModal,
    },
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
            onClick={card.onClick}
            className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          >
            <card.icon className="w-10 h-10 text-primary mb-4" />
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {studentsModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setStudentsModalOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Danh sách học viên đăng ký</h2>
              <button type="button" onClick={() => setStudentsModalOpen(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {loadingEnrollments ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              ) : enrollmentsList.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Chưa có học viên nào đăng ký.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 font-medium">Học viên</th>
                      <th className="pb-2 font-medium hidden sm:table-cell">Email</th>
                      <th className="pb-2 font-medium text-center">Thời gian học</th>
                      <th className="pb-2 font-medium text-center">Đã hoàn thành</th>
                      <th className="pb-2 font-medium text-center">Chưa hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollmentsList.map((row) => (
                      <tr key={row.userId} className="border-b border-border/50">
                        <td className="py-3 font-medium">{row.fullName}</td>
                        <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{row.email}</td>
                        <td className="py-3 text-center text-sm">
                          {formatTime(row.timeSpentSeconds ?? 0)} ({formatPercent(row.timeSpentRatePercent ?? 0)})
                        </td>
                        <td className="py-3 text-center text-green-600 dark:text-green-400">{row.completedLessons} / {row.totalLessons}</td>
                        <td className="py-3 text-center text-muted-foreground">{row.incompleteLessons}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {timeModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setTimeModalOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Thời gian học theo học viên</h2>
              <button type="button" onClick={() => setTimeModalOpen(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {loadingTimeList ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              ) : timeList.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Chưa có học viên nào đăng ký.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 font-medium">Học viên</th>
                      <th className="pb-2 font-medium hidden sm:table-cell">Email</th>
                      <th className="pb-2 font-medium text-center">Thời gian học</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeList.map((row) => (
                      <tr key={row.userId} className="border-b border-border/50">
                        <td className="py-3 font-medium">{row.fullName}</td>
                        <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{row.email}</td>
                        <td className="py-3 text-center">
                          {formatTime(row.timeSpentSeconds ?? 0)} ({formatPercent(row.timeSpentRatePercent ?? 0)})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {completedModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setCompletedModalOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Bài học hoàn thành theo học viên</h2>
              <button type="button" onClick={() => setCompletedModalOpen(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {loadingCompletedList ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              ) : completedList.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Chưa có học viên nào đăng ký.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 font-medium">Học viên</th>
                      <th className="pb-2 font-medium hidden sm:table-cell">Email</th>
                      <th className="pb-2 font-medium text-center">Đã hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedList.map((row) => {
                      const total = row.totalLessons ?? 0;
                      const completed = row.completedLessons ?? 0;
                      const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
                      return (
                        <tr key={row.userId} className="border-b border-border/50">
                          <td className="py-3 font-medium">{row.fullName}</td>
                          <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{row.email}</td>
                          <td className="py-3 text-center text-green-600 dark:text-green-400">
                            {completed} / {total} ({formatPercent(pct)})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
