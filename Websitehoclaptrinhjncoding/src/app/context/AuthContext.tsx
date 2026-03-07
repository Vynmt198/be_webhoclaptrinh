import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { authApi, userApi, type User } from '@/app/lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    loginWithToken: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (updated: Partial<User>) => void;
    refreshProfile: () => Promise<void>;
}

// ─── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem('token')
    );
    const [isLoading, setIsLoading] = useState(true);

    // On mount: if a token exists, fetch the real user profile
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (!savedToken) {
            setIsLoading(false);
            return;
        }
        userApi
            .getProfile()
            .then((res: { success: boolean; data: { user: User } }) => setUser(res.data.user))
            .catch(() => {
                // Token expired / invalid — clear everything
                localStorage.removeItem('token');
                setToken(null);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await authApi.login({ email, password });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
    }, []);

    const register = useCallback(
        async (fullName: string, email: string, password: string) => {
            await authApi.register({ fullName, email, password });
        },
        []
    );

    const loginWithToken = useCallback((token: string, user: User) => {
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
    }, []);

    const logout = useCallback(() => {
        authApi.logout().catch(() => { }); // fire-and-forget
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, []);

    const updateUser = useCallback((updated: Partial<User>) => {
        setUser((prev: User | null) => (prev ? { ...prev, ...updated } : prev));
    }, []);

    const refreshProfile = useCallback(async () => {
        const res = await userApi.getProfile();
        setUser(res.data.user);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                loginWithToken,
                logout,
                updateUser,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
