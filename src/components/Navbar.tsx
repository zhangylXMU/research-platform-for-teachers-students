import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  Menu,
  X,
  FlaskConical,
  LayoutDashboard,
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isTeacher, isStudent, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: "首页", path: "/" },
    { label: "科研课题", path: "/projects" },
    ...(isTeacher ? [{ label: "我的项目", path: "/dashboard" }] : []),
    ...(isStudent ? [{ label: "我的申请", path: "/dashboard" }] : []),
    ...(isAdmin ? [{ label: "管理后台", path: "/admin" }] : []),
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#1A1A1D]/90 backdrop-blur-xl shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <FlaskConical className="w-6 h-6 text-[#C9A87C] transition-transform group-hover:rotate-12" />
            <span className="text-[#F4F1EA] font-semibold text-lg tracking-wide">
              启明星科创
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path + link.label}
                to={link.path}
                className={`text-sm tracking-wider transition-colors duration-300 ${
                  location.pathname === link.path
                    ? "text-[#C9A87C]"
                    : "text-[#F4F1EA]/80 hover:text-[#C9A87C]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-[#F4F1EA]/80 hover:text-[#C9A87C] transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-[#C9A87C]/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#C9A87C]/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#C9A87C]" />
                    </div>
                  )}
                  <span className="text-sm">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-[#A09B94] hover:text-[#C9A87C] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-[#F4F1EA]/80 hover:text-[#C9A87C] hover:bg-transparent"
                  >
                    登录
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-[#E86A56] hover:bg-[#E86A56]/90 text-white text-sm px-5">
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[#F4F1EA]"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1A1A1D]/95 backdrop-blur-xl border-t border-[#C9A87C]/10">
          <div className="px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path + link.label}
                to={link.path}
                className={`block text-sm tracking-wider py-2 ${
                  location.pathname === link.path
                    ? "text-[#C9A87C]"
                    : "text-[#F4F1EA]/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="pt-4 border-t border-[#C9A87C]/10 space-y-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-[#F4F1EA]/80"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>个人中心</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-[#A09B94]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-[#C9A87C]/10 flex gap-3">
                <Link to="/login" className="flex-1">
                  <Button variant="outline" className="w-full border-[#C9A87C]/30 text-[#F4F1EA]">
                    登录
                  </Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button className="w-full bg-[#E86A56] hover:bg-[#E86A56]/90 text-white">
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
