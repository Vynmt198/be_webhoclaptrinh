import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CartProvider } from '@/app/context/CartContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { Layout } from '@/app/components/Layout';
import { Home } from '@/app/pages/Home';
import { Courses } from '@/app/pages/Courses';
import { CourseDetail } from '@/app/pages/CourseDetail';
import { MyCourses } from '@/app/pages/MyCourses';
import { Account } from '@/app/pages/Account';
import { Learn } from '@/app/pages/Learn';
import { Login } from '@/app/pages/Login';
import { Register } from '@/app/pages/Register';
import { ForgotPassword } from '@/app/pages/ForgotPassword';
import { ResetPassword } from '@/app/pages/ResetPassword';
import { Cart } from '@/app/pages/Cart';
import { Checkout } from '@/app/pages/Checkout';
import { OrderSuccess } from '@/app/pages/OrderSuccess';
import { About } from '@/app/pages/About';
import { Contact } from '@/app/pages/Contact';
import { FAQ } from '@/app/pages/FAQ';
import { Terms } from '@/app/pages/Terms';
import { NotFound } from '@/app/pages/NotFound';
import { AdminUsers } from '@/app/pages/admin/AdminUsers';

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
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="terms" element={<Terms />} />
              <Route path="admin/users" element={<AdminUsers />} />
            </Route>

            {/* Auth Routes (No Layout) */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />

            {/* Learning Route (No Layout) */}
            <Route path="learn/:id" element={<Learn />} />

            {/* Success Route (No Layout) */}
            <Route path="order-success" element={<OrderSuccess />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
