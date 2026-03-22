import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Compass, LayoutDashboard, UploadCloud, Briefcase, Users, Activity, Settings, Search, ShieldCheck, HelpCircle, TrendingUp, Moon, Sun } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const isHome = location.pathname === "/";

  // 2D Scroll Glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const triggerLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
    setShowLogoutModal(false);
  };

  const getNavLinks = () => {
    if (location.pathname === "/") {
      return []; // Pure Demo Home Page per Master Prompt
    }

    const common = [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }];
    if (!user) return common;

    if (user.role === "student") {
      return [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "My Portfolio", path: "/portfolio", icon: Briefcase },
        { name: "Verification Requests", path: "/verification-requests", icon: ShieldCheck },
        { name: "Skill Growth", path: "/analytics", icon: TrendingUp },
        { name: "Opportunities", path: "/opportunities", icon: Compass },
        { name: "Settings/Profile", path: "/settings", icon: Settings }
      ];
    }

    if (user.role === "recruiter") {
      return [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Candidate Search", path: "/talent", icon: Search },
        { name: "Verification Panel", path: "/verification-panel", icon: ShieldCheck },
        { name: "Job Postings", path: "/recruiter/jobs", icon: Briefcase },
        { name: "Analytics", path: "/recruiter/analytics", icon: Activity },
        { name: "Settings/Profile", path: "/settings", icon: Settings }
      ];
    }
    return common;
  };

  const navLinks = getNavLinks();

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 inset-x-0 z-[60] transition-all duration-500 ease-in-out ${
          scrolled || menuOpen
            ? "py-3 bg-black/80 backdrop-blur-xl shadow-lg border-b border-orange-500/20"
            : "py-6 bg-transparent border-b border-transparent shadow-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 relative group z-[70]" onClick={() => setMenuOpen(false)}>
                <span className={`text-xl md:text-2xl font-sans tracking-[0.3em] uppercase font-bold transition-colors ${scrolled || isHome || menuOpen ? 'text-white' : 'text-orange-500'}`}>
                  VERIPROOF
                </span>
                <motion.div className={`absolute -bottom-2 left-0 w-0 h-[1px] group-hover:w-full transition-all duration-300 ${scrolled || isHome || menuOpen ? 'bg-orange-500' : 'bg-orange-500'}`} />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-2 text-xs xl:text-sm tracking-widest uppercase transition-colors duration-300 font-medium ${
                    location.pathname === link.path
                      ? scrolled ? "text-orange-400" : "text-white"
                      : scrolled ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-orange-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6">
              <AnimatePresence mode="wait">
                {user ? (
                  <motion.div
                    key="user-nav"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-6"
                  >
                    <button 
                      onClick={toggleTheme} 
                      className={`p-2 flex items-center justify-center rounded-full transition-colors ${scrolled ? 'text-white hover:bg-white/20' : 'text-vp-teal hover:bg-vp-teal/10'}`}
                      aria-label="Toggle Dark Mode"
                    >
                      {isDarkMode ? <Sun className="w-5 h-5 text-ibex-gold" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <div 
                      className="relative group cursor-pointer"  
                      onClick={() => navigate("/settings")}
                    >
                      <div className={`h-9 w-9 flex items-center justify-center rounded-full border transition-colors duration-300 font-serif ${scrolled ? 'border-white text-white hover:bg-white hover:text-vp-teal' : 'border-vp-teal text-vp-teal hover:bg-vp-teal hover:text-white'}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute top-12 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white border border-ibex-surface shadow-xl text-vp-teal text-xs px-4 py-2 rounded-sm whitespace-nowrap tracking-widest uppercase pointer-events-none z-50 font-medium">
                        {user.name}
                      </div>
                    </div>
                    <button
                      onClick={triggerLogout}
                      className={`text-xs uppercase tracking-widest transition-colors duration-300 border-b border-transparent pb-1 font-medium ${scrolled ? 'text-white hover:text-orange-400 border-orange-400' : 'text-orange-500 hover:text-orange-400 border-orange-400'}`}
                    >
                      Logout
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="guest-nav"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-6"
                  >
                    <button 
                      onClick={toggleTheme} 
                      className={`p-2 flex items-center justify-center rounded-full transition-colors ${scrolled || isHome ? 'text-white hover:bg-white/20' : 'text-vp-teal hover:bg-vp-teal/10'}`}
                      aria-label="Toggle Dark Mode"
                    >
                      {isDarkMode ? <Sun className="w-5 h-5 text-ibex-gold" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <Link
                      to="/login"
                      className={`text-xs uppercase tracking-widest transition-colors duration-300 font-medium ${
                        scrolled ? "text-white hover:text-orange-400" : isHome ? "text-white hover:text-orange-400 bg-black/20 p-2 px-4 rounded-full" : "text-orange-500 hover:text-orange-400"
                      }`}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className={`text-xs uppercase tracking-widest px-6 py-2.5 rounded-full transition-all duration-300 font-bold ${
                        scrolled || isHome
                          ? "bg-white text-orange-600 hover:bg-opacity-90 shadow-[0_0_15px_rgba(255,69,0,0.5)]"
                          : "text-white bg-orange-600 hover:bg-orange-500 shadow-md"
                      }`}
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden z-[70] items-center space-x-2">
              <button 
                onClick={toggleTheme} 
                className={`p-2 transition-colors ${scrolled || isHome || menuOpen ? 'text-white hover:text-ibex-gold' : 'text-vp-teal hover:text-ibex-gold'}`}
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`p-2 transition-colors ${scrolled || isHome || menuOpen ? 'text-white hover:text-ibex-gold' : 'text-vp-teal hover:text-ibex-gold'}`}
                aria-label="Toggle menu"
              >
                <div className="w-6 flex flex-col items-end gap-1.5">
                  <span className={`h-[1px] bg-current transition-all duration-300 ${menuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`}></span>
                  <span className={`h-[1px] bg-current transition-all duration-300 ${menuOpen ? 'w-0 opacity-0' : 'w-4'}`}></span>
                  <span className={`h-[1px] bg-current transition-all duration-300 ${menuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Full Screen Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[55] bg-vp-teal flex flex-col items-center justify-center"
          >
            {/* Background texture for menu */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ibex-surface/20 pointer-events-none" />
            
            <div className="flex flex-col items-center space-y-8 text-center relative z-10 w-full px-6 overflow-y-auto max-h-screen py-20 pb-32">
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center space-x-4 text-2xl font-serif text-white hover:text-ibex-gold transition-colors uppercase tracking-widest"
                  >
                    <Icon className="w-6 h-6 text-ibex-gold" />
                    <span>{link.name}</span>
                  </Link>
                </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-16 h-[1px] bg-ibex-gold/30 my-6"
              />

              {user ? (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => { navigate("/settings"); setMenuOpen(false); }}
                  >
                    <div className="h-16 w-16 mb-4 flex items-center justify-center rounded-full border border-ibex-gold text-ibex-gold text-2xl font-serif bg-ibex-surface">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-ibex-gold tracking-widest uppercase text-sm">
                      {user.name}
                    </span>
                  </motion.div>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={triggerLogout}
                    className="text-sm uppercase tracking-widest text-ibex-muted hover:text-ibex-gold transition-colors mt-6"
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-6 mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="text-sm uppercase tracking-widest text-white hover:text-ibex-gold transition-colors"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="text-sm uppercase tracking-widest text-ibex-bg bg-ibex-gold px-8 py-3 rounded-full hover:bg-transparent hover:text-ibex-gold border border-ibex-gold transition-all"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-ibex-surface border border-ibex-gold/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-premium" />
              <h3 className="text-2xl font-serif text-ibex-text mb-2">Confirm Logout</h3>
              <p className="text-ibex-muted text-sm mb-8 font-light">Are you sure you want to securely end your session?</p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 px-4 border border-ibex-gold/30 text-ibex-text hover:border-ibex-gold rounded-full text-xs uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-3 px-4 bg-orange-600 shadow-[0_0_15px_rgba(255,69,0,0.5)] text-white rounded-full text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
