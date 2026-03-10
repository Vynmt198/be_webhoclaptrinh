import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, ArrowLeft } from 'lucide-react';
import { certificateApi, type Certificate } from '@/app/lib/api';
import { toast } from 'sonner';

interface CourseCertificateData {
  certificate: Certificate | null;
}

export function CourseCertificate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CourseCertificateData>({ certificate: null });

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Tận dụng API myCertificates để tìm chứng chỉ của khóa học này
        const res = await certificateApi.myCertificates();
        const list = res.data?.certificates ?? [];
        const cert = list.find((c) => c.courseId?._id === id);
        if (!cert) {
          toast.error('Không tìm thấy chứng chỉ cho khóa học này.');
        }
        setData({ certificate: cert ?? null });
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Không thể tải chứng chỉ.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Đang tải chứng chỉ...</p>
        </div>
      </div>
    );
  }

  if (!data.certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Chưa có chứng chỉ cho khóa học này</h1>
          <button
            type="button"
            onClick={() => navigate('/my-courses')}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
          >
            Quay lại khóa học của tôi
          </button>
        </div>
      </div>
    );
  }

  const cert = data.certificate;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-10 px-4">
      <div className="max-w-3xl w-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <button
            type="button"
            onClick={() => navigate(`/learn/${id}`)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại khóa học</span>
          </button>
          <span className="text-xs text-muted-foreground">Mã chứng chỉ: {cert.certificateId}</span>
        </div>

        <div className="px-8 py-10 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide">Chứng chỉ hoàn thành khóa học</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
            Được cấp cho
          </p>
          <p className="text-2xl font-semibold">
            {cert.userId?.fullName ?? 'Học viên'}
          </p>

          <div className="max-w-xl mx-auto space-y-2 text-sm md:text-base">
            <p className="text-muted-foreground">
              Với thành tích hoàn thành khóa học
            </p>
            <p className="font-semibold">
              {cert.courseId?.title ?? 'Khóa học'}
            </p>
            {cert.issuedAt && (
              <p className="text-muted-foreground">
                Ngày cấp: {new Date(cert.issuedAt).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

