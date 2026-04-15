import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { 
  ShieldCheck, 
  User, 
  Briefcase, 
  ArrowRight, 
  Terminal, 
  Lock, 
  Fingerprint 
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Intercept States
  const [showWelcome, setShowWelcome] = useState(false);
  const [loggedName, setLoggedName] = useState("");

  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const data = await login(email, password);
      // Determine first name or handle for the cinematic display
      const firstName = data.name ? data.name.split(" ")[0].toUpperCase() : "GUEST";
      setLoggedName(firstName);
      window.scrollTo(0, 0); // Snap viewport to top to prevent the cinematic overlay from being hidden
      setShowWelcome(true);
      
      // Delay navigation to let the cinematic welcome play out
      setTimeout(() => {
        navigate("/dashboard");
      }, 2800);
      
    } catch (err) {
      setError(err.response?.data?.message || "Access Denied: Invalid Credentials");
      setIsSubmitting(false);
    } 
  };

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] bg-[var(--color-bg)] flex items-start justify-center pt-32 md:pt-40 overflow-hidden"
          >
             <div className="absolute inset-0 bg-black/50 pointer-events-none" />
             
             <motion.div 
                initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center"
             >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.8, ease: "backOut" }}
                >
                  <ShieldCheck className="w-16 h-16 text-[var(--color-accent)] mb-8 opacity-50" />
                </motion.div>
                
                <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-[var(--color-text)] flex items-center gap-4">
                  WELCOME_
                  <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="text-[var(--color-accent)] not-italic"
                  >
                    {loggedName}
                  </motion.span>
                </h1>
                
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}
                  className="h-[2px] bg-[var(--color-border)] mt-8 relative"
                >
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, delay: 1.5, ease: "linear", repeat: Infinity }}
                    className="absolute inset-y-0 left-0 w-1/3 bg-[var(--color-accent)] blur-sm"
                  />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.8 }}
                  className="mt-6 text-sm font-mono tracking-[0.4em] uppercase text-[var(--color-text)] opacity-40"
                >
                  Establishing Secure Node Link...
                </motion.p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`min-h-[90vh] flex items-center justify-center p-4 transition-colors duration-700 ${showWelcome ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden shadow-2xl border border-current opacity-90 transition-all duration-700 bg-[var(--color-bg)]"
          style={{ borderColor: isDarkMode ? "rgba(245, 158, 11, 0.2)" : "rgba(37, 99, 235, 0.1)" }}>
          
          {/* LEFT SIDE: The Role Selector / Aesthetic Visual */}
          <div className={`relative p-12 hidden lg:flex flex-col justify-between overflow-hidden transition-all duration-700 ${
            role === "student" 
              ? "bg-blue-600 text-white" 
              : "bg-slate-950 text-amber-500"
          }`}>
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="relative z-10">
              <ShieldCheck className="w-12 h-12 mb-8" />
              <motion.h2 
                key={role}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`text-5xl font-bold tracking-tighter mb-4 ${role === "recruiter" ? "font-serif italic lowercase" : "font-sans uppercase"}`}
              >
                {role === "student" ? "Verify Your Legacy." : "Uncover The Truth."}
              </motion.h2>
              <p className="text-lg opacity-70 font-light leading-relaxed max-w-sm">
                {role === "student" 
                  ? "Join the elite tier of developers with verified project integrity and forensic skill validation."
                  : "Access a curated archive of talent where every line of code is authenticated and every claim is proven."}
              </p>
            </div>

            <div className="relative z-10">
              <div className="flex space-x-4 mb-8">
                <button 
                  onClick={() => setRole("student")}
                  className={`flex-1 py-4 px-6 border transition-all duration-500 flex flex-col items-center gap-2 ${
                    role === "student" ? "bg-white text-blue-600 border-white" : "border-white/20 hover:border-white/50"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-widest font-bold">The Candidate</span>
                </button>
                <button 
                  onClick={() => setRole("recruiter")}
                  className={`flex-1 py-4 px-6 border transition-all duration-500 flex flex-col items-center gap-2 ${
                    role === "recruiter" ? "bg-amber-500 text-black border-amber-500" : "border-amber-500/20 hover:border-amber-500/50"
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-widest font-bold">The Investigator</span>
                </button>
              </div>
              <div className="text-sm uppercase tracking-[0.3em] opacity-40 font-mono">
                Protocol: {role === "student" ? "EVIDENCE_SUBMISSION" : "FORENSIC_REVIEW"} // SECURED
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: The Form */}
          <div className="p-12 flex flex-col justify-center">
            <div className="mb-10 lg:hidden">
               <div className="flex justify-center space-x-4 mb-8">
                  <button onClick={() => setRole("student")} className={`text-sm tracking-widest uppercase pb-2 border-b-2 transition-all ${role === "student" ? "border-blue-600 text-blue-600" : "border-transparent opacity-50"}`}>Student</button>
                  <button onClick={() => setRole("recruiter")} className={`text-sm tracking-widest uppercase pb-2 border-b-2 transition-all ${role === "recruiter" ? "border-amber-500 text-amber-500" : "border-transparent opacity-50"}`}>Recruiter</button>
               </div>
            </div>

            <div className="mb-8">
              <h1 className={`text-2xl mb-2 ${isDarkMode ? "font-serif italic text-amber-500" : "font-sans font-black uppercase tracking-widest"}`}>
                Authentication
              </h1>
              <p className="text-xs opacity-50 font-mono uppercase tracking-tighter">Enter credentials to proceed to the command center</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm uppercase tracking-widest font-bold opacity-60 ml-1">Archive ID (Email)</label>
                <div className={`flex items-center space-x-3 p-4 border transition-all duration-500 ${
                  isDarkMode ? "bg-slate-900 border-amber-500/20 focus-within:border-amber-500" : "bg-slate-50 border-slate-200 focus-within:border-blue-600"
                }`}>
                  <Fingerprint className={`w-4 h-4 ${isDarkMode ? "text-amber-500" : "text-blue-600"}`} />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@archive.com"
                    className="bg-transparent border-none outline-none w-full text-sm font-mono placeholder:opacity-30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm uppercase tracking-widest font-bold opacity-60 ml-1">Access Key (Password)</label>
                <div className={`flex items-center space-x-3 p-4 border transition-all duration-500 ${
                  isDarkMode ? "bg-slate-900 border-amber-500/20 focus-within:border-amber-500" : "bg-slate-50 border-slate-200 focus-within:border-blue-600"
                }`}>
                  <Lock className={`w-4 h-4 ${isDarkMode ? "text-amber-500" : "text-blue-600"}`} />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent border-none outline-none w-full text-sm font-mono placeholder:opacity-30"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Link to="/forgot-password" className="text-[10px] font-mono tracking-widest uppercase opacity-40 hover:opacity-100 transition-colors">
                    Forgot Passphrase?
                  </Link>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm uppercase tracking-widest text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting || showWelcome}
                className={`w-full py-4 flex items-center justify-center space-x-3 transition-all duration-500 group ${
                  isDarkMode 
                    ? "bg-amber-500 text-black font-bold hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
                    : "bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg"
                }`}
              >
                <span className="text-base uppercase tracking-[0.3em]">
                  {isSubmitting ? "AUTHORIZING..." : "INITIALIZE_SESSION"}
                </span>
                {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-current opacity-10 flex justify-between items-center">
               <Link to="/register" className="text-sm uppercase tracking-widest hover:opacity-100 opacity-60 transition-opacity">Enlist for Archive Access</Link>
               <span className="text-sm uppercase tracking-widest opacity-30 font-mono">v1.0.4-forensic</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
