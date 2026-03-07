const BASE_URL = 'http://localhost:3000/api';

type RequestOptions = {
    method?: string;
    body?: Record<string, unknown>;
    token?: string | null;
};

async function request<T>(
    endpoint: string,
    { method = 'GET', body, token }: RequestOptions = {}
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Attach token from arg or fall back to localStorage
    const authToken = token ?? localStorage.getItem('token');
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    // Propagate backend error messages as thrown errors
    if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data as T;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authApi = {
    register: (payload: { fullName: string; email: string; password: string }) =>
        request('/auth/register', { method: 'POST', body: payload as Record<string, unknown> }),

    login: (payload: { email: string; password: string }) =>
        request<{ success: boolean; data: { token: string; user: User } }>(
            '/auth/login',
            { method: 'POST', body: payload as Record<string, unknown> }
        ),

    logout: () => request('/auth/logout', { method: 'POST' }),

    forgotPassword: (email: string) =>
        request('/auth/forgot-password', { method: 'POST', body: { email } }),

    resetPassword: (token: string, newPassword: string) =>
        request('/auth/reset-password', {
            method: 'POST',
            body: { token, newPassword },
        }),
};

// ─── User ──────────────────────────────────────────────────────────────────

export const userApi = {
    getProfile: () =>
        request<{ success: boolean; data: { user: User } }>('/users/profile'),

    updateProfile: (payload: { fullName?: string; avatar?: string }) =>
        request<{ success: boolean; data: { user: User } }>('/users/profile', {
            method: 'PUT',
            body: payload as Record<string, unknown>,
        }),

    changePassword: (payload: { currentPassword: string; newPassword: string }) =>
        request('/users/change-password', {
            method: 'PUT',
            body: payload as Record<string, unknown>,
        }),
};

// ─── Admin ─────────────────────────────────────────────────────────────────

export const adminApi = {
    listUsers: (params?: {
        page?: number;
        limit?: number;
        role?: string;
        isActive?: string;
        search?: string;
    }) => {
        const query = new URLSearchParams(
            Object.entries(params || {})
                .filter(([, v]) => v !== undefined && v !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{
            success: boolean;
            data: { users: User[]; pagination: Pagination };
        }>(`/admin/users${query ? `?${query}` : ''}`);
    },

    updateRole: (id: string, role: string) =>
        request(`/admin/users/${id}/role`, { method: 'PUT', body: { role } }),

    toggleStatus: (id: string) =>
        request(`/admin/users/${id}/status`, { method: 'PUT' }),

    deleteUser: (id: string) =>
        request(`/admin/users/${id}`, { method: 'DELETE' }),
};

// ─── Shared Types ──────────────────────────────────────────────────────────

export interface User {
    _id: string;
    email: string;
    fullName: string;
    role: 'learner' | 'instructor' | 'admin';
    isActive: boolean;
    avatar?: string;
    createdAt?: string;
    lastLogin?: string;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
