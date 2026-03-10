import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Loader2, Eye, EyeOff, GraduationCap, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import { authApi, userApi } from '@/app/lib/api';

export function Account() {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // --- Profile states ---
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName ?? '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- Instructor states ---
  const [instructorForm, setInstructorForm] = useState({
    headline: user?.instructorHeadline ?? '',
    bio: user?.instructorBio ?? '',
    skillsText: (user?.instructorSkills ?? []).join(', '),
    website: user?.instructorWebsite ?? '',
    facebook: user?.instructorFacebook ?? '',
    youtube: user?.instructorYoutube ?? '',
    linkedin: user?.instructorLinkedin ?? '',
  });
  const [isSavingInstructor, setIsSavingInstructor] = useState(false);

  // --- Password states ---
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const togglePw = (field: keyof typeof showPw) => setShowPw((p) => ({ ...p, [field]: !p[field] }));

  // --- OTP Reset states ---
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpStep, setOtpStep] = useState<'otp' | 'password'>('otp');
  const [otpForm, setOtpForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResettingWithOtp, setIsResettingWithOtp] = useState(false);

  useEffect(() => {
    setProfileForm({ fullName: user?.fullName ?? '' });
    setInstructorForm({
      headline: user?.instructorHeadline ?? '',
      bio: user?.instructorBio ?? '',
      skillsText: (user?.instructorSkills ?? []).join(', '),
      website: user?.instructorWebsite ?? '',
      facebook: user?.instructorFacebook ?? '',
      youtube: user?.instructorYoutube ?? '',
      linkedin: user?.instructorLinkedin ?? '',
    });
  }, [user]);

  const initials = user?.fullName ? user.fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : 'JD';

  // --- Handlers ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await userApi.updateProfile({ fullName: profileForm.fullName });
      updateUser(res.data.user);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật thất bại.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveInstructorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInstructor(true);
    try {
      const skills = instructorForm.skillsText.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await userApi.updateProfile({
        instructorHeadline: instructorForm.headline || undefined,
        instructorBio: instructorForm.bio || undefined,
        instructorSkills: skills,
        instructorWebsite: instructorForm.website || undefined,
        instructorFacebook: instructorForm.facebook || undefined,
        instructorYoutube: instructorForm.youtube || undefined,
        instructorLinkedin: instructorForm.linkedin || undefined,
      });
      updateUser(res.data.user);
      toast.success('Cập nhật thông tin giáo viên thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật thất bại.');
    } finally {
      setIsSavingInstructor(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Mật khẩu không khớp!');
    setIsSavingPassword(true);
    try {
      await userApi.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Đổi mật khẩu thành công!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      await authApi.forgotPassword(user?.email || '');
      toast.success('Mã OTP đã được gửi vào email của bạn.');
      setOtpStep('otp');
    } catch (err: any) {
      toast.error(err.message || 'Gửi OTP thất bại.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    try {
      await authApi.verifyResetOtp(otpForm.otp);
      setOtpStep('password');
      toast.success('Xác thực thành công. Hãy nhập mật khẩu mới.');
    } catch (err: any) {
      toast.error('Mã OTP không đúng hoặc hết hạn.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPasswordWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpForm.newPassword !== otpForm.confirmPassword) return toast.error('Mật khẩu không khớp!');
    setIsResettingWithOtp(true);
    try {
      await authApi.resetPassword(otpForm.otp, otpForm.newPassword);
      toast.success('Đặt lại mật khẩu thành công! Hãy đăng nhập lại.');
      logout();
      window.location.href = '/login';
    } catch (err: any) {
      toast.error(err.message || 'Thao tác thất bại.');
    } finally {
      setIsResettingWithOtp(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-tr from-primary to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold border-4 border-background shadow-lg overflow-hidden">
                {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : initials}
              </div>
              
              <h3 className="font-bold text-lg leading-tight">{user?.fullName}</h3>
              <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>

              {/* THÔNG TIN BỔ SUNG CHO GIÁO VIÊN TRÊN SIDEBAR */}
              {user?.role === 'instructor' && (user.instructorHeadline || user.instructorBio) && (
                <div className="mt-4 pt-4 border-t border-border space-y-3 text-left">
                  {user.instructorHeadline && (
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-foreground line-clamp-2">{user.instructorHeadline}</p>
                    </div>
                  )}
                  {user.instructorBio && (
                    <p className="text-[11px] text-muted-foreground line-clamp-3 italic leading-relaxed">
                      "{user.instructorBio}"
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>

            <nav className="space-y-1 bg-card border border-border rounded-2xl p-2 shadow-sm">
              {[
                { id: 'profile', label: 'Hồ sơ & Bảo mật', icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
              <button onClick={() => { logout(); window.location.href = '/login'; }} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium">
                <Lock className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-10">
              
              {activeTab === 'profile' && (
                <div className="space-y-12">
                  
                  {/* 1. THÔNG TIN CÁ NHÂN */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary"><User className="w-5 h-5" /></div>
                      <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
                    </div>
                    <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Họ và tên</label>
                        <input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm({ fullName: e.target.value })} className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Địa chỉ Email</label>
                        <div className="relative">
                          <input type="email" value={user?.email || ''} readOnly className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-muted-foreground cursor-not-allowed italic" />
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <button type="submit" disabled={isSavingProfile} className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50">
                          {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          Cập nhật thông tin
                        </button>
                      </div>
                    </form>
                  </section>

                  {/* 2. THÔNG TIN GIÁO VIÊN */}
{user?.role === 'instructor' && (
  <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
    <div className="flex items-center gap-3 pb-2 border-b">
      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
        <GraduationCap className="w-5 h-5" />
      </div>
      <h2 className="text-xl font-bold">Hồ sơ Giáo viên chuyên sâu</h2>
    </div>

    <form onSubmit={handleSaveInstructorProfile} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Headline */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold">Tiêu đề chuyên môn (Headline)</label>
          <input 
            type="text" 
            value={instructorForm.headline} 
            onChange={(e) => setInstructorForm(p => ({ ...p, headline: e.target.value }))} 
            placeholder="VD: Chuyên gia đào tạo React & Next.js" 
            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
          />
        </div>

        {/* Bio */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold">Tiểu sử / Giới thiệu chi tiết</label>
          <textarea 
            rows={4} 
            value={instructorForm.bio} 
            onChange={(e) => setInstructorForm(p => ({ ...p, bio: e.target.value }))} 
            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none" 
            placeholder="Chia sẻ về kinh nghiệm và hành trình giảng dạy của bạn..."
          />
        </div>

        {/* Skills */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold">Kỹ năng chuyên môn (cách nhau bởi dấu phẩy)</label>
          <input 
            type="text" 
            value={instructorForm.skillsText} 
            onChange={(e) => setInstructorForm(p => ({ ...p, skillsText: e.target.value }))} 
            placeholder="VD: React, Node.js, UI/UX Design" 
            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
          />
        </div>

        {/* Social Links */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Website cá nhân (URL)</label>
          <input 
            type="url" 
            value={instructorForm.website} 
            onChange={(e) => setInstructorForm(p => ({ ...p, website: e.target.value }))} 
            placeholder="https://yourportfolio.com" 
            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">LinkedIn Profile</label>
          <input 
            type="url" 
            value={instructorForm.linkedin} 
            onChange={(e) => setInstructorForm(p => ({ ...p, linkedin: e.target.value }))} 
            placeholder="https://linkedin.com/in/username" 
            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Kênh Youtube</label>
          <input 
            type="url" 
            value={instructorForm.youtube} 
            onChange={(e) => setInstructorForm(p => ({ ...p, youtube: e.target.value }))} 
            placeholder="https://youtube.com/@cannel" 
            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Facebook cá nhân</label>
          <input 
            type="url" 
            value={instructorForm.facebook} 
            onChange={(e) => setInstructorForm(p => ({ ...p, facebook: e.target.value }))} 
            placeholder="https://facebook.com/username" 
            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSavingInstructor} 
        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
      >
        {isSavingInstructor ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Lưu thay đổi hồ sơ giáo viên
      </button>
    </form>
  </section>
)}

                  {/* 3. BẢO MẬT & MẬT KHẨU */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600"><Lock className="w-5 h-5" /></div>
                        <h2 className="text-xl font-bold">Bảo mật</h2>
                      </div>
                      {!showOtpSection && (
                        <button type="button" onClick={() => setShowOtpSection(true)} className="text-sm font-bold text-primary hover:underline">
                          Quên mật khẩu cũ?
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {showOtpSection && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="p-6 bg-primary/5 rounded-2xl border border-dashed border-primary/30 space-y-6 mb-8">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-primary">Đặt lại mật khẩu bằng mã OTP Email</h3>
                              <button onClick={() => setShowOtpSection(false)} className="text-xs text-muted-foreground hover:text-foreground underline">Đóng lại</button>
                            </div>

                            {otpStep === 'otp' ? (
                              <div className="space-y-4">
                                
                                <div className="flex gap-3">
                                <p className="text-sm text-muted-foreground">Chúng tôi sẽ gửi một mã 6 chữ số tới email: <span className="font-semibold text-foreground">{user?.email}</span></p>
                                  <button onClick={handleSendOtp} disabled={isSendingOtp} className="px-6 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50">
                                    {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi mã'}
                                  </button>
                                </div>
                                <div className="flex gap-3">

                                <input type="text" placeholder="Nhập OTP" value={otpForm.otp} onChange={(e) => setOtpForm(p => ({ ...p, otp: e.target.value }))} className="flex-1 px-4 py-3 border border-border rounded-xl text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-primary/20 outline-none" />
                                <button onClick={handleVerifyOtp} disabled={isVerifyingOtp || !otpForm.otp} className="w-full py-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90 disabled:opacity-30">
                                  {isVerifyingOtp ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Xác thực mã OTP'}
                                </button>
                              </div>
                              </div>
                            ) : (
                              <form onSubmit={handleResetPasswordWithOtp} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input type="password" placeholder="Mật khẩu mới" value={otpForm.newPassword} onChange={(e) => setOtpForm(p => ({ ...p, newPassword: e.target.value }))} className="w-full px-4 py-3 border border-border rounded-xl" required />
                                  <input type="password" placeholder="Xác nhận mật khẩu mới" value={otpForm.confirmPassword} onChange={(e) => setOtpForm(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full px-4 py-3 border border-border rounded-xl" required />
                                </div>
                                <button type="submit" disabled={isResettingWithOtp} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20">
                                  {isResettingWithOtp ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Xác nhận thay đổi mật khẩu'}
                                </button>
                              </form>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 relative">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mật khẩu hiện tại</label>
                          <input type={showPw.current ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" required />
                          <button type="button" onClick={() => togglePw('current')} className="absolute right-4 bottom-3 text-muted-foreground">{showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                        <div className="space-y-2 relative">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mật khẩu mới</label>
                          <input type={showPw.newPw ? 'text' : 'password'} value={passwordForm.newPassword} onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" required />
                          <button type="button" onClick={() => togglePw('newPw')} className="absolute right-4 bottom-3 text-muted-foreground">{showPw.newPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                        <div className="space-y-2 relative">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Xác nhận mật khẩu mới</label>
                          <input type={showPw.confirm ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" required />
                          <button type="button" onClick={() => togglePw('confirm')} className="absolute right-4 bottom-3 text-muted-foreground">{showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                      </div>
                      <button type="submit" disabled={isSavingPassword} className="px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all">
                        {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cập nhật mật khẩu'}
                      </button>
                    </form>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}