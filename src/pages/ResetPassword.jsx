import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import {
  KeyRound,
  ArrowRight,
  TerminalSquare,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import api from "../utils/api";

const ResetPassword = () => {
  const { resettoken } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passphrases do not match.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await api.put(`/api/users/resetpassword/${resettoken}`, {
        password,
      });
      setMessage(data.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error updating passphrase. Token may be expired.",
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
          <TerminalSquare className="w-12 h-12 text-[var(--color-accent)] animate-pulse" />
        </div>

        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-center mb-2">
          New{" "}
          <span className="text-[var(--color-accent)] not-italic">
            Passphrase.
          </span>
        </h2>
        <p className="text-center font-mono text-xs tracking-widest uppercase opacity-50 mb-10">
          Establish New Cryptographic Key
        </p>

        {message && (
          <div className="p-4 mb-6 bg-green-500/10 border border-green-500/50 text-green-500 text-xs font-mono tracking-widest uppercase text-center flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {message} Redirecting to login...
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-mono tracking-widest uppercase text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <KeyRound className="w-5 h-5 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--color-accent)] transition-all" />
            </div>
            <input
              id="reset-passphrase"
              type="password"
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
              New Passphrase
            </label>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <KeyRound className="w-5 h-5 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--color-accent)] transition-all" />
            </div>
            <input
              id="confirm-passphrase"
              type="password"
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
              Verify Passphrase
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !!message}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all shadow-xl group border border-transparent disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Lock Passphrase{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;
