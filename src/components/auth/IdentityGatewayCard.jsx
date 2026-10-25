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
  ExternalLink,
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
  serverAwake = true,
}) => {
  const isRecruiter = role === "recruiter";
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Role Selection Tabs — Clean Borderless Architecture */}
      {setRole && (
        <div className="flex border-b border-slate-200 dark:border-gray-800 gap-8 mb-8">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`pb-3 text-xs font-mono uppercase tracking-[0.2em] font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
              !isRecruiter
                ? "text-blue-600 dark:text-cyan-400"
                : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
            }`}
          >
            <UserCircle className="w-4 h-4" />
            <span>Candidate Portal</span>
            {!isRecruiter && (
              <motion.span
                layoutId="activeRoleUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-cyan-400"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setRole("recruiter")}
            className={`pb-3 text-xs font-mono uppercase tracking-[0.2em] font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
              isRecruiter
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Recruiter Terminal</span>
            {isRecruiter && (
              <motion.span
                layoutId="activeRoleUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-600 dark:bg-emerald-400"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        </div>
      )}

      {/* Main Terminal Header — Boxless Typography */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-cyan-400/80 font-semibold">
            <Lock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            <span>MANDATORY_IDENTITY_CHECKPOINT</span>
          </span>
        </div>

        <h2 className="text-3xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white mb-2">
          {mode === "login"
            ? "Authenticate Identity"
            : `Initialize ${isRecruiter ? "Recruiter" : "Candidate"} Profile`}
        </h2>
        <p className="text-xs text-slate-600 dark:text-gray-400 font-sans leading-relaxed">
          Access protected {isRecruiter ? "recruiter" : "candidate"} forensic verification tools via secure OAuth.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3.5 border-l-2 border-red-500 bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-mono flex items-start gap-2.5"
        >
          <span className="text-red-500 font-bold shrink-0">⚠</span>
          <span className="leading-relaxed">{error}</span>
        </motion.div>
      )}

      {/* PRIMARY MANDATORY OAUTH BUTTON */}
      <div className="space-y-3 mb-8">
        <button
          type="button"
          onClick={onGoogleAuth}
          disabled={googleLoading}
          className="w-full py-3 px-5 rounded-none font-mono text-xs uppercase tracking-wider border border-slate-300 dark:border-gray-700 hover:border-slate-500 dark:hover:border-cyan-400 bg-transparent text-slate-900 dark:text-white transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
        {onOpenAuthWindow && (
          <div className="text-center">
            <button
              type="button"
              onClick={onOpenAuthWindow}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-cyan-400 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Popups blocked? Complete OAuth in new window</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Clean Divider */}
      <div className="relative my-8 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-gray-800" />
        </div>
        <span className="relative px-4 bg-stone-50 dark:bg-slate-950 text-[10px] font-mono tracking-widest text-slate-500 dark:text-gray-400 uppercase font-semibold">
          Or With Verified Credentials
        </span>
      </div>

      {/* Full Form — Borderless Bottom-Border Inputs */}
      <form
        method="post"
        autoComplete="on"
        onSubmit={onPasswordAuth}
        className="space-y-6"
      >
        {mode === "register" && setName && (
          <div className="relative">
            <label
              htmlFor="register-fullname"
              className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-1 font-semibold"
            >
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 dark:text-gray-500 mr-2 shrink-0" />
              <input
                id="register-fullname"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-slate-700 focus:border-cyan-400 focus:ring-0 rounded-none px-0 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        <div className="relative">
          <label
            htmlFor={`${mode}-email`}
            className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-1 font-semibold"
          >
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-slate-400 dark:text-gray-500 mr-2 shrink-0" />
            <input
              id={`${mode}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-slate-700 focus:border-cyan-400 focus:ring-0 rounded-none px-0 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-1">
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
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-400 dark:text-gray-500 mr-2 shrink-0" />
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
              className="w-full bg-transparent border-0 border-b border-slate-700 focus:border-cyan-400 focus:ring-0 rounded-none px-0 py-2 pr-8 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-0 top-2 p-1 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Password Strength Meter for Registration */}
          {mode === "register" && (
            <div className="mt-3">
              <PasswordStrengthMeter password={password} />
            </div>
          )}
        </div>

        {mode === "register" && setConfirmPassword && (
          <div className="relative">
            <label
              htmlFor="register-confirm-password"
              className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-1 font-semibold"
            >
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <KeyRound className="w-4 h-4 text-slate-400 dark:text-gray-500 mr-2 shrink-0" />
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-slate-700 focus:border-cyan-400 focus:ring-0 rounded-none px-0 py-2 pr-8 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                className="absolute right-0 top-2 p-1 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {mode === "register" && !isRecruiter && setGithubUsername && (
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="register-github-username"
                className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 font-semibold"
              >
                GitHub Handle <span className="text-[9px] text-slate-400 dark:text-gray-500 font-normal lowercase">(optional)</span>
              </label>
            </div>
            <div className="relative flex items-center">
              <Github className="w-4 h-4 text-slate-400 dark:text-gray-500 mr-2 shrink-0" />
              <input
                id="register-github-username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="octocat"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-slate-700 focus:border-cyan-400 focus:ring-0 rounded-none px-0 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {!serverAwake && (
          <div className="flex items-center gap-2 p-3 border-l-2 border-blue-500 dark:border-cyan-400 bg-blue-500/5 text-slate-700 dark:text-slate-300 text-xs font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 dark:text-cyan-400 shrink-0" />
            <span>Warming up verification backend node (cold start)...</span>
          </div>
        )}

        <button
          type="submit"
          disabled={passwordLoading}
          className={`w-full py-3.5 rounded-none font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isRecruiter
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
          } disabled:opacity-50 mt-4`}
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
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-gray-800 text-center text-xs">
        {mode === "login" ? (
          <p className="text-slate-600 dark:text-gray-400 font-sans">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 ml-1"
            >
              Register here <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        ) : (
          <p className="text-slate-600 dark:text-gray-400 font-sans">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 ml-1"
            >
              Sign In <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default IdentityGatewayCard;
