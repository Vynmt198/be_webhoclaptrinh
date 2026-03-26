import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, BookOpen, Award, Settings, Bell, Loader2, Eye, EyeOff, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import { enrollmentApi, userApi, certificateApi, paymentApi, type Certificate, type EnrollmentWithCourse, type PaymentInfo } from '@/app/lib/api';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function Account() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialTabFromQuery = searchParams.get('tab') ?? 'profile';
  const [activeTab, setActiveTab] = useState(initialTabFromQuery);

  const [certLoading, setCertLoading] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certLoaded, setCertLoaded] = useState(false);

  const [enrolledCoursesLoading, setEnrolledCoursesLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrollmentWithCourse[]>([]);
  const [enrolledCoursesLoaded, setEnrolledCoursesLoaded] = useState(false);

  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsList, setPaymentsList] = useState<PaymentInfo[]>([]);
  const [paymentsLoaded, setPaymentsLoaded] = useState(false);

  const [emailNotiEnabled, setEmailNotiEnabled] = useState<boolean>(user?.emailNotificationsEnabled ?? true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName ?? '',
    // Instructor-only fields
    instructorHeadline: user?.instructorHeadline ?? '',
    instructorBio: user?.instructorBio ?? '',
    instructorSkillsText: (user?.instructorSkills ?? []).join(', '),
    instructorWebsite: user?.instructorWebsite ?? '',
    instructorFacebook: user?.instructorFacebook ?? '',
    instructorYoutube: user?.instructorYoutube ?? '',
    instructorLinkedin: user?.instructorLinkedin ?? '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Đồng bộ form với user (khi vào trang hoặc sau khi lưu) để luôn hiển thị giá trị đã lưu
  useEffect(() => {
    if (!user) return;
    setProfileForm((prev) => ({
      ...prev,
      fullName: user.fullName ?? '',
      instructorHeadline: user.instructorHeadline ?? '',
      instructorBio: user.instructorBio ?? '',
      instructorSkillsText: (user.instructorSkills ?? []).join(', '),
      instructorWebsite: user.instructorWebsite ?? '',
      instructorFacebook: user.instructorFacebook ?? '',
      instructorYoutube: user.instructorYoutube ?? '',
      instructorLinkedin: user.instructorLinkedin ?? '',
    }));
    setEmailNotiEnabled(user.emailNotificationsEnabled ?? true);
  }, [user?._id, user?.fullName, user?.instructorHeadline, user?.instructorBio, user?.instructorSkills, user?.instructorWebsite, user?.instructorFacebook, user?.instructorYoutube, user?.instructorLinkedin, user?.emailNotificationsEnabled]);

  const handleToggleEmailNotifications = async (nextValue: boolean) => {
    setEmailNotiEnabled(nextValue);
    setIsSavingSettings(true);
    try {
      const res = await userApi.updateProfile({ emailNotificationsEnabled: nextValue });
      updateUser(res.data.user);
      toast.success('Đã cập nhật cài đặt thông báo.');
    } catch (err: unknown) {
      setEmailNotiEnabled(user?.emailNotificationsEnabled ?? true);
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật cài đặt.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const togglePw = (field: keyof typeof showPw) => setShowPw((p) => ({ ...p, [field]: !p[field] }));

  // Derive avatar initials
  const initials = user?.fullName
    ? user.fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'JD';

  // Tabs thay đổi theo role
  const tabs =
    user?.role === 'instructor'
      ? [
          { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
          { id: 'instructor-profile', label: 'Hồ sơ giảng dạy', icon: Award },
        ]
      : user?.role === 'admin'
      ? [
          { id: 'profile', label: 'Hồ sơ', icon: User },
        ]
      : [
          { id: 'profile', label: 'Hồ sơ', icon: User },
          { id: 'courses', label: 'Khóa học', icon: BookOpen },
          { id: 'certificates', label: 'Chứng chỉ', icon: Award },
          { id: 'payments', label: 'Lịch sử thanh toán', icon: CreditCard },
          { id: 'settings', label: 'Cài đặt', icon: Settings },
        ];

  // Đảm bảo tab đang active luôn là một trong các tab hợp lệ
  useMemo(() => {
    const validIds = tabs.map((t) => t.id);
    if (!validIds.includes(activeTab)) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setActiveTab('profile');
    }
  }, [tabs, activeTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const payload: Parameters<typeof userApi.updateProfile>[0] = {};

      // Chỉ gửi fullName khi đang ở tab hồ sơ cá nhân
      if (activeTab === 'profile') {
        payload.fullName = profileForm.fullName.trim();
      }

      // Chỉ giảng viên mới được chỉnh sửa thông tin instructor của chính mình
      if (user?.role === 'instructor') {
        const website = profileForm.instructorWebsite.trim();
        const facebook = profileForm.instructorFacebook.trim();
        const youtube = profileForm.instructorYoutube.trim();
        const linkedin = profileForm.instructorLinkedin.trim();

        payload.instructorHeadline = profileForm.instructorHeadline?.trim() || undefined;
        payload.instructorBio = profileForm.instructorBio?.trim() || undefined;
        payload.instructorWebsite = website || undefined;
        payload.instructorFacebook = facebook || undefined;
        payload.instructorYoutube = youtube || undefined;
        payload.instructorLinkedin = linkedin || undefined;
        payload.instructorSkills = profileForm.instructorSkillsText
          ? profileForm.instructorSkillsText
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
      }

      const res = await userApi.updateProfile(payload);
      updateUser(res.data.user);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err: unknown) {
      const e = err as Error & { responseData?: { errors?: { field: string; message: string }[] } };
      const details = e.responseData?.errors;
      const msg = details?.length
        ? details.map((x) => `${x.field}: ${x.message}`).join(' • ')
        : e.message || 'Cập nhật thất bại.';
      toast.error(msg);
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
                      if (tab.id === 'certificates' && !certLoaded && !certLoading) {
                        setCertLoading(true);
                        certificateApi
                          .myCertificates()
                          .then((res) => {
                            setCertificates(res.data?.certificates ?? []);
                            setCertLoaded(true);
                          })
                          .catch((err: unknown) => {
                            toast.error(err instanceof Error ? err.message : 'Không thể tải chứng chỉ.');
                          })
                          .finally(() => setCertLoading(false));
                      }

                      if (tab.id === 'courses' && !enrolledCoursesLoaded && !enrolledCoursesLoading) {
                        setEnrolledCoursesLoading(true);
                        enrollmentApi
                          .getMyEnrollments()
                          .then((res) => {
                            setEnrolledCourses(res.data?.enrollments ?? []);
                            setEnrolledCoursesLoaded(true);
                          })
                          .catch((err: unknown) => {
                            toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách khóa học.');
                          })
                          .finally(() => setEnrolledCoursesLoading(false));
                      }

                      if (tab.id === 'payments' && !paymentsLoaded && !paymentsLoading) {
                        setPaymentsLoading(true);
                        paymentApi
                          .getHistory({ limit: 50 })
                          .then((res) => {
                            setPaymentsList(res.data?.payments ?? []);
                            setPaymentsLoaded(true);
                          })
                          .catch((err: unknown) => {
                            toast.error(err instanceof Error ? err.message : 'Không thể tải lịch sử thanh toán.');
                          })
                          .finally(() => setPaymentsLoading(false));
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
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  fullName: e.target.value,
                }))
              }
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

    {/* ── Instructor Profile Tab (only for instructors) ── */}
    {user?.role === 'instructor' && activeTab === 'instructor-profile' && (
      <div className="space-y-8">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <h2 className="text-2xl font-bold">Hồ sơ giảng viên</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Tiêu đề ngắn (headline)</label>
            <input
              type="text"
              value={profileForm.instructorHeadline}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, instructorHeadline: e.target.value }))
              }
              placeholder="Ví dụ: Frontend Developer – React, TypeScript & UI/UX"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isSavingProfile}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Giới thiệu bản thân</label>
            <textarea
              value={profileForm.instructorBio}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, instructorBio: e.target.value }))
              }
              rows={5}
              placeholder="Chia sẻ kinh nghiệm giảng dạy, kỹ năng và thành tựu của bạn..."
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              disabled={isSavingProfile}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kỹ năng giảng dạy</label>
            <input
              type="text"
              value={profileForm.instructorSkillsText}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, instructorSkillsText: e.target.value }))
              }
              placeholder="Ví dụ: React, TypeScript, Next.js, Tailwind CSS (ngăn cách bằng dấu phẩy)"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isSavingProfile}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Website cá nhân</label>
              <input
                type="url"
                value={profileForm.instructorWebsite}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, instructorWebsite: e.target.value }))
                }
                placeholder="https://your-portfolio.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isSavingProfile}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Facebook</label>
              <input
                type="url"
                value={profileForm.instructorFacebook}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, instructorFacebook: e.target.value }))
                }
                placeholder="https://facebook.com/username"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isSavingProfile}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">YouTube</label>
              <input
                type="url"
                value={profileForm.instructorYoutube}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, instructorYoutube: e.target.value }))
                }
                placeholder="https://youtube.com/@channel"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isSavingProfile}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn</label>
              <input
                type="url"
                value={profileForm.instructorLinkedin}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, instructorLinkedin: e.target.value }))
                }
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isSavingProfile}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Lưu hồ sơ giảng viên</span>
          </button>
        </form>
      </div>
    )}

    {/* ── Certificates Tab ── */}
    {activeTab === 'certificates' && (
      <div>
        <h2 className="text-2xl font-bold mb-6">Chứng chỉ</h2>

        {certLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải chứng chỉ...</p>
        ) : certificates.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bạn chưa có chứng chỉ nào.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {certificates.map((c) => (
              <div
                key={c._id}
                className="p-6 border-2 border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5"
              >
                <Award className="w-12 h-12 text-primary mb-4" />

                <h3 className="font-semibold mb-1">
                  {c.courseId?.title ?? 'Chứng chỉ'}
                </h3>

                <p className="text-xs text-muted-foreground mb-3">
                  Mã: {c.certificateId}
                </p>

                <p className="text-sm text-muted-foreground mb-4">
                  Ngày cấp: {c.issuedAt
                    ? new Date(c.issuedAt).toLocaleDateString()
                    : '—'}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    const courseId = c.courseId?._id;
                    if (!courseId) {
                      toast.error('Không tìm thấy khóa học của chứng chỉ này.');
                      return;
                    }
                    navigate(`/courses/${courseId}/certificate`);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 text-sm font-medium"
                >
                  Xem chi tiết chứng chỉ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ── Courses Tab ── */}
    {activeTab === 'courses' && (
      <div>
        <h2 className="text-2xl font-bold mb-6">Khóa học đã đăng ký</h2>

        {enrolledCoursesLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải khóa học...</p>
        ) : enrolledCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bạn chưa đăng ký khóa học nào.</p>
        ) : (
          <div className="grid gap-4">
            {enrolledCourses.map((e) => {
              const course = e.courseId;
              const thumb =
                course?.thumbnail ||
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
              const progress = e.progress ?? 0;
              return (
                <div
                  key={e._id}
                  className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-all"
                >
                  <img
                    src={thumb}
                    alt={course?.title || 'Khóa học'}
                    className="w-20 h-14 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 line-clamp-1">{course?.title || 'Khóa học'}</h3>
                    <p className="text-sm text-muted-foreground">Tiến độ: {progress}%</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/learn/${course?._id}`)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    disabled={!course?._id}
                  >
                    Tiếp tục
                  </button>
                </div>
              );
            })}
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
        ) : paymentsList.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bạn chưa có giao dịch nào.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Mã đơn hàng</th>
                  <th className="px-4 py-3 font-medium">Khóa học / Ghi chú</th>
                  <th className="px-4 py-3 font-medium">Số tiền</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paymentsList.map(p => {
                  let statusColor = "text-yellow-500 bg-yellow-500/10";
                  let statusText = "Đang xử lý";
                  if (p.paymentStatus === 'success') {
                    statusColor = "text-green-500 bg-green-500/10";
                    statusText = "Thành công";
                  } else if (p.paymentStatus === 'failed' || p.paymentStatus === 'cancelled') {
                    statusColor = "text-red-500 bg-red-500/10";
                    statusText = "Thất bại";
                  }

                  let courseNames = p.orderInfo;
                  if (p.courseIds && p.courseIds.length > 0 && typeof p.courseIds[0] === 'object' && p.courseIds[0].title) {
                    courseNames = p.courseIds.map(c => typeof c === 'object' ? c.title : '').join(', ');
                  } else if (p.courseId && typeof p.courseId === 'object' && p.courseId.title) {
                    courseNames = p.courseId.title;
                  }

                  return (
                    <tr key={p._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{p.orderId}</td>
                      <td className="px-4 py-3 max-w-[250px] truncate" title={courseNames}>{courseNames}</td>
                      <td className="px-4 py-3 font-medium">{p.amount.toLocaleString()}đ</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>{statusText}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  );
                })}
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
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={emailNotiEnabled}
                          onChange={(e) => handleToggleEmailNotifications(e.target.checked)}
                          disabled={isSavingSettings}
                        />
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