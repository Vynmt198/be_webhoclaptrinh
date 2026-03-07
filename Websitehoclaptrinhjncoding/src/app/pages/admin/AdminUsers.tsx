import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Users, Search, ChevronLeft, ChevronRight,
    ToggleLeft, ToggleRight, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, type User, type Pagination } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';

const ROLES = ['', 'learner', 'instructor', 'admin'] as const;

export function AdminUsers() {
    const navigate = useNavigate();
    const { user: me, isLoading: authLoading } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Admin guard
    useEffect(() => {
        if (!authLoading && me?.role !== 'admin') {
            toast.error('Bạn không có quyền truy cập trang này.');
            navigate('/');
        }
    }, [me, authLoading, navigate]);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await adminApi.listUsers({
                page,
                limit: 10,
                role: roleFilter || undefined,
                search: search || undefined,
            });
            setUsers(res.data.users);
            setPagination(res.data.pagination);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách.');
        } finally {
            setIsLoading(false);
        }
    }, [page, roleFilter, search]);

    useEffect(() => {
        if (me?.role === 'admin') fetchUsers();
    }, [fetchUsers, me]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setActionLoading(userId + '-role');
        try {
            await adminApi.updateRole(userId, newRole);
            toast.success('Cập nhật vai trò thành công.');
            setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole as User['role'] } : u)));
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleStatus = async (userId: string) => {
        setActionLoading(userId + '-status');
        try {
            await adminApi.toggleStatus(userId);
            setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u)));
            toast.success('Cập nhật trạng thái thành công.');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại.');
        } finally {
            setActionLoading(null);
        }
    };


    const roleBadge = (role: string) => {
        const map: Record<string, string> = {
            admin: 'bg-red-500/10 text-red-500',
            instructor: 'bg-blue-500/10 text-blue-500',
            learner: 'bg-green-500/10 text-green-500',
        };
        return map[role] ?? 'bg-muted text-muted-foreground';
    };

    if (authLoading) return null;

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2">Quản lý người dùng</h1>
                <p className="text-muted-foreground">
                    {pagination ? `Tổng cộng ${pagination.total} người dùng` : 'Đang tải...'}
                </p>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                >
                    <option value="">Tất cả vai trò</option>
                    <option value="learner">Học viên</option>
                    <option value="instructor">Giảng viên</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Users className="w-12 h-12 mb-3 opacity-30" />
                        <p>Không tìm thấy người dùng nào.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Họ tên</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vai trò</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, i) => (
                                    <motion.tr
                                        key={u._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {u.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium">{u.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                disabled={u._id === me?._id || actionLoading === u._id + '-role'}
                                                className={`text-xs px-2 py-1 rounded-full border-0 font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer disabled:cursor-not-allowed ${roleBadge(u.role)}`}
                                            >
                                                {ROLES.filter(Boolean).map((r) => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleToggleStatus(u._id)}
                                                disabled={u._id === me?._id || actionLoading === u._id + '-status'}
                                                className="flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading === u._id + '-status' ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : u.isActive ? (
                                                    <ToggleRight className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                                                )}
                                                <span className={`text-xs ${u.isActive ? 'text-green-500' : 'text-muted-foreground'}`}>
                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                            Trang {pagination.page} / {pagination.totalPages}
                        </span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setPage((p) => p - 1)}
                                disabled={!pagination.hasPrevPage}
                                className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!pagination.hasNextPage}
                                className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
