import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { User, BookOpen, Settings, Bell, Loader2, Eye, EyeOff, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import { userApi, paymentApi, type PaymentInfo, enrollmentApi, type EnrollmentWithCourse } from '@/app/lib/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function Account() {
const { user, updateUser, logout } = useAuth();
const navigate = useNavigate();
const [searchParams] = useSearchParams();

const initialTabFromQuery = searchParams.get('tab') ?? 'profile';
const [activeTab, setActiveTab] = useState(initialTabFromQuery);


  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName ?? '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const togglePw = (field: keyof typeof showPw) => setShowPw((p) => ({ ...p, [field]: !p[field] }));

  // Payment History state
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [paymentsLoaded, setPaymentsLoaded] = useState(false);

  // Enrolled Courses state
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrollmentWithCourse[]>([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);

  // Derive avatar initials
  const initials = user?.fullName
    ? user.fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'JD';

  const tabs = [
    { id: 'profile', label: 'Hồ sơ', icon: User },
    ...(user?.role === 'admin' || user?.role === 'instructor' ? [] : [
      { id: 'courses', label: 'Khóa học', icon: BookOpen },
      { id: 'payments', label: 'Lịch sử thanh toán', icon: CreditCard },
      { id: 'settings', label: 'Cài đặt', icon: Settings },
    ])
  ];

  // Đảm bảo tab đang active luôn là một trong các tab hợp lệ
  useMemo(() => {
    const validIds = tabs.map((t) => t.id);
    if (!validIds.includes(activeTab)) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setActiveTab('profile');
    }
  }, [tabs, activeTab]);

  useEffect(() => {
    const tabFromQuery = searchParams.get('tab');
    if (tabFromQuery && tabFromQuery !== activeTab) {
      setActiveTab(tabFromQuery);
    }
  }, [searchParams, activeTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await userApi.updateProfile({ fullName: profileForm.fullName });
      updateUser(res.data.user);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    setIsSavingPassword(true);
    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Đổi mật khẩu thất bại.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Tài Khoản</h1>
          <p className="text-muted-foreground">Quản lý thông tin và cài đặt tài khoản</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">{initials}</span>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{user?.fullName ?? '—'}</h3>
                <p className="text-sm text-muted-foreground">{user?.email ?? '—'}</p>
                {user?.role && (
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary capitalize">
                    {user.role}
                  </span>
                )}
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);

                      if (tab.id === 'payments' && !paymentsLoaded && !paymentsLoading) {
                        setPaymentsLoading(true);
                        paymentApi
                          .getHistory({ status: 'success' })
                          .then((res) => {
                            setPayments(res.data?.payments || []);
                            setPaymentsLoaded(true);
                          })
                          .catch((err: unknown) => {
                            toast.error(err instanceof Error ? err.message : 'Không thể tải lịch sử thanh toán.');
                          })
                          .finally(() => setPaymentsLoading(false));
                      }
                      if (tab.id === 'courses' && !coursesLoaded && !coursesLoading) {
                        setCoursesLoading(true);
                        enrollmentApi
                          .getMyEnrollments()
                          .then((res) => {
                            setEnrolledCourses(res.data?.enrollments || []);
                            setCoursesLoaded(true);
                          })
                          .catch((err: unknown) => {
                            toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách khóa học.');
                          })
                          .finally(() => setCoursesLoading(false));
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="mt-4 w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium"
              >
                Đăng xuất
              </button>
            </div>
          </motion.div>

{/* Main Content */}
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.4, duration: 0.6 }}
  className="lg:col-span-3"
>
  <div className="bg-card border border-border rounded-xl p-6">

    {/* ── Profile Tab ── */}
    {activeTab === 'profile' && (
      <div className="space-y-8">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Họ và tên</label>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ fullName: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
              disabled={isSavingProfile}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Lưu thay đổi</span>
          </button>
        </form>

        {/* Change password (inside profile tab) */}
        <form onSubmit={handleChangePassword} className="space-y-4 pt-6 border-t border-border">
          <h2 className="text-xl font-bold">Đổi mật khẩu</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Mật khẩu hiện tại</label>
            <div className="relative">
              <input
                type={showPw.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                disabled={isSavingPassword}
              />
              <button type="button" onClick={() => togglePw('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPw.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showPw.newPw ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                minLength={8}
                disabled={isSavingPassword}
              />
              <button type="button" onClick={() => togglePw('newPw')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPw.newPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <input
                type={showPw.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                disabled={isSavingPassword}
              />
              <button type="button" onClick={() => togglePw('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPw.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSavingPassword}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSavingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Đổi mật khẩu</span>
          </button>
        </form>
      </div>
    )}

    {/* ── Courses Tab ── */}
    {activeTab === 'courses' && (
      <div>
        <h2 className="text-2xl font-bold mb-6">Khóa học đã đăng ký</h2>

        {coursesLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải danh sách khóa học...</p>
        ) : enrolledCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bạn chưa đăng ký khóa học nào.</p>
        ) : (
          <div className="grid gap-4">
            {enrolledCourses.map((enrollment) => (
              <div
                key={enrollment._id}
                className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-all"
              >
                <div className="w-full sm:w-32 h-20 bg-primary/5 border border-primary/20 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                  {enrollment.courseId?.thumbnail ? (
                    <img 
                      src={enrollment.courseId.thumbnail} 
                      alt={enrollment.courseId.title} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-8 h-8 text-primary/40" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 line-clamp-1">{enrollment.courseId?.title ?? 'Khóa học không tồn tại'}</h3>
                  <div className="w-full max-w-sm">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-medium">{enrollment.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500 ease-out" 
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto mt-4 sm:mt-0">
                  <button 
                    onClick={() => navigate(`/learn/${enrollment.courseId?._id}`)}
                    className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Tiếp tục học
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ── Payments Tab ── */}
    {activeTab === 'payments' && (
      <div>
        <h2 className="text-2xl font-bold mb-6">Lịch sử thanh toán</h2>
        
        {paymentsLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải lịch sử thanh toán...</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bạn chưa có giao dịch thanh toán thành công nào.</p>
        ) : (
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3">Mã đơn hàng</th>
                  <th className="px-6 py-3">Ngày thanh toán</th>
                  <th className="px-6 py-3">Nội dung</th>
                  <th className="px-6 py-3">Số tiền</th>
                  <th className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-b border-border hover:bg-muted/20">
                    <td className="px-6 py-4 font-medium">{p.orderId}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate" title={p.orderInfo}>
                      {p.orderInfo}
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      {p.amount.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-500">
                        Thành công
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

    {/* ── Settings Tab ── */}
    {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Cài đặt</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Thông báo Email</p>
                          <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                </div>
              </div>
            </div>
    )}
  </div>
</motion.div>
        </div>
      </div>
    </div>
  );
}