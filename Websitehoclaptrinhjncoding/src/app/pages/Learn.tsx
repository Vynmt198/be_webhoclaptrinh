import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Play,
  Lock,
  BookOpen
} from 'lucide-react';
import { learningApi, type Lesson, type LessonProgress } from '@/app/lib/api';

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
          setCurrentLessonId(lessons[0]._id);
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
                  className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                    isCompleted(currentLesson._id)
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                  disabled
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    {isCompleted(currentLesson._id)
                      ? 'Đã hoàn thành'
                      : 'Hoàn thành bài học (sẽ lưu tự động khi học xong)'}
                  </span>
                </button>
              </div>

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
        </div>
      </div>
    </div>
  );
}
