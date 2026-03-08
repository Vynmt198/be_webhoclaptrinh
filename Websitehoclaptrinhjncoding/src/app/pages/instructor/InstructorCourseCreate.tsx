import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { courseApi, categoryApi, uploadApi, Category } from '@/app/lib/api';
import { toast } from 'sonner';

export function InstructorCourseCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    syllabus: '',
    categoryId: '',
    level: 'beginner',
    price: 0,
    thumbnail: '',
    estimatedCompletionHours: 0,
  });

  useEffect(() => {
    categoryApi
      .list()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên khóa học.');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Vui lòng nhập mô tả khóa học.');
      return;
    }
    if (!form.categoryId) {
      toast.error('Vui lòng chọn danh mục khóa học.');
      return;
    }
    if (form.estimatedCompletionHours < 0) {
      toast.error('Thời gian học ước tính phải lớn hơn 0.');
      return;
    }
    setLoading(true);
    courseApi
      .create({
        title: form.title.trim(),
        description: form.description.trim(),
        syllabus: form.syllabus || undefined,
        categoryId: form.categoryId,
        level: form.level,
        price: form.price,
        thumbnail: form.thumbnail || undefined,
        estimatedCompletionHours: form.estimatedCompletionHours || 0,
      })
      .then((res) => {
        toast.success('Đã tạo khóa học! Bạn có thể thêm bài học bên dưới.');
        navigate(`/instructor/courses/${res.data._id}/edit`);
      })
      .catch((err: Error) => toast.error(err.message || 'Không thể tạo khóa học.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tạo khóa học mới</h1>
        <p className="text-muted-foreground">
          Điền thông tin cơ bản, sau đó bạn có thể thêm bài học và nội dung.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6 bg-card border border-border rounded-xl p-6"
      >
        <div>
          <label className="block text-sm font-medium mb-2">Tên khóa học *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="VD: Lập trình Python cơ bản"
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô tả *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Giới thiệu ngắn gọn về khóa học..."
            rows={4}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bạn sẽ học được gì</label>
          <textarea
            value={form.syllabus}
            onChange={(e) => setForm((f) => ({ ...f, syllabus: e.target.value }))}
            placeholder="Liệt kê các mục tiêu học tập..."
            rows={3}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Danh mục *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cấp độ</label>
            <select
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
            >
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Nâng cao</option>
              <option value="all-levels">Mọi cấp độ</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Giá (VNĐ)</label>
            <input
              type="number"
              min={0}
              value={form.price || ''}
              onChange={(e) => setForm((f) => ({ ...f, price: parseInt(e.target.value, 10) || 0 }))}
              placeholder="0 = Miễn phí"
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Thời gian học ước tính (giờ) *</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={form.estimatedCompletionHours || ''}
              onChange={(e) => setForm((f) => ({ ...f, estimatedCompletionHours: parseFloat(e.target.value) || 0 }))}
              placeholder="VD: 20"
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ảnh bìa</label>
          {form.thumbnail && (
            <div className="mb-2 rounded-lg overflow-hidden border border-border w-full max-w-xs aspect-video">
              <img src={form.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex flex-wrap gap-2 items-center">
            <label className="px-4 py-2 border border-border rounded-lg hover:bg-muted cursor-pointer text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2">
              {uploadingThumbnail ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {uploadingThumbnail ? 'Đang tải lên...' : 'Chọn ảnh upload'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                disabled={uploadingThumbnail}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingThumbnail(true);
                  uploadApi
                    .thumbnail(file)
                    .then((res) => setForm((f) => ({ ...f, thumbnail: res.data.url })))
                    .catch((err: Error) => toast.error(err?.message || 'Upload thất bại.'))
                    .finally(() => setUploadingThumbnail(false));
                  e.target.value = '';
                }}
              />
            </label>
            <span className="text-muted-foreground text-sm">hoặc nhập URL:</span>
            <input
              type="url"
              value={form.thumbnail}
              onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
              placeholder="https://..."
              className="flex-1 min-w-[200px] px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Tạo khóa học
          </button>
          <button
            type="button"
            onClick={() => navigate('/instructor/courses')}
            className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Hủy
          </button>
        </div>
      </motion.form>
    </div>
  );
}
