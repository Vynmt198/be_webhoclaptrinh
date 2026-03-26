import { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, DollarSign, BookOpen, TrendingUp, Loader2 } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { adminApi } from '@/app/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/app/components/ui/dialog';

export function AdminAnalytics() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        totalRevenue: number;
        newStudentsThisWeek: number;
        totalCourses: number;
        revenueLast7Days: { name: string; total: number }[];
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [txOpen, setTxOpen] = useState(false);
    const [txLoading, setTxLoading] = useState(false);
    const [txError, setTxError] = useState<string | null>(null);
    const [txPage, setTxPage] = useState(1);
    const [txStatus, setTxStatus] = useState<string>('');
    const [txSearch, setTxSearch] = useState('');
    const [txData, setTxData] = useState<{
        payments: {
            _id: string;
            orderId: string;
            amount: number;
            orderInfo: string;
            paymentStatus: string;
            createdAt: string;
            transactionNo?: string | null;
            userId: any;
            courseId?: any;
            courseIds?: any[];
        }[];
        pagination: { total: number; page: number; limit: number; totalPages: number; hasNextPage?: boolean; hasPrevPage?: boolean };
    } | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        adminApi
            .getStats()
            .then((res) => setData(res.data))
            .catch((err) => setError(err?.message ?? 'Không tải được thống kê.'))
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const formatDateTime = (iso: string) => {
        try {
            return new Date(iso).toLocaleString('vi-VN');
        } catch {
            return iso;
        }
    };

    const statusLabel = (s?: string) => {
        const v = (s || '').toLowerCase();
        if (v === 'success') return 'Thành công';
        if (v === 'pending') return 'Đang xử lý';
        if (v === 'failed') return 'Thất bại';
        if (v === 'cancelled') return 'Đã hủy';
        return s || '—';
    };

    const statusBadgeClass = (s?: string) => {
        const v = (s || '').toLowerCase();
        if (v === 'success') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (v === 'pending') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        if (v === 'failed') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        if (v === 'cancelled') return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
        return 'bg-muted/40 text-muted-foreground border-border';
    };

    const loadTransactions = async (opts?: { page?: number; status?: string; search?: string }) => {
        const page = opts?.page ?? txPage;
        const status = opts?.status ?? txStatus;
        const search = opts?.search ?? txSearch;

        setTxLoading(true);
        setTxError(null);
        try {
            const res = await adminApi.listPayments({
                page,
                limit: 10,
                status: status || undefined,
                search: search?.trim() ? search.trim() : undefined,
            });
            setTxData(res.data);
        } catch (e: any) {
            setTxData(null);
            setTxError(e?.message ?? 'Không tải được danh sách giao dịch.');
        } finally {
            setTxLoading(false);
        }
    };

    useEffect(() => {
        if (!txOpen) return;
        loadTransactions({ page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [txOpen]);

    const txItems = useMemo(() => txData?.payments ?? [], [txData]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Thống kê hệ thống</h1>
                    <p className="text-muted-foreground">Tổng quan hoạt động và doanh thu của nền tảng.</p>
                </div>
                <p className="text-destructive">{error ?? 'Không có dữ liệu.'}</p>
            </div>
        );
    }

    const statCards = [
        { title: 'Tổng Doanh Thu', value: formatCurrency(data.totalRevenue), icon: DollarSign, trend: '—', color: 'text-emerald-500' },
        { title: 'Học viên mới (Tuần)', value: data.newStudentsThisWeek.toLocaleString(), icon: Users, trend: '—', color: 'text-blue-500' },
        { title: 'Khóa học', value: data.totalCourses.toLocaleString(), icon: BookOpen, trend: '—', color: 'text-purple-500' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Thống kê hệ thống</h1>
                <p className="text-muted-foreground">Tổng quan hoạt động và doanh thu của nền tảng.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={[
                            'p-6 bg-card border border-border rounded-2xl shadow-sm flex items-center space-x-4 relative overflow-hidden',
                            i === 0 ? 'cursor-pointer hover:border-primary/40 hover:bg-card/80 transition-colors' : '',
                        ].join(' ')}
                        onClick={() => {
                            if (i !== 0) return;
                            setTxPage(1);
                            setTxStatus('');
                            setTxSearch('');
                            setTxOpen(true);
                        }}
                    >
                        <div className={`p-4 rounded-xl bg-muted/50 ${stat.color}`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                            <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        </div>
                        {stat.trend !== '—' && (
                            <div className="absolute top-6 right-6 flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {stat.trend}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <Dialog
                open={txOpen}
                onOpenChange={(open: boolean) => {
                    setTxOpen(open);
                    if (!open) {
                        setTxError(null);
                        setTxLoading(false);
                    }
                }}
            >
                <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-5xl overflow-hidden min-w-0">
                    <DialogHeader>
                        <DialogTitle>Chi tiết giao dịch</DialogTitle>
                        <DialogDescription>
                            Danh sách giao dịch thanh toán toàn hệ thống (Admin).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="min-w-0 space-y-4">
                    <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between min-w-0">
                        <div className="flex gap-2 items-center min-w-0 shrink-0">
                            <select
                                value={txStatus}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setTxStatus(v);
                                    setTxPage(1);
                                    loadTransactions({ page: 1, status: v });
                                }}
                                className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="success">Thành công</option>
                                <option value="pending">Đang xử lý</option>
                                <option value="failed">Thất bại</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => loadTransactions({ page: 1 })}
                                className="h-10 rounded-lg border border-border bg-muted/30 px-3 text-sm hover:bg-muted/50 transition-colors"
                                disabled={txLoading}
                            >
                                Làm mới
                            </button>
                        </div>

                        <div className="flex gap-2 items-center min-w-0 flex-1 md:flex-initial md:max-w-[320px]">
                            <input
                                value={txSearch}
                                onChange={(e) => setTxSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setTxPage(1);
                                        loadTransactions({ page: 1, search: txSearch });
                                    }
                                }}
                                placeholder="Tìm orderId / nội dung / bank / mã GD..."
                                className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setTxPage(1);
                                    loadTransactions({ page: 1, search: txSearch });
                                }}
                                className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                                disabled={txLoading}
                            >
                                Tìm
                            </button>
                        </div>
                    </div>

                    {txError && <p className="text-sm text-destructive">{txError}</p>}

                    <div className="border border-border rounded-xl overflow-hidden min-w-0 w-full">
                        <div className="max-h-[50vh] overflow-y-auto overflow-x-hidden">
                            <table className="w-full text-sm table-fixed">
                                <thead className="sticky top-0 bg-card/95 backdrop-blur border-b border-border z-10">
                                    <tr className="text-left text-muted-foreground">
                                        <th className="px-3 py-2.5 font-medium w-[130px] shrink-0">Thời gian</th>
                                        <th className="px-3 py-2.5 font-medium w-[140px] shrink-0">Order</th>
                                        <th className="px-3 py-2.5 font-medium min-w-[120px]">Người mua</th>
                                        <th className="px-3 py-2.5 font-medium min-w-0">Nội dung</th>
                                        <th className="px-3 py-2.5 font-medium text-right w-[100px] shrink-0">Số tiền</th>
                                        <th className="px-3 py-2.5 font-medium w-[100px] shrink-0">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {txLoading && (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-10 text-center">
                                                <div className="inline-flex items-center gap-2 text-muted-foreground">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Đang tải...
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {!txLoading && txItems.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">
                                                Không có giao dịch.
                                            </td>
                                        </tr>
                                    )}

                                    {!txLoading &&
                                        txItems.map((p) => {
                                            const user = typeof p.userId === 'object' && p.userId ? p.userId : null;
                                            const courseCount = Array.isArray(p.courseIds) && p.courseIds.length > 0 ? p.courseIds.length : (p.courseId ? 1 : 0);
                                            return (
                                                <tr key={p._id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                                                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatDateTime(p.createdAt)}</td>
                                                    <td className="px-3 py-2.5 min-w-0">
                                                        <div className="font-mono text-xs truncate" title={p.orderId}>{p.orderId}</div>
                                                        {p.transactionNo ? (
                                                            <div className="text-xs text-muted-foreground truncate" title={p.transactionNo}>Mã GD: {p.transactionNo}</div>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-3 py-2.5 min-w-0">
                                                        <div className="font-medium truncate" title={user?.fullName || ''}>{user?.fullName || '—'}</div>
                                                        <div className="text-xs text-muted-foreground truncate" title={user?.email || ''}>{user?.email || '—'}</div>
                                                    </td>
                                                    <td className="px-3 py-2.5 min-w-0">
                                                        <div className="line-clamp-2 text-muted-foreground" title={p.orderInfo}>{p.orderInfo}</div>
                                                        {courseCount > 0 ? (
                                                            <div className="text-xs text-muted-foreground">{courseCount} khóa</div>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">{formatCurrency(p.amount)}</td>
                                                    <td className="px-3 py-2.5">
                                                        <span className={['inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap', statusBadgeClass(p.paymentStatus)].join(' ')}>
                                                            {statusLabel(p.paymentStatus)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between min-w-0">
                        <p className="text-sm text-muted-foreground shrink-0">
                            Tổng: <span className="font-medium text-foreground">{(txData?.pagination?.total ?? 0).toLocaleString()}</span> giao dịch
                        </p>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                className="h-9 px-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors disabled:opacity-50"
                                disabled={txLoading || !(txData?.pagination?.hasPrevPage)}
                                onClick={() => {
                                    const next = Math.max(1, txPage - 1);
                                    setTxPage(next);
                                    loadTransactions({ page: next });
                                }}
                            >
                                Trước
                            </button>
                            <span className="text-sm text-muted-foreground">
                                Trang <span className="font-medium text-foreground">{txData?.pagination?.page ?? txPage}</span> /{' '}
                                <span className="font-medium text-foreground">{txData?.pagination?.totalPages ?? 1}</span>
                            </span>
                            <button
                                type="button"
                                className="h-9 px-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors disabled:opacity-50"
                                disabled={txLoading || !(txData?.pagination?.hasNextPage)}
                                onClick={() => {
                                    const next = txPage + 1;
                                    setTxPage(next);
                                    loadTransactions({ page: next });
                                }}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Chart — domain theo max data để đường vẫn rõ khi doanh thu dưới 1M */}
            {(() => {
                const series = data.revenueLast7Days;
                const maxTotal = Math.max(0, ...series.map((d) => d.total));
                const yMax = maxTotal > 0 ? Math.ceil(maxTotal * 1.15) : 1;
                return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-6">Doanh thu 7 ngày qua</h2>
                <div className="h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={series} margin={{ top: 10, right: 10, left: 52, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                            <YAxis
                                domain={[0, yMax]}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value: number) => {
                                    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                                    if (value >= 1e3) return `${Math.round(value / 1e3)}K`;
                                    return String(value);
                                }}
                                tick={{ fontSize: 12, fill: '#888' }}
                                width={48}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none', color: '#fff' }}
                                formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                            />
                            <Area type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
                );
            })()}
        </div>
    );
}
