import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { assignmentApi, certificateApi, type Assignment, type AssignmentSubmission } from '@/app/lib/api';
import { toast } from 'sonner';

interface ExamData {
  assignment: Assignment;
  canSubmit: boolean;
  mySubmission?: AssignmentSubmission;
}

export function AssignmentExam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; isPassed: boolean } | null>(null);
  const [initialSeconds, setInitialSeconds] = useState<number | null>(null);
  const [generatingCert, setGeneratingCert] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    assignmentApi
      .getOne(id)
      .then((res) => {
        const assignment = res.data.assignment;
        if (assignment.type !== 'exam' || !assignment.questions || assignment.questions.length === 0) {
          toast.error('Bài tập này không phải bài thi trắc nghiệm.');
          navigate(-1);
          return;
        }
        setData(res.data as ExamData);
        setAnswers(
          assignment.questions.map(() => -1)
        );
        if (assignment.timeLimitMinutes && assignment.timeLimitMinutes > 0) {
          const secs = assignment.timeLimitMinutes * 60;
          setRemainingSeconds(secs);
          setInitialSeconds(secs);
        }
        if (res.data.mySubmission?.score != null) {
          setResult({
            score: res.data.mySubmission.score,
            isPassed:
              res.data.mySubmission.score >= (assignment.passingScorePercent ?? 60),
          });
        }
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : 'Không thể tải dữ liệu bài thi.',
        );
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (remainingSeconds == null || remainingSeconds <= 0 || result) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev == null) return prev;
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds, result]);

  useEffect(() => {
    if (remainingSeconds === 0 && !result && !submitting && id) {
      handleSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds]);

  const handleSelectOption = (qIndex: number, optIndex: number) => {
    if (result) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });
  };

  const handleSubmit = async (auto = false) => {
    if (!id || !data?.assignment) return;
    if (!data.canSubmit) {
      toast.error('Bạn chưa đủ điều kiện để làm bài thi này.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await assignmentApi.submitExam(id, { answers });
      setResult({ score: res.data.score, isPassed: res.data.isPassed });
      toast.success(
        res.data.isPassed
          ? 'Chúc mừng, bạn đã đạt bài thi cuối khóa.'
          : 'Bài thi chưa đạt điểm yêu cầu.',
      );
    } catch (err: unknown) {
      if (!auto) {
        toast.error(err instanceof Error ? err.message : 'Không thể nộp bài thi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToCertificate = async () => {
    if (!data?.assignment?.courseId) return;
    const courseId = data.assignment.courseId;
    setGeneratingCert(true);
    try {
      await certificateApi.generate(courseId);
      navigate(`/courses/${courseId}/certificate`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Không thể cấp chứng chỉ. Hãy kiểm tra điều kiện hoàn thành khóa học.',
      );
    } finally {
      setGeneratingCert(false);
    }
  };

  if (loading || !data?.assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const { assignment } = data;
  const questions = assignment.questions ?? [];
  const minutes = remainingSeconds != null ? Math.floor(remainingSeconds / 60) : null;
  const seconds =
    remainingSeconds != null ? String(remainingSeconds % 60).padStart(2, '0') : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card/60 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại khóa học</span>
          </button>
          {remainingSeconds != null && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                Còn lại: {minutes}:{seconds}
              </span>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">
            Bài thi cuối khóa
          </p>
          <h1 className="text-2xl md:text-3xl font-bold">{assignment.title}</h1>
          {assignment.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {assignment.description}
            </p>
          )}
        </header>

        {result && (
          <div
            className={`rounded-xl border p-4 flex flex-col md:flex-row md:items-start gap-3 ${
              result.isPassed ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              {result.isPassed ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              )}
              <div className="space-y-1.5">
                <p className="font-semibold">
                  Điểm: {result.score}% (yêu cầu tối thiểu {assignment.passingScorePercent ?? 60}%)
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.isPassed
                    ? 'Bạn đã hoàn thành bài thi cuối khóa. Hệ thống sẽ ghi nhận khi xét chứng chỉ.'
                    : 'Bạn có thể thi lại để cải thiện điểm, hoặc liên hệ giảng viên nếu cần hỗ trợ thêm.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:ml-4">
              {!result.isPassed && (
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted whitespace-nowrap"
                  onClick={() => {
                    setResult(null);
                    setAnswers(questions.map(() => -1));
                    if (initialSeconds != null) {
                      setRemainingSeconds(initialSeconds);
                    }
                  }}
                >
                  Thi lại
                </button>
              )}
              {result.isPassed && (
                <button
                  type="button"
                  onClick={handleGoToCertificate}
                  disabled={generatingCert}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 text-xs font-medium whitespace-nowrap"
                >
                  {generatingCert ? 'Đang mở chứng chỉ...' : 'Xem chứng chỉ'}
                </button>
              )}
            </div>
          </div>
        )}

        <section className="space-y-4">
          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mt-0.5">
                  Câu {qIndex + 1}
                </span>
                <p className="font-medium">{q.questionText}</p>
              </div>
              <div className="grid gap-2">
                {q.options.map((opt, optIndex) => {
                  const checked = answers[qIndex] === optIndex;
                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={!!result}
                      onClick={() => handleSelectOption(qIndex, optIndex)}
                      className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                        checked
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted'
                      } ${result ? 'cursor-default opacity-80' : ''}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {!result && (
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Nộp bài thi</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

