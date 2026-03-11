import { useState, useEffect } from 'react';
import { Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { certificateApi, type Certificate } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';

export function Certificates() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [certLoading, setCertLoading] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    // Only fetch if learner is authenticated
    if (!isAuthenticated || !['user', 'learner'].includes(user?.role || 'learner')) {
       return;
    }

    setCertLoading(true);
    certificateApi
      .myCertificates()
      .then((res) => {
        setCertificates(res.data?.certificates || []);
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : 'Không thể tải chứng chỉ.');
      })
      .finally(() => setCertLoading(false));
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Chứng chỉ</h2>
        <p className="text-muted-foreground">Vui lòng đăng nhập để xem chứng chỉ của bạn.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
          <Award className="w-8 h-8 text-primary" />
          Chứng chỉ của tôi
        </h2>

        {certLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Đang tải chứng chỉ...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-border/50">
            <Award className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Bạn chưa có chứng chỉ nào.</p>
            <p className="text-sm text-muted-foreground mt-2">Hãy hoàn thành khóa học để nhận chứng chỉ nhé!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {certificates.map((c) => (
              <div
                key={c._id}
                className="p-6 border-2 border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 hover:border-primary/50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-4">
                  <Award className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : '—'}
                  </span>
                </div>

                <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem]">
                  {c.courseId?.title ?? 'Chứng chỉ khóa học'}
                </h3>

                <p className="text-xs text-muted-foreground mb-6 font-mono bg-background/50 inline-block px-2 py-1 rounded">
                  ID: {c.certificateId}
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
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                >
                  <Award className="w-4 h-4" />
                  Xem chi tiết chứng chỉ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
