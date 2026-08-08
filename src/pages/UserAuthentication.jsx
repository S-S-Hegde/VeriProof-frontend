import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { persistUserSession } from "../utils/authStorage";
import {
  Mail, Lock, ArrowRight, Shield, UserCircle, ShieldCheck,
  Loader2, CheckCircle, Eye, EyeOff, KeyRound,
} from "lucide-react";

const Login = () => {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]             = useState("student");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

  // OTP state
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [otpEmail, setOtpEmail]     = useState("");
  const [otp, setOtp]               = useState(["", "", "", "", "", ""]);
  const otpRefs                     = useRef([]);

  const { user, setUser } = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation();
  const emailRef           = useRef(null);
  const timeoutRef         = useRef(null);

  useEffect(() => {
    if (user) {
      const redirectPath = user.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    emailRef.current?.focus();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await api.post("/api/users/login", { email, password, role });

      if (data.requiresOTP) {
        // First login for invited candidate — show OTP step
        setOtpEmail(data.email || email);
        setRequiresOTP(true);
        setLoading(false);
        return;
      }

      finishLogin(data);
    } catch (err) {
      const status = err.response?.status;
      const data   = err.response?.data;
      const msg    = data?.message || "Authentication_Failed";
      if ((status === 404 || status === 403) && data?.redirectTo) {
        setError(msg); setLoading(false);
        timeoutRef.current = setTimeout(() => navigate(`/register?email=${encodeURIComponent(email)}&role=${role}`), 1500);
      } else {
        setError(msg); setLoading(false);
      }
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) { setError("Please enter all 6 digits."); return; }
    setError(""); setLoading(true);
    try {
      const { data } = await api.post("/api/users/verify-otp", { email: otpEmail, otp: code });
      finishLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP. Please try signing in again.");
      setLoading(false);
    }
  };

  const finishLogin = (data) => {
    setWelcomeName(data.name);
    setShowWelcome(true);
    timeoutRef.current = setTimeout(() => {
      setUser(data);
      persistUserSession(data);
      let fromPath = location.state?.from?.pathname || location.state?.from;
      if (!fromPath) fromPath = data.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard";
      navigate(fromPath, { replace: true });
    }, 1800);
  };

  const handleOtpKey = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <AnimatePresence>
        {showWelcome && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--color-bg)] flex flex-col items-center justify-center">
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="mb-8">
              <CheckCircle className="w-16 h-16 text-[var(--color-accent)]" />
            </motion.div>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="vp-label-accent mb-3">Identity_Verified</motion.p>
            <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
              Welcome, <span className="text-[var(--color-accent)] not-italic">{welcomeName}</span>
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md">

        {/* ── OTP Step ── */}
        <AnimatePresence mode="wait">
          {requiresOTP ? (
            <motion.div key="otp" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border)] mb-6">
                  <KeyRound className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span className="vp-label-accent" style={{ letterSpacing: "0.2em" }}>Two_Factor_Auth</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-2">
                  Enter <span className="text-[var(--color-accent)] not-italic">OTP</span>
                </h1>
                <p className="text-sm text-[var(--color-muted)]">
                  A 6-digit code was sent to <strong className="text-[var(--color-text)]">{otpEmail}</strong>. Valid for 10 minutes.
                </p>
              </div>

              <div className="vp-glass p-8">
                <form onSubmit={submitOtp} className="space-y-6">
                  {/* OTP digit inputs */}
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => otpRefs.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKey(idx, e)}
                        className="w-12 h-14 text-center text-2xl font-black font-mono rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-sunken)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
                      />
                    ))}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-sm text-[var(--color-error)] font-mono uppercase tracking-wider text-center">⚠ {error}</motion.p>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={loading || otp.join("").length !== 6}
                    className="vp-btn vp-btn-accent w-full py-4 text-sm gap-3 group disabled:opacity-50 vp-light-sweep">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin relative z-10" /> : (
                      <><span className="relative z-10">Verify & Sign In</span><ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>

                  <button type="button" onClick={() => { setRequiresOTP(false); setOtp(["","","","","",""]); setError(""); }}
                    className="w-full text-center text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors">
                    ← Back to Sign In
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            /* ── Login Form ── */
            <motion.div key="login" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.4 }}>
              <div className="text-center mb-10">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border)] mb-6">
                  <Shield className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span className="vp-label-accent" style={{ letterSpacing: "0.2em" }}>Secure_Authentication</span>
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-2">
                  Sign <span className="text-[var(--color-accent)] not-italic">In</span>
                </h1>
                <p className="text-sm text-[var(--color-muted)]">Access your verification terminal</p>
              </div>

              <div className="vp-glass p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)] opacity-[0.03] blur-3xl -mr-16 -mt-16 pointer-events-none" />

                {/* Role selector */}
                <div className="mb-8">
                  <label className="vp-label mb-3 block text-center tracking-widest uppercase text-[var(--color-muted)]">Select Your Portal</label>
                  <div className="flex p-1 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]">
                    {[{value:"student",label:"Candidate",icon:UserCircle},{value:"recruiter",label:"Recruiter",icon:ShieldCheck}].map(({value,label,icon:Icon})=>(
                      <button key={value} type="button" onClick={()=>setRole(value)}
                        className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] rounded-[var(--radius-sm)] transition-colors ${role===value?"text-[var(--color-bg)]":"text-[var(--color-muted)] hover:text-[var(--color-text)]"}`}>
                        {role===value&&<motion.div layoutId="role-pill" className="absolute inset-0 bg-[var(--color-accent)] rounded-[var(--radius-sm)]" transition={{type:"spring",stiffness:380,damping:30}}/>}
                        <span className="relative z-10 flex items-center gap-2"><Icon className="w-3.5 h-3.5"/>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={submitHandler} className="space-y-5">
                  <div>
                    <label htmlFor="login-email" className="vp-label mb-2 block"><Mail className="w-3 h-3 inline mr-1.5"/>Email Address</label>
                    <input id="login-email" name="email" autoComplete="username" ref={emailRef} type="email" required placeholder="you@company.com" className="vp-input w-full" value={email} onChange={e=>setEmail(e.target.value)}/>
                  </div>
                  <div>
                    <label htmlFor="login-password" className="vp-label mb-2 block"><Lock className="w-3 h-3 inline mr-1.5"/>Password</label>
                    <div className="relative">
                      <input id="login-password" name="password" autoComplete="current-password" type={showPassword?"text":"password"} required placeholder="••••••••" className="vp-input w-full pr-10" value={password} onChange={e=>setPassword(e.target.value)}/>
                      <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                        {showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error&&(
                      <div className="space-y-2">
                        <motion.p initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-sm text-[var(--color-error)] font-mono uppercase tracking-wider">⚠ {error}</motion.p>
                        {(error.toLowerCase().includes("register")||error.toLowerCase().includes("no account"))&&(
                          <button type="button" onClick={()=>navigate(`/register?email=${encodeURIComponent(email)}&role=${role}`)} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2">
                            <span>Register New Account Now</span><ArrowRight className="w-4 h-4"/>
                          </button>
                        )}
                      </div>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={loading} className="vp-btn vp-btn-accent w-full py-4 text-sm gap-3 group disabled:opacity-50 vp-light-sweep mt-2">
                    {loading?<Loader2 className="w-4 h-4 animate-spin relative z-10"/>:<><span className="relative z-10">Authenticate</span><ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform"/></>}
                  </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-3">
                  <Link to="/forgot-password" className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors">Forgot_Access_Key?</Link>
                  <p className="text-[11px] text-[var(--color-muted)] uppercase tracking-wider">No credentials? <Link to="/register" className="text-[var(--color-accent)] font-bold hover:underline">Register</Link></p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
