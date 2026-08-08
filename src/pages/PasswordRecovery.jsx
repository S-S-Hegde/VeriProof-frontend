import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import {
  Mail,
  ArrowLeft,
  TerminalSquare,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import api from "../utils/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await api.post("/api/users/forgotpassword", { email });
      setMessage(data.message || "A 6-digit verification code has been sent to your email address.");
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error dispatching verification code.");
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
          <TerminalSquare className="w-12 h-12 text-[var(--color-accent)] animate-pulse" />
        </div>

        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-center mb-2">
          Forgot{" "}
          <span className="text-[var(--color-accent)] not-italic">
            Password.
          </span>
        </h2>
        <p className="text-center font-mono text-xs tracking-widest uppercase opacity-50 mb-10">
          Initiate Cryptographic Key Recovery
        </p>

        {message && (
          <div className="p-4 mb-6 bg-green-500/10 border border-green-500/50 text-green-500 text-xs font-mono tracking-widest uppercase text-center flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-mono tracking-widest uppercase text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--color-accent)] transition-all" />
            </div>
            <input
              type="email"
              placeholder="IDENTITY@DOMAIN.COM"
              className="w-full bg-black/20 border border-[var(--color-border)] pl-12 pr-4 py-4 focus:border-[var(--color-accent)] outline-none transition-all duration-300 text-sm font-mono tracking-wider focus:bg-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="absolute -top-3 left-4 px-2 text-[10px] uppercase font-bold tracking-[0.2em] bg-[var(--color-bg)]">
              Primary Comms Address
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all shadow-xl group border border-transparent disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Dispatch Recovery Protocol"
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-8 border-t border-[var(--color-border)]">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-[0.2em] opacity-60 hover:opacity-100 hover:text-[var(--color-accent)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Abort Sequence (Return to Login)
          </Link>
        </div>
      </div>
    </PageTransition>
  );
};

export default ForgotPassword;
