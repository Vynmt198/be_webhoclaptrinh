import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Play,
  Lock,
  BookOpen
} from 'lucide-react';
import { getCourseById } from '@/app/data/courses';

export function Learn() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const course = getCourseById(id || '');
  const [currentSection, setCurrentSection] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h2>
          <button onClick={() => navigate('/my-courses')} className="text-primary hover:underline">
            Quay lại khóa học của tôi
          </button>
        </div>
      </div>
    );
  }

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleLessonComplete = (sectionIndex: number, lessonIndex: number) => {
    const lessonId = `${sectionIndex}-${lessonIndex}`;
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
    // Auto advance to next lesson
    if (lessonIndex < course.curriculum[sectionIndex].lessons.length - 1) {
      setCurrentLesson(lessonIndex + 1);
    } else if (sectionIndex < course.curriculum.length - 1) {
      setCurrentSection(sectionIndex + 1);
      setCurrentLesson(0);
    }
  };

  const isLessonCompleted = (sectionIndex: number, lessonIndex: number) => {
    return completedLessons.includes(`${sectionIndex}-${lessonIndex}`);
  };

  const currentSectionData = course.curriculum[currentSection];
  const currentLessonData = currentSectionData?.lessons[currentLesson];

  const totalLessons = course.curriculum.reduce((sum, section) => sum + section.lessons.length, 0);
  const progress = Math.round((completedLessons.length / totalLessons) * 100);

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
                <h1 className="font-semibold line-clamp-1">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {currentSectionData?.section} - {currentLessonData}
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
              <h2 className="text-2xl font-bold mb-2">{currentLessonData}</h2>
              <p className="text-white/70">Video player sẽ được tích hợp ở đây</p>
            </div>
          </div>

          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{currentLessonData}</h2>
                <button
                  onClick={() => handleLessonComplete(currentSection, currentLesson)}
                  className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                    isLessonCompleted(currentSection, currentLesson)
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    {isLessonCompleted(currentSection, currentLesson)
                      ? 'Đã hoàn thành'
                      : 'Hoàn thành bài học'}
                  </span>
                </button>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-4">Mô tả bài học</h3>
                <p className="text-muted-foreground">
                  Trong bài học này, bạn sẽ học về {currentLessonData.toLowerCase()}.
                  Chúng ta sẽ đi sâu vào các khái niệm cơ bản và ứng dụng thực tế.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Tài liệu tham khảo</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Tài liệu 1.pdf</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Source code.zip</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Curriculum */}
        <div className="w-80 bg-card border-l border-border overflow-y-auto">
          <div className="p-4 border-b border-border sticky top-0 bg-card z-10">
            <h3 className="font-semibold mb-2">Nội dung khóa học</h3>
            <div className="text-sm text-muted-foreground">
              {completedLessons.length}/{totalLessons} bài học
            </div>
          </div>

          <div className="divide-y divide-border">
            {course.curriculum.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-2 flex-1 text-left">
                    {expandedSections.includes(sectionIndex) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="font-medium text-sm">{section.section}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {section.lessons.filter((_, i) => isLessonCompleted(sectionIndex, i)).length}/
                    {section.lessons.length}
                  </span>
                </button>

                {expandedSections.includes(sectionIndex) && (
                  <div className="bg-muted/30">
                    {section.lessons.map((lesson, lessonIndex) => {
                      const isActive =
                        sectionIndex === currentSection && lessonIndex === currentLesson;
                      const isCompleted = isLessonCompleted(sectionIndex, lessonIndex);

                      return (
                        <button
                          key={lessonIndex}
                          onClick={() => {
                            setCurrentSection(sectionIndex);
                            setCurrentLesson(lessonIndex);
                          }}
                          className={`w-full px-4 py-3 pl-12 flex items-center space-x-3 hover:bg-muted transition-colors ${
                            isActive ? 'bg-primary/10 text-primary' : ''
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : isActive ? (
                            <Play className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="text-sm text-left flex-1">{lesson}</span>
                          <span className="text-xs text-muted-foreground">10:00</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
