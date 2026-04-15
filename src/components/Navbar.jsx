import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { 
  LayoutDashboard, 
  Settings, 
  Search, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Clock,
  Menu,
  X,
  Activity,
  Wand2,
  FileText,
  Info,
  Mail,
  User as UserIcon
} from "lucide-react";
import OutroScreen from "./OutroScreen";
import { cldAvatar } from "../utils/cloudinaryImage";

const Navbar = () => {
  const { user, logout, setIsExiting, isExiting } = useAuth();
  const { theme, toggleTheme, THEMES } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    const timer = setInterval(() => setTime(new Date()), 1000);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(timer);
    };
  }, []);

  const interceptNavigation = (e, path) => {
    if (!user) {
      e.preventDefault();
      navigate("/login");
    }
  };

  const getNavLinks = () => {
    const isRecruiter = user?.role === "recruiter";
    if (isRecruiter) {
      return [
        { name: "Forensics", path: "/dashboard", icon: LayoutDashboard },
        { name: "Discover", path: "/discover", icon: Search },
        { name: "Jobs", path: "/recruiter-jobs", icon: ShieldCheck },
        { name: "Intel", path: "/recruiter-resumes", icon: Activity },
      ];
    }
    return [
      { name: "Terminal", path: "/dashboard", icon: LayoutDashboard },
      { name: "Evidence", path: "/discover", icon: Search },
      { name: "Exams", path: "/exams", icon: FileText },
      { name: "AI Builder", path: "/ai-resume-builder", icon: Wand2 },
    ];
  };

  const navLinks = getNavLinks();

  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    setIsExiting(true);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 inset-x-0 z-[60] transition-all duration-500 ${
          scrolled 
            ? `py-3 border-b border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl` 
            : `py-6 bg-transparent`
        } text-[var(--color-text)] ${theme === THEMES.LIGHT ? 'theme-light-nav' : ''}`}
      >
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 flex justify-between items-center w-full">
          
          <div className="flex items-center space-x-4 xl:space-x-6 shrink-0">
            <Link to="/" className="group relative">
              <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none">
                VeriProof<span className="text-[var(--color-accent)] not-italic">.</span>
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--color-accent)] group-hover:w-full transition-all duration-500" />
            </Link>

            <div className="hidden 2xl:flex items-center space-x-4 border-l border-[var(--color-border)] pl-4 h-6">
              <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase opacity-40">
                <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                <span>Live_Nodes_Active</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase opacity-40 border-l border-[var(--color-border)] pl-4">
                <Clock className="w-3 h-3" />
                <span>{time.toLocaleTimeString([], { hour12: false })} UTC</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(e) => interceptNavigation(e, link.path)}
                  className={`px-4 xl:px-6 py-2 border-l last:border-r border-[var(--color-border)] flex items-center space-x-2 text-xs xl:text-sm tracking-widest xl:tracking-[0.2em] uppercase font-bold transition-all duration-300 group ${
                    isActive 
                      ? "text-[var(--color-accent)] bg-[var(--color-accent)]/5" 
                      : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.02]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 shrink-0 ${isActive ? "text-[var(--color-accent)]" : ""}`} />
                  <span className="whitespace-nowrap">{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4 xl:space-x-6 shrink-0">
            <button 
                onClick={toggleTheme}
                className="p-2 border border-[var(--color-border)] hover:border-[var(--color-text)] transition-all rounded-sm text-[var(--color-text)] flex shrink-0"
            >
              {theme === THEMES.DARK || theme === THEMES.IMMERSIVE ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
                <div 
                    className="relative group"
                    onMouseEnter={() => setProfileOpen(true)}
                    onMouseLeave={() => setProfileOpen(false)}
                >
                    <div className="w-10 h-10 border border-[var(--color-accent)] flex items-center justify-center bg-[var(--color-accent)]/5 group-hover:bg-[var(--color-accent)] transition-all cursor-pointer overflow-hidden group-hover:text-white">
                        {user.profileImage ? (
                          <img 
                            src={cldAvatar(user.profileImage)} 
                            alt={user.name} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <span className="text-xs font-mono font-bold uppercase">{user.name.charAt(0)}</span>
                        )}
                    </div>

                    <AnimatePresence>
                        {profileOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-56 bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xl backdrop-blur-xl p-4 origin-top-right z-50"
                            >
                                <div className="mb-4 pb-4 border-b border-[var(--color-border)]">
                                    <p className="text-sm font-mono opacity-40 uppercase tracking-tighter">Authorized_User</p>
                                    <p className="text-base font-bold uppercase tracking-widest truncate">{user.name}</p>
                                </div>
                                
                                <div className="space-y-1">
                                    <Link 
                                        to="/settings" 
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center space-x-3 p-2 text-sm uppercase tracking-widest hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] transition-all font-bold"
                                    >
                                        <Settings className="w-3 h-3" />
                                        <span>Protocols</span>
                                    </Link>
                                    <Link 
                                        to="/about" 
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center space-x-3 p-2 text-sm uppercase tracking-widest hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] transition-all font-bold"
                                    >
                                        <Info className="w-3 h-3" />
                                        <span>About_Us</span>
                                    </Link>
                                    <Link 
                                        to="/contact" 
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center space-x-3 p-2 text-sm uppercase tracking-widest hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] transition-all font-bold"
                                    >
                                        <Mail className="w-3 h-3" />
                                        <span>Contact_Us</span>
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-3 p-2 text-sm uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all font-bold text-left"
                                    >
                                        <X className="w-3 h-3" />
                                        <span>Terminate_Session</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex items-center space-x-2 md:space-x-4">
                  <Link
                      to="/login"
                      className="hidden sm:block px-4 md:px-6 py-2 border border-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] text-xs md:text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap"
                  >
                      Auth
                  </Link>
                  <Link
                      to="/register"
                      className="px-4 md:px-6 py-2 bg-[var(--color-text)] text-[var(--color-bg)] hover:bg-[var(--color-accent)] hover:text-white text-xs md:text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap"
                  >
                      Register
                  </Link>
                </div>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[55] bg-[var(--color-bg)] flex flex-col p-12 pt-32"
          >
            <div className="flex flex-col space-y-12">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(e) => {
                      setMenuOpen(false);
                      interceptNavigation(e, link.path);
                  }}
                  className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-6 group"
                >
                  <span className="text-[var(--color-accent)] opacity-20 group-hover:opacity-100 transition-opacity">/</span>
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="mt-auto pt-12 border-t border-[var(--color-border)] flex flex-col gap-4">
                <Link to="/about" onClick={() => setMenuOpen(false)} className="text-sm font-mono uppercase tracking-[0.4em] opacity-40 hover:opacity-100 hover:text-[var(--color-accent)] transition-all">About Us</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)} className="text-sm font-mono uppercase tracking-[0.4em] opacity-40 hover:opacity-100 hover:text-[var(--color-accent)] transition-all">Contact Us</Link>
                <p className="text-sm font-mono opacity-20 uppercase tracking-[0.5em]">SYSTEM_VERSION_4.0.0_STABLE</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
