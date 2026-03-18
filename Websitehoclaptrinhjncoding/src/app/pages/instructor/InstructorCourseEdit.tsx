import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Video, FileText, HelpCircle, ClipboardList, Users, X, MessageSquareMore, Pin, Send, BookOpen } from 'lucide-react';
import { courseApi, categoryApi, lessonApi, uploadApi, instructorQuizApi, assignmentApi, discussionApi, type Category, type Lesson, type Assignment, type AssignmentSubmission, type DiscussionPost } from '@/app/lib/api';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

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
    resources: '',
    duration: 0,
    isPreview: false,
  });
  const [savingLesson, setSavingLesson] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [quizModalLessonId, setQuizModalLessonId] = useState<string | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    passingScore: 80,
    questions: [] as { questionText: string; questionCode: string; options: string[]; correctIndex: number }[],
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
    type: 'exam' as 'exam',
    timeLimitMinutes: '' as string | '',
    passingScorePercent: 60 as number,
    questionsJson: '',
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
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false);
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [repliesByPostId, setRepliesByPostId] = useState<Record<string, DiscussionPost[]>>({});
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set());
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContentByPostId, setReplyContentByPostId] = useState<Record<string, string>>({});
  const [sendingPost, setSendingPost] = useState(false);
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [pinningId, setPinningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleImportQuizFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = String(e.target?.result || '');
        const raw = JSON.parse(text);
        if (!Array.isArray(raw)) {
          throw new Error('File quiz phải chứa một mảng câu hỏi (JSON array).');
        }
        const mapped = raw
          .map((item, idx) => {
            const questionText = (item.questionText ?? item.question ?? '').toString().trim();
            if (!questionText) return null;
            const questionCode = (item.questionCode ?? item.code ?? '').toString();
            const rawOptions = Array.isArray(item.options) ? item.options.map((o: unknown) => String(o)) : [];
            const options = rawOptions.length ? rawOptions : ['', '', '', ''];
            const rawIndex =
              typeof item.correctIndex === 'number'
                ? item.correctIndex
                : typeof item.correctOptionIndex === 'number'
                ? item.correctOptionIndex
                : 0;
            const correctIndex = Math.max(0, Math.min(rawIndex, options.length - 1));
            return {
              questionText,
              questionCode,
              options,
              correctIndex,
            };
          })
          .filter(Boolean) as { questionText: string; questionCode: string; options: string[]; correctIndex: number }[];

        if (!mapped.length) {
          throw new Error('Không tìm thấy câu hỏi hợp lệ trong file.');
        }

        setQuizForm((f) => ({ ...f, questions: mapped }));
        toast.success(`Đã import ${mapped.length} câu hỏi từ file.`);
      } catch (err) {
        console.error(err);
        toast.error(
          err instanceof Error
            ? err.message
            : 'File không đúng định dạng. Vui lòng dùng JSON chứa mảng câu hỏi.'
        );
      }
    };
    reader.readAsText(file);
  };

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
      .then((res: { data?: { assignments?: Assignment[] } }) =>
        setAssignments((res.data?.assignments ?? []).filter((a) => a.type === 'exam'))
      )
      .catch(() => setAssignments([]))
      .finally(() => setLoadingAssignments(false));
  }, [id]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const openAddAssignment = () => {
    setEditingAssignmentId(null);
    setAssignmentForm({
      title: '',
      description: '',
      maxScore: 100,
      dueDate: '',
      lessonId: '',
      type: 'exam',
      timeLimitMinutes: '',
      passingScorePercent: 60,
      questionsJson: '',
    });
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
      type: 'exam',
      timeLimitMinutes: a.timeLimitMinutes != null ? String(a.timeLimitMinutes) : '',
      passingScorePercent: a.passingScorePercent ?? 60,
      questionsJson: a.questions ? JSON.stringify(a.questions, null, 2) : '',
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
    let parsedQuestions: unknown = undefined;
    if (assignmentForm.questionsJson.trim()) {
      try {
        parsedQuestions = JSON.parse(assignmentForm.questionsJson);
      } catch {
        toast.error('JSON câu hỏi không hợp lệ.');
        setSavingAssignment(false);
        return;
      }
    }
    const payload: any = {
      title: assignmentForm.title.trim(),
      description: assignmentForm.description || undefined,
      maxScore: assignmentForm.maxScore || 100,
      dueDate: assignmentForm.dueDate || undefined,
      lessonId: assignmentForm.lessonId || undefined,
      type: 'exam',
    };
    payload.timeLimitMinutes = assignmentForm.timeLimitMinutes
      ? Number(assignmentForm.timeLimitMinutes)
      : undefined;
    payload.passingScorePercent = assignmentForm.passingScorePercent ?? 60;
    if (parsedQuestions) {
      payload.questions = parsedQuestions;
    }
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
      .then((res: { data?: { submissions?: AssignmentSubmission[] } }) => setSubmissions(res.data?.submissions ?? []))
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
            .then((res: { data?: { submissions?: AssignmentSubmission[] } }) => setSubmissions(res.data?.submissions ?? []));
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
      resources: '',
      // duration input is in minutes (backend stores seconds)
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
          resources: l.resources || '',
          // Convert seconds -> minutes for UI
          duration: l.duration ? Math.round((l.duration / 60) * 10) / 10 : 0,
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
    const durationMinutes = Number(lessonForm.duration) || 0;
    const durationSeconds = Math.max(0, Math.round(durationMinutes * 60));
    const payload = {
      title: lessonForm.title.trim(),
      type: lessonForm.type,
      videoUrl: lessonForm.type === 'video' ? lessonForm.videoUrl : undefined,
      content: lessonForm.type === 'text' ? lessonForm.content : undefined,
      resources: lessonForm.resources || undefined,
      duration: durationSeconds,
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
        .then((res) => {
          const newLesson = res.data as Lesson;
          toast.success('Đã thêm bài học.');
          setLessonModalOpen(false);
          fetchLessons();
          if (newLesson?._id && lessonForm.type === 'quiz') {
            openQuizSetup(newLesson._id);
          }
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
              questionCode: (qn as { questionCode?: string }).questionCode ?? '',
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

  const loadDiscussions = useCallback(() => {
    if (!id) return;
    setLoadingDiscussions(true);
    discussionApi
      .getList(id, { limit: 50 })
      .then((res) => setDiscussions(res.data?.discussions ?? []))
      .catch((err: Error) => toast.error(err?.message || 'Không tải được hỏi đáp.'))
      .finally(() => setLoadingDiscussions(false));
  }, [id]);

  const loadReplies = useCallback((postId: string) => {
    if (!id) return;
    discussionApi
      .getReplies(id, postId, { limit: 100 })
      .then((res) => {
        setRepliesByPostId((prev) => ({ ...prev, [postId]: res.data?.replies ?? [] }));
      })
      .catch((err: Error) => toast.error(err?.message || 'Không tải được trả lời.'));
  }, [id]);

  useEffect(() => {
    if (discussionModalOpen && id) loadDiscussions();
  }, [discussionModalOpen, id, loadDiscussions]);

  const handleExpandPost = (postId: string) => {
    setExpandedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else {
        next.add(postId);
        if (!repliesByPostId[postId]) loadReplies(postId);
      }
      return next;
    });
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newPostContent.trim()) return;
    setSendingPost(true);
    discussionApi
      .create({ courseId: id, title: 'Thảo luận', content: newPostContent.trim() })
      .then(() => {
        setNewPostContent('');
        loadDiscussions();
        toast.success('Đã đăng bài.');
      })
      .catch((err: Error) => toast.error(err?.message || 'Không thể đăng bài.'))
      .finally(() => setSendingPost(false));
  };

  const handleReply = (postId: string) => {
    const content = (replyContentByPostId[postId] ?? '').trim();
    if (!content) return;
    setSendingReplyId(postId);
    discussionApi
      .reply(postId, { content, courseId: id ?? undefined })
      .then(() => {
        setReplyContentByPostId((prev) => ({ ...prev, [postId]: '' }));
        loadReplies(postId);
        loadDiscussions();
        toast.success('Đã trả lời.');
      })
      .catch((err: Error) => toast.error(err?.message || 'Không thể gửi trả lời.'))
      .finally(() => setSendingReplyId(null));
  };

  const handlePinPost = (postId: string) => {
    setPinningId(postId);
    discussionApi
      .pin(postId)
      .then(() => {
        loadDiscussions();
        toast.success('Đã cập nhật ghim.');
      })
      .catch((err: Error) => toast.error(err?.message || 'Không thể ghim.'))
      .finally(() => setPinningId(null));
  };

  const handleDeleteDiscussion = (discussionId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết/trả lời này?')) return;
    setDeletingId(discussionId);
    discussionApi
      .delete(discussionId)
      .then(() => {
        loadDiscussions();
        setRepliesByPostId((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((pid) => {
            next[pid] = next[pid].filter((r) => r._id !== discussionId);
          });
          return next;
        });
        toast.success('Đã xóa.');
      })
      .catch((err: Error) => toast.error(err?.message || 'Không thể xóa.'))
      .finally(() => setDeletingId(null));
  };

  const getDiscussionUserName = (p: DiscussionPost) =>
    typeof p.userId === 'object' && p.userId?.fullName ? p.userId.fullName : '—';

  const getLessonKey = (p: DiscussionPost): string => {
    const lid = typeof p.lessonId === 'object' ? (p.lessonId as { _id?: string })?._id : p.lessonId;
    return lid ?? 'none';
  };
  const getLessonTitle = (p: DiscussionPost): string => {
    if (typeof p.lessonId === 'object' && p.lessonId?.title) return p.lessonId.title as string;
    const lid = typeof p.lessonId === 'object' ? (p.lessonId as { _id?: string })?._id : p.lessonId;
    if (lid) {
      const lesson = lessons.find((l) => l._id === lid);
      return lesson?.title ?? 'Bài học';
    }
    return 'Chung (không gắn bài học)';
  };
  const discussionsByLesson = (() => {
    const map: Record<string, DiscussionPost[]> = {};
    discussions.forEach((p) => {
      const key = getLessonKey(p);
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    const keys = Object.keys(map);
    const sortedKeys = keys.filter((k) => k !== 'none').sort((a, b) => {
      const idxA = lessons.findIndex((l) => l._id === a);
      const idxB = lessons.findIndex((l) => l._id === b);
      if (idxA >= 0 && idxB >= 0) return idxA - idxB;
      if (idxA >= 0) return -1;
      if (idxB >= 0) return 1;
      return 0;
    });
    if (map['none']) sortedKeys.push('none');
    return sortedKeys.map((key) => ({ key, posts: map[key], title: map[key][0] ? getLessonTitle(map[key][0]) : '—' }));
  })();

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
          questionCode: (q.questionCode ?? '').trim(),
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
            <div className="space-y-2">
              <Select
                value={form.categoryId || 'none'}
                onValueChange={(value: string) =>
                  setForm((f) => ({ ...f, categoryId: value === 'none' ? '' : value }))
                }
                disabled={courseStatus !== 'draft'}
              >
                <SelectTrigger className="w-full bg-muted/30">
                  <SelectValue placeholder="-- Chọn danh mục --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Chọn danh mục --</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {courseStatus === 'draft' && (
                <button
                  type="button"
                  onClick={() => {
                    setNewCategory({ name: '', description: '' });
                    setCategoryModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm border border-dashed border-border rounded-lg hover:bg-muted"
                >
                  + Thêm danh mục
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cấp độ</label>
            <Select
              value={form.level}
              onValueChange={(value: string) => setForm((f) => ({ ...f, level: value }))}
              disabled={courseStatus !== 'draft'}
            >
              <SelectTrigger className="w-full bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Cơ bản</SelectItem>
                <SelectItem value="intermediate">Trung cấp</SelectItem>
                <SelectItem value="advanced">Nâng cao</SelectItem>
                <SelectItem value="all-levels">Mọi cấp độ</SelectItem>
              </SelectContent>
            </Select>
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
            <>
              <button
                type="button"
                onClick={() => navigate(`/courses/${id}/learn`)}
                className="px-6 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Xem trang học
              </button>
              <button
                type="button"
                onClick={() => navigate(`/courses/${id}`)}
                className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Xem chi tiết
              </button>
            </>
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
            <MessageSquareMore className="w-5 h-5" />
            Hỏi đáp khóa học
          </h2>
          <button
            type="button"
            onClick={() => setDiscussionModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 text-sm font-medium"
          >
            <MessageSquareMore className="w-4 h-4" />
            Xem &amp; trả lời hỏi đáp
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Xem và trả lời câu hỏi của học viên trong mục Thảo luận. Bạn có thể ghim bài quan trọng hoặc xóa nội dung vi phạm.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Bài thi cuối khóa (Trắc nghiệm)
          </h2>
          <button
            type="button"
            onClick={openAddAssignment}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Thêm bài thi
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Học viên cần pass hết quiz trong khóa để mở khóa làm bài thi cuối khóa. Đạt bài thi thì mới đủ điều kiện nhận chứng chỉ.
        </p>
        {loadingAssignments ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-muted-foreground py-4">Chưa có bài thi. Nhấn &quot;Thêm bài thi&quot; để tạo.</p>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 z-10 bg-card border-b border-border px-8 py-5">
              <h2 className="text-xl font-bold">
                {editingLessonId ? 'Chỉnh sửa bài học' : 'Thêm bài học'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Thông tin cơ bản và tài liệu cho bài học này</p>
            </div>
            <form onSubmit={handleSaveLesson} className="p-8 space-y-8">
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Thông tin bài học</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2">Tên bài học *</label>
                    <input
                      type="text"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="VD: Bài 1 - Giới thiệu khóa học"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Loại bài học</label>
                    <Select
                      value={lessonForm.type}
                      onValueChange={(value: string) =>
                        setLessonForm((f) => ({ ...f, type: value as 'video' | 'text' | 'quiz' }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="text">Văn bản</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Thời lượng (phút)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={lessonForm.duration || ''}
                      onChange={(e) =>
                        setLessonForm((f) => ({ ...f, duration: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                </div>
                {lessonForm.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">URL video (YouTube, v.v.)</label>
                    <input
                      type="url"
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm((f) => ({ ...f, videoUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/..."
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                )}
                {lessonForm.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Nội dung</label>
                    <textarea
                      value={lessonForm.content}
                      onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))}
                      placeholder="Nội dung bài học..."
                      rows={5}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                    />
                  </div>
                )}
                <label className="flex items-center gap-3 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={lessonForm.isPreview}
                    onChange={(e) => setLessonForm((f) => ({ ...f, isPreview: e.target.checked }))}
                    className="rounded border-border w-4 h-4"
                  />
                  <span className="text-sm">Cho xem trước (miễn phí)</span>
                </label>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tài liệu tham khảo</h3>
                <textarea
                  value={lessonForm.resources}
                  onChange={(e) => setLessonForm((f) => ({ ...f, resources: e.target.value }))}
                  placeholder="Ghi chú tài liệu, link slide, repo, bài viết... Mỗi dòng một mục."
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none resize-none text-sm"
                />
              </section>

              {lessonForm.type === 'quiz' && (
                <section className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    Nội dung Quiz
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Câu hỏi, đáp án, đoạn code (nếu có) và điểm đạt (%) được thiết lập trong bước riêng để dễ quản lý.
                  </p>
                  {editingLessonId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLessonModalOpen(false);
                        setQuizModalLessonId(editingLessonId);
                      }}
                      className="w-full py-4 px-5 rounded-xl border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90 font-semibold flex items-center justify-center gap-3 text-base"
                    >
                      <HelpCircle className="w-5 h-5" />
                      Mở thiết lập câu hỏi quiz (tiêu đề, câu hỏi, đáp án, điểm đạt)
                    </button>
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-4">
                      Lưu bài học trước. Sau đó nhấn nút <strong>Thiết lập câu hỏi</strong> (icon ?) bên cạnh bài học trong danh sách để thêm câu hỏi, đáp án và điểm đạt.
                    </p>
                  )}
                </section>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {savingLesson && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingLessonId ? 'Lưu thay đổi' : 'Thêm bài học'}
                </button>
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  className="px-6 py-3 border border-border rounded-xl hover:bg-muted font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Thêm danh mục mới */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full shadow-xl">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Thêm danh mục mới</h2>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const name = newCategory.name.trim();
                if (!name) {
                  toast.error('Vui lòng nhập tên danh mục.');
                  return;
                }
                try {
                  const res = await categoryApi.create({
                    name,
                    description: newCategory.description.trim() || undefined,
                  });
                  const created = res.data;
                  setCategories((prev) => [...prev, created]);
                  setForm((f) => ({ ...f, categoryId: created._id }));
                  toast.success('Đã thêm danh mục mới.');
                  setCategoryModalOpen(false);
                } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : 'Không thể thêm danh mục.');
                }
              }}
            >
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên danh mục *</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory((c) => ({ ...c, name: e.target.value }))}
                    placeholder="VD: JavaScript, Frontend, Backend..."
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mô tả (tùy chọn)</label>
                  <textarea
                    rows={3}
                    value={newCategory.description}
                    onChange={(e) => setNewCategory((c) => ({ ...c, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                    placeholder="Mô tả ngắn về danh mục này..."
                  />
                </div>
              </div>
              <div className="p-5 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
                >
                  Lưu danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {quizModalLessonId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="shrink-0 px-8 py-5 border-b border-border">
              <h2 className="text-xl font-bold">Thiết lập câu hỏi Quiz</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Thêm câu hỏi, đáp án và đoạn code (nếu có) cho bài quiz này</p>
            </div>
            <form onSubmit={handleSaveQuiz} className="flex flex-col flex-1 min-h-0 overflow-y-auto">
              {loadingQuiz ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              ) : (
                <div className="p-8 space-y-8">
                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tiêu đề quiz</label>
                      <input
                        type="text"
                        value={quizForm.title}
                        onChange={(e) => setQuizForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="VD: Ôn tập toán tử ++ và --"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Điểm đạt (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={quizForm.passingScore}
                        onChange={(e) =>
                          setQuizForm((f) => ({ ...f, passingScore: parseInt(e.target.value, 10) || 0 }))
                        }
                        className="w-full sm:w-32 px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                  </section>
                  <section>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Câu hỏi
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Bạn có thể thêm thủ công hoặc import nhanh từ file JSON.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer text-xs sm:text-sm font-medium text-primary hover:underline">
                          Nhập từ file (JSON)
                          <input
                            type="file"
                            accept="application/json,.json"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              if (file) {
                                handleImportQuizFile(file);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setQuizForm((f) => ({
                              ...f,
                              questions: [
                                ...f.questions,
                                { questionText: '', questionCode: '', options: ['', '', '', ''], correctIndex: 0 },
                              ],
                            }))
                          }
                          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          + Thêm câu hỏi
                        </button>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {quizForm.questions.map((q, qIdx) => (
                        <div key={qIdx} className="p-6 rounded-xl border border-border bg-muted/20 space-y-4">
                          <div className="flex justify-between items-start gap-3">
                            <input
                              type="text"
                              value={q.questionText}
                              onChange={(e) => {
                                const next = [...quizForm.questions];
                                next[qIdx] = { ...next[qIdx], questionText: e.target.value };
                                setQuizForm((f) => ({ ...f, questions: next }));
                              }}
                              placeholder={`Nội dung câu hỏi ${qIdx + 1}`}
                              className="flex-1 px-4 py-3 border border-border rounded-xl text-sm"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setQuizForm((f) => ({
                                  ...f,
                                  questions: f.questions.filter((_, i) => i !== qIdx),
                                }))
                              }
                              className="p-2 rounded-lg border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
                              title="Xóa câu hỏi"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-2">Đoạn code (tùy chọn) — hiển thị trong ô code cho học viên</label>
                            <textarea
                              value={q.questionCode}
                              onChange={(e) => {
                                const next = [...quizForm.questions];
                                next[qIdx] = { ...next[qIdx], questionCode: e.target.value };
                                setQuizForm((f) => ({ ...f, questions: next }));
                              }}
                              placeholder="var a = 1;&#10;console.log(a);"
                              rows={3}
                              className="w-full px-4 py-3 border border-border rounded-xl text-sm font-mono bg-background"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[0, 1, 2, 3].map((optIdx) => (
                              <label key={optIdx} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50 hover:border-primary/30 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`correct-${qIdx}`}
                                  checked={q.correctIndex === optIdx}
                                  onChange={() => {
                                    const next = [...quizForm.questions];
                                    next[qIdx] = { ...next[qIdx], correctIndex: optIdx };
                                    setQuizForm((f) => ({ ...f, questions: next }));
                                  }}
                                  className="w-4 h-4"
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
                                  className="flex-1 px-3 py-2 border-0 bg-transparent focus:ring-0 outline-none text-sm"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
              {!loadingQuiz && (
                <div className="shrink-0 px-8 py-5 border-t border-border bg-muted/20 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={savingQuiz}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 font-medium"
                  >
                    {savingQuiz && <Loader2 className="w-4 h-4 animate-spin" />}
                    Lưu quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuizModalLessonId(null)}
                    className="px-6 py-3 border border-border rounded-xl hover:bg-muted font-medium"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}

      {discussionModalOpen && id && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="shrink-0 px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquareMore className="w-5 h-5" />
                  Hỏi đáp khóa học
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">Xem và trả lời câu hỏi của học viên. Ghim bài quan trọng hoặc xóa nội dung vi phạm.</p>
              </div>
              <button type="button" onClick={() => setDiscussionModalOpen(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <form onSubmit={handleCreatePost} className="flex gap-2">
                <input
                  type="text"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Đăng bài mới (câu hỏi hoặc thông báo)..."
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                />
                <button type="submit" disabled={sendingPost || !newPostContent.trim()} className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 text-sm font-medium">
                  {sendingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Đăng
                </button>
              </form>
              {loadingDiscussions ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              ) : discussions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">Chưa có bài viết nào. Học viên có thể đăng trong mục Hỏi đáp khi học khóa.</p>
              ) : (
                <div className="space-y-6">
                  {discussionsByLesson.map(({ key: lessonKey, title: lessonTitle, posts: groupPosts }) => (
                    <div key={lessonKey}>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {lessonTitle}
                      </h3>
                      <ul className="space-y-4">
                        {groupPosts.map((post) => (
                          <li key={post._id} className="border border-border rounded-xl overflow-hidden bg-muted/10">
                      <div className="p-4 flex justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium text-sm">{getDiscussionUserName(post)}</span>
                            {post.isPinned && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/15 text-primary text-xs rounded-full">
                                <Pin className="w-3 h-3" /> Đã ghim
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : ''}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words">{post.title || post.content}</p>
                          {post.title && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">{post.content}</p>}
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              type="button"
                              onClick={() => handleExpandPost(post._id)}
                              className="text-xs text-primary hover:underline"
                            >
                              {expandedPostIds.has(post._id) ? 'Ẩn' : 'Xem'} {(post.repliesCount ?? 0)} trả lời
                            </button>
                            {!post.parentId && (
                              <button
                                type="button"
                                onClick={() => handlePinPost(post._id)}
                                disabled={pinningId === post._id}
                                className="text-xs text-muted-foreground hover:text-primary disabled:opacity-50 flex items-center gap-1"
                              >
                                {pinningId === post._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pin className="w-3 h-3" />}
                                {post.isPinned ? 'Bỏ ghim' : 'Ghim'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteDiscussion(post._id)}
                              disabled={deletingId === post._id}
                              className="text-xs text-muted-foreground hover:text-destructive disabled:opacity-50 flex items-center gap-1"
                            >
                              {deletingId === post._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                      {expandedPostIds.has(post._id) && (
                        <div className="border-t border-border bg-muted/20 p-4 space-y-3">
                          {(repliesByPostId[post._id] ?? []).map((reply) => (
                            <div key={reply._id} className="pl-4 border-l-2 border-primary/30 py-2">
                              <div className="flex justify-between gap-2">
                                <div>
                                  <span className="font-medium text-xs">{getDiscussionUserName(reply)}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {reply.createdAt ? new Date(reply.createdAt).toLocaleString('vi-VN') : ''}
                                  </span>
                                  <p className="text-sm mt-0.5 whitespace-pre-wrap break-words">{reply.content}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDiscussion(reply._id)}
                                  disabled={deletingId === reply._id}
                                  className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg"
                                >
                                  {deletingId === reply._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          ))}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleReply(post._id);
                            }}
                            className="flex gap-2 mt-2"
                          >
                            <input
                              type="text"
                              value={replyContentByPostId[post._id] ?? ''}
                              onChange={(e) => setReplyContentByPostId((prev) => ({ ...prev, [post._id]: e.target.value }))}
                              placeholder="Viết trả lời..."
                              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                            <button type="submit" disabled={sendingReplyId === post._id || !(replyContentByPostId[post._id] ?? '').trim()} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1">
                              {sendingReplyId === post._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              Gửi
                            </button>
                          </form>
                        </div>
                      )}
                    </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {assignmentModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 z-10 bg-card border-b border-border px-8 py-5">
              <h2 className="text-xl font-bold">
                {editingAssignmentId ? 'Chỉnh sửa bài thi' : 'Thêm bài thi'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Học viên cần pass hết quiz để mở khóa làm bài thi</p>
            </div>
            <form onSubmit={handleSaveAssignment} className="p-8 space-y-6">
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Thông tin bài thi</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Tên bài thi *</label>
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="VD: Bài thi cuối khóa"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mô tả / yêu cầu</label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Mô tả bài tập, yêu cầu nộp (nội dung, link code...)"
                    rows={5}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                  />
                </div>
              </section>
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Bài thi trắc nghiệm cuối khóa</h3>
                <div className="mt-2 space-y-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">
                    Thiết lập bài thi trắc nghiệm cho cuối khóa. Có thể nhập JSON câu hỏi thủ công hoặc import từ file.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Thời gian làm bài (phút)</label>
                      <input
                        type="number"
                        min={1}
                        value={assignmentForm.timeLimitMinutes}
                        onChange={(e) =>
                          setAssignmentForm((f) => ({ ...f, timeLimitMinutes: e.target.value }))
                        }
                        placeholder="VD: 60"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Điểm đạt tối thiểu (%)</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={assignmentForm.passingScorePercent}
                        onChange={(e) =>
                          setAssignmentForm((f) => ({
                            ...f,
                            passingScorePercent: parseInt(e.target.value, 10) || 60,
                          }))
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-sm font-medium">Câu hỏi trắc nghiệm (JSON)</label>
                      <label className="text-xs text-primary hover:underline cursor-pointer">
                        Import từ file JSON
                        <input
                          type="file"
                          accept="application/json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              try {
                                const text = String(reader.result || '');
                                JSON.parse(text);
                                setAssignmentForm((f) => ({ ...f, questionsJson: text }));
                                toast.success('Đã import file câu hỏi.');
                              } catch {
                                toast.error('File JSON không hợp lệ.');
                              }
                            };
                            reader.readAsText(file, 'utf-8');
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                    <textarea
                      value={assignmentForm.questionsJson}
                      onChange={(e) =>
                        setAssignmentForm((f) => ({ ...f, questionsJson: e.target.value }))
                      }
                      rows={8}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-xs font-mono bg-background"
                      placeholder='[{"questionText":"...","options":["A","B","C","D"],"correctIndex":0,"points":1}]'
                    />
                  </div>
                </div>
              </section>
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Điểm tối đa</label>
                  <input
                    type="number"
                    min={1}
                    value={assignmentForm.maxScore}
                    onChange={(e) =>
                      setAssignmentForm((f) => ({ ...f, maxScore: parseInt(e.target.value, 10) || 100 }))
                    }
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hạn nộp (tùy chọn)</label>
                  <input
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
              </section>
              <section>
                <label className="block text-sm font-medium mb-2">Gắn với bài học (tùy chọn)</label>
                <Select
                  value={assignmentForm.lessonId || 'none'}
                  onValueChange={(value: string) =>
                    setAssignmentForm((f) => ({ ...f, lessonId: value === 'none' ? '' : value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Không gắn --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Không gắn --</SelectItem>
                    {lessons.map((l) => (
                      <SelectItem key={l._id} value={l._id}>
                        {l.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={savingAssignment}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {savingAssignment && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingAssignmentId ? 'Lưu thay đổi' : 'Thêm bài thi'}
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentModalOpen(false)}
                  className="px-6 py-3 border border-border rounded-xl hover:bg-muted font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {submissionsModalAssignmentId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6 sm:p-8 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Bài nộp của học viên</h2>
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
                            <Select
                              value={gradeForm.status}
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              onValueChange={(value: any) =>
                                setGradeForm((f) => ({
                                  ...f,
                                  status: value as 'submitted' | 'graded' | 'needs_revision',
                                }))
                              }
                            >
                              <SelectTrigger className="w-full max-w-xs text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="submitted">Đã nộp</SelectItem>
                                <SelectItem value="graded">Đã chấm</SelectItem>
                                <SelectItem value="needs_revision">Cần sửa lại</SelectItem>
                              </SelectContent>
                            </Select>
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
