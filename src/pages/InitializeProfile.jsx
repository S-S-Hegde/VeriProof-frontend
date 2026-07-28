import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { persistUserSession } from "../utils/authStorage";
import {
  UserPlus,
  Mail,
  Lock,
  Github,
  UserCircle,
  Target,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [githubUsername, setGithubUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAuth();
  useTheme();
  const navigate = useNavigate();

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    setError("");
    setStep(2);
  };

  const handleBackNavigation = () => {
    // Clear sensitive state when navigating back to prevent shared-terminal privacy flaws
    setName("");
    setEmail("");
    setPassword("");
    setGithubUsername("");
    setError("");
    setStep(1);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/users", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        githubUsername: role === "student" ? githubUsername.trim() : "",
      });
      setUser(data);
      persistUserSession(data);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl relative">
        <AnimatePresence mode="wait">
          {/* ── Step 1: Role Selection ── */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col md:flex-row gap-4 w-full"
            >
              {/* Candidate Card - Now an accessible button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelection("student")}
                className="w-full md:w-1/2 flex flex-col items-center justify-center p-10 md:p-14 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-text)] transition-all cursor-pointer group min-h-[320px] md:min-h-[440px] vp-light-sweep text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <Target className="w-14 h-14 md:w-16 md:h-16 mb-6 text-[var(--color-muted)] group-hover:text-[var(--color-text)] transition-colors" />
                <h2 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-center leading-none">
                  Candidate
                </h2>
                <p className="mt-4 text-sm text-[var(--color-muted)] text-center max-w-[220px]">
                  Submit your architectural evidence
                </p>
                <div className="mt-8 vp-btn vp-btn-secondary text-[10px] py-2 px-6">
                  Select_Origin
                </div>
              </motion.button>

              {/* Investigator Card - Now an accessible button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelection("recruiter")}
                className="w-full md:w-1/2 flex flex-col items-center justify-center p-10 md:p-14 rounded-[var(--radius-2xl)] bg-[var(--color-accent)] border border-[var(--color-accent)] hover:opacity-95 transition-all cursor-pointer group min-h-[320px] md:min-h-[440px] vp-light-sweep text-left focus:outline-none focus:ring-2 focus:ring-white"
              >
                <ShieldCheck className="w-14 h-14 md:w-16 md:h-16 mb-6 text-white/60 group-hover:text-white transition-colors" />
                <h2 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white text-center leading-none">
                  Investigator
                </h2>
                <p className="mt-4 text-sm text-white/70 text-center max-w-[220px]">
                  Audit portfolios and source truth
                </p>
                <div className="mt-8 px-6 py-2 bg-white text-[var(--color-accent)] text-[10px] font-bold uppercase tracking-[0.2em] rounded-[var(--radius-md)]">
                  Grant_Access
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 2: Registration Form ── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md mx-auto"
            >
              {/* Back button */}
              <button
                onClick={handleBackNavigation}
                disabled={loading}
                className="flex items-center gap-2 mb-6 text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border)] mb-5">
                  <UserPlus className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span
                    className="vp-label-accent"
                    style={{ letterSpacing: "0.2em" }}
                  >
                    {role === "student"
                      ? "Candidate_Protocol"
                      : "Investigator_Protocol"}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
                  Join the{" "}
                  <span className="text-[var(--color-accent)] not-italic opacity-50">
                    Archive
                  </span>
                </h1>
              </div>

              {/* Glass Card */}
              <div className="vp-glass p-8">
                <form onSubmit={submitHandler} className="space-y-5">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <div>
                    <label htmlFor="fullName" className="vp-label mb-2 block">
                      <UserCircle className="w-3 h-3 inline mr-1.5" />
                      Full_Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      disabled={loading}
                      placeholder={
                        role === "student" ? "John_Doe" : "Sarah_Connor"
                      }
                      className="vp-input disabled:opacity-50"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="emailAddress"
                      className="vp-label mb-2 block"
                    >
                      <Mail className="w-3 h-3 inline mr-1.5" />
                      Network_Address
                    </label>
                    <input
                      id="emailAddress"
                      type="email"
                      required
                      disabled={loading}
                      placeholder="identity@protocol.com"
                      className="vp-input disabled:opacity-50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="securePassword"
                      className="vp-label mb-2 block"
                    >
                      <Lock className="w-3 h-3 inline mr-1.5" />
                      Access_Key
                    </label>
                    <div className="relative">
                      <input
                        id="securePassword"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        disabled={loading}
                        placeholder="••••••••"
                        className="vp-input pr-10 disabled:opacity-50"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors disabled:opacity-50"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
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
                    {role === "student" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <label
                          htmlFor="githubHandle"
                          className="vp-label mb-2 block mt-5"
                        >
                          <Github className="w-3 h-3 inline mr-1.5" />
                          GitHub_Handle
                        </label>
                        <input
                          id="githubHandle"
                          type="text"
                          required
                          disabled={loading}
                          placeholder="github_username"
                          className="vp-input disabled:opacity-50"
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="vp-btn vp-btn-accent w-full py-4 text-sm gap-3 group disabled:opacity-50 vp-light-sweep mt-3"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                    ) : (
                      <>
                        <span className="relative z-10">
                          Initialize_Profile
                        </span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-[11px] text-[var(--color-muted)] uppercase tracking-wider">
                  Already have credentials?{" "}
                  <Link
                    to="/login"
                    className="text-[var(--color-accent)] font-bold hover:underline"
                  >
                    Sign_In
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Register;
