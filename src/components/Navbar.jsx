import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Activity
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, THEMES } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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

  const navLinks = [
    { name: "Terminal", path: "/dashboard", icon: LayoutDashboard },
    { name: "Evidence", path: "/discover", icon: Search },
    { name: "Verify", path: "/verification-requests", icon: ShieldCheck },
    { name: "Protocols", path: "/settings", icon: Settings },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 inset-x-0 z-[60] transition-all duration-500 ${
          scrolled 
            ? "py-2 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]" 
            : "py-6 bg-transparent"
        } text-[var(--color-text)]`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex justify-between items-center">
          
          <div className="flex items-center space-x-12">
            <Link to="/" className="group relative">
              <span className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                VeriProof<span className="text-[var(--color-accent)] not-italic">.</span>
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--color-accent)] group-hover:w-full transition-all duration-500" />
            </Link>

            <div className="hidden xl:flex items-center space-x-8 border-l border-[var(--color-border)] pl-12 h-6">
              <div className="flex items-center space-x-3 text-[9px] font-mono tracking-[0.3em] uppercase opacity-40">
                <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                <span>Live_Nodes_Active</span>
              </div>
              <div className="flex items-center space-x-3 text-[9px] font-mono tracking-[0.3em] uppercase opacity-40">
                <Clock className="w-3 h-3" />
                <span>{time.toLocaleTimeString([], { hour12: false })} UTC</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(e) => interceptNavigation(e, link.path)}
                  className={`px-8 py-2 border-l last:border-r border-[var(--color-border)] flex items-center space-x-3 text-[10px] tracking-[0.4em] uppercase font-bold transition-all duration-300 group ${
                    isActive 
                      ? "text-[var(--color-accent)] bg-[var(--color-accent)]/5" 
                      : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.02]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isActive ? "text-[var(--color-accent)]" : ""}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-8">
            <button 
                onClick={toggleTheme}
                className="p-2 border border-[var(--color-border)] hover:border-[var(--color-text)] transition-all rounded-sm text-[var(--color-text)]"
            >
              {theme === THEMES.DARK || theme === THEMES.IMMERSIVE ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
                <Link to="/settings" className="flex items-center gap-4 group">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-mono opacity-40 uppercase tracking-tighter">Authorized_User</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{user.name}</span>
                    </div>
                    <div className="w-10 h-10 border border-[var(--color-accent)] flex items-center justify-center bg-[var(--color-accent)]/5 group-hover:bg-[var(--color-accent)] transition-all group-hover:text-white">
                        <span className="text-xs font-mono font-bold">{user.name.charAt(0)}</span>
                    </div>
                </Link>
            ) : (
                <Link
                    to="/login"
                    className="px-8 py-3 bg-[var(--color-text)] text-[var(--color-bg)] text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--color-accent)] transition-all"
                >
                    Initialize
                </Link>
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
            
            <div className="mt-auto pt-12 border-t border-[var(--color-border)]">
                <p className="text-[9px] font-mono opacity-40 uppercase tracking-[0.5em]">SYSTEM_VERSION_4.0.0_STABLE</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
