import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CartProvider } from '@/app/context/CartContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { Layout } from '@/app/components/Layout';
import { Home } from '@/app/pages/Home';
import { Courses } from '@/app/pages/Courses';
import { CourseDetail } from '@/app/pages/CourseDetail';
import { MyCourses } from '@/app/pages/MyCourses';
import { Account } from '@/app/pages/Account';
import { Certificates } from '@/app/pages/Certificates';
import { Learn } from '@/app/pages/Learn';
import { CourseCertificate } from '@/app/pages/CourseCertificate';
import { AssignmentExam } from '@/app/pages/AssignmentExam';
import { Login } from '@/app/pages/Login';
import { Register } from '@/app/pages/Register';
import { ForgotPassword } from '@/app/pages/ForgotPassword';
import { ResetPassword } from '@/app/pages/ResetPassword';
import { AuthCallback } from '@/app/pages/AuthCallback';
import { Cart } from '@/app/pages/Cart';
import { Checkout } from '@/app/pages/Checkout';
import { PaymentResult } from '@/app/pages/PaymentResult';
import { About } from '@/app/pages/About';
import { Contact } from '@/app/pages/Contact';
import { FAQ } from '@/app/pages/FAQ';
import { Terms } from '@/app/pages/Terms';
import { NotFound } from '@/app/pages/NotFound';
import { AdminLayout } from '@/app/pages/admin/AdminLayout';
import { AdminUsers } from '@/app/pages/admin/AdminUsers';
import { AdminCourses } from '@/app/pages/admin/AdminCourses';
import { AdminContent } from '@/app/pages/admin/AdminContent';
import { AdminAnalytics } from '@/app/pages/admin/AdminAnalytics';
import { InstructorLayout } from '@/app/pages/instructor/InstructorLayout';
import { InstructorCourses } from '@/app/pages/instructor/InstructorCourses';
import { InstructorCourseCreate } from '@/app/pages/instructor/InstructorCourseCreate';
import { InstructorCourseEdit } from '@/app/pages/instructor/InstructorCourseEdit';
import { InstructorAnalytics } from '@/app/pages/instructor/InstructorAnalytics';
import { InstructorAnalyticsList } from '@/app/pages/instructor/InstructorAnalyticsList';
import { InstructorProfileView } from '@/app/pages/InstructorProfileView';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster richColors position="top-right" />
          <Routes>
            {/* Main Layout Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="account" element={<Account />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="about" element={<About />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="terms" element={<Terms />} />
              <Route path="contact" element={<Contact />} />
              <Route path="profile/instructor/:userId" element={<InstructorProfileView />} />

              {/* Admin Routes (Wrapped in Layout + AdminLayout) */}
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="analytics" replace />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="content" element={<AdminContent />} />
              </Route>

              {/* Instructor Routes */}
              <Route path="instructor" element={<InstructorLayout />}>
                <Route index element={<Navigate to="courses" replace />} />
                <Route path="courses" element={<InstructorCourses />} />
                <Route path="courses/new" element={<InstructorCourseCreate />} />
                <Route path="courses/:id/edit" element={<InstructorCourseEdit />} />
                <Route path="analytics" element={<InstructorAnalyticsList />} />
                <Route path="analytics/:id" element={<InstructorAnalytics />} />
              </Route>
            </Route>

            {/* Auth Routes (No Layout) */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="auth/callback" element={<AuthCallback />} />

            {/* Learning Route (No Layout) */}
            <Route path="learn/:id" element={<Learn />} />
            <Route path="courses/:id/certificate" element={<CourseCertificate />} />
            <Route path="assignments/:id" element={<AssignmentExam />} />

            {/* Success Route (No Layout) */}
            <Route path="payment-result" element={<PaymentResult />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
