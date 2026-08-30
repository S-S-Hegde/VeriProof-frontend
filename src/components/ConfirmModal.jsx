import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

/**
 * ConfirmModal — High-performance forensic confirmation modal
 * Replaces native browser alert/confirm popups with a sleek cyberpunk glass design.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this action?",
  subtitle,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  const variantStyles = {
    danger: {
      icon: Trash2,
      accentBorder: "border-red-500/30",
      accentBg: "bg-red-500/10",
      accentText: "text-red-400",
      btnBg: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
    },
    warning: {
      icon: AlertTriangle,
      accentBorder: "border-amber-500/30",
      accentBg: "bg-amber-500/10",
      accentText: "text-amber-400",
      btnBg: "bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-lg shadow-amber-500/20",
    },
    info: {
      icon: AlertTriangle,
      accentBorder: "border-[var(--color-accent)]/30",
      accentBg: "bg-[var(--color-accent)]/10",
      accentText: "text-[var(--color-accent)]",
      btnBg: "vp-btn-accent",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;
  const IconComponent = currentVariant.icon;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !loading && onClose()}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full max-w-md rounded-[var(--radius-2xl)] border ${currentVariant.accentBorder} bg-[var(--color-bg)] p-6 sm:p-7 shadow-2xl z-10 overflow-hidden vp-glass`}
          >
            {/* Header / Close button */}
            <button
              onClick={() => !loading && onClose()}
              disabled={loading}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-sunken)] transition-colors disabled:opacity-40 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon & Title Block */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`p-3 rounded-[var(--radius-xl)] ${currentVariant.accentBg} ${currentVariant.accentText} border ${currentVariant.accentBorder} shrink-0`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="pt-0.5">
                <p className="vp-label-accent text-[10px] tracking-[0.2em] mb-1">
                  SYSTEM_CONFIRMATION
                </p>
                <h3 className="text-lg font-black italic uppercase tracking-tight text-[var(--color-text)]">
                  {title}
                </h3>
              </div>
            </div>

            {/* Body Message */}
            <div className="space-y-2 mb-6">
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                {message}
              </p>
              {subtitle && (
                <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-sunken)]/60 border border-[var(--color-border)] text-xs font-mono text-[var(--color-text)]">
                  {subtitle}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--color-border)]/60">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text)] transition-all disabled:opacity-40 cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`px-5 py-2.5 rounded-[var(--radius-md)] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer ${currentVariant.btnBg}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{confirmText}</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
