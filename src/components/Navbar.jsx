import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  Moon,
  Sun,
  FileText,
  Award,
  Info,
  Mail,
  BarChart3,
  Briefcase,
  Users,
  GitBranch,
  FolderGit2,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cldAvatar } from "../utils/cloudinaryImage";
import ConfirmModal from "./ConfirmModal";

/* ═══════════════════════════════════════════════════
   VeriProof Slim Sticky Navbar
   Height: h-16 (64px) constrained
   Unified responsive top header, zero floating docks
   ═══════════════════════════════════════════════════ */

const Navbar = () => {
  const { user, setIsExiting } = useAuth();
  const { theme, toggleTheme, THEMES } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  // Hide Navbar completely when taking an exam to preserve lockdown
  if (location.pathname === "/exams") {
    return null;
  }

  const isUnverifiedRecruiter =
    user?.role === "recruiter" &&
    user?.recruiterVerificationStatus &&
    user?.recruiterVerificationStatus !== "COMPANY_EMAIL_VERIFIED";

  const guard = (e, path) => {
    if (!user) {
      e.preventDefault();
      navigate("/login");
      return;
    }
    if (isUnverifiedRecruiter) {
      e.preventDefault();
      navigate("/register");
      return;
    }
  };

  const handleLogout = () => setShowLogoutModal(true);

  // ─── AUTH & ROUTE CHECKS ───
  const isRecruiter = user?.role === "recruiter";
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/auth") ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password");

  // Primary nav — authenticated users outside auth pages
  const primaryNav = !user || isAuthPage || isUnverifiedRecruiter
    ? []
    : isRecruiter
    ? [
        { name: "Dashboard",       path: "/recruiter-dashboard", icon: LayoutDashboard },
        { name: "Job Roles",       path: "/recruiter-jobs",      icon: Briefcase },
        { name: "Upload Resumes",  path: "/bulk-screening",      icon: Users },
        { name: "Rankings",        path: "/verdicts",            icon: BarChart3 },
      ]
    : [
        { name: "Dashboard",       path: "/dashboard",       icon: LayoutDashboard },
        { name: "Certifications",  path: "/certifications",  icon: Award },
        { name: "Exams",           path: "/exams",           icon: FileText },
        { name: "Skills",          path: "/skill-tree",      icon: GitBranch },
        { name: "Project Archive", path: "/project-archive", icon: FolderGit2 },
      ];

  const profileActions = [
    { name: "Protocols", path: isRecruiter ? "/recruiter-settings" : "/settings", icon: Settings },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "About_VeriProof", path: "/about", icon: Info },
    { name: "Contact_Us", path: "/contact", icon: Mail },
  ];

  const isActive = (path) => location.pathname === path;

  const logoDestination = !user
    ? "/"
    : isUnverifiedRecruiter
    ? "/register"
    : isRecruiter
    ? "/recruiter-dashboard"
    : "/dashboard";

  return (
    <>
      {/* ─── Slim Sticky Top Header (h-16) ─── */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/60 bg-stone-50/80 dark:bg-slate-950/80 backdrop-blur-md z-50 sticky top-0 w-full transition-colors duration-200">
        {/* ── Left: Logo + Forensic Status ── */}
        <div className="flex items-center gap-6">
          <Link to={logoDestination} className="group relative flex items-center">
            <span className="text-xl font-black italic tracking-tighter uppercase leading-none text-slate-900 dark:text-white">
              VeriProof
              <span className="text-[var(--color-accent)] not-italic">.</span>
            </span>
            <motion.div
              className="absolute -bottom-1 left-0 h-[2px] bg-[var(--color-accent)]"
              initial={false}
              animate={{ width: isActive(logoDestination) ? "100%" : "0%" }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </Link>

          {/* Forensic status indicator */}
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="vp-status-dot" style={{ width: 5, height: 5 }} />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 font-semibold">
                Live
              </span>
            </div>
            <span className="hidden xl:inline font-mono text-[10px] tracking-[0.15em] uppercase text-slate-400 dark:text-slate-500">
              {time.toLocaleTimeString([], { hour12: false })} UTC
            </span>
          </div>
        </div>

        {/* ── Center: Nav Links with Pill Indicators (Desktop Only) ── */}
        {primaryNav.length > 0 && (
          <nav className="hidden lg:flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-900/60 p-1 border border-slate-200 dark:border-slate-800/80">
            {primaryNav.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(e) => guard(e, link.path)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 rounded-md ${
                    active
                      ? "text-white dark:text-slate-950 font-black"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-slate-900 dark:bg-white rounded-md pointer-events-none"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* ── Right: Theme + Auth / Profile ── */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {theme === THEMES.DARK ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-4 h-4 text-cyan-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-4 h-4 text-slate-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {user ? (
            /* ── Profile Dropdown ── */
            <div ref={profileRef} className="relative">
              <motion.button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 hover:border-cyan-400/50 transition-colors bg-slate-100/50 dark:bg-slate-900/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-7 h-7 rounded overflow-hidden bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  {user.profileImage ? (
                    <img
                      src={cldAvatar(user.profileImage)}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-cyan-500">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-900 dark:text-white hidden sm:block max-w-[100px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronRight
                  className={`w-3 h-3 text-slate-400 transition-transform ${profileOpen ? "rotate-90" : ""}`}
                />
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 mt-2 w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 origin-top-right z-50 font-mono text-xs"
                  >
                    <div className="px-3 py-2.5 mb-1 border-b border-slate-200 dark:border-slate-800">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">
                        Session Active
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white truncate text-xs mt-0.5">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-cyan-600 dark:text-cyan-400 capitalize">
                        {user.role} Account
                      </p>
                    </div>

                    <div className="space-y-0.5 py-1">
                      {profileActions.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>

                    <div className="pt-1 mt-1 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Terminate_Session
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : isAuthPage ? (
            <Link
              to="/"
              className="text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded hover:border-cyan-400/50 transition-colors"
            >
              ← Home
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 text-slate-700 dark:text-slate-200 hover:text-cyan-500 transition-colors"
              >
                Sign_In
              </Link>
              <Link
                to="/register"
                className="text-xs font-mono font-bold uppercase tracking-wider px-4 py-1.5 bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950 hover:bg-cyan-500 dark:hover:bg-cyan-300 transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ─── Logout Confirmation Modal ─── */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          setIsExiting(true);
        }}
        title="Terminate Session"
        message="Are you sure you want to log out of your VeriProof candidate workspace? Your active session data is saved."
        confirmText="Logout"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default Navbar;
