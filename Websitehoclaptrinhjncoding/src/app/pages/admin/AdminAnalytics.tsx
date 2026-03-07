import { motion } from 'motion/react';
import { Users, DollarSign, BookOpen, TrendingUp } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Mock Data
const revenueData = [
    { name: 'T2', total: 1500000 },
    { name: 'T3', total: 2200000 },
    { name: 'T4', total: 1800000 },
    { name: 'T5', total: 3100000 },
    { name: 'T6', total: 2800000 },
    { name: 'T7', total: 4200000 },
    { name: 'CN', total: 5100000 },
];

export function AdminAnalytics() {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const statCards = [
        { title: 'Tổng Doanh Thu', value: '12.500.000đ', icon: DollarSign, trend: '+15%', color: 'text-emerald-500' },
        { title: 'Học viên mới (Tuần)', value: '1,420', icon: Users, trend: '+8%', color: 'text-blue-500' },
        { title: 'Khóa học', value: '45', icon: BookOpen, trend: '+2', color: 'text-purple-500' },
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
                        className="p-6 bg-card border border-border rounded-2xl shadow-sm flex items-center space-x-4 relative overflow-hidden"
                    >
                        <div className={`p-4 rounded-xl bg-muted/50 ${stat.color}`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                            <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        </div>
                        <div className="absolute top-6 right-6 flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {stat.trend}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-6">Doanh thu 7 ngày qua</h2>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `${value / 1000000}M`}
                                tick={{ fontSize: 12, fill: '#888' }}
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
        </div>
    );
}
