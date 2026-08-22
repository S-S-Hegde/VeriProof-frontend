import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ShieldCheck, KeyRound, Loader2, AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const LinkedInIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6c0-.88-.72-1.6-1.6-1.6Z" />
  </svg>
);

const RecruiterCompanyOnboardingModal = ({ isOpen, onClose, onVerified }) => {
  const { user, setUser } = useAuth();

  const [step, setStep] = useState(() => {
    if (user?.recruiterVerificationStatus === "COMPANY_EMAIL_VERIFICATION_PENDING") return 2;
    return 1;
  });

  const [linkedinUsername, setLinkedinUsername] = useState(
    user?.linkedinUsername || user?.linkedinUrl || ""
  );
  const [companyEmail, setCompanyEmail] = useState(
    user?.companyEmail || user?.email || ""
  );
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanLinkedin = linkedinUsername.trim();
    if (!cleanLinkedin) {
      setError("Please enter your LinkedIn username or profile URL.");
      return;
    }

    const cleanEmail = companyEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address to receive the verification code.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/users/recruiter/company-info", {
        linkedinUsername: cleanLinkedin,
        linkedinUrl: cleanLinkedin.startsWith("http")
          ? cleanLinkedin
          : `https://www.linkedin.com/in/${cleanLinkedin.replace(/^@/, "")}`,
        companyEmail: cleanEmail,
      });

      setUser((prev) => ({
        ...prev,
        linkedinUsername: data.linkedinUsername,
        linkedinUrl: data.linkedinUrl,
        companyEmail: data.companyEmail,
        recruiterVerificationStatus: data.recruiterVerificationStatus,
      }));

      setSuccessMsg(data.message || `Verification code sent to ${cleanEmail}`);
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send LinkedIn verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/users/recruiter/verify-company-email", {
        otp: otp.trim(),
      });

      setUser((prev) => ({
        ...prev,
        companyEmailVerified: true,
        linkedinVerified: true,
        recruiterVerificationStatus: data.recruiterVerificationStatus,
      }));

      setSuccessMsg("LinkedIn identity verified successfully! Redirecting...");
      setTimeout(() => {
        if (onVerified) onVerified();
        if (onClose) onClose();
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid verification code. Please check the code sent to your email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md p-7 sm:p-8 rounded-3xl bg-[#0c1222] border border-cyan-500/20 text-white shadow-2xl relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-600/15 blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/10 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-[#0a66c2]/15 border border-[#0a66c2]/40 flex items-center justify-center text-[#0a66c2] shadow-inner">
            <LinkedInIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight uppercase italic text-white flex items-center gap-2">
              Recruiter Verification
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              Step {step} of 2 &mdash; {step === 1 ? "LinkedIn Account" : "Confirm Security Code"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5 flex items-center justify-between">
                <span>LinkedIn Username or URL</span>
                <span className="text-[10px] text-gray-500 lowercase">e.g. linkedin.com/in/username</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-[#0a66c2]">
                  <LinkedInIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. shrishail-hegde or linkedin.com/in/..."
                  value={linkedinUsername}
                  onChange={(e) => setLinkedinUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#0a66c2] text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5 flex items-center justify-between">
                <span>LinkedIn Connected Email</span>
                <span className="text-[10px] text-cyan-400 font-mono">OTP will be sent here</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="your-email@domain.com"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm transition-colors"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 font-sans leading-relaxed">
                Enter your email connected to your professional LinkedIn account to receive the 6-digit access code.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0a66c2] to-cyan-500 hover:from-[#004182] hover:to-cyan-400 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-lg mt-5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Profile &amp; Send Code</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit} className="space-y-5 relative z-10">
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-gray-300">
                <span className="text-gray-400">Recipient Email:</span>
                <span className="text-cyan-300 font-bold">{companyEmail}</span>
              </div>
              <div className="flex items-center justify-between text-gray-300 border-t border-cyan-500/10 pt-2">
                <span className="text-gray-400">LinkedIn Profile:</span>
                <span className="text-white font-bold">
                  @{linkedinUsername.replace(/^https?:\/\//i, "").replace(/^(www\.)?linkedin\.com\/(in\/)?/i, "").replace(/\/.*$/, "").replace(/^@/, "") || "recruiter"}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-mono text-center">
              Please enter the 6-digit access code sent to your inbox to authenticate this profile.
            </p>

            <div>
              <div className="relative">
                <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-cyan-400" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/70 border border-cyan-500/40 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 text-center font-mono text-3xl tracking-[0.35em] font-black shadow-inner"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="w-1/3 py-3 px-4 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs uppercase font-mono tracking-wider transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-2/3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-lg"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Confirm &amp; Access
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default RecruiterCompanyOnboardingModal;

