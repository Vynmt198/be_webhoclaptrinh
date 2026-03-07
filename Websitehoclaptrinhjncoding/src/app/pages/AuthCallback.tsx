import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { userApi } from '@/app/lib/api';

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();
    const ran = useRef(false);

    useEffect(() => {
        // Strict Mode guard — only run once
        if (ran.current) return;
        ran.current = true;

        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error || !token) {
            toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
            navigate('/login', { replace: true });
            return;
        }

        userApi
            .getProfileWithToken(token)
            .then((res) => {
                loginWithToken(token, res.data.user);
                toast.success('Đăng nhập Google thành công!');
                navigate('/my-courses', { replace: true });
            })
            .catch(() => {
                toast.error('Không thể xác thực token. Vui lòng thử lại.');
                navigate('/login', { replace: true });
            });
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang xác thực tài khoản Google...</p>
        </div>
    );
}
