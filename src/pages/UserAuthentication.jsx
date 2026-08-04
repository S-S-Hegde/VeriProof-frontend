import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { persistUserSession } from "../utils/authStorage";
import {
  Mail,
  Lock,
  ArrowRight,
  Shield,
  UserCircle,
  ShieldCheck,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const emailRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (user) {
      const redirectPath =
        user.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    emailRef.current?.focus();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/users/login", {
        email,
        password,
        role,
      });

      setWelcomeName(data.name);
      setShowWelcome(true);

      timeoutRef.current = setTimeout(() => {
        setUser(data);
        persistUserSession(data);

        let fromPath = location.state?.from?.pathname || location.state?.from;

        if (!fromPath) {
          fromPath =
            data.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard";
        }

        navigate(fromPath, { replace: true });
      }, 1800);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Authentication_Failed";

      if (status === 403 && err.response?.data?.redirectTo) {
        // Role-mismatch: guide user to register
        setError(msg);
        setLoading(false);
        // After 2.5s auto-navigate to register with pre-filled email
        timeoutRef.current = setTimeout(() => {
          navigate(`/register?email=${encodeURIComponent(email)}&role=${role}`);
        }, 2500);
      } else {
        setError(msg);
        setLoading(false);
      }
    }
  };


  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--color-bg)] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <CheckCircle className="w-16 h-16 text-[var(--color-accent)]" />
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="vp-label-accent mb-3"
            >
              Identity_Verified
            </motion.p>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter"
            >
              Welcome,{" "}
              <span className="text-[var(--color-accent)] not-italic">
                {welcomeName}
              </span>
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border)] mb-6"
          >
            <Shield className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span
              className="vp-label-accent"
              style={{ letterSpacing: "0.2em" }}
            >
              Secure_Authentication
            </span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-2">
            Sign{" "}
            <span className="text-[var(--color-accent)] not-italic">In</span>
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Access your verification terminal
          </p>
        </div>

        <div className="vp-glass p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)] opacity-[0.03] blur-3xl -mr-16 -mt-16 pointer-events-none" />

          {/* Role Selection Section */}
          <div className="mb-8">
            <label className="vp-label mb-3 block text-center tracking-widest uppercase text-[var(--color-muted)]">
              Select Your Portal
            </label>
            <div className="flex p-1 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]">
              {[
                { value: "student", label: "Candidate", icon: UserCircle },
                {
                  value: "recruiter",
                  label: "Recruiter",
                  icon: ShieldCheck,
                },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] rounded-[var(--radius-sm)] transition-colors ${role === value ? "text-[var(--color-bg)]" : "text-[var(--color-muted)] hover:text-[var(--color-text)]"}`}
                >
                  {role === value && (
                    <motion.div
                      layoutId="role-pill"
                      className="absolute inset-0 bg-[var(--color-accent)] rounded-[var(--radius-sm)]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="vp-label mb-2 block">
                <Mail className="w-3 h-3 inline mr-1.5" /> Email Address
              </label>
              <input
                id="login-email"
                name="email"
                autoComplete="username"
                ref={emailRef}
                type="email"
                required
                placeholder="you@company.com"
                className="vp-input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="login-password" className="vp-label mb-2 block">
                <Lock className="w-3 h-3 inline mr-1.5" /> Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="vp-input w-full pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-[var(--color-error)] font-mono uppercase tracking-wider"
                >
                  ⚠ {error}
                </motion.p>
              )}
            </AnimatePresence>
            <button
              type="submit"
              disabled={loading}
              className="vp-btn vp-btn-accent w-full py-4 text-sm gap-3 group disabled:opacity-50 vp-light-sweep mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin relative z-10" />
              ) : (
                <>
                  <span className="relative z-10">Authenticate</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              to="/forgot-password"
              className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
            >
              Forgot_Access_Key?
            </Link>
            <p className="text-[11px] text-[var(--color-muted)] uppercase tracking-wider">
              No credentials?{" "}
              <Link
                to="/register"
                className="text-[var(--color-accent)] font-bold hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
