import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { BookOpen, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export function InstructorLayout() {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    if (!user || !['instructor', 'admin'].includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    const links = [
        { to: '/instructor/courses', icon: BookOpen, label: 'Khóa tôi dạy' },
    ];

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card/50 hidden md:flex flex-col">
                <div className="p-6">
                    <div className="flex items-center space-x-2 text-primary font-bold text-lg">
                        <GraduationCap className="w-6 h-6" />
                        <span>Kênh giảng viên</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-balance">
                        Quản lý khóa học và nội dung của bạn
                    </p>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`
                            }
                        >
                            <link.icon className="w-5 h-5" />
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
