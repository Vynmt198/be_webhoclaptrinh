import { useEffect, useMemo, useState, useCallback } from 'react';
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
} from 'lucide-react';
import { learningApi, progressApi, quizApi, assignmentApi, assignmentLearnerApi, type Lesson, type LessonProgress, type Assignment, type AssignmentSubmission, type Quiz, type QuizQuestion } from '@/app/lib/api';
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

  const completedLessonIds = useMemo(
    () => new Set((state?.progressList || []).filter(p => p.isCompleted).map(p => p.lessonId)),
    [state]
  );

  const totalLessons = state?.lessons.length ?? 0;
  const progress = state?.completionPercentage ?? 0;

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

  const currentIndex = state.lessons.findIndex(l => l._id === currentLessonId) ?? 0;
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentLesson = state.lessons[safeIndex];

  const isCompleted = (lessonId: string) => completedLessonIds.has(lessonId);

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
          <div className="aspect-video bg-black flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-12 h-12 ml-2" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{currentLesson?.title}</h2>
              <p className="text-white/70">Video player sẽ được tích hợp ở đây</p>
            </div>
          </div>

          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{currentLesson?.title}</h2>
                <button
                  type="button"
                  onClick={handleMarkComplete}
                  disabled={isCompleted(currentLesson._id)}
                  className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                    isCompleted(currentLesson._id)
                      ? 'bg-green-500/10 text-green-500 cursor-default'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    {isCompleted(currentLesson._id)
                      ? 'Đã hoàn thành'
                      : 'Hoàn thành bài học'}
                  </span>
                </button>
              </div>

              {currentLesson?.type === 'quiz' && (
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Quiz
                  </h3>
                  {!isCompleted(currentLesson._id) ? (
                    <p className="text-amber-600 dark:text-amber-400 text-sm mb-3">
                      Hoàn thành bài học trước khi làm quiz.
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={openQuizModal}
                    disabled={!isCompleted(currentLesson._id)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Làm quiz (có thể làm lại nhiều lần)
                  </button>
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-4">Mô tả bài học</h3>
                <p className="text-muted-foreground">
                  Nội dung chi tiết của bài học sẽ được hiển thị tại đây khi bạn tích hợp dữ liệu video và mô tả từ backend.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Tài liệu tham khảo</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Tài liệu sẽ được cập nhật</span>
                    </a>
                  </li>
                </ul>
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
                      <button
                        type="button"
                        onClick={() => openSubmitModal(a)}
                        disabled={!canSubmitAssignment}
                        className="mt-1.5 text-primary hover:underline text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3 h-3" />
                        {sub ? 'Xem / Sửa bài nộp' : 'Nộp bài'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal nộp bài */}
      {submitModalAssignment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">{submitModalAssignment.title}</h3>
              <button type="button" onClick={() => setSubmitModalAssignment(null)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            {submitModalAssignment.description && (
              <div className="p-4 border-b border-border bg-muted/30">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{submitModalAssignment.description}</p>
                <p className="text-xs text-muted-foreground mt-2">Điểm tối đa: {submitModalAssignment.maxScore}</p>
              </div>
            )}
            {currentSubmission?.status === 'graded' && (
              <div className="p-4 border-b border-border bg-green-500/10">
                <p className="text-sm font-medium">Điểm: {currentSubmission.score ?? '—'} / {submitModalAssignment.maxScore}</p>
                {currentSubmission.feedback && (
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">Nhận xét: {currentSubmission.feedback}</p>
                )}
              </div>
            )}
            <form onSubmit={handleSubmitAssignment} className="p-4 space-y-4">
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
              {!canSubmitAssignment && (
                <p className="text-sm text-amber-600 dark:text-amber-400">Bạn cần pass hết quiz trong khóa mới được nộp bài tập.</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting || !canSubmitAssignment}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Đang nộp...' : 'Nộp bài'}
                </button>
                <button type="button" onClick={() => setSubmitModalAssignment(null)} className="px-4 py-2 border border-border rounded-lg hover:bg-muted">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quiz */}
      {quizModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">{quizData?.title ?? 'Quiz'}</h3>
              <button type="button" onClick={() => { setQuizModalOpen(false); setQuizResult(null); }} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {loadingQuiz ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : quizResult != null ? (
                <div className="space-y-4">
                  <p className={`text-lg font-medium ${quizResult.isPassed ? 'text-green-600' : 'text-amber-600'}`}>
                    {quizResult.isPassed ? 'Chúc mừng, bạn đã đạt!' : 'Chưa đạt. Hãy làm lại.'}
                  </p>
                  <p className="text-muted-foreground">Điểm: {quizResult.score}% (đạt từ {quizData?.passingScore ?? 80}%)</p>
                  <button
                    type="button"
                    onClick={() => { setQuizResult(null); setQuizAnswers((quizData?.questions ?? []).map(() => undefined)); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Làm lại
                  </button>
                </div>
              ) : quizData ? (
                <form onSubmit={handleQuizSubmit} className="space-y-4">
                  {(quizData.questions ?? []).map((q: QuizQuestion, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border border-border bg-muted/20">
                      <p className="font-medium text-sm mb-2">{idx + 1}. {q.questionText}</p>
                      <div className="space-y-1.5">
                        {(q.options ?? []).map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`q-${idx}`}
                              checked={quizAnswers[idx] === opt}
                              onChange={() => {
                                const next = [...quizAnswers];
                                next[idx] = opt;
                                setQuizAnswers(next);
                              }}
                              className="rounded-full border-border"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={submittingQuiz}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {submittingQuiz ? 'Đang nộp...' : 'Nộp bài'}
                    </button>
                    <button type="button" onClick={() => { setQuizModalOpen(false); }} className="px-4 py-2 border border-border rounded-lg hover:bg-muted">
                      Đóng
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
