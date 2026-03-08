import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Lottie from 'lottie-react';
import { Loader2 } from 'lucide-react';
import { paymentsApi, type VnpayReturnResponse } from '@/app/lib/api';
import { Button } from '@/app/components/ui/button';
import successAnim from '@/app/assets/animation/success.json';
import failAnim from '@/app/assets/animation/fail.json';

type ViewType = 'success' | 'invalid' | 'fail' | 'error' | 'loading';

function getViewType(
  res: VnpayReturnResponse | null,
  err: boolean,
  urlResponseCode?: string | null
): ViewType {
  const code = res?.data?.responseCode ?? urlResponseCode ?? '';
  if (err || !res) {
    if (code === '97') return 'invalid';
    if (code === '24') return 'fail';
    if (code === '11') return 'error';
    return 'error';
  }
  switch (code) {
    case '00':
      return 'success';
    case '24':
      return 'fail'; // Khách hàng hủy
    case '97':
      return 'invalid'; // Invalid signature
    case '11':
      return 'error'; // Hết hạn
    default:
      return res.success ? 'success' : 'error';
  }
}

function SuccessView({ message, onHome, onBack }: { message?: string; onHome: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[560px] text-center bg-card rounded-xl p-7 shadow-sm border border-border">
        <div className="mb-2 w-[180px] h-[180px] mx-auto">
          <Lottie animationData={successAnim} loop={false} style={{ width: 180, height: 180 }} />
        </div>
        <h2 className="text-xl font-bold mt-3 mb-1.5 text-foreground">Thanh toán thành công</h2>
        <p className="text-muted-foreground">{message || 'Cảm ơn bạn — giao dịch đã được xử lý thành công.'}</p>
        <div className="mt-5 flex gap-3 justify-center flex-wrap">
          <Button onClick={onHome}>Về trang chủ</Button>
          <Button variant="outline" onClick={onBack}>Quay lại</Button>
        </div>
      </div>
    </div>
  );
}

function InvalidView({ message, onHome, onBack }: { message?: string; onHome: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[560px] text-center bg-card rounded-xl p-7 shadow-sm border border-border">
        <div className="mb-2 w-[180px] h-[180px] mx-auto">
          <Lottie animationData={failAnim} loop={false} style={{ width: 180, height: 180 }} />
        </div>
        <h2 className="text-xl font-bold mt-3 mb-1.5 text-foreground">Thanh toán thất bại</h2>
        <p className="text-muted-foreground">
          {message || 'Giao dịch không được chấp nhận. Vui lòng thử lại hoặc chọn phương thức khác.'}
        </p>
        <div className="mt-5 flex gap-3 justify-center flex-wrap">
          <Button onClick={onHome}>Về trang chủ</Button>
          <Button variant="outline" onClick={onBack}>Quay lại</Button>
        </div>
      </div>
    </div>
  );
}

function FailView({ message, onHome }: { message?: string; onHome: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[560px] text-center bg-card rounded-xl p-7 shadow-sm border border-border">
        <div className="mb-2 w-[180px] h-[180px] mx-auto">
          <Lottie animationData={failAnim} loop={false} style={{ width: 180, height: 180 }} />
        </div>
        <h2 className="text-xl font-bold mt-3 mb-1.5 text-foreground">Thanh toán thất bại</h2>
        <p className="text-muted-foreground">
          {message || 'Giao dịch thất bại. Vui lòng thử lại hoặc chọn phương thức khác.'}
        </p>
        <div className="mt-5 flex gap-3 justify-center flex-wrap">
          <Button onClick={onHome}>Về trang chủ</Button>
        </div>
      </div>
    </div>
  );
}

function ErrorView({ message, onHome, onBack }: { message?: string; onHome: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[560px] text-center bg-card rounded-xl p-7 shadow-sm border border-border">
        <div className="mb-2 w-[180px] h-[180px] mx-auto">
          <Lottie animationData={failAnim} loop={false} style={{ width: 180, height: 180 }} />
        </div>
        <h2 className="text-xl font-bold mt-3 mb-1.5 text-foreground">Thanh toán thất bại</h2>
        <p className="text-muted-foreground">
          {message || 'Giao dịch đã xảy ra lỗi. Vui lòng thử lại hoặc chọn phương thức khác.'}
        </p>
        <div className="mt-5 flex gap-3 justify-center flex-wrap">
          <Button onClick={onHome}>Về trang chủ</Button>
          <Button variant="outline" onClick={onBack}>Quay lại</Button>
        </div>
      </div>
    </div>
  );
}

export function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [res, setRes] = useState<VnpayReturnResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const search = searchParams.toString();
    if (!search) {
      setRequestError(true);
      setErrorMessage('Thiếu dữ liệu từ VNPay.');
      setLoading(false);
      return;
    }
    paymentsApi
      .getVnpayReturn('?' + search)
      .then((data) => {
        setRes(data);
        setRequestError(false);
      })
      .catch((e) => {
        setRequestError(true);
        setErrorMessage(e instanceof Error ? e.message : 'Không thể xác thực kết quả thanh toán.');
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const urlResponseCode = searchParams.get('vnp_ResponseCode');
  const viewType = loading ? 'loading' : getViewType(res, requestError, urlResponseCode);
  const message = res?.message ?? errorMessage;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang xác thực kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  const onHome = () => navigate('/');
  const onBack = () => navigate(-1);

  switch (viewType) {
    case 'success':
      return <SuccessView message={message} onHome={onHome} onBack={onBack} />;
    case 'invalid':
      return <InvalidView message={message} onHome={onHome} onBack={onBack} />;
    case 'fail':
      return <FailView message={message} onHome={onHome} />;
    default:
      return <ErrorView message={message} onHome={onHome} onBack={onBack} />;
  }
}
