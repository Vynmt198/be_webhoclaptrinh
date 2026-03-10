import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Video, FileText, HelpCircle, ClipboardList, Users } from 'lucide-react';
import { courseApi, categoryApi, lessonApi, uploadApi, instructorQuizApi, assignmentApi, type Category, type Lesson, type Assignment, type AssignmentSubmission } from '@/app/lib/api';
import { toast } from 'sonner';

export function InstructorCourseEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'video' as 'video' | 'text' | 'quiz',
    videoUrl: '',
    content: '',
    duration: 0,
    isPreview: false,
  });
  const [savingLesson, setSavingLesson] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [quizModalLessonId, setQuizModalLessonId] = useState<string | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    passingScore: 80,
    questions: [] as { questionText: string; options: string[]; correctIndex: number }[],
  });
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    maxScore: 100,
    dueDate: '',
    lessonId: '',
  });
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [submissionsModalAssignmentId, setSubmissionsModalAssignmentId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '', status: 'graded' as 'submitted' | 'graded' | 'needs_revision' });
  const [savingGrade, setSavingGrade] = useState(false);
  const [courseStatus, setCourseStatus] = useState<string>('draft');
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

  useEffect(() => {
    if (!id) {
      setFetching(false);
      return;
    }
    setFetching(true);
    courseApi
      .getById(id)
      .then((res) => {
        const c = res.data;
        setCourseStatus(c.status || 'draft');
        setForm({
          title: c.title || '',
          description: c.description || '',
          syllabus: c.syllabus || '',
          categoryId: (typeof c.categoryId === 'object' ? c.categoryId?._id : c.categoryId) ?? '',
          level: c.level || 'beginner',
          price: c.price ?? 0,
          thumbnail: c.thumbnail || '',
          estimatedCompletionHours: c.estimatedCompletionHours ?? 0,
        });
      })
      .catch(() => {
        toast.error('Không tải được thông tin khóa học.');
        navigate('/instructor/courses');
      })
      .finally(() => setFetching(false));
  }, [id, navigate]);

  const fetchLessons = useCallback(() => {
    if (!id) return;
    setLoadingLessons(true);
    courseApi
      .getCurriculum(id)
      .then((res) => setLessons(res.data || []))
      .catch(() => setLessons([]))
      .finally(() => setLoadingLessons(false));
  }, [id]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const fetchAssignments = useCallback(() => {
    if (!id) return;
    setLoadingAssignments(true);
    assignmentApi
      .listByCourse(id)
      .then((res) => setAssignments(res.data?.assignments ?? []))
      .catch(() => setAssignments([]))
      .finally(() => setLoadingAssignments(false));
  }, [id]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const openAddAssignment = () => {
    setEditingAssignmentId(null);
    setAssignmentForm({ title: '', description: '', maxScore: 100, dueDate: '', lessonId: '' });
    setAssignmentModalOpen(true);
  };

  const openEditAssignment = (a: Assignment) => {
    setEditingAssignmentId(a._id);
    setAssignmentForm({
      title: a.title || '',
      description: a.description || '',
      maxScore: a.maxScore ?? 100,
      dueDate: a.dueDate ? a.dueDate.slice(0, 10) : '',
      lessonId: typeof a.lessonId === 'object' && a.lessonId?._id ? a.lessonId._id : '',
    });
    setAssignmentModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentForm.title.trim()) {
      toast.error('Vui lòng nhập tên bài tập.');
      return;
    }
    setSavingAssignment(true);
    const payload = {
      title: assignmentForm.title.trim(),
      description: assignmentForm.description || undefined,
      maxScore: assignmentForm.maxScore || 100,
      dueDate: assignmentForm.dueDate || undefined,
      lessonId: assignmentForm.lessonId || undefined,
    };
    if (editingAssignmentId) {
      assignmentApi
        .update(editingAssignmentId, payload)
        .then(() => {
          toast.success('Đã cập nhật bài tập.');
          setAssignmentModalOpen(false);
          fetchAssignments();
        })
        .catch((err: Error) => toast.error(err?.message || 'Không thể cập nhật.'))
        .finally(() => setSavingAssignment(false));
    } else if (id) {
      assignmentApi
        .create(id, payload)
        .then(() => {
          toast.success('Đã thêm bài tập.');
          setAssignmentModalOpen(false);
          fetchAssignments();
        })
        .catch((err: Error) => toast.error(err?.message || 'Không thể thêm bài tập.'))
        .finally(() => setSavingAssignment(false));
    } else {
      setSavingAssignment(false);
    }
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài tập này? Các bài nộp sẽ bị xóa.')) return;
    assignmentApi
      .delete(assignmentId)
      .then(() => {
        toast.success('Đã xóa bài tập.');
        fetchAssignments();
        if (submissionsModalAssignmentId === assignmentId) setSubmissionsModalAssignmentId(null);
      })
      .catch((err: Error) => toast.error(err?.message || 'Không thể xóa.'));
  };

  const openSubmissions = (assignmentId: string) => {
    setSubmissionsModalAssignmentId(assignmentId);
    setSubmissions([]);
    setLoadingSubmissions(true);
    assignmentApi
      .getSubmissions(assignmentId)
      .then((res) => setSubmissions(res.data?.submissions ?? []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoadingSubmissions(false));
  };

  const openGradeForm = (sub: AssignmentSubmission) => {
    setGradingSubmissionId(sub._id);
    setGradeForm({
      score: sub.score != null ? String(sub.score) : '',
      feedback: sub.feedback || '',
      status: sub.status || 'graded',
    });
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmissionId) return;
    const scoreNum = gradeForm.score.trim() ? parseFloat(gradeForm.score) : undefined;
    if (scoreNum !== undefined && (Number.isNaN(scoreNum) || scoreNum < 0)) {
      toast.error('Điểm không hợp lệ.');
      return;
    }
    setSavingGrade(true);
    assignmentApi
      .gradeSubmission(gradingSubmissionId, {
        score: scoreNum,
        feedback: gradeForm.feedback || undefined,
        status: gradeForm.status,
      })
      .then(() => {
        toast.success('Đã lưu điểm.');
        setGradingSubmissionId(null);
        if (submissionsModalAssignmentId) {
          assignmentApi
            .getSubmissions(submissionsModalAssignmentId)
            .then((res) => setSubmissions(res.data?.submissions ?? []));
        }
      })
      .catch((err: Error) => toast.error(err?.message || 'Không thể lưu điểm.'))
      .finally(() => setSavingGrade(false));
  };

  const openAddLesson = () => {
    setEditingLessonId(null);
    setLessonForm({
      title: '',
      type: 'video',
      videoUrl: '',
      content: '',
      duration: 0,
      isPreview: false,
    });
    setLessonModalOpen(true);
  };

  const openEditLesson = (lessonId: string) => {
    setEditingLessonId(lessonId);
    lessonApi
      .getById(lessonId)
      .then((res) => {
        const l = res.data;
        setLessonForm({
          title: l.title || '',
          type: (l.type as 'video' | 'text' | 'quiz') || 'video',
          videoUrl: l.videoUrl || '',
          content: l.content || '',
          duration: l.duration || 0,
          isPreview: l.isPreview || false,
        });
        setLessonModalOpen(true);
      })
      .catch((err: Error) => toast.error(err?.message || 'Không tải được bài học.'));
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!lessonForm.title.trim()) {
      toast.error('Vui lòng nhập tên bài học.');
      return;
    }
    setSavingLesson(true);
    const payload = {
      title: lessonForm.title.trim(),
      type: lessonForm.type,
      videoUrl: lessonForm.type === 'video' ? lessonForm.videoUrl : undefined,
      content: lessonForm.type === 'text' ? lessonForm.content : undefined,
      duration: lessonForm.duration || 0,
      isPreview: lessonForm.isPreview,
    };
    if (editingLessonId) {
      lessonApi
        .update(editingLessonId, payload)
        .then(() => {
          toast.success('Đã cập nhật bài học.');
          setLessonModalOpen(false);
          fetchLessons();
        })
        .catch((err: Error) => toast.error(err.message || 'Không thể cập nhật.'))
        .finally(() => setSavingLesson(false));
    } else {
      lessonApi
        .create(id, payload)
        .then(() => {
          toast.success('Đã thêm bài học.');
          setLessonModalOpen(false);
          fetchLessons();
        })
        .catch((err: Error) => toast.error(err.message || 'Không thể thêm bài học.'))
        .finally(() => setSavingLesson(false));
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài học này?')) return;
    lessonApi
      .delete(lessonId)
      .then(() => {
        toast.success('Đã xóa bài học.');
        fetchLessons();
      })
      .catch((err: Error) => toast.error(err.message || 'Không thể xóa.'));
  };

  const moveLesson = (index: number, direction: 'up' | 'down') => {
    if (!id || lessons.length === 0) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= lessons.length) return;
    const newList = [...lessons];
    const [item] = newList.splice(index, 1);
    newList.splice(target, 0, item);
    const reorderPayload = newList.map((l, i) => ({ id: l._id, order: i }));
    lessonApi
      .reorder(id, reorderPayload)
      .then(() => {
        toast.success('Đã đổi thứ tự.');
        fetchLessons();
      })
      .catch((err: Error) => toast.error(err.message || 'Không thể đổi thứ tự.'));
  };

  const openQuizSetup = (lessonId: string) => {
    const lesson = lessons.find((l) => l._id === lessonId);
    setQuizModalLessonId(lessonId);
    setLoadingQuiz(true);
    setQuizForm({ title: lesson?.title || 'Quiz', passingScore: 80, questions: [] });
    instructorQuizApi
      .getByLessonId(lessonId)
      .then((res) => {
        const q = res.data;
        setQuizForm({
          title: q.title || lesson?.title || 'Quiz',
          passingScore: q.passingScore ?? 80,
          questions: (q.questions || []).map((qn) => {
            const opts = Array.isArray(qn.options) ? [...qn.options, '', '', '', ''].slice(0, 4) : ['', '', '', ''];
            const correctVal = qn.correctAnswer ?? opts[0];
            const correctIndex = Math.min(3, Math.max(0, opts.indexOf(String(correctVal))));
            return {
              questionText: qn.questionText || '',
              options: opts,
              correctIndex: correctIndex >= 0 ? correctIndex : 0,
            };
          }),
        });
      })
      .catch(() => {
        setQuizForm({
          title: lesson?.title || 'Quiz',
          passingScore: 80,
          questions: [],
        });
      })
      .finally(() => setLoadingQuiz(false));
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizModalLessonId) return;
    const mapped = quizForm.questions
      .filter((q) => q.questionText.trim())
      .map((q) => {
        const opts = q.options.filter((o) => o.trim()).length ? q.options : ['A', 'B', 'C', 'D'];
        const correctIdx = Math.max(0, Math.min(q.correctIndex, opts.length - 1));
        return {
          questionText: q.questionText.trim(),
          type: 'multiple-choice' as const,
          options: opts,
          correctAnswer: (opts[correctIdx] ?? opts[0] ?? '').trim() || opts[0],
          points: 1,
        };
      });
    if (mapped.length === 0) {
      toast.error('Thêm ít nhất một câu hỏi trước khi lưu.');
      return;
    }
    setSavingQuiz(true);
    const payload = {
      title: quizForm.title || 'Quiz',
      passingScore: quizForm.passingScore,
      questions: mapped,
    };
    instructorQuizApi
      .createOrUpdate(quizModalLessonId, payload)
      .then(() => {
        toast.success('Đã lưu câu hỏi quiz.');
        setQuizModalLessonId(null);
      })
      .catch((err: Error) => toast.error(err?.message || 'Không thể lưu quiz.'))
      .finally(() => setSavingQuiz(false));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const isDraft = courseStatus === 'draft';
    if (isDraft) {
      if (!form.title.trim()) {
        toast.error('Vui lòng nhập tên khóa học.');
        return;
      }
      if (!form.categoryId) {
        toast.error('Vui lòng chọn danh mục khóa học.');
        return;
      }
    }
    if (!form.description.trim()) {
      toast.error('Vui lòng nhập mô tả khóa học.');
      return;
    }
    if (form.estimatedCompletionHours < 0) {
      toast.error('Thời gian học ước tính phải lớn hơn 0.');
      return;
    }
    setLoading(true);
    const payload = isDraft
      ? {
          title: form.title.trim(),
          description: form.description.trim(),
          syllabus: form.syllabus || undefined,
          categoryId: form.categoryId || null,
          level: form.level,
          price: form.price,
          thumbnail: form.thumbnail || null,
          estimatedCompletionHours: form.estimatedCompletionHours || 0,
        }
      : {
          description: form.description.trim(),
          syllabus: form.syllabus || undefined,
          thumbnail: form.thumbnail || null,
          estimatedCompletionHours: form.estimatedCompletionHours || 0,
        };
    courseApi
      .update(id, payload)
      .then((res) => {
        toast.success('Đã cập nhật khóa học!');
        navigate(`/courses/${res.data._id}`);
      })
      .catch((err: Error) => toast.error(err.message || 'Không thể cập nhật khóa học.'))
      .finally(() => setLoading(false));
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Chỉnh sửa khóa học</h1>
        <p className="text-muted-foreground">
          {courseStatus === 'draft'
            ? 'Cập nhật thông tin khóa học. Có thể sửa mọi trường khi khóa ở trạng thái Nháp.'
            : 'Khóa đã gửi duyệt/đã duyệt: chỉ có thể sửa mô tả, nội dung học, ảnh bìa, thời lượng. Tên, danh mục, cấp độ, giá do admin quản lý.'}
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6 bg-card border border-border rounded-xl p-6"
      >
        <div>
          <label className="block text-sm font-medium mb-2">Tên khóa học {courseStatus === 'draft' ? '*' : ''}</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="VD: Lập trình Python cơ bản"
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed bg-muted/30"
            required={courseStatus === 'draft'}
            readOnly={courseStatus !== 'draft'}
            disabled={courseStatus !== 'draft'}
          />
          {courseStatus !== 'draft' && (
            <p className="text-xs text-muted-foreground mt-1">Không thể thay đổi khi khóa đã gửi duyệt/đã duyệt</p>
          )}
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
            <label className="block text-sm font-medium mb-2">Danh mục {courseStatus === 'draft' ? '*' : ''}</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed bg-muted/30"
              disabled={courseStatus !== 'draft'}
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
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed bg-muted/30"
              disabled={courseStatus !== 'draft'}
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
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed bg-muted/30"
              disabled={courseStatus !== 'draft'}
            />
            {courseStatus !== 'draft' && (
              <p className="text-xs text-muted-foreground mt-1">Liên hệ admin để thay đổi giá</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Thời gian học ước tính (giờ) *</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={form.estimatedCompletionHours || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, estimatedCompletionHours: parseFloat(e.target.value) || 0 }))
              }
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
            <span className="text-muted-foreground text-sm">hoặc URL:</span>
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
            Lưu thay đổi
          </button>
          <button
            type="button"
            onClick={() => navigate('/instructor/courses')}
            className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Hủy
          </button>
          {id && (
            <button
              type="button"
              onClick={() => navigate(`/courses/${id}`)}
              className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Xem chi tiết
            </button>
          )}
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Nội dung khóa học (Curriculum)</h2>
          <button
            type="button"
            onClick={openAddLesson}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Thêm bài học
          </button>
        </div>
        {loadingLessons ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : lessons.length === 0 ? (
          <p className="text-muted-foreground py-4">Chưa có bài học. Nhấn &quot;Thêm bài học&quot; để tạo.</p>
        ) : (
          <ul className="space-y-2">
            {lessons.map((lesson, index) => (
              <li
                key={lesson._id}
                className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40"
              >
                <span className="text-muted-foreground w-6 text-sm">{index + 1}.</span>
                <span className="flex-1 font-medium truncate">{lesson.title}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {lesson.type === 'video' && <Video className="w-3.5 h-3.5" />}
                  {lesson.type === 'text' && <FileText className="w-3.5 h-3.5" />}
                  {lesson.type === 'quiz' && <HelpCircle className="w-3.5 h-3.5" />}
                  {lesson.type}
                </span>
                {lesson.isPreview && (
                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">Xem trước</span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveLesson(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-50"
                    title="Lên"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLesson(index, 'down')}
                    disabled={index === lessons.length - 1}
                    className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-50"
                    title="Xuống"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {lesson.type === 'quiz' && (
                    <button
                      type="button"
                      onClick={() => openQuizSetup(lesson._id)}
                      className="p-1.5 rounded border border-border hover:bg-primary/10 text-primary"
                      title="Thiết lập câu hỏi"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEditLesson(lesson._id)}
                    className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Sửa"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLesson(lesson._id)}
                    className="p-1.5 rounded border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Bài tập (Assignments)
          </h2>
          <button
            type="button"
            onClick={openAddAssignment}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Thêm bài tập
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Học viên cần pass hết quiz trong khóa mới được nộp bài tập. Chấm đạt bài tập thì mới đủ điều kiện nhận chứng chỉ.
        </p>
        {loadingAssignments ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-muted-foreground py-4">Chưa có bài tập. Nhấn &quot;Thêm bài tập&quot; để tạo.</p>
        ) : (
          <ul className="space-y-2">
            {assignments.map((a) => (
              <li
                key={a._id}
                className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40"
              >
                <ClipboardList className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="flex-1 font-medium truncate">{a.title}</span>
                <span className="text-xs text-muted-foreground">Điểm tối đa: {a.maxScore}</span>
                <button
                  type="button"
                  onClick={() => openSubmissions(a._id)}
                  className="p-1.5 rounded border border-border hover:bg-primary/10 text-primary flex items-center gap-1"
                  title="Xem bài nộp"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Bài nộp</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditAssignment(a)}
                  className="p-1.5 rounded border border-border hover:bg-muted"
                  title="Sửa"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAssignment(a._id)}
                  className="p-1.5 rounded border border-border hover:bg-destructive/10 text-destructive"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {lessonModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">
                {editingLessonId ? 'Chỉnh sửa bài học' : 'Thêm bài học'}
              </h3>
            </div>
            <form onSubmit={handleSaveLesson} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên bài học *</label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="VD: Giới thiệu khóa học"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loại</label>
                <select
                  value={lessonForm.type}
                  onChange={(e) =>
                    setLessonForm((f) => ({ ...f, type: e.target.value as 'video' | 'text' | 'quiz' }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                >
                  <option value="video">Video</option>
                  <option value="text">Văn bản</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              {lessonForm.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium mb-1">URL video</label>
                  <input
                    type="url"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
              )}
              {lessonForm.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Nội dung</label>
                  <textarea
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="Nội dung bài học..."
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Thời lượng (giây)</label>
                <input
                  type="number"
                  min={0}
                  value={lessonForm.duration || ''}
                  onChange={(e) =>
                    setLessonForm((f) => ({ ...f, duration: parseInt(e.target.value, 10) || 0 }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lessonForm.isPreview}
                  onChange={(e) => setLessonForm((f) => ({ ...f, isPreview: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-sm">Cho xem trước (miễn phí)</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {savingLesson && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingLessonId ? 'Lưu' : 'Thêm'}
                </button>
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {quizModalLessonId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Thiết lập câu hỏi Quiz</h3>
            </div>
            <form onSubmit={handleSaveQuiz} className="p-6 space-y-4">
              {loadingQuiz ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tiêu đề quiz</label>
                    <input
                      type="text"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Điểm đạt (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={quizForm.passingScore}
                      onChange={(e) =>
                        setQuizForm((f) => ({ ...f, passingScore: parseInt(e.target.value, 10) || 0 }))
                      }
                      className="w-24 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Câu hỏi</label>
                      <button
                        type="button"
                        onClick={() =>
                          setQuizForm((f) => ({
                            ...f,
                            questions: [...f.questions, { questionText: '', options: ['', '', '', ''], correctIndex: 0 }],
                          }))
                        }
                        className="text-sm text-primary hover:underline"
                      >
                        + Thêm câu hỏi
                      </button>
                    </div>
                    <div className="space-y-4">
                      {quizForm.questions.map((q, qIdx) => (
                        <div key={qIdx} className="p-4 rounded-lg border border-border bg-muted/20 space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <input
                              type="text"
                              value={q.questionText}
                              onChange={(e) => {
                                const next = [...quizForm.questions];
                                next[qIdx] = { ...next[qIdx], questionText: e.target.value };
                                setQuizForm((f) => ({ ...f, questions: next }));
                              }}
                              placeholder={`Nội dung câu hỏi ${qIdx + 1}`}
                              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setQuizForm((f) => ({
                                  ...f,
                                  questions: f.questions.filter((_, i) => i !== qIdx),
                                }))
                              }
                              className="p-1.5 rounded border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pl-2">
                            {[0, 1, 2, 3].map((optIdx) => (
                              <label key={optIdx} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${qIdx}`}
                                  checked={q.correctIndex === optIdx}
                                  onChange={() => {
                                    const next = [...quizForm.questions];
                                    next[qIdx] = { ...next[qIdx], correctIndex: optIdx };
                                    setQuizForm((f) => ({ ...f, questions: next }));
                                  }}
                                />
                                <input
                                  type="text"
                                  value={q.options[optIdx] ?? ''}
                                  onChange={(e) => {
                                    const next = [...quizForm.questions];
                                    const opts = [...(next[qIdx].options || ['', '', '', ''])];
                                    opts[optIdx] = e.target.value;
                                    next[qIdx] = { ...next[qIdx], options: opts };
                                    setQuizForm((f) => ({ ...f, questions: next }));
                                  }}
                                  placeholder={`Đáp án ${optIdx + 1}`}
                                  className="flex-1 px-2 py-1 border border-border rounded text-sm"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={savingQuiz}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingQuiz && <Loader2 className="w-4 h-4 animate-spin" />}
                      Lưu quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuizModalLessonId(null)}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              )}
            </form>
          </motion.div>
        </div>
      )}

      {assignmentModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">
                {editingAssignmentId ? 'Chỉnh sửa bài tập' : 'Thêm bài tập'}
              </h3>
            </div>
            <form onSubmit={handleSaveAssignment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên bài tập *</label>
                <input
                  type="text"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="VD: Bài tập tuần 1"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả / yêu cầu</label>
                <textarea
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả bài tập, yêu cầu nộp..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Điểm tối đa</label>
                  <input
                    type="number"
                    min={1}
                    value={assignmentForm.maxScore}
                    onChange={(e) =>
                      setAssignmentForm((f) => ({ ...f, maxScore: parseInt(e.target.value, 10) || 100 }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hạn nộp (tùy chọn)</label>
                  <input
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gắn với bài học (tùy chọn)</label>
                <select
                  value={assignmentForm.lessonId}
                  onChange={(e) => setAssignmentForm((f) => ({ ...f, lessonId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                >
                  <option value="">-- Không gắn --</option>
                  {lessons.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingAssignment}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {savingAssignment && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingAssignmentId ? 'Lưu' : 'Thêm'}
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {submissionsModalAssignmentId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bài nộp của học viên</h3>
              <button
                type="button"
                onClick={() => {
                  setSubmissionsModalAssignmentId(null);
                  setGradingSubmissionId(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Đóng
              </button>
            </div>
            <div className="p-6">
              {loadingSubmissions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : submissions.length === 0 ? (
                <p className="text-muted-foreground py-4">Chưa có bài nộp nào.</p>
              ) : (
                <ul className="space-y-3">
                  {submissions.map((sub) => {
                    const user = typeof sub.userId === 'object' ? sub.userId : null;
                    const name = user?.fullName ?? (typeof sub.userId === 'string' ? sub.userId : '-');
                    const isGrading = gradingSubmissionId === sub._id;
                    return (
                      <li key={sub._id} className="p-4 rounded-lg border border-border bg-muted/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{name}</span>
                          <span className="text-sm text-muted-foreground">
                            {sub.status} {sub.score != null ? `· ${sub.score} điểm` : ''}
                          </span>
                        </div>
                        {sub.content && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-2">{sub.content}</p>
                        )}
                        {isGrading ? (
                          <form onSubmit={handleSaveGrade} className="mt-2 space-y-2 flex flex-col gap-2">
                            <input
                              type="number"
                              min={0}
                              step={0.5}
                              placeholder="Điểm"
                              value={gradeForm.score}
                              onChange={(e) => setGradeForm((f) => ({ ...f, score: e.target.value }))}
                              className="w-24 px-2 py-1 border border-border rounded text-sm"
                            />
                            <textarea
                              placeholder="Nhận xét"
                              value={gradeForm.feedback}
                              onChange={(e) => setGradeForm((f) => ({ ...f, feedback: e.target.value }))}
                              rows={2}
                              className="w-full px-2 py-1 border border-border rounded text-sm resize-none"
                            />
                            <select
                              value={gradeForm.status}
                              onChange={(e) =>
                                setGradeForm((f) => ({
                                  ...f,
                                  status: e.target.value as 'submitted' | 'graded' | 'needs_revision',
                                }))
                              }
                              className="w-full max-w-xs px-2 py-1 border border-border rounded text-sm"
                            >
                              <option value="submitted">Đã nộp</option>
                              <option value="graded">Đã chấm</option>
                              <option value="needs_revision">Cần sửa lại</option>
                            </select>
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={savingGrade}
                                className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50"
                              >
                                {savingGrade ? 'Đang lưu...' : 'Lưu điểm'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setGradingSubmissionId(null)}
                                className="px-3 py-1.5 border border-border rounded text-sm"
                              >
                                Hủy
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openGradeForm(sub)}
                            className="text-sm text-primary hover:underline"
                          >
                            Chấm điểm
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
