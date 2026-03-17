import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter, Loader2, Plus, Eye, Send, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { instructorApi, courseApi, Course } from '@/app/lib/api';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // @ts-ignore - .jsx has no declaration file
} from '@/app/components/ui/alert-dialog';

export function InstructorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ courseId: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = () => {
    setLoading(true);
    instructorApi
      .listMyCourses({
        status: filter || undefined,
        page: 1,
        limit: 50,
      })
      .then((res) => setCourses(res.data?.courses ?? []))
      .catch((err) => {
        setCourses([]);
        toast.error(err?.message || 'Không thể tải danh sách khóa học. Vui lòng đăng nhập lại.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      !search.trim() ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.categoryId?.name || '').toLowerCase().includes(search.toLowerCase());
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

  const handleSubmitForReview = (courseId: string) => {
    courseApi
      .update(courseId, { submitForReview: true })
      .then(() => {
        toast.success('Đã gửi khóa học chờ admin duyệt.');
        fetchCourses();
      })
      .catch((err: Error) => toast.error(err.message || 'Không thể gửi duyệt.'));
  };

  const handleDeleteClick = (courseId: string, title: string) => {
    setDeleteConfirm({ courseId, title });
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    courseApi
      .delete(deleteConfirm.courseId)
      .then(() => {
        toast.success('Đã xóa khóa học.');
        setDeleteConfirm(null);
        fetchCourses();
      })
      .catch((err: Error) => toast.error(err.message || 'Không thể xóa khóa học.'))
      .finally(() => setDeleting(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Khóa tôi dạy</h1>
          <p className="text-muted-foreground">
            Quản lý và chỉnh sửa các khóa học bạn đã tạo.
          </p>
        </div>
        <Link
          to="/instructor/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Tạo khóa học mới
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên khóa học, danh mục..."
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
            <option value="">Tất cả</option>
            <option value="draft">Nháp</option>
            <option value="pending">Chờ duyệt</option>
            <option value="active">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
            <option value="disabled">Đã tắt</option>
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
                  <th className="px-4 py-3 font-medium">Danh mục</th>
                  <th className="px-4 py-3 font-medium">Giá</th>
                  <th className="px-4 py-3 font-medium">Học viên</th>
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
                        {course.categoryId?.name || '-'}
                      </td>
                      <td className="px-4 py-4 font-medium text-emerald-500">
                        {formatPrice(course.price)}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {(course.enrollmentCount || 0).toLocaleString()}
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
                        <div className="flex items-center justify-end gap-2">
                          {course.status !== 'rejected' && (
                            <Link
                              to={`/instructor/courses/${course._id}/edit`}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Chỉnh sửa (nội dung, bài học, quiz)"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                          )}
                          {course.status === 'draft' && (
                            <button
                              onClick={() => handleSubmitForReview(course._id)}
                              className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Gửi duyệt"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          {/* Xóa: chỉ nháp, chờ duyệt, từ chối. Khóa đã tắt (disabled) chỉ admin mới xóa được. */}
                          {(course.status === 'draft' || course.status === 'pending' || course.status === 'rejected') && (
                            <button
                              onClick={() => handleDeleteClick(course._id, course.title)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            to={`/courses/${course._id}`}
                            state={{ from: 'instructor-courses' }}
                            className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      Bạn chưa có khóa học nào. Hãy tạo khóa học mới để bắt đầu.
                      <div className="mt-4">
                        <Link
                          to="/instructor/courses/new"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Tạo khóa học
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open: boolean) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khóa học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa khóa học &quot;{deleteConfirm?.title}&quot;? Hành động không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
