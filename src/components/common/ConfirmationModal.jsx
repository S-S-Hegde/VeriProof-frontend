import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Lock, Loader2, X, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Destructive Action",
  subtitle = "This action is permanent and cannot be undone.",
  confirmText = "DELETE",
  requirePassword = false,
  requireConfirmText = false,
  confirmButtonText = "Delete Permanently",
  variant = "danger", // 'danger' | 'warning' | 'info'
  progressSteps = [],
  currentStepIndex = -1,
  isProcessing = false,
  error = "",
}) {
  const [password, setPassword] = useState("");
  const [inputConfirmText, setInputConfirmText] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setInputConfirmText("");
      setShowPassword(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || isProcessing) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const isTextValid = !requireConfirmText || inputConfirmText.trim() === confirmText;
  const isPasswordValid = !requirePassword || password.length > 0;
  const canSubmit = isTextValid && isPasswordValid && !isProcessing;

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canSubmit) {
      onConfirm({ password, confirmText: inputConfirmText });
    }
  };

  const variantStyles = {
    danger: {
      accentColor: "border-red-500/50 bg-red-500/10 text-red-400",
      buttonBg: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30",
      badge: "border-red-500/30 bg-red-500/10 text-red-400",
      icon: <Trash2 className="w-6 h-6 text-red-400" />,
    },
    warning: {
      accentColor: "border-amber-500/50 bg-amber-500/10 text-amber-400",
      buttonBg: "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30",
      badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
    },
    info: {
      accentColor: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
      buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30",
      badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
      icon: <ShieldAlert className="w-6 h-6 text-cyan-400" />,
    },
  }[variant];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Top ambient glow */}
          <div className={`absolute -top-16 -left-16 w-32 h-32 rounded-full blur-3xl opacity-30 ${variant === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`} />

          {/* Close button */}
          {!isProcessing && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className={`p-3 rounded-xl border ${variantStyles.badge} shrink-0`}>
              {variantStyles.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
              <p className="mt-1 text-sm text-slate-400 leading-relaxed">{subtitle}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 border border-red-500/40 bg-red-500/10 rounded-xl text-xs text-red-300 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Progress Animation List (During Execution) */}
          {isProcessing && progressSteps.length > 0 ? (
            <div className="my-6 space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Execution Protocol</p>
              {progressSteps.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isDone = idx < currentStepIndex;
                return (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span className={isDone ? "text-slate-400 line-through" : isCurrent ? "text-cyan-300 font-medium" : "text-slate-600"}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Confirm Text Requirement */}
              {requireConfirmText && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Type <span className="font-mono font-bold text-red-400">{confirmText}</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={inputConfirmText}
                    onChange={(e) => setInputConfirmText(e.target.value)}
                    placeholder={confirmText}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 rounded-xl text-sm font-mono text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              )}

              {/* Password Requirement */}
              {requirePassword && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Enter your account password:</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`px-5 py-2.5 text-sm font-medium rounded-xl flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles.buttonBg}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{confirmButtonText}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
