import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Search, Filter, Loader2, Power, PowerOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminCourseApi, courseApi, Course } from '@/app/lib/api';

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCourses = () => {
    setLoading(true);
    adminCourseApi
      .list({
        status: filter === 'all' ? undefined : filter,
        page: 1,
        limit: 50,
      })
      .then((res: { data: { courses: Course[] } }) => setCourses(res.data.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const handleAction = (courseId: string, action: 'approve' | 'reject') => {
    adminCourseApi
      .approve(courseId, action)
      .then(() => {
        toast.success(action === 'approve' ? 'Đã duyệt khóa học!' : 'Đã từ chối khóa học.');
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
      })
      .catch((err: Error) => toast.error(err.message || 'Có lỗi xảy ra'));
  };

  const handleStatusChange = (courseId: string, status: 'active' | 'disabled') => {
    adminCourseApi
      .updateStatus(courseId, status)
      .then(() => {
        toast.success(status === 'active' ? 'Đã mở lại khóa học.' : 'Đã tắt khóa học.');
        setCourses((prev) => prev.map((c) => (c._id === courseId ? { ...c, status } : c)));
      })
      .catch((err: Error) => toast.error(err.message || 'Có lỗi xảy ra'));
  };

  const handleDelete = (courseId: string, title: string) => {
    if (!window.confirm(`Xóa khóa học "${title}"? Hành động không thể hoàn tác.`)) return;
    courseApi
      .delete(courseId)
      .then(() => {
        toast.success('Đã xóa khóa học.');
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
      })
      .catch((err: Error) => toast.error(err.message || 'Không thể xóa.'));
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      !search.trim() ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.instructorId?.fullName || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const StatusBadge = ({ status }: { status?: string }) => {
    const s = (status || '').toLowerCase();
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      active: 'bg-green-500/10 text-green-500',
      rejected: 'bg-red-500/10 text-red-500',
      draft: 'bg-gray-500/10 text-gray-500',
      disabled: 'bg-orange-500/10 text-orange-500',
    };
    const labels: Record<string, string> = {
      pending: 'Chờ duyệt',
      active: 'Đã duyệt',
      rejected: 'Đã từ chối',
      draft: 'Nháp',
      disabled: 'Đã tắt',
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[s] || 'bg-muted text-muted-foreground'}`}
      >
        {labels[s] || status}
      </span>
    );
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return price === 0 ? 'Miễn phí' : `${price.toLocaleString('vi-VN')}đ`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Duyệt khóa học</h1>
        <p className="text-muted-foreground">
          Xét duyệt các khóa học do giảng viên đăng tải.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên khóa học, giảng viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 pr-8 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
          >
            <option value="pending">Chờ duyệt</option>
            <option value="draft">Nháp</option>
            <option value="active">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
            <option value="disabled">Đã tắt</option>
            <option value="all">Tất cả</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Tên khóa học</th>
                  <th className="px-4 py-3 font-medium">Giảng viên</th>
                  <th className="px-4 py-3 font-medium">Giá</th>
                  <th className="px-4 py-3 font-medium">Cập nhật</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr
                      key={course._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-4 font-medium">{course.title}</td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {course.instructorId?.fullName || '-'}
                      </td>
                      <td className="px-4 py-4 font-medium text-emerald-500">
                        {formatPrice(course.price)}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {course.updatedAt
                          ? new Date(course.updatedAt).toLocaleDateString('vi-VN')
                          : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={course.status} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {course.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(course._id, 'approve')}
                                className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Duyệt"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleAction(course._id, 'reject')}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Từ chối"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {course.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(course._id, 'disabled')}
                              className="p-1.5 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                              title="Tắt khóa học"
                            >
                              <PowerOff className="w-5 h-5" />
                            </button>
                          )}
                          {course.status === 'disabled' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(course._id, 'active')}
                                className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Mở lại khóa học"
                              >
                                <Power className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(course._id, course.title)}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <Link
                            to={`/courses/${course._id}`}
                            state={{ from: 'admin-courses' }}
                            className="px-3 py-1.5 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors text-xs inline-flex items-center gap-1"
                          >
                            Xem
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Không tìm thấy khóa học nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
