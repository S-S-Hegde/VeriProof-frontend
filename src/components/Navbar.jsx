import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  Search,
  ShieldCheck,
  Moon,
  Sun,
  Clock,
  X,
  Activity,
  Wand2,
  FileText,
  Info,
  Mail,
  BarChart3,
  Briefcase,
  Users,
  HelpCircle,
  GitBranch,
  MoreHorizontal,
  Home,
  User as UserIcon,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cldAvatar } from "../utils/cloudinaryImage";

/* ═══════════════════════════════════════════════════
   VeriProof Navbar v5.0
   Desktop: Glass bar + pill indicators + forensic status
   Mobile:  Bottom dock (5 primary) + overflow drawer
   ═══════════════════════════════════════════════════ */

const Navbar = () => {
  const { user, setIsExiting } = useAuth();
  const { theme, toggleTheme, THEMES } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const profileRef = useRef(null);
  const moreRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    const timer = setInterval(() => setTime(new Date()), 1000);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(timer);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target))
        setMoreOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMoreOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const guard = (e, path) => {
    if (!user) {
      e.preventDefault();
      navigate("/login");
    }
  };

  const handleLogout = () => setIsExiting(true);

  // ─── NAVIGATION DEFINITIONS ───
  const isRecruiter = user?.role === "recruiter";

  // Primary nav (desktop top bar + mobile bottom dock)
  const primaryNav = isRecruiter
    ? [
        { name: "Forensics", path: "/dashboard", icon: LayoutDashboard },
        { name: "Discover", path: "/discover", icon: Search },
        { name: "Jobs", path: "/recruiter-jobs", icon: Briefcase },
        { name: "Intel", path: "/recruiter-resumes", icon: Users },
        { name: "Panel", path: "/verification-panel", icon: ShieldCheck },
      ]
    : [
        { name: "Terminal", path: "/dashboard", icon: LayoutDashboard },
        { name: "Evidence", path: "/discover", icon: Search },
        { name: "Exams", path: "/exams", icon: FileText },
        { name: "Skill_Tree", path: "/skill-tree", icon: GitBranch },
        { name: "Requests", path: "/verification-requests", icon: ShieldCheck },
      ];

  // Mobile dock items (5 max — primary nav + Home)
  const dockItems = [
    { name: "Home", path: "/", icon: Home },
    ...primaryNav.slice(0, 3),
    {
      name: "More",
      path: null,
      icon: MoreHorizontal,
      action: () => setMoreOpen(true),
    },
  ];

  // Overflow drawer items (everything not in dock)
  const overflowNav = [
    ...(primaryNav.length > 3 ? primaryNav.slice(3) : []),
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Mail },
    { name: "Support", path: "/support", icon: HelpCircle },
  ];

  // Profile dropdown items
  const profileActions = [
    { name: "Protocols", path: "/settings", icon: Settings },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "About_VeriProof", path: "/about", icon: Info },
    { name: "Contact_Us", path: "/contact", icon: Mail },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ════════════════════════════════════════════
          DESKTOP NAVBAR
          ════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 inset-x-0 z-[60] transition-all duration-300 ease-out hidden lg:block ${
          scrolled
            ? "py-2.5 bg-[var(--vp-glass-bg)] backdrop-blur-2xl border-b border-[var(--vp-glass-border)] shadow-sm translate-y-0"
            : "py-2.5 bg-transparent translate-y-2"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 xl:px-10 flex items-center justify-between">
          {/* ── Left: Logo + Forensic Status ── */}
          <div className="flex items-center gap-6">
            <Link to="/" className="group relative flex items-center">
              <span className="text-xl font-black italic tracking-tighter uppercase leading-none text-[var(--color-text)]">
                VeriProof
                <span className="text-[var(--color-accent)] not-italic">.</span>
              </span>
              <motion.div
                className="absolute -bottom-1 left-0 h-[2px] bg-[var(--color-accent)]"
                initial={false}
                animate={{ width: isActive("/") ? "100%" : "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            </Link>

            {/* Forensic status indicators — compact */}
            <div className="hidden xl:flex items-center gap-4 pl-6 border-l border-[var(--color-border)]">
              <div className="flex items-center gap-1.5">
                <span
                  className="vp-status-dot"
                  style={{ width: 5, height: 5 }}
                />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
                  Live
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)]">
                {time.toLocaleTimeString([], { hour12: false })} UTC
              </span>
            </div>
          </div>

          {/* ── Center: Nav Links with Pill Indicators ── */}
          <div className="flex items-center gap-1 rounded-[var(--radius-lg)] bg-[var(--color-bg-sunken)]/50 p-1 border border-[var(--color-border)]">
            {primaryNav.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(e) => guard(e, link.path)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 rounded-[var(--radius-md)] ${
                    active
                      ? "text-[var(--color-bg)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-[var(--color-text)] rounded-[var(--radius-md)]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">{link.name}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          {/* ── Right: Theme + Auth/Profile ── */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              className="relative w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text)] transition-colors"
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
                    <Sun className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {user ? (
              /* ── Profile dropdown ── */
              <div ref={profileRef} className="relative">
                <motion.button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 transition-colors bg-[var(--color-bg-sunken)]/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-7 h-7 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
                    {user.profileImage ? (
                      <img
                        src={cldAvatar(user.profileImage)}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-[var(--color-accent)]">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text)] hidden xl:block max-w-[100px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronRight
                    className={`w-3 h-3 text-[var(--color-muted)] transition-transform ${profileOpen ? "rotate-90" : ""}`}
                  />
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2 w-60 vp-glass p-2 origin-top-right z-50"
                    >
                      {/* User info header */}
                      <div className="px-3 py-3 mb-1 border-b border-[var(--color-border)]">
                        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
                          Authorized_User
                        </p>
                        <p className="text-sm font-bold uppercase tracking-wider text-[var(--color-text)] truncate mt-0.5">
                          {user.name}
                        </p>
                        <p className="font-mono text-[10px] tracking-wider text-[var(--color-muted)] mt-0.5">
                          {user.role === "recruiter"
                            ? "INVESTIGATOR"
                            : "CANDIDATE"}
                        </p>
                      </div>

                      <div className="py-1">
                        {profileActions.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.path}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent-subtle)] rounded-[var(--radius-md)] transition-colors"
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="pt-1 mt-1 border-t border-[var(--color-border)]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-error)] hover:bg-[var(--color-error)]/8 rounded-[var(--radius-md)] transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Terminate_Session
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Auth buttons ── */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="vp-btn vp-btn-secondary text-[10px] py-2 px-5"
                >
                  Sign_In
                </Link>
                <Link
                  to="/register"
                  className="vp-btn vp-btn-primary text-[10px] py-2 px-5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════
          MOBILE BOTTOM DOCK
          ════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 inset-x-0 z-[60] lg:hidden">
        {/* Dock bar */}
        <div className="mx-3 mb-3 rounded-[var(--radius-2xl)] bg-[var(--vp-glass-bg)] backdrop-blur-2xl border border-[var(--vp-glass-border)] shadow-[0_-4px_32px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-around px-2 py-2">
            {dockItems.map((item) => {
              const Icon = item.icon;
              const active = item.path && isActive(item.path);
              const isMore = item.name === "More";

              return (
                <motion.div key={item.name} whileTap={{ scale: 0.9 }}>
                  {isMore ? (
                    <button
                      onClick={item.action}
                      className="flex flex-col items-center gap-1 px-3 py-2 text-[var(--color-muted)] active:text-[var(--color-text)] transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {item.name}
                      </span>
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={(e) => guard(e, item.path)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors relative ${
                        active
                          ? "text-[var(--color-accent)]"
                          : "text-[var(--color-muted)]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {item.name}
                      </span>
                      {active && (
                        <motion.div
                          layoutId="dock-indicator"
                          className="absolute -top-0.5 w-5 h-0.5 rounded-full bg-[var(--color-accent)]"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 28,
                          }}
                        />
                      )}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════
          MOBILE: Minimal top bar (logo + theme + profile)
          ════════════════════════════════════════════ */}
      <div
        className={`fixed top-0 inset-x-0 z-[60] lg:hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? "py-2.5 bg-[var(--vp-glass-bg)] backdrop-blur-2xl border-b border-[var(--vp-glass-border)]"
            : "py-3 bg-transparent"
        }`}
      >
        <div className="px-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-lg font-black italic tracking-tighter uppercase text-[var(--color-text)]"
          >
            VP<span className="text-[var(--color-accent)] not-italic">.</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Compact status */}
            <div className="flex items-center gap-1.5 mr-2">
              <span className="vp-status-dot" style={{ width: 4, height: 4 }} />
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--color-muted)]">
                Live
              </span>
            </div>

            <motion.button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-muted)]"
              whileTap={{ scale: 0.9 }}
            >
              {theme === THEMES.DARK ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </motion.button>

            {user ? (
              <Link
                to="/settings"
                className="w-8 h-8 rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-accent)]/10 flex items-center justify-center"
              >
                {user.profileImage ? (
                  <img
                    src={cldAvatar(user.profileImage)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-mono font-bold text-[var(--color-accent)]">
                    {user.name.charAt(0)}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="vp-btn vp-btn-primary text-[9px] py-1.5 px-3"
              >
                Auth
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          MOBILE: Overflow Drawer (More panel)
          ════════════════════════════════════════════ */}
      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 z-[65] bg-black/40 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              ref={moreRef}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 z-[70] lg:hidden rounded-t-[var(--radius-2xl)] bg-[var(--color-bg-raised)] border-t border-[var(--vp-glass-border)] shadow-[0_-8px_40px_rgba(0,0,0,0.2)] max-h-[70vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-[var(--color-border-strong)]" />
              </div>

              <div className="px-5 pb-3">
                <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-4">
                  Navigation_Matrix
                </p>
              </div>

              <div className="px-3 pb-6">
                {overflowNav.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={(e) => {
                        setMoreOpen(false);
                        guard(e, item.path);
                      }}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-[var(--radius-lg)] transition-colors ${
                        active
                          ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                          : "text-[var(--color-text)] hover:bg-[var(--color-accent-subtle)]"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-bold uppercase tracking-[0.12em]">
                        {item.name}
                      </span>
                      {active && (
                        <span
                          className="ml-auto vp-status-dot"
                          style={{ width: 5, height: 5 }}
                        />
                      )}
                    </Link>
                  );
                })}

                {/* Logout */}
                {user && (
                  <button
                    onClick={() => {
                      setMoreOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-[var(--radius-lg)] text-[var(--color-error)] hover:bg-[var(--color-error)]/8 transition-colors mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-[0.12em]">
                      Terminate_Session
                    </span>
                  </button>
                )}
              </div>

              {/* System info */}
              <div className="px-5 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="vp-status-dot"
                    style={{ width: 4, height: 4 }}
                  />
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--color-muted)]">
                    Protocol_Online
                  </span>
                </div>
                <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--color-muted)]">
                  v5.0.0
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
