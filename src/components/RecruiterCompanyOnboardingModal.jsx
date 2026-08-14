import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Globe, Mail, ShieldCheck, KeyRound, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "ymail.com", "outlook.com",
  "hotmail.com", "live.com", "msn.com", "icloud.com", "me.com", "mac.com",
  "aol.com", "zoho.com", "protonmail.com", "proton.me", "gmx.com", "mail.com"
]);

const extractDomain = (str) => {
  if (!str) return "";
  let clean = str.trim().toLowerCase();
  clean = clean.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].split(":")[0];
  return clean;
};

const RecruiterCompanyOnboardingModal = ({ isOpen, onClose, onVerified }) => {
  const { user, setUser } = useAuth();

  const [step, setStep] = useState(() => {
    if (user?.recruiterVerificationStatus === "COMPANY_EMAIL_VERIFICATION_PENDING") return 2;
    return 1; // Step 1: Company Details
  });

  const [companyName, setCompanyName]       = useState(user?.companyName || "");
  const [companyWebsite, setCompanyWebsite] = useState(user?.companyWebsite || "");
  const [companyEmail, setCompanyEmail]     = useState(user?.companyEmail || "");
  const [otp, setOtp]                       = useState("");

  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [successMsg, setSuccessMsg]         = useState("");

  if (!isOpen) return null;

  const validateDetails = () => {
    if (!companyName.trim()) return "Company name is required.";
    if (!companyWebsite.trim()) return "Company website URL is required.";
    if (!companyEmail.trim()) return "Company email address is required.";

    const emailDomain = companyEmail.trim().toLowerCase().split("@")[1] || "";
    const websiteDomain = extractDomain(companyWebsite);

    if (PUBLIC_EMAIL_DOMAINS.has(emailDomain)) {
      return `Public email providers (@${emailDomain}) are not accepted for company verification. Please use a professional domain email.`;
    }

    const isMatch = emailDomain === websiteDomain ||
      emailDomain.endsWith("." + websiteDomain) ||
      websiteDomain.endsWith("." + emailDomain);

    if (!isMatch) {
      return `Domain mismatch: Company email domain (@${emailDomain}) does not match company website domain (${websiteDomain}).`;
    }

    return null;
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");

    const valErr = validateDetails();
    if (valErr) {
      setError(valErr);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/users/recruiter/company-info", {
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim(),
        companyEmail: companyEmail.trim(),
      });

      setUser((prev) => ({
        ...prev,
        companyName: data.companyName,
        companyWebsite: data.companyWebsite,
        companyEmail: data.companyEmail,
        recruiterVerificationStatus: data.recruiterVerificationStatus,
      }));

      setSuccessMsg(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit company details. Please try again.");
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

    setError(""); setSuccessMsg("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/users/recruiter/verify-company-email", {
        otp: otp.trim(),
      });

      setUser((prev) => ({
        ...prev,
        companyEmailVerified: true,
        recruiterVerificationStatus: data.recruiterVerificationStatus,
      }));

      setSuccessMsg(data.message);
      setTimeout(() => {
        if (onVerified) onVerified();
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please check your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg p-8 rounded-2xl bg-[var(--color-bg,#0a0e1a)] border border-[var(--color-border,#1e293b)] text-white shadow-2xl relative"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border,#1e293b)]">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold italic tracking-tight uppercase">Recruiter Identity Verification</h2>
            <p className="text-xs text-gray-400 font-mono">
              Step {step} of 2 &mdash; {step === 1 ? "Company Profile & Domain" : "Company Domain Email Verification"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Company / Organization Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-accent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Company Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="url"
                  required
                  placeholder="https://techcorp.com"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-accent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Professional Company Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="recruiter@techcorp.com"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1 font-mono">
                Must match company website domain. Public domains (@gmail, @yahoo, etc.) rejected.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-accent text-white font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              Submit &amp; Send Verification Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <p className="text-xs text-gray-300 leading-relaxed">
              We sent a 6-digit verification code to <strong className="text-accent">{companyEmail}</strong>. Please enter the code below to verify control of this company domain.
            </p>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                6-Digit Domain Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-accent text-center font-mono text-xl tracking-widest"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setError(""); setStep(1); }}
                className="w-1/3 py-3 px-4 rounded-xl border border-gray-800 text-gray-400 hover:text-white text-xs uppercase font-mono tracking-wider"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 px-4 rounded-xl bg-accent text-white font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Verify Company Email
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default RecruiterCompanyOnboardingModal;
