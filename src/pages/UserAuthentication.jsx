import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { persistUserSession } from "../utils/authStorage";
import RecruiterCompanyOnboardingModal from "../components/RecruiterCompanyOnboardingModal";
import AuthShell from "../components/auth/AuthShell";
import IdentityGatewayCard from "../components/auth/IdentityGatewayCard";
import { CheckCircle, KeyRound, Loader2, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]             = useState("student");
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]           = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

  const [showCompanyModal, setShowCompanyModal] = useState(false);

  // OTP state
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [otpEmail, setOtpEmail]     = useState("");
  const [otp, setOtp]               = useState(["", "", "", "", "", ""]);
  const otpRefs                     = useRef([]);

  const { user, setUser, loginWithGoogle } = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation();
  const timeoutRef         = useRef(null);

  useEffect(() => {
    if (user) {
      if (user.role === "recruiter" && user.recruiterVerificationStatus && user.recruiterVerificationStatus !== "COMPANY_EMAIL_VERIFIED") {
        setShowCompanyModal(true);
        return;
      }
      const redirectPath = user.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const handleGoogleAuth = async () => {
    setError(""); setGoogleLoading(true);
    try {
      const data = await loginWithGoogle(role);
      finishLogin(data);
    } catch (err) {
      console.error("[Google Auth Error]:", err);
      const msg = err.response?.data?.message || err.message || "Google authentication failed. Please try again.";
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const submitHandler = async (e) => {
    if (e) e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await api.post("/api/users/login", { email, password, role });

      if (data.requiresOTP) {
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
      if (data.role === "recruiter" && data.recruiterVerificationStatus && data.recruiterVerificationStatus !== "COMPANY_EMAIL_VERIFIED") {
        setShowCompanyModal(true);
        setShowWelcome(false);
        return;
      }
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
    <div className="min-h-[90vh]">
      <RecruiterCompanyOnboardingModal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        onVerified={() => {
          const redirectPath = user?.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard";
          navigate(redirectPath, { replace: true });
        }}
      />

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#070a14] flex flex-col items-center justify-center text-white"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8 p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30"
            >
              <CheckCircle className="w-16 h-16 text-emerald-400" />
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400 mb-3"
            >
              [ CRYPTOGRAPHIC_IDENTITY_VERIFIED ]
            </motion.p>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-center"
            >
              Welcome, <span className="text-cyan-400 not-italic">{welcomeName}</span>
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthShell role={role} mode="login">
        {requiresOTP ? (
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-300">
                  TWO_FACTOR_IDENTITY_AUTH
                </span>
              </div>
              <h2 className="text-3xl font-black italic uppercase text-white tracking-tight">
                Enter Verification OTP
              </h2>
              <p className="text-xs text-gray-400 mt-2 font-mono">
                A 6-digit access code was sent to <strong className="text-white">{otpEmail}</strong>
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0c1222]/80 border border-white/10 backdrop-blur-xl">
              <form onSubmit={submitOtp} className="space-y-6">
                <div className="flex justify-center gap-2.5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(idx, e)}
                      className="w-12 h-14 text-center text-2xl font-black font-mono rounded-xl border border-white/10 bg-black/50 text-white focus:border-cyan-400 focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-xs text-red-400 font-mono text-center">⚠ {error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-lg"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Access Code"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequiresOTP(false);
                    setOtp(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="w-full text-center text-[11px] font-mono text-gray-500 hover:text-gray-300 uppercase tracking-wider"
                >
                  ← Return to Identity Access Terminal
                </button>
              </form>
            </div>
          </div>
        ) : (
          <IdentityGatewayCard
            role={role}
            setRole={setRole}
            onGoogleAuth={handleGoogleAuth}
            googleLoading={googleLoading}
            onPasswordAuth={submitHandler}
            passwordLoading={loading}
            error={error}
            mode="login"
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        )}
      </AuthShell>
    </div>
  );
};

export default Login;
