import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  X,
  Sparkles,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";
import { testPopupPermission } from "../../config/firebase";

/**
 * Browser-style permission prompt component mimicking native browser
 * permission requests (like Camera & Geolocation).
 */
const BrowserPermissionPrompt = ({
  onPermissionGranted,
  onUseRedirect,
  forceShow = false,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("idle"); // "idle", "testing", "granted", "blocked"
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.host);
      // Only show when specifically requested (e.g. when popup is blocked)
      if (forceShow) {
        setVisible(true);
        setStatus("blocked");
      }
    }
  }, [forceShow]);

  const handleAllowClick = () => {
    setStatus("testing");
    const res = testPopupPermission();
    if (res.allowed) {
      setStatus("granted");
      localStorage.setItem("veriproof_popup_pref", "allowed");
      if (onPermissionGranted) onPermissionGranted();
      setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 1600);
    } else {
      setStatus("blocked");
      localStorage.setItem("veriproof_popup_pref", "blocked");
    }
  };

  const handleUseRedirectClick = () => {
    localStorage.setItem("veriproof_popup_pref", "redirect");
    setVisible(false);
    if (onUseRedirect) onUseRedirect();
    if (onClose) onClose();
  };

  const handleDismiss = () => {
    localStorage.setItem("veriproof_popup_pref", "dismissed");
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed top-4 left-4 sm:left-6 z-50 w-full max-w-sm sm:max-w-md shadow-2xl rounded-2xl bg-white dark:bg-[#0c1324] border border-slate-300 dark:border-cyan-500/30 text-slate-900 dark:text-white p-4 sm:p-5 backdrop-blur-2xl transition-all"
        style={{
          boxShadow:
            "0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 20px 2px rgba(6, 182, 212, 0.15)",
        }}
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-t-2xl" />

        {/* Browser Permission Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[200px] sm:max-w-[260px]">
                <span>{origin || "Identity Gateway"}</span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded">
                  HTTPS
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-gray-200">
                wants to:
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Permission Request Description */}
        <div className="flex items-start gap-3 my-3 p-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 text-base">
            🗔
          </div>
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
              Open popup windows
            </span>
            <span className="text-slate-600 dark:text-gray-400 text-[11px]">
              Required to authenticate your Google Account securely through OAuth without losing active page state.
            </span>
          </div>
        </div>

        {/* Live Status Feedback */}
        {status === "granted" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Popup windows permitted! Ready for Google Sign-In.</span>
          </motion.div>
        )}

        {status === "blocked" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex flex-col gap-2"
          >
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <strong className="block font-bold">Pop-up blocked by browser</strong>
                <span className="text-[11px] leading-tight text-slate-700 dark:text-amber-200/80">
                  Look at the <strong>top-right of your address bar</strong> for the 🗔 icon and select <em>"Always allow pop-ups"</em>, then click below to complete authentication:
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setVisible(false);
                if (onClose) onClose();
                if (onPermissionGranted) onPermissionGranted();
              }}
              className="mt-1 w-full py-2 px-3 rounded-lg bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>I've Allowed Popups — Try Sign-In</span>
            </button>
          </motion.div>
        )}

        {/* Primary Action Buttons */}
        {status !== "granted" && status !== "blocked" && (
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleDismiss}
              className="py-2 px-3 text-xs font-bold text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAllowClick}
              className="py-2 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-500 text-white dark:text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Allow Popups</span>
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default BrowserPermissionPrompt;
