import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, UserCircle, Loader2, ArrowRight, Lock, Mail, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

const IdentityGatewayCard = ({
  role = "student",
  setRole,
  onGoogleAuth,
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
  const [showLegacyForm, setShowLegacyForm] = useState(false);
  const isRecruiter = role === "recruiter";

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Role Selection Tabs */}
      {setRole && (
        <div className="mb-6">
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400 block mb-2 text-center font-semibold">
            Select Terminal Portal
          </label>
          <div className="flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-black/60 border border-slate-300 dark:border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`relative flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                !isRecruiter ? "text-white" : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
              }`}
            >
              {!isRecruiter && (
                <motion.div
                  layoutId="activeRoleTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <UserCircle className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Candidate</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={`relative flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                isRecruiter ? "text-white" : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
              }`}
            >
              {isRecruiter && (
                <motion.div
                  layoutId="activeRoleTab"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <ShieldCheck className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Recruiter</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Glass Terminal Card */}
      <div className="relative p-8 rounded-3xl bg-white dark:bg-[#0c1222]/80 border border-slate-300 dark:border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden transition-colors duration-300">
        {/* Glow halo */}
        <div
          className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[100px] pointer-events-none transition-all duration-700 ${
            isRecruiter ? "bg-emerald-500/10" : "bg-blue-500/10 dark:bg-cyan-500/10"
          }`}
        />

        {/* Mandatory Identity Checkpoint Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 font-semibold">
            <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>MANDATORY_IDENTITY_CHECKPOINT</span>
          </span>
        </div>

        <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white mb-2">
          {mode === "login" ? "Authenticate Identity" : `Initialize ${isRecruiter ? "Recruiter" : "Candidate"} Profile`}
        </h2>
        <p className="text-xs text-slate-600 dark:text-gray-400 font-sans leading-relaxed mb-6">
          Google OAuth is required to verify identity before accessing protected {isRecruiter ? "recruiter" : "candidate"} platform tools.
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono flex items-start gap-2.5"
          >
            <span className="text-red-500 font-bold">⚠</span>
            <span>{error}</span>
          </motion.div>
        )}

        {/* PRIMARY MANDATORY OAUTH BUTTON */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={onGoogleAuth}
            disabled={googleLoading}
            className={`w-full py-4 px-5 rounded-2xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer relative overflow-hidden group ${
              isRecruiter
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-500 dark:via-teal-500 dark:to-emerald-600 text-white dark:text-slate-950 hover:brightness-110"
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-cyan-400 dark:via-blue-500 dark:to-indigo-600 text-white hover:brightness-110"
            }`}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 bg-white rounded-full p-0.5 shadow-sm shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google OAuth</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-xs text-center text-slate-500 dark:text-gray-400 font-mono">
            Verified identity is cryptographically linked to your VeriProof profile.
          </p>
        </div>

        {/* Collapsible Legacy Password Option */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setShowLegacyForm(!showLegacyForm)}
            className="w-full flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 font-semibold"
          >
            <span>Legacy Password Access</span>
            {showLegacyForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showLegacyForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={onPasswordAuth}
                className="space-y-4 pt-4 overflow-hidden"
              >
                {mode === "register" && setName && (
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-1 font-semibold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-1 font-semibold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-1 font-semibold">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === "register" && setConfirmPassword && (
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-1 font-semibold">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                )}

                {mode === "register" && !isRecruiter && setGithubUsername && (
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-1 font-semibold">
                      GitHub Handle
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="github_handle"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white dark:bg-white/10 dark:hover:bg-white/20 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authenticate with Password"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default IdentityGatewayCard;
