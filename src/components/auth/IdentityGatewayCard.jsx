import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  UserCircle,
  Loader2,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  Github,
  KeyRound,
} from "lucide-react";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

const IdentityGatewayCard = ({
  role = "student",
  setRole,
  onGoogleAuth,
  onGoogleRedirect,
  onOpenAuthWindow,
  googleLoading,
  onPasswordAuth,
  passwordLoading,
  error,
  mode = "login", // "login" or "register"
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  githubUsername,
  setGithubUsername,
  showPassword,
  setShowPassword,
  name,
  setName,
}) => {
  const isRecruiter = role === "recruiter";
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Role Selection Tabs */}
      {setRole && (
        <div className="mb-2.5">
          <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400 block mb-1 text-center font-semibold">
            Select Terminal Portal
          </label>
          <div className="flex p-1 rounded-xl bg-slate-200/80 dark:bg-black/60 border border-slate-300 dark:border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`relative flex-1 py-1.5 px-3 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !isRecruiter
                  ? "text-white"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
              }`}
            >
              {!isRecruiter && (
                <motion.div
                  layoutId="activeRoleTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <UserCircle className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Candidate</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={`relative flex-1 py-1.5 px-3 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isRecruiter
                  ? "text-white"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
              }`}
            >
              {isRecruiter && (
                <motion.div
                  layoutId="activeRoleTab"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg shadow-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <ShieldCheck className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Recruiter</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Glass Terminal Card */}
      <div className="relative p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-[#0c1222]/70 border border-slate-200 dark:border-cyan-500/20 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] overflow-hidden transition-colors duration-300">
        {/* Glow halo */}
        <div
          className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[100px] pointer-events-none transition-all duration-700 ${
            isRecruiter
              ? "bg-emerald-500/10"
              : "bg-blue-500/10 dark:bg-cyan-500/10"
          }`}
        />

        {/* Mandatory Identity Checkpoint Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 font-semibold">
            <Lock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            <span>MANDATORY_IDENTITY_CHECKPOINT</span>
          </span>
        </div>

        <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white mb-0.5">
          {mode === "login"
            ? "Authenticate Identity"
            : `Initialize ${isRecruiter ? "Recruiter" : "Candidate"} Profile`}
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-gray-400 font-sans leading-relaxed mb-3">
          Access protected {isRecruiter ? "recruiter" : "candidate"} forensic verification tools via secure OAuth.
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono flex items-start gap-2 shadow-sm"
          >
            <span className="text-red-500 font-bold shrink-0">⚠</span>
            <span className="leading-relaxed">{error}</span>
          </motion.div>
        )}

        {/* PRIMARY MANDATORY OAUTH BUTTON */}
        <div>
          <button
            type="button"
            onClick={onGoogleAuth}
            disabled={googleLoading}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer relative overflow-hidden group ${
              isRecruiter
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-500 dark:via-teal-500 dark:to-emerald-600 text-white dark:text-slate-950 hover:brightness-110"
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-cyan-400 dark:via-blue-500 dark:to-indigo-600 text-white hover:brightness-110"
            }`}
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5 bg-white rounded-full p-0.5 shadow-sm shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google OAuth</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-2.5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-white/10" />
          </div>
          <span className="relative px-2.5 bg-white dark:bg-[#0c1222] text-[9px] font-mono tracking-widest text-slate-500 dark:text-gray-400 uppercase font-semibold">
            Or With Verified Credentials
          </span>
        </div>

        {/* Full Form */}
        <form
          method="post"
          autoComplete="on"
          onSubmit={onPasswordAuth}
          className="space-y-2"
        >
          {mode === "register" && setName && (
            <div>
              <label
                htmlFor="register-fullname"
                className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-0.5 font-semibold"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="register-fullname"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 text-xs transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor={`${mode}-email`}
              className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-0.5 font-semibold"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-gray-500 pointer-events-none" />
              <input
                id={`${mode}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 text-xs transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label
                htmlFor={`${mode}-password`}
                className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 font-semibold"
              >
                Password
              </label>
              {mode === "login" && (
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 hover:underline tracking-tight"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-gray-500 pointer-events-none" />
              <input
                id={`${mode}-password`}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-9 py-1.5 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 text-xs transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Password Strength Meter for Registration */}
            {mode === "register" && (
              <div className="mt-1">
                <PasswordStrengthMeter password={password} />
              </div>
            )}
          </div>

          {mode === "register" && setConfirmPassword && (
            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-0.5 font-semibold"
              >
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-8 pr-9 py-1.5 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 text-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {mode === "register" && !isRecruiter && setGithubUsername && (
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label
                  htmlFor="register-github-username"
                  className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 font-semibold"
                >
                  GitHub Handle <span className="text-[9px] text-slate-400 dark:text-gray-500 font-normal lowercase">(optional)</span>
                </label>
              </div>
              <div className="relative">
                <Github className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="register-github-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="octocat"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 text-xs transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isRecruiter
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-100"
            } disabled:opacity-50 mt-1`}
          >
            {passwordLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "login" ? (
              "Sign In with Credentials"
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>

        {/* Footer Navigation: Switch between Login & Register */}
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/10 text-center text-[11px]">
          {mode === "login" ? (
            <p className="text-slate-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                Register here <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          ) : (
            <p className="text-slate-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          )}
        </div>
      </div>


    </div>
  );
};

export default IdentityGatewayCard;
