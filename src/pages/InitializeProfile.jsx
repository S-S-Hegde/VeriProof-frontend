import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ChevronLeft, Github, ArrowRight, Loader2, SkipForward, ShieldAlert } from "lucide-react";
import api from "../utils/api";
import { persistUserSession } from "../utils/authStorage";
import RecruiterCompanyOnboardingModal from "../components/RecruiterCompanyOnboardingModal";
import RoleSelectionDeck from "../components/auth/RoleSelectionDeck";
import AuthShell from "../components/auth/AuthShell";
import IdentityGatewayCard from "../components/auth/IdentityGatewayCard";
import BrowserPermissionPrompt from "../components/auth/BrowserPermissionPrompt";

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [githubUsername, setGithubUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [forceShowPrompt, setForceShowPrompt] = useState(false);

  // Post-OAuth GitHub username collection state
  const [pendingOAuthData, setPendingOAuthData] = useState(null); // holds user data after Google OAuth
  const [githubStep, setGithubStep] = useState(false);            // shows GitHub username prompt
  const [githubSaving, setGithubSaving] = useState(false);

  const {
    setUser,
    loginWithGoogle,
    loginWithGoogleRedirect,
    authLoading,
    redirectProcessing,
    oauthError,
  } = useAuth();
  useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If returning from an auth redirect or pending state, resume on Step 2
    const pendingStr = localStorage.getItem("veriproof_auth_pending");
    if (pendingStr) {
      try {
        const parsed = JSON.parse(pendingStr);
        if (parsed.role) setRole(parsed.role);
        setStep(2);
      } catch (e) {}
    }

    const params = new URLSearchParams(location.search);
    const qEmail = params.get("email");
    const qRole = params.get("role");
    if (qEmail) {
      setEmail(qEmail);
      if (qRole) setRole(qRole);
      setStep(2);
    }
  }, [location]);

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    setError("");
    setStep(2);
  };

  const handleBackNavigation = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setGithubUsername("");
    setError("");
    setStep(1);
  };

  const handleGoogleRedirect = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogleRedirect(role);
    } catch (err) {
      console.error("[Google Registration Redirect Error]:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Google registration redirect failed to initiate.";
      setError(msg);
      setGoogleLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const data = await loginWithGoogle(role);
      if (!data) {
        // OAuth redirect was initiated or waiting
        return;
      }

      if (
        data.role === "recruiter" &&
        data.recruiterVerificationStatus &&
        data.recruiterVerificationStatus !== "COMPANY_EMAIL_VERIFIED"
      ) {
        setUser(data);
        persistUserSession(data);
        setShowCompanyModal(true);
        return;
      }

      // ── For candidates: collect GitHub username if missing ──
      if (data.role === "student" && !data.githubUsername) {
        setPendingOAuthData(data);
        setGithubStep(true);
        return;
      }

      setUser(data);
      persistUserSession(data);
      navigate(data.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard");
    } catch (err) {
      console.error("[Google Registration Error]:", err);
      const isPopupBlocked =
        err.isPopupBlocked ||
        (typeof err.message === "string" &&
          (err.message.toLowerCase().includes("popup was blocked") ||
            err.message.toLowerCase().includes("popup-blocked")));

      if (isPopupBlocked) {
        setForceShowPrompt(true);
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Google registration failed. Please check your credentials or try email sign up."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Save GitHub username to backend after OAuth ──────────────────────────
  const handleSaveGithub = async () => {
    if (!pendingOAuthData) return;
    setGithubSaving(true);
    setError("");
    try {
      if (githubUsername.trim()) {
        await api.post(
          "/api/users/profile",
          { githubUsername: githubUsername.trim() },
          { headers: { Authorization: `Bearer ${pendingOAuthData.token}` } }
        );
      }
      const updatedUser = { ...pendingOAuthData, githubUsername: githubUsername.trim() };
      setUser(updatedUser);
      persistUserSession(updatedUser);
      navigate("/dashboard");
    } catch {
      // Even if saving fails, proceed to dashboard — username can be added in Settings
      setUser(pendingOAuthData);
      persistUserSession(pendingOAuthData);
      navigate("/dashboard");
    } finally {
      setGithubSaving(false);
    }
  };

  const handleSkipGithub = () => {
    if (!pendingOAuthData) return;
    setUser(pendingOAuthData);
    persistUserSession(pendingOAuthData);
    navigate("/dashboard");
  };

  const submitHandler = async (e) => {
    if (e) e.preventDefault();

    // Read directly from form DOM elements in case browser autofill didn't trigger React onChange
    let submittedName = name;
    let submittedEmail = email;
    let submittedPassword = password;
    let submittedConfirmPassword = confirmPassword;
    let submittedGithub = githubUsername;

    if (e?.target && e.target instanceof HTMLFormElement) {
      const fd = new FormData(e.target);
      submittedName = fd.get("name") ?? name;
      submittedEmail = fd.get("email") ?? email;
      submittedPassword = fd.get("password") ?? password;
      submittedConfirmPassword = fd.get("confirmPassword") ?? confirmPassword;
      submittedGithub = fd.get("username") ?? githubUsername;
    }

    submittedName = String(submittedName || "").trim();
    submittedEmail = String(submittedEmail || "").trim().toLowerCase();
    submittedPassword = String(submittedPassword || "");
    submittedConfirmPassword = String(submittedConfirmPassword || "");
    submittedGithub = String(submittedGithub || "").trim();

    if (!submittedEmail || !submittedPassword) {
      setError("Please provide an email address and password.");
      return;
    }

    if (submittedPassword !== submittedConfirmPassword) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    if (submittedPassword.length < 6) {
      setError("Password must be at least 6 characters in length.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/users", {
        name: submittedName || "Candidate",
        email: submittedEmail,
        password: submittedPassword,
        role,
        githubUsername: role === "student" ? submittedGithub : "",
      });
      setUser(data);
      persistUserSession(data);
      if (
        data.role === "recruiter" &&
        data.recruiterVerificationStatus &&
        data.recruiterVerificationStatus !== "COMPANY_EMAIL_VERIFIED"
      ) {
        setShowCompanyModal(true);
        return;
      }
      navigate(data.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] relative">
      {/* Fullscreen loading overlay while redirect OAuth is being processed. */}
      {redirectProcessing && (
        <div className="fixed inset-0 z-[200] bg-[#070a14] flex flex-col items-center justify-center text-white">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 animate-pulse mb-2">
                Completing Google Sign-In...
              </p>
              <p className="text-[11px] font-mono text-gray-500">
                Waking backend server — this may take up to 30 seconds
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Browser Permission Prompt for Google OAuth Popups */}
      <BrowserPermissionPrompt
        forceShow={forceShowPrompt}
        onClose={() => setForceShowPrompt(false)}
        onUseRedirect={handleGoogleRedirect}
        onPermissionGranted={() => setError("")}
      />

      <RecruiterCompanyOnboardingModal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        onVerified={() => {
          navigate("/recruiter-dashboard");
        }}
      />

      {/* ── Post-Google-OAuth: GitHub Username Collection Step ── */}
      {githubStep ? (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="w-full max-w-md">
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1222]/90 border border-slate-300 dark:border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 font-semibold">
                  <Github className="w-3.5 h-3.5 text-cyan-400" />
                  REPOSITORY_INTELLIGENCE_SETUP
                </span>
              </div>

              <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white mb-2">
                Add GitHub Handle
              </h2>
              <p className="text-xs text-slate-600 dark:text-gray-400 font-sans leading-relaxed mb-6">
                VeriProof automatically analyzes your top public repositories to build your verified skill profile.
                Add your GitHub username to activate repository intelligence.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono">
                  ⚠ {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="oauth-github-username" className="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-1 font-semibold">
                    GitHub Username
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
                    <input
                      id="oauth-github-username"
                      type="text"
                      autoComplete="username"
                      placeholder="octocat"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveGithub(); }}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-cyan-400 text-xs transition-colors"
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] font-mono text-slate-500 dark:text-gray-500">
                    Your GitHub profile URL: github.com/<strong className="text-cyan-400">{githubUsername || "username"}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveGithub}
                  disabled={githubSaving}
                  className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-100 disabled:opacity-50"
                >
                  {githubSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Continue to Dashboard</>}
                </button>

                <button
                  type="button"
                  onClick={handleSkipGithub}
                  className="w-full text-center text-[11px] font-mono text-gray-500 hover:text-gray-300 uppercase tracking-wider flex items-center justify-center gap-1.5 mt-1"
                >
                  <SkipForward className="w-3 h-3" /> Skip for now (add later in Settings)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : step === 1 ? (
        <div className="py-8 px-4">
          {(oauthError || error) && (
            <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3 shadow-lg">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-amber-300 mb-1 uppercase font-mono tracking-wider">
                  Authentication Notice
                </p>
                <p className="text-slate-300 dark:text-gray-300 leading-relaxed">
                  {oauthError || error}
                </p>
              </div>
            </div>
          )}
          <RoleSelectionDeck onSelectRole={handleRoleSelection} />
        </div>
      ) : (
        <AuthShell role={role} mode="register" step={step}>
          <div className="w-full max-w-md mx-auto">
            <button
              type="button"
              onClick={handleBackNavigation}
              className="flex items-center gap-2 mb-6 text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Role Selection
            </button>

            <IdentityGatewayCard
              role={role}
              setRole={setRole}
              onGoogleAuth={handleGoogleRegister}
              onGoogleRedirect={handleGoogleRedirect}
              googleLoading={googleLoading || authLoading}
              onPasswordAuth={submitHandler}
              passwordLoading={loading}
              error={oauthError || error}
              mode="register"
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              githubUsername={githubUsername}
              setGithubUsername={setGithubUsername}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </div>
        </AuthShell>
      )}
    </div>
  );
};

export default Register;
