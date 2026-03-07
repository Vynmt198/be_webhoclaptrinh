import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Users, BookOpen, FileText, PieChart, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminLayout() {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    const links = [
        { to: '/admin/analytics', icon: PieChart, label: 'Thống kê' },
        { to: '/admin/users', icon: Users, label: 'Người dùng' },
        { to: '/admin/courses', icon: BookOpen, label: 'Khóa học' },
        { to: '/admin/content', icon: FileText, label: 'Nội dung' },
    ];

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card/50 hidden md:flex flex-col">
                <div className="p-6">
                    <div className="flex items-center space-x-2 text-primary font-bold text-lg">
                        <ShieldAlert className="w-6 h-6" />
                        <span>Admin Portal</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-balance">
                        Quản trị toàn quyền hệ thống
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

            {/* Main Content Area */}
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
