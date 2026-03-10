import { useEffect, useMemo, useState, Fragment } from 'react';
import { motion } from 'motion/react';
import { FileText, MessageSquareMore, HelpCircle, Search, Trash2, Eye, EyeOff, Loader2, ThumbsUp, MessageCircle, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, reviewApi } from '@/app/lib/api';

export function AdminContent() {
    const [activeTab, setActiveTab] = useState<'lessons' | 'comments' | 'quizzes' | 'reviews'>('lessons');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [lessons, setLessons] = useState<{
        _id: string;
        title: string;
        courseTitle: string;
        instructorName: string;
        views: number;
        isHidden: boolean;
    }[]>([]);
    const [commentsError, setCommentsError] = useState<string | null>(null);
    const [comments, setComments] = useState<{
        _id: string;
        parentId: string | null;
        user: string;
        content: string;
        target: string;
        date: string;
        status: string;
        isReply: boolean;
        likesCount: number;
        repliesCount: number;
    }[]>([]);
    const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
    const [expandedCommentIds, setExpandedCommentIds] = useState<Set<string>>(new Set());
    const [reviewsError, setReviewsError] = useState<string | null>(null);
    const [reviews, setReviews] = useState<{
        _id: string;
        user: string;
        courseTitle: string;
        courseId: string;
        rating: number;
        reviewText: string;
        date: string;
    }[]>([]);

    const dateFormatter = useMemo(
        () => new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        []
    );

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            if (activeTab === 'comments') setCommentsError(null);
            if (activeTab === 'reviews') setReviewsError(null);
            if (activeTab === 'quizzes') {
                setLoading(false);
                return;
            }
            try {
                if (activeTab === 'lessons') {
                    const res = await adminApi.getContentLessons({ search });
                    if (cancelled) return;
                    setLessons(res.data?.lessons ?? []);
                } else if (activeTab === 'comments') {
                    const res = await adminApi.getContentComments({ search });
                    if (cancelled) return;
                    const list = (res.data?.comments ?? []).map((c) => ({
                        _id: c._id,
                        parentId: c.parentId ?? null,
                        user: c.user,
                        content: c.content,
                        target: c.target,
                        date: dateFormatter.format(new Date(c.date)),
                        status: c.status,
                        isReply: c.isReply,
                        likesCount: c.likesCount ?? 0,
                        repliesCount: c.repliesCount ?? 0,
                    }));
                    setComments(list);
                    setCommentsError(null);
                } else if (activeTab === 'reviews') {
                    const res = await adminApi.getContentReviews({ search });
                    if (cancelled) return;
                    const list = (res.data?.reviews ?? []).map((r) => ({
                        _id: r._id,
                        user: r.user,
                        courseTitle: r.courseTitle,
                        courseId: r.courseId,
                        rating: r.rating,
                        reviewText: r.reviewText ?? '',
                        date: dateFormatter.format(new Date(r.date)),
                    }));
                    setReviews(list);
                    setReviewsError(null);
                }
            } catch (err: any) {
                if (!cancelled) {
                    toast.error(err?.message ?? 'Không tải được dữ liệu.');
                    if (activeTab === 'comments') setCommentsError(err?.message ?? 'Không tải được danh sách.');
                    if (activeTab === 'reviews') setReviewsError(err?.message ?? 'Không tải được danh sách đánh giá.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [activeTab, search, dateFormatter]);

    const toggleLessonStatus = (lessonId: string) => {
        adminApi
            .toggleLessonVisibility(lessonId)
            .then((res) => {
                const isHidden = res.data?.isHidden ?? false;
                setLessons((prev) => prev.map((l) => (l._id === lessonId ? { ...l, isHidden } : l)));
                toast.success(`Đã ${isHidden ? 'ẩn' : 'hiển thị'} bài giảng.`);
            })
            .catch((err: any) => toast.error(err?.message ?? 'Không thể cập nhật bài giảng.'));
    };

    const deleteComment = (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
            adminApi
                .deleteContentComment(id)
                .then(() => {
                    setComments((prev) => prev.filter((c) => c._id !== id));
                    toast.success('Đã xóa bình luận khỏi hệ thống.');
                })
                .catch((err: any) => toast.error(err?.message ?? 'Không thể xóa bình luận.'));
        }
    };

    const deleteReview = (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
            reviewApi
                .delete(id)
                .then(() => {
                    setReviews((prev) => prev.filter((r) => r._id !== id));
                    toast.success('Đã xóa đánh giá.');
                })
                .catch((err: any) => toast.error(err?.message ?? 'Không thể xóa đánh giá.'));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Quản lý nội dung</h1>
                <p className="text-muted-foreground">Kiểm soát bài giảng, bình luận và tài liệu trên hệ thống.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-border">
                {[
                    { id: 'lessons', label: 'Bài giảng', icon: FileText },
                    { id: 'comments', label: 'Bình luận', icon: MessageSquareMore },
                    { id: 'reviews', label: 'Đánh giá khóa học', icon: Star },
                    { id: 'quizzes', label: 'Câu hỏi (Quiz)', icon: HelpCircle },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder={`Tìm kiếm ${activeTab}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                />
            </div>

            {/* Content Areas */}
            {activeTab === 'lessons' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Tên bài giảng</th>
                                    <th className="px-4 py-3 font-medium" />
                                    <th className="px-4 py-3 font-medium">Giảng viên</th>
                                    <th className="px-4 py-3 font-medium">Lượt xem</th>
                                    <th className="px-4 py-3 font-medium text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {(() => {
                                    const byCourse: Record<string, typeof lessons> = {};
                                    lessons.forEach((l) => {
                                        if (!byCourse[l.courseTitle]) byCourse[l.courseTitle] = [];
                                        byCourse[l.courseTitle].push(l);
                                    });

                                    const toggleCourse = (courseTitle: string) => {
                                        setExpandedCourses((prev) => {
                                            const next = new Set(prev);
                                            if (next.has(courseTitle)) next.delete(courseTitle);
                                            else next.add(courseTitle);
                                            return next;
                                        });
                                    };

                                    return Object.entries(byCourse).map(([courseTitle, list]) => {
                                        const expanded = expandedCourses.has(courseTitle);
                                        return (
                                            <Fragment key={courseTitle}>
                                                <tr
                                                    className="cursor-pointer hover:bg-muted/30"
                                                    onClick={() => toggleCourse(courseTitle)}
                                                >
                                                    <td colSpan={5} className="px-4 py-2 font-semibold text-foreground flex items-center gap-2">
                                                        {expanded ? (
                                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                        <span>{courseTitle}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({list.length} bài giảng)
                                                        </span>
                                                    </td>
                                                </tr>
                                                {expanded &&
                                                    list.map((lesson) => (
                                                        <tr key={lesson._id} className="hover:bg-muted/30">
                                                            <td className="px-4 py-3 font-medium">{lesson.title}</td>
                                                            <td className="px-4 py-3 text-muted-foreground" />
                                                            <td className="px-4 py-3 text-muted-foreground">{lesson.instructorName}</td>
                                                            <td className="px-4 py-3 text-muted-foreground">{lesson.views.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right">
                                                                <button
                                                                    onClick={() => toggleLessonStatus(lesson._id)}
                                                                    className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                                                                    title={!lesson.isHidden ? 'Ẩn bài giảng' : 'Hiển thị bài giảng'}
                                                                >
                                                                    {!lesson.isHidden ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-yellow-500" />}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </Fragment>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                    )}
                </motion.div>
            )}

            {activeTab === 'comments' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    ) : commentsError ? (
                        <div className="bg-card border border-border rounded-xl p-8 text-center">
                            <p className="text-destructive mb-2">{commentsError}</p>
                            <p className="text-sm text-muted-foreground">Kiểm tra đăng nhập admin hoặc backend.</p>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">Chưa có bình luận nào</p>
                            <p className="text-sm">Bình luận hiển thị ở đây khi học viên hoặc giảng viên đăng bài trong mục <strong>Thảo luận</strong> của từng khóa học. Hãy vào một khóa học → Thảo luận → đăng bài thử để thấy dữ liệu.</p>
                        </div>
                    ) : (
                        (() => {
                            const posts = comments.filter((c) => !c.isReply);
                            const repliesByParentId: Record<string, typeof comments> = {};
                            comments.filter((c) => c.isReply && c.parentId).forEach((r) => {
                                if (!repliesByParentId[r.parentId!]) repliesByParentId[r.parentId!] = [];
                                repliesByParentId[r.parentId!].push(r);
                            });
                            const renderCommentCard = (comment: (typeof comments)[0], isReply: boolean) => (
                                <div key={comment._id} className={`bg-card border border-border p-4 rounded-xl flex justify-between items-start gap-4 hover:border-primary/30 transition-colors ${isReply ? 'ml-6 border-l-2 border-l-primary/30' : ''}`}>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-semibold text-sm">{comment.user}</span>
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full ${isReply ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                                                {isReply ? 'Trả lời' : 'Bài viết'}
                                            </span>
                                            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                                                {comment.target}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{comment.date}</span>
                                        </div>
                                        <p className="text-sm">{comment.content}</p>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <ThumbsUp className="w-3.5 h-3.5" />
                                                {comment.likesCount.toLocaleString()}
                                            </span>
                                            {!isReply && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setExpandedCommentIds((prev) => {
                                                            const next = new Set(prev);
                                                            if (next.has(comment._id)) {
                                                                next.delete(comment._id);
                                                            } else {
                                                                next.add(comment._id);
                                                            }
                                                            return next;
                                                        });
                                                    }}
                                                    className="inline-flex items-center gap-1 text-primary hover:underline text-[11px]"
                                                >
                                                    <MessageCircle className="w-3 h-3" />
                                                    <span>
                                                        {expandedCommentIds.has(comment._id)
                                                            ? 'Ẩn trả lời'
                                                            : `Xem ${comment.repliesCount.toLocaleString()} trả lời`}
                                                    </span>
                                                </button>
                                            )}
                                            {comment.status !== 'visible' && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                    {comment.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteComment(comment._id)}
                                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Xóa bình luận vi phạm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                            return (
                                <div className="space-y-3">
                                    {posts.map((post) => (
                                        <div key={post._id} className="space-y-2">
                                            {renderCommentCard(post, false)}
                                            {expandedCommentIds.has(post._id) &&
                                                (repliesByParentId[post._id] ?? []).map((reply) =>
                                                    renderCommentCard(reply, true)
                                                )}
                                        </div>
                                    ))}
                                </div>
                            );
                        })()
                    )}
                </motion.div>
            )}

            {activeTab === 'reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    ) : reviewsError ? (
                        <div className="p-8 text-center">
                            <p className="text-destructive mb-2">{reviewsError}</p>
                            <p className="text-sm text-muted-foreground">Kiểm tra đăng nhập admin hoặc backend.</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">Chưa có đánh giá nào</p>
                            <p className="text-sm">Đánh giá hiển thị khi học viên đánh giá sao và để lại nhận xét ở trang chi tiết khóa học (mục Đánh giá &amp; xếp hạng).</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Người đánh giá</th>
                                    <th className="px-4 py-3 font-medium">Khóa học</th>
                                    <th className="px-4 py-3 font-medium text-center">Sao</th>
                                    <th className="px-4 py-3 font-medium">Nội dung</th>
                                    <th className="px-4 py-3 font-medium">Ngày</th>
                                    <th className="px-4 py-3 font-medium text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {reviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{review.user}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{review.courseTitle}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${review.rating} sao`}>
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'fill-current' : 'opacity-30'}`} />
                                                ))}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{review.reviewText || '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">{review.date}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => deleteReview(review._id)}
                                                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Xóa đánh giá"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </motion.div>
            )}

            {activeTab === 'quizzes' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-xl text-muted-foreground">
                    <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p>Tính năng quản lý ngân hàng câu hỏi đang được phát triển.</p>
                </motion.div>
            )}
        </div>
    );
}
