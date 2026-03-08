import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, MessageSquareMore, HelpCircle, Search, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const initialLessons = [
    { id: 1, title: 'Bài 1: Giới thiệu React', course: 'React Masterclass', author: 'Instructor Demo', status: 'published', views: 1250 },
    { id: 2, title: 'Bài 2: Hooks cơ bản', course: 'React Masterclass', author: 'Instructor Demo', status: 'hidden', views: 800 },
];

const initialComments = [
    { id: 1, user: 'Hung Nguyen', content: 'Bài giảng rất hay và dễ hiểu!', target: 'Bài 1: Giới thiệu React', date: '21/10/2024' },
    { id: 2, user: 'Do Nam Trung', content: 'Mình chưa hiểu phần useEffect?', target: 'Bài 2: Hooks cơ bản', date: '22/10/2024' },
];

export function AdminContent() {
    const [activeTab, setActiveTab] = useState<'lessons' | 'comments' | 'quizzes'>('lessons');
    const [lessons, setLessons] = useState(initialLessons);
    const [comments, setComments] = useState(initialComments);

    const toggleLessonStatus = (id: number) => {
        setLessons(prev => prev.map(l => {
            if (l.id === id) {
                const newStatus = l.status === 'published' ? 'hidden' : 'published';
                toast.success(`Đã ${newStatus === 'published' ? 'hiển thị' : 'ẩn'} bài giảng.`);
                return { ...l, status: newStatus };
            }
            return l;
        }));
    };

    const deleteComment = (id: number) => {
        if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
            setComments(prev => prev.filter(c => c.id !== id));
            toast.success('Đã xóa bình luận khỏi hệ thống.');
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
                    className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                />
            </div>

            {/* Content Areas */}
            {activeTab === 'lessons' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-4 py-3 font-medium">Tên bài giảng</th>
                                <th className="px-4 py-3 font-medium">Khóa học</th>
                                <th className="px-4 py-3 font-medium">Giảng viên</th>
                                <th className="px-4 py-3 font-medium">Lượt xem</th>
                                <th className="px-4 py-3 font-medium text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {lessons.map(lesson => (
                                <tr key={lesson.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{lesson.title}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{lesson.course}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{lesson.author}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{lesson.views.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => toggleLessonStatus(lesson.id)}
                                            className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                                            title={lesson.status === 'published' ? 'Ẩn bài giảng' : 'Hiển thị bài giảng'}
                                        >
                                            {lesson.status === 'published' ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-yellow-500" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}

            {activeTab === 'comments' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
                    {comments.map(comment => (
                        <div key={comment.id} className="bg-card border border-border p-4 rounded-xl flex justify-between items-start gap-4 hover:border-primary/30 transition-colors">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-semibold text-sm">{comment.user}</span>
                                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                                        {comment.target}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{comment.date}</span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                            </div>
                            <button
                                onClick={() => deleteComment(comment.id)}
                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Xóa bình luận vi phạm"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
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
