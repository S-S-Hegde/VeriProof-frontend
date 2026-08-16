import React, { useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import {
  KeyRound,
  ArrowRight,
  TerminalSquare,
  AlertTriangle,
  Loader2,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import api from "../utils/api";
import PasswordStrengthMeter from "../components/auth/PasswordStrengthMeter";

const ResetPassword = () => {
  const { resettoken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState(resettoken || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passphrases do not match. Please verify both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters in length.");
      return;
    }

    const codeToSubmit = (otp || resettoken || "").trim();
    if (!codeToSubmit) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await api.post("/api/users/resetpassword", {
        email,
        otp: codeToSubmit,
        password,
      });

      setMessage(data.message || "Passphrase updated successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Verification code may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-[80vh] flex items-center justify-center pt-24 px-4 bg-[var(--color-bg)]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-accent)] opacity-[0.03] blur-[100px] pointer-events-none" />

      <div className="glass-card max-w-lg w-full p-10 md:p-12 relative z-10 border border-[var(--color-border)] overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-[var(--color-accent)]" />

        <div className="flex justify-center mb-8">
          <ShieldCheck className="w-12 h-12 text-[var(--color-accent)] animate-pulse" />
        </div>

        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-center mb-2">
          Verify &{" "}
          <span className="text-[var(--color-accent)] not-italic">
            Reset.
          </span>
        </h2>
        <p className="text-center font-mono text-xs tracking-widest uppercase opacity-50 mb-10">
          Enter 6-Digit OTP Code & Establish New Password
        </p>

        {message && (
          <div className="p-4 mb-6 bg-green-500/10 border border-green-500/50 text-green-400 text-xs font-mono tracking-widest uppercase text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-mono tracking-widest uppercase text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on" className="space-y-6">
          {!location.state?.email && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--color-accent)] transition-all" />
              </div>
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="IDENTITY@DOMAIN.COM"
                className="w-full bg-black/20 border border-[var(--color-border)] pl-12 pr-4 py-4 focus:border-[var(--color-accent)] outline-none transition-all duration-300 text-sm font-mono tracking-wider focus:bg-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="reset-email" className="absolute -top-3 left-4 px-2 text-[10px] uppercase font-bold tracking-[0.2em] bg-[var(--color-bg)]">
                Email Address
              </label>
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <TerminalSquare className="w-5 h-5 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--color-accent)] transition-all" />
            </div>
            <input
              id="reset-otp"
              name="one-time-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-DIGIT OTP CODE"
              maxLength={6}
              className="w-full bg-black/20 border border-[var(--color-border)] pl-12 pr-4 py-4 focus:border-[var(--color-accent)] outline-none transition-all duration-300 text-base font-mono tracking-[0.3em] font-bold text-[var(--color-accent)] uppercase focus:bg-transparent"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              required
            />
            <label htmlFor="reset-otp" className="absolute -top-3 left-4 px-2 text-[10px] uppercase font-bold tracking-[0.2em] bg-[var(--color-bg)] text-[var(--color-accent)]">
              6-Digit Email Verification Code
            </label>
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="w-5 h-5 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--color-accent)] transition-all" />
              </div>
              <input
                id="reset-passphrase"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full bg-black/20 border border-[var(--color-border)] pl-12 pr-4 py-4 focus:border-[var(--color-accent)] outline-none transition-all duration-300 text-sm font-mono tracking-wider focus:bg-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <label
                htmlFor="reset-passphrase"
                className="absolute -top-3 left-4 px-2 text-[10px] uppercase font-bold tracking-[0.2em] bg-[var(--color-bg)]"
              >
                New Password
              </label>
            </div>
            <PasswordStrengthMeter password={password} />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <KeyRound className="w-5 h-5 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--color-accent)] transition-all" />
            </div>
            <input
              id="confirm-passphrase"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full bg-black/20 border border-[var(--color-border)] pl-12 pr-4 py-4 focus:border-[var(--color-accent)] outline-none transition-all duration-300 text-sm font-mono tracking-wider focus:bg-transparent"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
            <label
              htmlFor="confirm-passphrase"
              className="absolute -top-3 left-4 px-2 text-[10px] uppercase font-bold tracking-[0.2em] bg-[var(--color-bg)]"
            >
              Confirm New Password
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !!message}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all shadow-xl group border border-transparent disabled:opacity-50 mt-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Confirm & Lock Password{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-[var(--color-border)]">
          <Link
            to="/login"
            className="text-xs font-mono uppercase tracking-[0.2em] opacity-60 hover:opacity-100 hover:text-[var(--color-accent)] transition-colors"
          >
            Return to Login Terminal
          </Link>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;
