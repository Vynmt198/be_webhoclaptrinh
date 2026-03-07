import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Search, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';

// Mock data
type CourseStatus = 'pending' | 'approved' | 'rejected';

interface MockCourse {
    id: string;
    title: string;
    instructor: string;
    price: string;
    submittedAt: string;
    status: CourseStatus;
}

const initialCourses: MockCourse[] = [
    { id: 'c1', title: 'Khóa học Node.js Thực chiến', instructor: 'Instructor Demo', price: 'Free', submittedAt: '20/10/2024', status: 'pending' },
    { id: 'c2', title: 'React Masterclass', instructor: 'Hung Nguyen', price: '499.000đ', submittedAt: '18/10/2024', status: 'approved' },
    { id: 'c3', title: 'Lập trình C++ Cơ bản', instructor: 'Instructor Demo', price: 'Free', submittedAt: '22/10/2024', status: 'pending' },
];

export function AdminCourses() {
    const [courses, setCourses] = useState<MockCourse[]>(initialCourses);
    const [filter, setFilter] = useState<CourseStatus | 'all'>('all');
    const [search, setSearch] = useState('');

    const handleAction = (id: string, action: 'approve' | 'reject') => {
        setCourses(prev =>
            prev.map(c => {
                if (c.id === id) {
                    const newStatus = action === 'approve' ? 'approved' : 'rejected';
                    toast.success(action === 'approve' ? 'Đã duyệt khóa học!' : 'Đã từ chối khóa học.');
                    return { ...c, status: newStatus };
                }
                return c;
            })
        );
    };

    const filteredCourses = courses.filter(c => {
        const matchesFilter = filter === 'all' || c.status === filter;
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.instructor.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const StatusBadge = ({ status }: { status: CourseStatus }) => {
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-500',
            approved: 'bg-green-500/10 text-green-500',
            rejected: 'bg-red-500/10 text-red-500',
        };
        const labels = {
            pending: 'Chờ duyệt',
            approved: 'Đã duyệt',
            rejected: 'Từ chối',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Duyệt khóa học</h1>
                <p className="text-muted-foreground">Xét duyệt các khóa học do giảng viên đăng tải.</p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên khóa học, giảng viên..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="pl-9 pr-8 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-4 py-3 font-medium">Tên khóa học</th>
                                <th className="px-4 py-3 font-medium">Giảng viên</th>
                                <th className="px-4 py-3 font-medium">Giá</th>
                                <th className="px-4 py-3 font-medium">Ngày nộp</th>
                                <th className="px-4 py-3 font-medium">Trạng thái</th>
                                <th className="px-4 py-3 font-medium text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map(course => (
                                    <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-4 font-medium">{course.title}</td>
                                        <td className="px-4 py-4 text-muted-foreground">{course.instructor}</td>
                                        <td className="px-4 py-4 font-medium text-emerald-500">{course.price}</td>
                                        <td className="px-4 py-4 text-muted-foreground">{course.submittedAt}</td>
                                        <td className="px-4 py-4"><StatusBadge status={course.status} /></td>
                                        <td className="px-4 py-4 text-right">
                                            {course.status === 'pending' ? (
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleAction(course.id, 'approve')}
                                                        className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors flex items-center gap-1"
                                                        title="Duyệt"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(course.id, 'reject')}
                                                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1"
                                                        title="Từ chối"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="px-3 py-1.5 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors text-xs flex items-center gap-1 ml-auto">
                                                    <Eye className="w-3.5 h-3.5" /> Xem
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        Không tìm thấy khóa học nào khớp với tìm kiếm.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
