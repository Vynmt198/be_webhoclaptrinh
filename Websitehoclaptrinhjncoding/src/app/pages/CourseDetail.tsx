import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Star,
  Clock,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  Play,
  ArrowLeft,
  ShoppingCart,
  Loader2,
  Send,
  Trash2,
} from 'lucide-react';
import { courseApi, reviewApi, Course, Lesson, type Review, type RatingSummary as RatingSummaryType } from '@/app/lib/api';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import { RatingSummary } from '@/app/components/RatingSummary';

function formatLevel(level?: string) {
  if (!level) return '-';
  const map: Record<string, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
    'all-levels': 'Mọi cấp độ',
  };
  return map[level] || level;
}

function formatDuration(minutes?: number) {
  if (!minutes) return '0 giờ';
  if (minutes < 60) return `${minutes} phút`;
  return `${Math.round(minutes / 60)} giờ`;
}

function formatLessonDuration(seconds?: number) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = (location.state as { from?: string } | null)?.from;
  const fromMyCourses = fromState === 'my-courses';
  const fromAdminCourses = fromState === 'admin-courses';
  const fromInstructorCourses = fromState === 'instructor-courses';
  const backPath = fromAdminCourses ? '/admin/courses' : fromInstructorCourses ? '/instructor/courses' : fromMyCourses ? '/my-courses' : '/courses';
  const backLabel = fromAdminCourses ? 'Quay lại duyệt khóa học' : fromInstructorCourses ? 'Quay lại khóa tôi dạy' : fromMyCourses ? 'Quay lại khóa học của tôi' : 'Quay lại khóa học';
  const [course, setCourse] = useState<Course | null>(null);
  const [curriculum, setCurriculum] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  type ReviewSort = 'newest' | 'highest' | 'lowest';
  const [reviewsSort, setReviewsSort] = useState<ReviewSort>('newest');
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [myReviewLoading, setMyReviewLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<RatingSummaryType | null>(null);
  const [ratingSummaryLoading, setRatingSummaryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToCart, items } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([courseApi.getById(id), courseApi.getCurriculum(id)])
      .then(([courseRes, curriculumRes]) => {
        setCourse(courseRes.data);
        setCurriculum(curriculumRes.data || []);
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    courseApi
      .getReviews(id, { page: reviewsPage, limit: 5, sort: reviewsSort })
      .then((res) => {
        setReviews(res.data.reviews || []);
        const p = res.data.pagination;
        setReviewsTotalPages(p?.totalPages ?? (p?.total && p?.limit ? Math.ceil(p.total / p.limit) : 1));
      })
      .catch(() => setReviews([]));
  }, [id, reviewsPage, reviewsSort]);

  // Fetch rating summary for distribution chart
  useEffect(() => {
    if (!id) return;
    setRatingSummaryLoading(true);
    courseApi
      .getRatingSummary(id)
      .then((res) => setRatingSummary(res.data))
      .catch(() => setRatingSummary(null))
      .finally(() => setRatingSummaryLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !user) {
      setMyReview(null);
      setReviewForm({ rating: 5, reviewText: '' });
      return;
    }
    setMyReviewLoading(true);
    reviewApi
      .getMyReview(id)
      .then((res) => {
        setMyReview(res.data.review);
        setReviewForm({
          rating: res.data.review.rating || 5,
          reviewText: res.data.review.reviewText || res.data.review.comment || '',
        });
      })
      .catch(() => {
        setMyReview(null);
        setReviewForm({ rating: 5, reviewText: '' });
      })
      .finally(() => setMyReviewLoading(false));
  }, [id, user]);

  const refetchReviews = () => {
    if (!id) return;
    courseApi.getReviews(id, { page: reviewsPage, limit: 5, sort: reviewsSort }).then((res) => {
      setReviews(res.data.reviews || []);
      const p = res.data.pagination;
      setReviewsTotalPages(p?.totalPages ?? (p?.total && p?.limit ? Math.ceil(p.total / p.limit) : 1));
    }).catch(() => {});
    // Also refresh rating summary
    courseApi.getRatingSummary(id).then((res) => setRatingSummary(res.data)).catch(() => {});
  };

  const handleDeleteReview = (review: Review) => {
    const reviewUserId = review.userId?._id;
    const canDelete = user && (reviewUserId === user._id || user.role === 'admin');
    if (!canDelete) return;
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    setDeletingReviewId(review._id);
    reviewApi
      .delete(review._id)
      .then(() => {
        toast.success('Đã xóa đánh giá.');
        if (myReview?._id === review._id) {
          setMyReview(null);
          setReviewForm({ rating: 5, reviewText: '' });
        }
        refetchReviews();
        if (id) courseApi.getById(id).then((r) => setCourse(r.data)).catch(() => {});
        if (id && user) {
          reviewApi.getMyReview(id).then((res) => setMyReview(res.data.review)).catch(() => setMyReview(null));
        }
      })
      .catch((err: Error) => toast.error(err?.message || 'Không thể xóa đánh giá.'))
      .finally(() => setDeletingReviewId(null));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error('Vui lòng chọn điểm từ 1 đến 5.');
      return;
    }
    setSubmittingReview(true);
    if (myReview) {
      reviewApi
        .update(myReview._id, { rating: reviewForm.rating, reviewText: reviewForm.reviewText || undefined })
        .then((res) => {
          setMyReview(res.data.review);
          toast.success('Đã cập nhật đánh giá.');
          refetchReviews();
          courseApi.getById(id).then((r) => setCourse(r.data)).catch(() => {});
        })
        .catch((err: Error) => toast.error(err?.message || 'Không thể cập nhật đánh giá.'))
        .finally(() => setSubmittingReview(false));
    } else {
      reviewApi
        .create({ courseId: id, rating: reviewForm.rating, reviewText: reviewForm.reviewText || undefined })
        .then((res) => {
          setMyReview(res.data.review);
          toast.success('Đã gửi đánh giá.');
          refetchReviews();
          courseApi.getById(id).then((r) => setCourse(r.data)).catch(() => {});
        })
        .catch((err: Error) => toast.error(err?.message || 'Bạn cần ghi danh khóa học để đánh giá.'))
        .finally(() => setSubmittingReview(false));
    }
  };

  const handleEnroll = () => {
    if (!course) return;
    const cartItem = {
      id: course._id,
      title: course.title,
      price: course.price,
      image:
        course.thumbnail ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    };
    addToCart(cartItem);
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    if (!course) return;
    const cartItem = {
      id: course._id,
      title: course.title,
      price: course.price,
      image:
        course.thumbnail ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    };
    addToCart(cartItem);
  };

  const isInCart = course ? items.some((item: { id: string }) => item.id === course._id) : false;

  const isOwner = user && course && (course.instructorId?._id === user._id || user.role === 'admin');
  const isLearner = !user || (user.role !== 'admin' && user.role !== 'instructor');
  const isEnrolledInCourse = !!course?.isEnrolled || fromMyCourses;
  const isCourseCompleted =
    course?.enrollmentStatus === 'completed' || course?.hasCertificate === true;
  const handleSubmitForReview = () => {
    if (!course) return;
    setSubmitting(true);
    courseApi
      .update(course._id, { submitForReview: true })
      .then((res) => {
        setCourse(res.data);
        toast.success('Đã gửi khóa học chờ admin duyệt.');
      })
      .catch((err: Error) => toast.error(err.message || 'Không thể gửi duyệt.'))
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h2>
          <Link to={backPath} className="text-primary hover:underline">
            {fromMyCourses ? 'Quay lại khóa học của tôi' : 'Quay lại danh sách khóa học'}
          </Link>
        </div>
      </div>
    );
  }

  const instructorName = course.instructorId?.fullName || '-';
  const categoryName = course.categoryId?.name || '-';

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-background via-primary/5 to-accent/5 py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate(backPath)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{backLabel}</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                {categoryName}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>

              <p className="text-lg text-muted-foreground mb-6">
                {course.description || 'Chưa có mô tả.'}
              </p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{course.averageRating?.toFixed(1) || '0'}</span>
                  <span className="text-muted-foreground">đánh giá</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>{(course.enrollmentCount || 0).toLocaleString()} học viên</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>{formatDuration(course.totalDuration)}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <BookOpen className="w-5 h-5" />
                  <span>{course.totalLessons || 0} bài học</span>
                </div>
              </div>

              {course.instructorId?._id ? (
                <Link
                  to={{
                    pathname: `/profile/instructor/${course.instructorId._id}`,
                  }}
                  state={{
                    instructorName,
                    instructorAvatar:
                      course.instructorId?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=3b82f6&color=fff`,
                  }}
                  className="flex items-center space-x-4 rounded-lg p-2 -m-2 hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={
                      course.instructorId?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=3b82f6&color=fff`
                    }
                    alt={instructorName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">Giảng viên</p>
                    <p className="font-medium">{instructorName}</p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      course.instructorId?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=3b82f6&color=fff`
                    }
                    alt={instructorName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">Giảng viên</p>
                    <p className="font-medium">{instructorName}</p>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="lg:sticky lg:top-24 h-fit"
            >
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
                <div className="relative aspect-video">
                  <img
                    src={
                      course.thumbnail ||
                      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
                    }
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/40 transition-colors group">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-primary">
                      {course.price === 0
                        ? 'Miễn phí'
                        : `${(course.price || 0).toLocaleString('vi-VN')}đ`}
                    </div>
                  </div>

                  {isOwner && course.status === 'draft' && (
                    <>
                      <Link
                        to={`/instructor/courses/${course._id}/edit`}
                        className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 mb-3"
                      >
                        <span>Chỉnh sửa khóa học</span>
                      </Link>
                      <button
                        onClick={handleSubmitForReview}
                        disabled={submitting}
                        className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
                      >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        <span>Gửi duyệt</span>
                      </button>
                    </>
                  )}

                  {/* Chỉ learner (hoặc khách) thấy CTA */}
                  {isLearner && (
                    <>
                      {isEnrolledInCourse ? (
                        <button
                          onClick={() => navigate(`/learn/${course._id}`)}
                          className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-500 text-white rounded-lg hover:shadow-2xl hover:shadow-emerald-500/30 transition-all font-semibold flex items-center justify-center space-x-2 mb-3 btn-shine border-2 border-emerald-500/20 hover:scale-[1.02] active:scale-95"
                        >
                          <Play className="w-5 h-5" />
                          <span>{isCourseCompleted ? 'Xem lại khóa học' : 'Tiếp tục học'}</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleEnroll}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all font-semibold flex items-center justify-center space-x-2 mb-3 btn-shine border-2 border-blue-500/20 hover:scale-[1.02] active:scale-95"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            <span>Đăng ký ngay</span>
                          </button>

                          <button
                            onClick={handleAddToCart}
                            disabled={isInCart}
                            className="w-full py-4 border-2 border-primary/50 hover:border-primary bg-gradient-to-r from-primary/10 to-accent/10 text-foreground rounded-lg hover:bg-primary/20 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed btn-shine"
                          >
                            {isInCart ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
                          </button>
                        </>
                      )}
                    </>
                  )}

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Truy cập trọn đời</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Chứng chỉ hoàn thành</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Hỗ trợ trực tuyến</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {course.syllabus && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h2 className="text-2xl font-bold mb-6">Bạn sẽ học được gì</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{course.syllabus}</p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <h2 className="text-2xl font-bold mb-6">Nội dung khóa học</h2>
                <div className="space-y-4">
                  {curriculum.length > 0 ? (
                    curriculum.map((lesson) => (
                      <div
                        key={lesson._id}
                        className="p-4 flex items-center space-x-3 hover:bg-muted/30 transition-colors rounded-lg border border-border"
                      >
                        <Play className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="flex-1">{lesson.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatLessonDuration(lesson.duration)}
                        </span>
                        {lesson.isPreview && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                            Xem trước
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Chưa có bài học.</p>
                  )}
                </div>
              </motion.div>

              <motion.div
                id="reviews"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-6 scroll-mt-24"
              >
                <h2 className="text-2xl font-bold mb-4">Đánh giá & xếp hạng</h2>
                
                {/* Rating Summary Component (FE-REVIEW-04) */}
                <div className="mb-6">
                  <RatingSummary data={ratingSummary} loading={ratingSummaryLoading} />
                </div>

                {user && !isOwner && (
                  <div className="mb-6 p-4 rounded-xl border border-border bg-muted/20">
                    {myReviewLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tải...</span>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <h3 className="font-semibold">
                          {myReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá'}
                        </h3>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Điểm (1–5 sao)</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setReviewForm((f) => ({ ...f, rating: i }))}
                                className="p-1 rounded hover:bg-muted/50 transition-colors"
                              >
                                <Star
                                  className={`w-8 h-8 ${
                                    i <= reviewForm.rating
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-muted-foreground mb-1">Nội dung (tùy chọn)</label>
                          <textarea
                            value={reviewForm.reviewText}
                            onChange={(e) => setReviewForm((f) => ({ ...f, reviewText: e.target.value }))}
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            rows={3}
                            maxLength={1000}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                          />
                          <p className="text-xs text-muted-foreground mt-1">{reviewForm.reviewText.length}/1000</p>
                        </div>
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                          {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                          {myReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                <div className="mb-4 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sắp xếp:</span>
                  <select
                    value={reviewsSort}
                    onChange={(e) => {
                      setReviewsSort(e.target.value as ReviewSort);
                      setReviewsPage(1);
                    }}
                    className="px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="highest">Cao nhất</option>
                    <option value="lowest">Thấp nhất</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground">Chưa có đánh giá nào.</p>
                  ) : (
                    reviews.map((r) => {
                      const reviewUserId = r.userId?._id;
                      const canDeleteReview = user && (reviewUserId === user._id || user.role === 'admin');
                      return (
                        <div
                          key={r._id}
                          className="p-4 rounded-lg border border-border bg-muted/20"
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  r.userId?.avatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userId?.fullName || 'U')}&background=6b7280&color=fff`
                                }
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium">{r.userId?.fullName || 'Ẩn danh'}</p>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i <= (r.rating || 0)
                                          ? 'fill-yellow-500 text-yellow-500'
                                          : 'text-muted-foreground/30'
                                      }`}
                                    />
                                  ))}
                                  <span className="text-sm text-muted-foreground ml-1">
                                    {r.rating}/5
                                  </span>
                                </div>
                              </div>
                            </div>
                            {canDeleteReview && (
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(r)}
                                disabled={deletingReviewId === r._id}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                                title="Xóa đánh giá"
                              >
                                {deletingReviewId === r._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                          {(r.reviewText ?? r.comment) && (
                            <p className="text-muted-foreground text-sm pl-12">{r.reviewText ?? r.comment}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                {reviewsTotalPages > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    <button
                      type="button"
                      disabled={reviewsPage <= 1}
                      onClick={() => setReviewsPage((p) => p - 1)}
                      className="px-3 py-1.5 rounded border border-border hover:bg-muted disabled:opacity-50 text-sm"
                    >
                      Trước
                    </button>
                    <span className="px-3 py-1.5 text-sm text-muted-foreground">
                      {reviewsPage} / {reviewsTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={reviewsPage >= reviewsTotalPages}
                      onClick={() => setReviewsPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded border border-border hover:bg-muted disabled:opacity-50 text-sm"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Thông tin khóa học</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cấp độ</span>
                    <span className="font-medium">{formatLevel(course.level)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tổng thời lượng</span>
                    <span className="font-medium">{formatDuration(course.totalDuration)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Số bài học</span>
                    <span className="font-medium">{course.totalLessons || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Học viên</span>
                    <span className="font-medium">
                      {(course.enrollmentCount || 0).toLocaleString()}
                    </span>
                  </div>
                  <a
                    href="#reviews"
                    className="flex items-center justify-between mt-3 pt-3 border-t border-border text-primary hover:underline"
                  >
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      Đánh giá
                    </span>
                    <span className="font-medium">
                      {(course.averageRating ?? 0).toFixed(1)} / 5
                    </span>
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
                <Award className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Nhận chứng chỉ</h3>
                <p className="text-sm text-muted-foreground">
                  Hoàn thành khóa học để nhận chứng chỉ chính thức từ Jncoding
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {showCheckout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-xl max-w-md w-full p-6"
          >
            <h3 className="text-2xl font-bold mb-4">Thanh toán</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                  alt={course.title}
                  className="w-20 h-14 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold line-clamp-2">{course.title}</h4>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {course.price === 0
                      ? 'Miễn phí'
                      : `${(course.price || 0).toLocaleString('vi-VN')}đ`}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold mb-3">
              Xác nhận thanh toán
            </button>
            <button
              onClick={() => setShowCheckout(false)}
              className="w-full py-3 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Hủy
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
