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

/** Upload file (e.g. thumbnail) - multipart, no JSON */
async function uploadFile(endpoint: string, file: File, token?: string | null): Promise<{ success: boolean; data: { url: string } }> {
    const authToken = token ?? localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const formData = new FormData();
    formData.append('thumbnail', file);
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Upload failed: ${res.status}`);
    return data as { success: boolean; data: { url: string } };
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

    getProfileWithToken: (token: string) =>
        request<{ success: boolean; data: { user: User } }>('/users/profile', { token }),

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
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
}

// ─── Courses (Module 2) ─────────────────────────────────────────────────────

export interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    thumbnail?: string | null;
    level: string;
    status?: string;
    totalLessons?: number;
    totalDuration?: number;
    enrollmentCount?: number;
    averageRating?: number;
    syllabus?: string;
    estimatedCompletionHours?: number;
    instructorId?: { _id: string; fullName: string; avatar?: string; email?: string };
    categoryId?: { _id: string; name: string; slug?: string };
    createdAt?: string;
    updatedAt?: string;
}

export interface Lesson {
    _id: string;
    title: string;
    type: string;
    duration?: number;
    order?: number;
    isPreview?: boolean;
    content?: string;
    videoUrl?: string;
    courseId?: string;
}

export interface Review {
    _id: string;
    courseId: string;
    userId: { _id: string; fullName: string; avatar?: string };
    rating: number;
    reviewText?: string | null;
    comment?: string; // alias for reviewText (backend uses reviewText)
    createdAt?: string;
}

export interface RatingSummary {
    averageRating: number;
    totalReviews: number;
    distribution: {
        oneStar: number;
        twoStars: number;
        threeStars: number;
        fourStars: number;
        fiveStars: number;
    };
}

export const courseApi = {
    list: (params?: { page?: number; limit?: number; sortBy?: string }) => {
        const q = new URLSearchParams(
            Object.entries(params || {})
                .filter(([, v]) => v != null && String(v) !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{ success: boolean; data: { courses: Course[]; pagination: Pagination } }>(
            `/courses${q ? `?${q}` : ''}`
        );
    },

    search: (params?: { q?: string; category?: string; level?: string; priceType?: string; page?: number; limit?: number; sortBy?: string }) => {
        const q = new URLSearchParams(
            Object.entries(params || {})
                .filter(([, v]) => v != null && String(v) !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{ success: boolean; data: { courses: Course[]; pagination: Pagination } }>(
            `/courses/search${q ? `?${q}` : ''}`
        );
    },

    autocomplete: (params: { q: string; limit?: number }) => {
        const query = new URLSearchParams(
            Object.entries(params)
                .filter(([, v]) => v != null && String(v) !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{ success: boolean; data: { _id: string; title: string }[] }>(
            `/courses/autocomplete${query ? `?${query}` : ''}`
        );
    },

    getById: (id: string) =>
        request<{ success: boolean; data: Course }>(`/courses/${id}`),

    getCurriculum: (id: string) =>
        request<{ success: boolean; data: Lesson[] }>(`/courses/${id}/curriculum`),

    getReviews: (id: string, params?: { page?: number; limit?: number; sort?: 'newest' | 'highest' | 'lowest' }) => {
        const q = new URLSearchParams(
            Object.entries(params || {})
                .filter(([, v]) => v != null && String(v) !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{ success: boolean; data: { reviews: Review[]; pagination: Pagination } }>(
            `/courses/${id}/reviews${q ? `?${q}` : ''}`
        );
    },
    getRatingSummary: (id: string) =>
        request<{ success: boolean; data: RatingSummary }>(`/courses/${id}/rating-summary`),
    create: (payload: { title: string; description?: string; syllabus?: string; categoryId?: string; level?: string; price?: number; thumbnail?: string; estimatedCompletionHours?: number }) =>
        request<{ success: boolean; data: Course }>('/courses', { method: 'POST', body: payload as Record<string, unknown> }),
    update: (id: string, payload: Partial<{ title: string; description: string; syllabus: string; categoryId: string | null; level: string; price: number; thumbnail: string | null; estimatedCompletionHours: number; submitForReview: boolean }>) =>
        request<{ success: boolean; data: Course }>(`/courses/${id}`, { method: 'PUT', body: payload as Record<string, unknown> }),
    delete: (id: string) =>
        request<{ success: boolean }>(`/courses/${id}`, { method: 'DELETE' }),
};

export const uploadApi = {
    thumbnail: (file: File) => uploadFile('/upload/thumbnail', file),
};

export const reviewApi = {
    getMyReview: (courseId: string) =>
        request<{ success: boolean; data: { review: Review } }>(`/reviews/my-review/${courseId}`),
    create: (payload: { courseId: string; rating: number; reviewText?: string }) =>
        request<{ success: boolean; data: { review: Review } }>('/reviews', {
            method: 'POST',
            body: payload as Record<string, unknown>,
        }),
    update: (reviewId: string, payload: { rating?: number; reviewText?: string }) =>
        request<{ success: boolean; data: { review: Review } }>(`/reviews/${reviewId}`, {
            method: 'PUT',
            body: payload as Record<string, unknown>,
        }),
    delete: (reviewId: string) =>
        request<{ success: boolean }>(`/reviews/${reviewId}`, { method: 'DELETE' }),
};

export const lessonApi = {
    getById: (id: string) =>
        request<{ success: boolean; data: Lesson }>(`/lessons/by-id/${id}`),
    create: (courseId: string, payload: { title?: string; type?: string; content?: string; videoUrl?: string; duration?: number; order?: number; isPreview?: boolean }) =>
        request<{ success: boolean; data: Lesson }>(`/courses/${courseId}/lessons`, { method: 'POST', body: payload as Record<string, unknown> }),
    update: (id: string, payload: Partial<{ title: string; type: string; content: string; videoUrl: string; duration: number; order: number; isPreview: boolean }>) =>
        request<{ success: boolean; data: Lesson }>(`/lessons/${id}`, { method: 'PUT', body: payload as Record<string, unknown> }),
    delete: (id: string) =>
        request<{ success: boolean }>(`/lessons/${id}`, { method: 'DELETE' }),
    reorder: (courseId: string, lessons: { id: string; order: number }[]) =>
        request<{ success: boolean }>(`/lessons/reorder`, { method: 'PUT', body: { courseId, lessons } }),
};

export interface Category {
    _id: string;
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
}

export const categoryApi = {
    list: () =>
        request<{ success: boolean; data: Category[] }>('/categories'),
};

export interface QuizQuestion {
    questionText?: string;
    type: string;
    options?: string[];
    correctAnswer?: unknown;
    explanation?: string;
    points?: number;
}

export interface Quiz {
    _id: string;
    lessonId: string;
    title: string;
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit?: number;
}

export const instructorQuizApi = {
    getByLessonId: (lessonId: string) =>
        request<{ success: boolean; data: Quiz }>(`/instructor/lessons/${lessonId}/quiz`),
    createOrUpdate: (lessonId: string, payload: { title?: string; questions?: QuizQuestion[]; passingScore?: number; timeLimit?: number }) =>
        request<{ success: boolean; data: Quiz }>(`/instructor/lessons/${lessonId}/quiz`, {
            method: 'POST',
            body: payload as Record<string, unknown>,
        }),
    update: (quizId: string, payload: { title?: string; questions?: QuizQuestion[]; passingScore?: number; timeLimit?: number }) =>
        request<{ success: boolean; data: Quiz }>(`/instructor/quizzes/${quizId}`, {
            method: 'PUT',
            body: payload as Record<string, unknown>,
        }),
};

export const instructorApi = {
    listMyCourses: (params?: { page?: number; limit?: number; status?: string }) => {
        const q = new URLSearchParams(
            Object.entries(params || {})
                .filter(([, v]) => v != null && String(v) !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{ success: boolean; data: { courses: Course[]; pagination: Pagination } }>(
            `/instructor/courses${q ? `?${q}` : ''}`
        );
    },
    getAnalytics: (courseId: string) =>
        request<{ success: boolean; data: { totalEnrollments: number; totalTimeSpentSeconds: number; totalCompletedLessons: number; courseTitle: string } }>(
            `/instructor/courses/${courseId}/analytics`
        ),
};

export const adminCourseApi = {
    list: (params?: { status?: string; page?: number; limit?: number }) => {
        const q = new URLSearchParams(
            Object.entries(params || {})
                .filter(([, v]) => v != null && String(v) !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{ success: boolean; data: { courses: Course[]; pagination: Pagination } }>(
            `/admin/courses${q ? `?${q}` : ''}`
        );
    },

    approve: (id: string, action: 'approve' | 'reject') =>
        request(`/admin/courses/${id}/approve`, { method: 'PUT', body: { action } }),

    /** Cập nhật trạng thái: active | rejected | disabled (mở lại / tắt khóa) */
    updateStatus: (id: string, status: 'active' | 'rejected' | 'disabled') =>
        request<{ success: boolean; data: Course }>(`/admin/courses/${id}/status`, {
            method: 'PUT',
            body: { status },
        }),
};

// ─── Payment ───────────────────────────────────────────────────────────────

export interface PaymentInfo {
    _id: string;
    orderId: string;
    amount: number;
    paymentStatus: string;
    orderInfo: string;
    courseIds: string[];
    createdAt: string;
}

export const paymentApi = {
    create: (payload: { amount: number; courseIds: string[] }) =>
        request<{ success: boolean; message: string; data: { paymentUrl: string; orderId: string } }>('/payments/create', {
            method: 'POST',
            body: payload as Record<string, unknown>,
        }),
    getHistory: (params?: { page?: number; limit?: number; status?: string }) => {
        const query = new URLSearchParams(
            Object.entries(params || {})
                .filter(([, v]) => v !== undefined && v !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{ success: boolean; data: { payments: PaymentInfo[]; pagination: Pagination } }>(`/payments/history${query ? `?${query}` : ''}`);
    },
    verifyReturn: (queryStr: string) =>
        request<{ success: boolean; message: string; data: any }>(`/payments/vnpay-return${queryStr}`),
};

