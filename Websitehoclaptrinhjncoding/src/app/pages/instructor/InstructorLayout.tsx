import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { BookOpen, GraduationCap, PlusCircle, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';

export function InstructorLayout() {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    if (!user || !['instructor', 'admin'].includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    const links = [
        { to: '/instructor/courses', icon: BookOpen, label: 'Khóa tôi dạy' },
        { to: '/instructor/courses/new', icon: PlusCircle, label: 'Tạo khóa mới' },
        { to: '/instructor/analytics', icon: BarChart2, label: 'Thống kê' },
    ];

    return (
        <div className="flex min-h-[calc(100vh-64px)]">
            {/* Sidebar */}
            <aside className="w-56 shrink-0 border-r border-border bg-card/30 flex flex-col">
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                        <GraduationCap className="w-5 h-5" />
                        <span>Kênh giảng viên</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Quản lý khóa học và nội dung
                    </p>
                </div>
                <nav className="p-3 space-y-0.5">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/instructor/courses'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-primary/15 text-primary'
                                        : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                }`
                            }
                        >
                            <link.icon className="w-4 h-4 shrink-0" />
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background/50">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 md:p-8"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}
