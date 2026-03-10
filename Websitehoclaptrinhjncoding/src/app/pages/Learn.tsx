import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Play,
  Lock,
  BookOpen,
  ClipboardList,
  Send,
  X,
  HelpCircle,
  RotateCcw,
  Award,
} from 'lucide-react';
import { learningApi, progressApi, quizApi, assignmentApi, assignmentLearnerApi, certificateApi, lessonContentApi, type Lesson, type LessonProgress, type Assignment, type AssignmentSubmission, type Quiz, type QuizQuestion } from '@/app/lib/api';
import { toast } from 'sonner';

interface LearningState {
  courseTitle: string;
  lessons: Lesson[];
  progressList: LessonProgress[];
  completionPercentage: number;
}

export function Learn() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<LearningState | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [canSubmitAssignment, setCanSubmitAssignment] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<AssignmentSubmission[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [submitModalAssignment, setSubmitModalAssignment] = useState<Assignment | null>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [submitAttachments, setSubmitAttachments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<unknown[]>([]);
  const [quizResult, setQuizResult] = useState<{ score: number; isPassed: boolean } | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [lessonContent, setLessonContent] = useState<Lesson | null>(null);
  const [loadingLessonContent, setLoadingLessonContent] = useState(false);

  const fetchLearning = useCallback(async () => {
    if (!id) return;
    const res = await learningApi.getCourseLearning(id);
    const { course, lessons, progress, completionPercentage } = res.data;
    setState({
      courseTitle: course.title,
      lessons,
      progressList: progress,
      completionPercentage: completionPercentage ?? 0,
    });
  }, [id]);

  const fetchAssignments = useCallback(() => {
    if (!id) return;
    setLoadingAssignments(true);
    assignmentApi
      .listByCourse(id)
      .then((res) => {
        setAssignments(res.data?.assignments ?? []);
        setCanSubmitAssignment(res.data?.canSubmit ?? false);
      })
      .catch(() => {
        setAssignments([]);
        setCanSubmitAssignment(false);
      })
      .finally(() => setLoadingAssignments(false));
    assignmentLearnerApi
      .getMySubmissionsByCourse(id!)
      .then((res) => setMySubmissions(res.data?.submissions ?? []))
      .catch(() => setMySubmissions([]));
  }, [id]);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Không tìm thấy khóa học');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await learningApi.getCourseLearning(id);
        const { course, lessons, progress, completionPercentage } = res.data;
        setState({
          courseTitle: course.title,
          lessons,
          progressList: progress,
          completionPercentage: completionPercentage ?? 0,
        });
        if (lessons.length > 0) {
          setCurrentLessonId((prev) => prev || lessons[0]._id);
        }
      } catch (err: any) {
        const msg = err?.message || 'Không thể tải dữ liệu khóa học.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (id && state) fetchAssignments();
  }, [id, state, fetchAssignments]);

  useEffect(() => {
    const lessonId = currentLessonId;
    if (!lessonId) return;
    setLoadingLessonContent(true);
    lessonContentApi
      .getContent(lessonId)
      .then((res) => setLessonContent(res.data.lesson))
      .catch(() => setLessonContent(null))
      .finally(() => setLoadingLessonContent(false));
  }, [currentLessonId]);

  const openSubmitModal = (a: Assignment) => {
    const sub = mySubmissions.find((s) => (typeof s.assignmentId === 'object' ? s.assignmentId?._id : s.assignmentId) === a._id);
    setSubmitModalAssignment(a);
    setSubmitContent(sub?.content ?? '');
    setSubmitAttachments((sub?.attachments ?? []).join('\n'));
  };

  const currentSubmission = submitModalAssignment
    ? mySubmissions.find((s) => (typeof s.assignmentId === 'object' ? s.assignmentId?._id : s.assignmentId) === submitModalAssignment._id)
    : null;

  const handleMarkComplete = () => {
    if (!currentLesson || isCompleted(currentLesson._id)) return;
    progressApi
      .markComplete(currentLesson._id)
      .then(() => {
        toast.success('Đã đánh dấu hoàn thành bài học.');
        fetchLearning();
      })
      .catch((err: Error) => toast.error(err?.message ?? 'Không thể cập nhật.'));
  };

  const openQuizModal = () => {
    if (!currentLesson?.quizId) return;
    setQuizResult(null);
    setQuizAnswers([]);
    setQuizData(null);
    setQuizModalOpen(true);
    setLoadingQuiz(true);
    quizApi
      .getQuiz(currentLesson.quizId)
      .then((res) => {
        setQuizData(res.data);
        setQuizAnswers((res.data.questions ?? []).map(() => undefined));
      })
      .catch((err: Error) => {
        toast.error(err?.message ?? 'Không tải được quiz.');
        setQuizModalOpen(false);
      })
      .finally(() => setLoadingQuiz(false));
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizData || !currentLesson?.quizId) return;
    setSubmittingQuiz(true);
    quizApi
      .submitAttempt(currentLesson.quizId, { answers: quizAnswers })
      .then((res) => {
        setQuizResult({ score: res.data.score, isPassed: res.data.isPassed });
        toast.success(res.data.isPassed ? 'Chúc mừng, bạn đã đạt!' : `Điểm: ${res.data.score}%. Làm lại để đạt.`);
        if (res.data.isPassed) {
          // Backend marks quiz-lesson completed when passed; refresh to reflect progress + unlock assignments.
          fetchLearning();
          fetchAssignments();
        }
      })
      .catch((err: Error) => toast.error(err?.message ?? 'Nộp bài thất bại.'))
      .finally(() => setSubmittingQuiz(false));
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitModalAssignment) return;
    setSubmitting(true);
    const attachments = submitAttachments.trim() ? submitAttachments.trim().split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
    assignmentApi
      .submit(submitModalAssignment._id, { content: submitContent, attachments })
      .then(() => {
        toast.success('Đã nộp bài.');
        setSubmitModalAssignment(null);
        fetchAssignments();
      })
      .catch((err: Error) => toast.error(err?.message ?? 'Không thể nộp bài.'))
      .finally(() => setSubmitting(false));
  };

  const completedLessonIds = useMemo(() => {
    const list = state?.progressList ?? [];
    const ids = list
      .filter((p) => p.isCompleted)
      .map((p) =>
        typeof p.lessonId === 'object' && p.lessonId != null && '_id' in p.lessonId
          ? (p.lessonId as { _id: string })._id
          : String(p.lessonId ?? '')
      )
      .filter(Boolean);
    return new Set(ids);
  }, [state]);

  const totalLessons = state?.lessons?.length ?? 0;
  const progress = state?.completionPercentage ?? 0;

  const currentIndex = state?.lessons?.length
    ? (state.lessons.findIndex((l) => l._id === currentLessonId) ?? 0)
    : 0;
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentLesson = state?.lessons?.[safeIndex] ?? null;
  const currentLessonType = lessonContent?.type ?? currentLesson?.type ?? 'video';
  const lessonForView = useMemo(() => {
    if (!currentLesson) return null;
    if (lessonContent && lessonContent._id === currentLesson._id) {
      return { ...currentLesson, ...lessonContent };
    }
    return currentLesson;
  }, [currentLesson, lessonContent]);

  const toYouTubeEmbedUrl = useCallback((raw?: string) => {
    if (!raw) return null;
    try {
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./, '');
      if (host === 'youtu.be') {
        const id = u.pathname.split('/').filter(Boolean)[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (u.pathname.startsWith('/embed/')) return raw;
        const id = u.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const isCompleted = useCallback(
    (lessonId: string) => completedLessonIds.has(lessonId),
    [completedLessonIds]
  );

  const previousLessonsCompleted = useMemo(() => {
    if (!state?.lessons?.length || safeIndex <= 0) return true;
    const prev = state.lessons.slice(0, safeIndex);
    return prev.every((l) => isCompleted(l._id));
  }, [state?.lessons, safeIndex, isCompleted]);

  const allAssignmentsPassed = useMemo(() => {
    if (!assignments.length) return true;
    const PASS_PERCENT = 0.6;
    return assignments.every((a) => {
      const sub = mySubmissions.find(
        (s) =>
          (typeof s.assignmentId === 'object' ? s.assignmentId?._id : s.assignmentId) === a._id
      );
      const passScore = (a.maxScore ?? 100) * PASS_PERCENT;
      return !!sub && sub.status === 'graded' && (sub.score ?? -1) >= passScore;
    });
  }, [assignments, mySubmissions]);

  const allLessonsCompleted = (state?.completionPercentage ?? 0) >= 100;
  const hasPassedAllQuizzes = canSubmitAssignment;
  const canGenerateCertificate = allLessonsCompleted && hasPassedAllQuizzes && allAssignmentsPassed;

  const handleGenerateCertificate = useCallback(async () => {
    if (!id) return;
    setGeneratingCert(true);
    try {
      const res = await certificateApi.generate(id);
      toast.success(res.message || 'Đã cấp chứng chỉ.');
      if (res?.data?.certificate?.certificateId) {
        try {
          (toast as { message?: (t: string) => void }).message?.(
            `Mã chứng chỉ: ${res.data.certificate.certificateId}`
          );
        } catch {
          toast.success(`Mã chứng chỉ: ${res.data.certificate.certificateId}`);
        }
      }
      // Sau khi cấp chứng chỉ thành công, chuyển sang trang Tài khoản - tab Chứng chỉ
      navigate(`/courses/${id}/certificate`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể cấp chứng chỉ.');
    } finally {
      setGeneratingCert(false);
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải nội dung khóa học...</p>
        </div>
      </div>
    );
  }

  if (error || !state || totalLessons === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {error?.includes('Access denied') ? 'Bạn chưa đăng ký khóa học này' : 'Không tìm thấy khóa học'}
          </h2>
          <button onClick={() => navigate('/my-courses')} className="text-primary hover:underline">
            Quay lại khóa học của tôi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/my-courses')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-semibold line-clamp-1">{state.courseTitle}</h1>
                <p className="text-sm text-muted-foreground">
                  Bài {safeIndex + 1} · {currentLesson?.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <div className="text-sm text-muted-foreground mb-1">Tiến độ</div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 bg-background">
          <div className="aspect-video bg-black">
            {loadingLessonContent ? (
              <div className="h-full flex items-center justify-center text-white/80">
                Đang tải nội dung bài học...
              </div>
            ) : currentLessonType === 'video' && lessonForView?.videoUrl ? (
              (() => {
                const embed = toYouTubeEmbedUrl(lessonForView.videoUrl);
                if (embed) {
                  return (
                    <iframe
                      title={lessonForView.title}
                      src={embed}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }

                const url = lessonForView.videoUrl;
                const lower = url.toLowerCase();
                const isDirectVideo = lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg');
                if (isDirectVideo) {
                  return <video className="w-full h-full" controls src={url} />;
                }

                return (
                  <div className="h-full flex items-center justify-center text-white/80 p-6 text-center">
                    <div>
                      <div className="font-semibold mb-2">Không thể nhúng video từ link này</div>
                      <a className="underline" href={url} target="_blank" rel="noreferrer">
                        Mở video trong tab mới
                      </a>
                    </div>
                  </div>
                );
              })()
            ) : currentLessonType === 'quiz' ? (
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="max-w-xl mx-auto text-center text-white space-y-5 px-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1 text-sm">
                    <HelpCircle className="w-4 h-4" />
                    <span>Quiz bài học</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    {lessonForView?.title ?? currentLesson?.title ?? 'Quiz'}
                  </h2>
                  <p className="text-white/80 text-sm md:text-base">
                    {previousLessonsCompleted
                      ? 'Hãy làm quiz này để kiểm tra kiến thức và hoàn thành bài học.'
                      : 'Bạn cần hoàn thành các bài học trước đó trước khi làm quiz này.'}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={openQuizModal}
                      disabled={!previousLessonsCompleted}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Bắt đầu làm quiz
                    </button>
                  </div>
                </div>
              </div>
            ) : currentLessonType === 'text' || !lessonForView?.videoUrl ? (
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="max-w-3xl mx-auto px-6 text-left text-white space-y-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {lessonForView?.title ?? currentLesson?.title ?? 'Bài học văn bản'}
                    </h2>
                  </div>
                  <p className="text-white/80 whitespace-pre-wrap text-sm md:text-base">
                    {lessonForView?.content?.trim()
                      ? lessonForView.content.trim()
                      : 'Nội dung bài học dạng văn bản sẽ hiển thị tại đây.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-12 h-12 ml-2" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{lessonForView?.title ?? currentLesson?.title}</h2>
                  <p className="text-white/70">Nội dung bài học sẽ hiển thị ở đây</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{currentLesson?.title}</h2>
                {currentLesson?.type !== 'quiz' ? (
                  <button
                    type="button"
                    onClick={handleMarkComplete}
                    disabled={!(currentLesson?._id) || isCompleted(currentLesson?._id ?? '')}
                    className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                      isCompleted(currentLesson?._id ?? '')
                        ? 'bg-green-500/10 text-green-500 cursor-default'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>
                      {isCompleted(currentLesson?._id ?? '')
                        ? 'Đã hoàn thành'
                        : 'Hoàn thành bài học'}
                    </span>
                  </button>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Bài quiz sẽ được tính hoàn thành khi bạn làm đạt.
                  </div>
                )}
              </div>

              {/* Khi bài học là quiz-only, phần hero phía trên đã là màn quiz chính.
                  Ở đây chỉ hiển thị block quiz cho các bài học khác (ví dụ video) nhưng có quiz kèm theo. */}
              {currentLesson?.type !== 'quiz' && currentLesson?.quizId && (
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Quiz
                  </h3>
                  {!previousLessonsCompleted ? (
                    <p className="text-amber-600 dark:text-amber-400 text-sm mb-3">
                      Bạn cần hoàn thành các bài học trước đó trước khi làm quiz.
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={openQuizModal}
                    disabled={!previousLessonsCompleted}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Làm quiz (có thể làm lại nhiều lần)
                  </button>
                </div>
              )}

              {/* Với bài học dạng text, nội dung đã hiển thị đầy đủ ở hero phía trên,
                  nên không lặp lại mô tả lần nữa để tránh trùng lặp. */}
              {currentLessonType !== 'text' && (
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                  <h3 className="font-semibold mb-4">Mô tả bài học</h3>
                  {lessonForView?.content?.trim() ? (
                    <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                      {lessonForView.content.trim()}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Nội dung chi tiết của bài học sẽ được cập nhật bởi giảng viên.
                    </p>
                  )}
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Tài liệu tham khảo</h3>
                {lessonForView?.resources?.trim() ? (
                  <ul className="space-y-2">
                    {lessonForView.resources
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, idx) => {
                        const isUrl = /^https?:\/\//i.test(line);
                        return (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <BookOpen className="w-4 h-4 text-primary mt-0.5" />
                            {isUrl ? (
                              <a href={line} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">
                                {line}
                              </a>
                            ) : (
                              <span className="text-muted-foreground whitespace-pre-wrap">{line}</span>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tài liệu sẽ được giảng viên bổ sung cho bài học này.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Lessons list */}
        <div className="w-80 bg-card border-l border-border overflow-y-auto">
          <div className="p-4 border-b border-border sticky top-0 bg-card z-10">
            <h3 className="font-semibold mb-2">Nội dung khóa học</h3>
            <div className="text-sm text-muted-foreground">
              {completedLessonIds.size}/{totalLessons} bài học
            </div>
          </div>

          <div className="divide-y divide-border">
            {state.lessons.map((lesson, index) => {
              const active = lesson._id === currentLessonId;
              const completed = isCompleted(lesson._id);
              return (
                <button
                  key={lesson._id}
                  onClick={() => setCurrentLessonId(lesson._id)}
                  className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-muted transition-colors ${
                    active ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  {completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : active ? (
                    <Play className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm text-left flex-1 line-clamp-2">
                    Bài {index + 1}: {lesson.title}
                  </span>
                  {lesson.duration != null && (
                    <span className="text-xs text-muted-foreground">
                      {lesson.duration} phút
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bài tập */}
          <div className="p-4 border-t border-border">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Bài tập
            </h3>
            {loadingAssignments ? (
              <p className="text-sm text-muted-foreground">Đang tải...</p>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Khóa này chưa có bài tập.</p>
            ) : !canSubmitAssignment ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Pass hết quiz trong khóa để mở khóa nộp bài tập.
              </p>
            ) : null}
            {assignments.length > 0 && canSubmitAssignment && (
              <p className="text-xs text-muted-foreground mt-1">Có thể nộp lại nhiều lần để cập nhật.</p>
            )}
            {assignments.length > 0 && (
              <ul className="space-y-2 mt-2">
                {assignments.map((a) => {
                  const sub = mySubmissions.find((s) => (typeof s.assignmentId === 'object' ? s.assignmentId?._id : s.assignmentId) === a._id);
                  const status = sub ? (sub.status === 'graded' ? `Đã chấm${sub.score != null ? `: ${sub.score}/${a.maxScore}` : ''}` : sub.status === 'needs_revision' ? 'Cần sửa lại' : 'Đã nộp') : 'Chưa nộp';
                  return (
                    <li key={a._id} className="text-sm">
                      <div className="font-medium line-clamp-2">{a.title}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{status}</div>
                      {a.type === 'exam' && a.questions && a.questions.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/assignments/${a._id}`)}
                          disabled={!canSubmitAssignment}
                          className="mt-1.5 text-primary hover:underline text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-3 h-3" />
                          {sub ? 'Xem kết quả bài thi' : 'Làm bài thi cuối khóa'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openSubmitModal(a)}
                          disabled={!canSubmitAssignment}
                          className="mt-1.5 text-primary hover:underline text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-3 h-3" />
                          {sub ? 'Xem / Sửa bài nộp' : 'Nộp bài'}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Chứng chỉ */}
          <div className="p-4 border-t border-border">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Chứng chỉ
            </h3>
            {canGenerateCertificate ? (
              <button
                type="button"
                onClick={handleGenerateCertificate}
                disabled={generatingCert}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
              >
                {generatingCert ? 'Đang cấp chứng chỉ...' : 'Nhận chứng chỉ'}
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Hoàn thành 100% bài học, pass hết quiz và pass tất cả bài tập để nhận chứng chỉ.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Bài tập (Assignment) — nộp sau khi pass hết quiz */}
      {submitModalAssignment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-5 border-b border-border flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bài tập</p>
                <h2 className="text-xl font-bold mt-0.5">{submitModalAssignment.title}</h2>
              </div>
              <button type="button" onClick={() => setSubmitModalAssignment(null)} className="p-2 hover:bg-muted rounded-lg" aria-label="Đóng">
                <X className="w-5 h-5" />
              </button>
            </div>
            {submitModalAssignment.description && (
              <div className="p-5 border-b border-border bg-muted/20">
                <p className="text-sm text-foreground whitespace-pre-wrap">{submitModalAssignment.description}</p>
                <p className="text-xs text-muted-foreground mt-2">Điểm tối đa: {submitModalAssignment.maxScore}</p>
              </div>
            )}
            {currentSubmission?.status === 'graded' && (
              <div className="p-5 border-b border-border bg-green-500/10">
                <p className="text-sm font-medium">Điểm: {currentSubmission.score ?? '—'} / {submitModalAssignment.maxScore}</p>
                {currentSubmission.feedback && (
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">Nhận xét: {currentSubmission.feedback}</p>
                )}
              </div>
            )}
            <form onSubmit={handleSubmitAssignment} className="p-5 space-y-4">
              {!canSubmitAssignment && (
                <p className="text-sm text-amber-600 dark:text-amber-400 px-3 py-2 rounded-lg bg-amber-500/10">
                  Hoàn thành và đạt tất cả bài quiz trong khóa trước khi nộp bài tập.
                </p>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Nội dung nộp bài *</label>
                <textarea
                  value={submitContent}
                  onChange={(e) => setSubmitContent(e.target.value)}
                  placeholder="Nhập nội dung, link code, hoặc mô tả bài làm..."
                  rows={5}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link đính kèm (mỗi dòng một link, tùy chọn)</label>
                <textarea
                  value={submitAttachments}
                  onChange={(e) => setSubmitAttachments(e.target.value)}
                  placeholder="https://..."
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none bg-background text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSubmitModalAssignment(null)} className="px-4 py-2.5 border border-border rounded-lg hover:bg-muted">
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting || !canSubmitAssignment}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-semibold"
                >
                  {submitting ? 'Đang nộp...' : 'NỘP BÀI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quiz — UI giống mẫu: tiêu đề, ngày cập nhật, ô code, chọn đáp án, nút TRẢ LỜI */}
      {quizModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {loadingQuiz ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : quizResult != null ? (
              <>
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold">{quizData?.title ?? 'Quiz'}</h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className={`text-lg font-medium ${quizResult.isPassed ? 'text-green-600' : 'text-amber-600'}`}>
                    {quizResult.isPassed ? 'Chúc mừng, bạn đã đạt!' : 'Chưa đạt. Hãy làm lại.'}
                  </p>
                  <p className="text-muted-foreground">Điểm: {quizResult.score}% (đạt từ {quizData?.passingScore ?? 80}%)</p>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setQuizResult(null); setQuizAnswers((quizData?.questions ?? []).map(() => undefined)); }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Làm lại
                    </button>
                    <button type="button" onClick={() => { setQuizModalOpen(false); setQuizResult(null); }} className="px-4 py-2 border border-border rounded-lg hover:bg-muted">
                      Đóng
                    </button>
                  </div>
                </div>
              </>
            ) : quizData ? (
              <form onSubmit={handleQuizSubmit} className="flex flex-col">
                <div className="p-6 pb-4 border-b border-border flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{quizData.title}</h2>
                    {quizData.updatedAt && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Cập nhật {new Date(quizData.updatedAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <button type="button" onClick={() => { setQuizModalOpen(false); }} className="p-2 hover:bg-muted rounded-lg" aria-label="Đóng">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {(quizData.questions ?? []).map((q: QuizQuestion, idx: number) => (
                    <div key={idx} className="space-y-3">
                      {q.questionCode?.trim() ? (
                        <div className="rounded-xl bg-sky-100 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 p-4">
                          <pre className="text-sm font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                            <code>{q.questionCode.trim()}</code>
                          </pre>
                        </div>
                      ) : null}
                      {q.questionText?.trim() ? (
                        <p className="font-medium text-foreground">{idx + 1}. {q.questionText}</p>
                      ) : null}
                      <p className="text-sm font-medium text-foreground">Chọn câu trả lời đúng.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(q.options ?? []).filter(Boolean).map((opt, oIdx) => {
                          const selected = quizAnswers[idx] === opt;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                const next = [...quizAnswers];
                                next[idx] = opt;
                                setQuizAnswers(next);
                              }}
                              className={`px-4 py-3 rounded-lg border-2 text-left text-sm font-medium transition-colors ${
                                selected
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-muted/30 hover:border-primary/50 text-foreground'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 pt-2 flex justify-end gap-2 border-t border-border">
                  <button type="button" onClick={() => setQuizModalOpen(false)} className="px-4 py-2.5 border border-border rounded-lg hover:bg-muted">
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQuiz}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-semibold"
                  >
                    {submittingQuiz ? 'Đang gửi...' : 'TRẢ LỜI'}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
