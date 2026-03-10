import { useParams, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, GraduationCap, Pencil, Globe, Facebook, Youtube, Linkedin } from 'lucide-react';
import { userApi, type PublicUserProfile } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function InstructorProfileView() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const navState = (location.state as { instructorName?: string; instructorAvatar?: string } | null) || null;
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    userApi
      .getPublicProfile(userId)
      .then((res) => setProfile(res.data.user))
      .catch((err: any) => {
        // 404 / User not found: chỉ dùng thông tin từ trang khóa học, không cần báo lỗi
        const msg = String(err?.message || '').toLowerCase();
        const isNotFound = msg.includes('404') || msg.includes('not found') || msg.includes('không tìm thấy');
        if (!isNotFound) {
          toast.error('Không thể tải hồ sơ giảng viên.');
        }
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const isOwnProfile =
    !!currentUser && ((profile && currentUser._id === profile._id) || (!profile && userId && currentUser._id === userId));

  const displayName = profile?.fullName || navState?.instructorName || '-';
  const avatarUrl =
    profile?.avatar ||
    navState?.instructorAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại khóa học
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: avatar + info ngắn */}
            <div className="lg:col-span-1 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-border pb-6 lg:pb-0 lg:pr-6">
              <div className="w-24 h-24 rounded-full mb-4 overflow-hidden border-4 border-background shadow-lg bg-muted flex items-center justify-center">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <GraduationCap className="w-4 h-4" />
                Giảng viên
              </p>
              <h1 className="text-2xl font-bold mb-2">{displayName}</h1>
              {profile?.instructorHeadline && (
                <p className="text-sm text-foreground font-medium mb-3">
                  {profile.instructorHeadline}
                </p>
              )}

              {/* Kỹ năng chính */}
              {profile?.instructorSkills && profile.instructorSkills.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {profile.instructorSkills.slice(0, 8).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Link mạng xã hội / website */}
              {(profile?.instructorWebsite ||
                profile?.instructorFacebook ||
                profile?.instructorYoutube ||
                profile?.instructorLinkedin) && (
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {profile.instructorWebsite && (
                    <a
                      href={profile.instructorWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {profile.instructorFacebook && (
                    <a
                      href={profile.instructorFacebook}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </a>
                  )}
                  {profile.instructorYoutube && (
                    <a
                      href={profile.instructorYoutube}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </a>
                  )}
                  {profile.instructorLinkedin && (
                    <a
                      href={profile.instructorLinkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              )}

              {isOwnProfile && (
                <Link
                  to="/account"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  <Pencil className="w-4 h-4" />
                  Chỉnh sửa hồ sơ
                </Link>
              )}
            </div>

            {/* Right: mô tả chi tiết */}
            <div className="lg:col-span-2 text-left">
              <h2 className="text-lg font-semibold mb-3">Giới thiệu</h2>
              {profile?.instructorBio || profile?.bio ? (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {profile.instructorBio || profile.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Giảng viên chưa cập nhật phần giới thiệu chi tiết.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
