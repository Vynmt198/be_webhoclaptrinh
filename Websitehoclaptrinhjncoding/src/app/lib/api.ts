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

    /** Verify OTP/token before allowing new password step */
    verifyResetOtp: (token: string) =>
        request<{ success: boolean; message?: string }>('/auth/verify-reset-otp', {
            method: 'POST',
            body: { token },
        }),

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

    updateProfile: (payload: {
        fullName?: string;
        avatar?: string;
        // Instructor profile (optional)
        instructorHeadline?: string;
        instructorBio?: string;
        instructorSkills?: string[];
        instructorWebsite?: string;
        instructorFacebook?: string;
        instructorYoutube?: string;
        instructorLinkedin?: string;
    }) =>
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

    getStats: () =>
        request<{
            success: boolean;
            data: {
                totalRevenue: number;
                newStudentsThisWeek: number;
                totalCourses: number;
                revenueLast7Days: { name: string; total: number }[];
            };
        }>('/admin/stats'),

    // Content moderation
    getContentLessons: (params?: { search?: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams(
            Object.entries(params || {})
                .filter(([, v]) => v !== undefined && v !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{
            success: boolean;
            data: {
                lessons: {
                    _id: string;
                    title: string;
                    courseTitle: string;
                    instructorName: string;
                    views: number;
                    isHidden: boolean;
                }[];
                pagination: Pagination;
            };
        }>(`/admin/content/lessons${query ? `?${query}` : ''}`);
    },

    toggleLessonVisibility: (lessonId: string) =>
        request<{ success: boolean; data: { lessonId: string; isHidden: boolean } }>(
            `/admin/content/lessons/${lessonId}/visibility`,
            { method: 'PATCH' }
        ),

    getContentComments: (params?: { search?: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams(
            Object.entries(params || {})
                .filter(([, v]) => v !== undefined && v !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{
            success: boolean;
            data: {
                comments: {
                    _id: string;
                    parentId: string | null;
                    user: string;
                    content: string;
                    target: string;
                    date: string;
                    status: string;
                    isReply: boolean;
                    likesCount: number;
                    repliesCount: number;
                }[];
                pagination: Pagination;
            };
        }>(`/admin/content/comments${query ? `?${query}` : ''}`);
    },

    deleteContentComment: (id: string) =>
        request<{ success: boolean; message: string }>(`/admin/content/comments/${id}`, { method: 'DELETE' }),

    getContentReviews: (params?: { search?: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams(
            Object.entries(params || {})
                .filter(([, v]) => v !== undefined && v !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{
            success: boolean;
            data: {
                reviews: { _id: string; user: string; courseTitle: string; courseId: string; rating: number; reviewText: string; date: string }[];
                pagination: Pagination;
            };
        }>(`/admin/content/reviews${query ? `?${query}` : ''}`);
    },
};

// ─── Shared Types ──────────────────────────────────────────────────────────

export interface User {
    _id: string;
    email: string;
    fullName: string;
    role: 'learner' | 'instructor' | 'admin';
    isActive: boolean;
    avatar?: string;
    // Instructor profile (optional)
    instructorHeadline?: string;
    instructorBio?: string;
    instructorSkills?: string[];
    instructorWebsite?: string;
    instructorFacebook?: string;
    instructorYoutube?: string;
    instructorLinkedin?: string;
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
    /** Có khi lesson.type === 'quiz', dùng để gọi API làm quiz */
    quizId?: string;
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

// ─── Discussion (thảo luận khóa học) ───────────────────────────────────────

export interface DiscussionPost {
    _id: string;
    courseId: string;
    userId: { _id: string; fullName: string; avatar?: string } | string;
    parentId: string | null;
    title: string | null;
    content: string;
    isPinned?: boolean;
    likesCount?: number;
    repliesCount?: number;
    status?: string;
    createdAt: string;
    updatedAt?: string;
}

export const discussionApi = {
    getList: (courseId: string, params?: { page?: number; limit?: number }) => {
        const q = new URLSearchParams(
            Object.entries(params || {})
                .filter(([, v]) => v != null && String(v) !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{
            success: boolean;
            data: { discussions: DiscussionPost[]; pagination: { total: number; page: number; limit: number; pages: number } };
        }>(`/discussions/${courseId}${q ? `?${q}` : ''}`);
    },
    getReplies: (courseId: string, postId: string, params?: { page?: number; limit?: number }) => {
        const q = new URLSearchParams(
            Object.entries(params || {})
                .filter(([, v]) => v != null && String(v) !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();
        return request<{
            success: boolean;
            data: { replies: DiscussionPost[]; pagination: { total: number; page: number; limit: number; pages: number } };
        }>(`/discussions/${courseId}/${postId}/replies${q ? `?${q}` : ''}`);
    },
    create: (payload: { courseId: string; title?: string; content: string }) =>
        request<{ success: boolean; message?: string; data: { discussion: DiscussionPost } }>('/discussions', {
            method: 'POST',
            body: payload as Record<string, unknown>,
        }),
    reply: (postId: string, payload: { content: string; courseId?: string }) =>
        request<{ success: boolean; message?: string; data: { reply: DiscussionPost } }>(`/discussions/${postId}/reply`, {
            method: 'POST',
            body: payload as Record<string, unknown>,
        }),
    like: (postId: string) =>
        request<{ success: boolean; data: { likesCount: number } }>(`/discussions/${postId}/like`, { method: 'POST' }),
    unlike: (postId: string) =>
        request<{ success: boolean; data: { likesCount: number } }>(`/discussions/${postId}/unlike`, { method: 'POST' }),
    delete: (id: string) =>
        request<{ success: boolean }>(`/discussions/${id}`, { method: 'DELETE' }),
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

// ─── Learning (learner view) ──────────────────────────────────────────────

export interface LessonProgress {
    _id: string;
    userId: string;
    courseId: string;
    lessonId: string;
    isCompleted: boolean;
    timeSpent?: number;
    lastPosition?: number;
    completedAt?: string;
}

export interface CourseLearningResponse {
    course: { _id: string; title: string; instructorId?: string | null };
    lessons: Lesson[];
    progress: LessonProgress[];
    completionPercentage: number;
}

export const learningApi = {
    getCourseLearning: (courseId: string) =>
        request<{ success: boolean; data: CourseLearningResponse }>(`/courses/${courseId}/learn`),
};

export const progressApi = {
    markComplete: (lessonId: string) =>
        request<{ success: boolean; data: LessonProgress }>('/progress/mark-complete', {
            method: 'POST',
            body: { lessonId },
        }),
    updatePosition: (payload: { lessonId: string; lastPosition?: number; timeSpent?: number }) =>
        request<{ success: boolean; data: LessonProgress }>('/progress/update-position', {
            method: 'PUT',
            body: payload as Record<string, unknown>,
        }),
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

/** Enrollment with populated course and progress (for learner "Khóa của tôi") */
export interface EnrollmentWithCourse {
    _id: string;
    userId: string;
    courseId: Course;
    status: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
    updatedAt?: string;
}

export const enrollmentApi = {
    getMyEnrollments: () =>
        request<{ success: boolean; data: { enrollments: EnrollmentWithCourse[] } }>('/enrollments'),
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

/** Quiz cho học viên: xem đề + nộp bài (có thể làm lại nhiều lần) */
export const quizApi = {
    getQuiz: (quizId: string) =>
        request<{ success: boolean; data: Quiz }>(`/quizzes/${quizId}`),
    submitAttempt: (quizId: string, payload: { answers: unknown[]; timeSpent?: number }) =>
        request<{ success: boolean; data: { attemptId: string; score: number; isPassed: boolean; timeSpent?: number } }>(
            `/quizzes/${quizId}/attempt`,
            { method: 'POST', body: payload as Record<string, unknown> }
        ),
};

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
        request<{
            success: boolean;
            data: {
                totalEnrollments: number;
                totalTimeSpentSeconds: number;
                totalCompletedLessons: number;
                totalLessons: number;
                expectedTimeSeconds: number;
                completionRatePercent: number;
                timeSpentRatePercent: number;
                courseTitle: string;
            };
        }>(
            `/instructor/courses/${courseId}/analytics`
        ),
    getCourseEnrollments: (courseId: string) =>
        request<{
            success: boolean;
            data: {
                enrollments: {
                    userId: string;
                    fullName: string;
                    email: string;
                    completedLessons: number;
                    totalLessons: number;
                    incompleteLessons: number;
                    timeSpentSeconds: number;
                    timeSpentRatePercent: number;
                }[];
                totalLessons: number;
                expectedSecondsPerLearner?: number;
            };
        }>(`/instructor/courses/${courseId}/enrollments`),
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

// ─── Assignments (instructor: create/grade; learner: submit) ─────────────────

export interface Assignment {
    _id: string;
    courseId: string;
    lessonId?: { _id: string; title?: string; order?: number } | null;
    title: string;
    description?: string;
    maxScore: number;
    dueDate?: string | null;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AssignmentSubmission {
    _id: string;
    assignmentId: string | { _id: string; title?: string; maxScore?: number };
    userId: string | { _id: string; fullName?: string; email?: string };
    content?: string;
    attachments?: string[];
    score?: number | null;
    feedback?: string | null;
    status: 'submitted' | 'graded' | 'needs_revision';
    gradedAt?: string | null;
    gradedBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export const assignmentApi = {
    listByCourse: (courseId: string) =>
        request<{ success: boolean; data: { assignments: Assignment[]; canSubmit: boolean } }>(
            `/courses/${courseId}/assignments`
        ),
    create: (courseId: string, payload: { title: string; description?: string; lessonId?: string | null; maxScore?: number; dueDate?: string | null }) =>
        request<{ success: boolean; data: { assignment: Assignment } }>(`/courses/${courseId}/assignments`, {
            method: 'POST',
            body: payload as Record<string, unknown>,
        }),
    getOne: (assignmentId: string) =>
        request<{ success: boolean; data: { assignment: Assignment; canSubmit: boolean; mySubmission?: AssignmentSubmission } }>(
            `/assignments/${assignmentId}`
        ),
    update: (assignmentId: string, payload: Partial<{ title: string; description: string; lessonId: string | null; maxScore: number; dueDate: string | null; isActive: boolean }>) =>
        request<{ success: boolean; data: { assignment: Assignment } }>(`/assignments/${assignmentId}`, {
            method: 'PUT',
            body: payload as Record<string, unknown>,
        }),
    delete: (assignmentId: string) =>
        request<{ success: boolean }>(`/assignments/${assignmentId}`, { method: 'DELETE' }),
    getSubmissions: (assignmentId: string) =>
        request<{ success: boolean; data: { submissions: AssignmentSubmission[]; total: number } }>(
            `/assignments/${assignmentId}/submissions`
        ),
    gradeSubmission: (submissionId: string, payload: { score?: number; feedback?: string; status: 'submitted' | 'graded' | 'needs_revision' }) =>
        request<{ success: boolean; data: { submission: AssignmentSubmission } }>(
            `/assignments/submissions/${submissionId}/grade`,
            { method: 'PUT', body: payload as Record<string, unknown> }
        ),
    /** Learner: nộp bài (content + attachments) */
    submit: (assignmentId: string, payload: { content?: string; attachments?: string[] }) =>
        request<{ success: boolean; data: { submission: AssignmentSubmission } }>(
            `/assignments/${assignmentId}/submit`,
            { method: 'POST', body: payload as Record<string, unknown> }
        ),
};

export const assignmentLearnerApi = {
    getMySubmissionsByCourse: (courseId: string) =>
        request<{ success: boolean; data: { submissions: AssignmentSubmission[]; total: number } }>(
            `/courses/${courseId}/my-assignment-submissions`
        ),
};

