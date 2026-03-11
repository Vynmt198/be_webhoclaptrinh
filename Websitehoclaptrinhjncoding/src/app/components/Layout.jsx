import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Code2, User, LogIn, LogOut, Menu, X, ShoppingCart, Award, Shield, GraduationCap, UserPlus } from "lucide-react";
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

  const isActive = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  const isLearner = isAuthenticated && !['admin', 'instructor'].includes(user?.role || '');
  const isInstructor = isAuthenticated && user?.role === 'instructor';

  const navLinks = [
    { path: "/", label: "Trang chủ" },
    { path: "/courses", label: "Khóa học" },
    ...(isLearner ? [
      { path: "/my-courses", label: "Khóa của tôi" },
      { path: "/certificates", label: "Chứng chỉ", icon: Award },
    ] : []),
    ...(isInstructor ? [{ path: "/my-courses", label: "Khóa tôi dạy" }] : []),
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
              {isAuthenticated && !['instructor', 'admin'].includes(user?.role || '') && (
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
              )}

              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/users"
                      className="px-3 py-2 text-sm bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/25 transition-all flex items-center space-x-1.5"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  {user?.role === 'instructor' && (
                    <Link
                      to="/instructor/courses"
                      className="px-3 py-2 text-sm bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/25 transition-all flex items-center space-x-1.5"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Kênh giảng viên</span>
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
                    to="/register"
                    className="px-4 py-2 text-sm bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 text-white rounded-lg hover:shadow-lg hover:shadow-violet-500/25 transition-all flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Đăng ký</span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập</span>
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

                  {user?.role === 'instructor' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.06 }}
                    >
                        <Link
                            to="/instructor/courses"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors flex items-center space-x-2"
                          >
                            <GraduationCap className="w-4 h-4" />
                            <span>Kênh giảng viên</span>
                          </Link>
                    </motion.div>
                  )}
                  {isAuthenticated && !['instructor', 'admin'].includes(user?.role || '') && (
                      <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navLinks.length + 1) * 0.06 }}
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
                  )}

                  <div className="border-t border-border my-2" />

                  {isAuthenticated ? (
                    <>
                      {user?.role === 'admin' && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (navLinks.length + 2) * 0.06 }}
                        >
                          <Link
                            to="/admin/users"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors flex items-center space-x-2"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Admin</span>
                          </Link>
                        </motion.div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (navLinks.length + 3) * 0.06 }}
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
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (navLinks.length + 4) * 0.06 }}
                      >
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left block px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (navLinks.length + 1) * 0.06 }}
                      >
                        <Link
                          to="/register"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all flex items-center space-x-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Đăng ký</span>
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (navLinks.length + 2) * 0.06 }}
                      >
                        <Link
                          to="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center space-x-2"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Đăng nhập</span>
                        </Link>
                      </motion.div>
                    </>
                  )}
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
              <div>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/vo.yen.nhi.952706" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com/channel/UCG-XKr1r1zgtnE-TAnLlU3w" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="https://github.com/YenNhi206" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                
              </div>
            </div>
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
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Về chúng tôi</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">
                    Giới thiệu
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary transition-colors">
                    Hỗ trợ
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors">
                    Điều khoản sử dụng
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Thông tin liên hệ</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a className="hover:text-primary transition-colors">
                    Địa chỉ: 123 Nguyễn Huệ, Q.1, TP.HCM
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors">
                    Điện thoại: +84 123 456 789
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors">
                    Email: support@jncoding.com
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
