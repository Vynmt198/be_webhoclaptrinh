import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Code2, User, LogIn, LogOut, Menu, X, ShoppingCart, Award, Shield } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { AIChatBot } from "@/app/components/AIChatBot";

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất.');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Trang chủ" },
    { path: "/courses", label: "Khóa học" },
    { path: "/my-courses", label: "Khóa của tôi" },
    { path: "/account", label: "Chứng chỉ", icon: Award },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border relative"
      >
        {/* Gradient border effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent blur-sm" />

        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center"
              >
                <Code2 className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Jncoding
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <motion.span
                    className="relative z-10 flex items-center space-x-2"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.icon ? <link.icon className="w-4 h-4" /> : null}
                    <span>{link.label}</span>
                  </motion.span>

                  {isActive(link.path) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}

                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              ))}
            </div>

            {/* Right section */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="relative">
                <Link
                  to="/cart"
                  className="px-4 py-2 text-sm bg-gradient-to-r from-red-600 via-rose-500 to-red-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/25 transition-all flex items-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Giỏ hàng</span>
                </Link>

                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 bg-white text-red-600 text-[11px] rounded-full flex items-center justify-center font-bold shadow-lg leading-none">
                    {cartItemCount}
                  </span>
                )}
              </div>

              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/users"
                      className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors flex items-center space-x-1.5 text-muted-foreground"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link
                    to="/account"
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{user?.fullName?.split(' ').pop() ?? 'Tài khoản'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors flex items-center space-x-1.5 text-muted-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập</span>
                  </Link>
                  <Link
                    to="/account"
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Tài khoản</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>

          {/* Mobile Nav */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="md:hidden overflow-hidden"
              >
                <div className="py-4 space-y-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 ${isActive(link.path)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                          }`}
                      >
                        {link.icon ? <link.icon className="w-4 h-4" /> : null}
                        <span>{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.06 }}
                  >
                    <Link
                      to="/cart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="relative block px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors flex items-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Giỏ hàng</span>
                      {cartItemCount > 0 && (
                        <span className="ml-auto min-w-[24px] h-6 px-2 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>
                  </motion.div>

                  <div className="border-t border-border my-2" />

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navLinks.length + 1) * 0.06 }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors flex items-center space-x-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Đăng nhập</span>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navLinks.length + 2) * 0.06 }}
                  >
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Tài khoản</span>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* AI ChatBot */}
      <AIChatBot />

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-lg mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Jncoding
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Nền tảng học lập trình chất lượng cao cho mọi người.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4">Khóa học</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/courses"
                    className="hover:text-primary transition-colors"
                  >
                    Tất cả khóa học
                  </Link>
                </li>
                <li>
                  <Link
                    to="/courses/frontend"
                    className="hover:text-primary transition-colors"
                  >
                    Frontend
                  </Link>
                </li>
                <li>
                  <Link
                    to="/courses/backend"
                    className="hover:text-primary transition-colors"
                  >
                    Backend
                  </Link>
                </li>
                <li>
                  <Link
                    to="/courses/fullstack"
                    className="hover:text-primary transition-colors"
                  >
                    Full Stack
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary transition-colors">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors">
                    Điều khoản
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Kết nối</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    YouTube
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Jncoding. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
