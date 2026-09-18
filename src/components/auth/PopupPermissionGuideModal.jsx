import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Laptop,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const PopupPermissionGuideModal = ({ isOpen, onClose, onContinueRedirect }) => {
  const [activeTab, setActiveTab] = useState("chrome"); // "chrome", "safari", "brave"

  if (!isOpen) return null;

  const currentHost =
    typeof window !== "undefined" ? window.location.host : "localhost:5173";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg rounded-3xl bg-slate-900/95 dark:bg-[#0c1222]/95 border border-slate-700 dark:border-white/10 shadow-2xl p-6 sm:p-7 z-10 text-white overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold block">
                  BROWSER_SECURITY_PROTOCOL
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  How to Allow Popup Windows
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 dark:text-gray-400 mb-5 leading-relaxed relative z-10">
            Modern web browsers block popup windows by default to prevent spam.
            VeriProof uses a secure Google OAuth popup to verify your identity.
            Follow the steps below, or use the instant redirect option.
          </p>

          {/* Browser Selection Tabs */}
          <div className="flex p-1 rounded-xl bg-black/40 border border-white/10 mb-5 relative z-10">
            <button
              type="button"
              onClick={() => setActiveTab("chrome")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "chrome"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Chrome / Edge
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("safari")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "safari"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Safari
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("brave")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "brave"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Brave / Firefox
            </button>
          </div>

          {/* Step Content */}
          <div className="space-y-4 mb-6 relative z-10">
            {activeTab === "chrome" && (
              <div className="space-y-3">
                {/* Mock Address Bar Visual */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-[11px] flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2 overflow-hidden truncate">
                    <span className="text-slate-500">🔒</span>
                    <span className="text-slate-400 truncate">{currentHost}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 bg-red-500/20 border border-red-500/40 text-red-300 px-2 py-0.5 rounded-md animate-pulse">
                    <span>🗔</span>
                    <span className="text-[10px] font-bold">Pop-up blocked</span>
                  </div>
                </div>

                <ol className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>
                      Look at the <strong className="text-white">top-right of your address bar</strong> for the <strong>Pop-up blocked</strong> icon.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>
                      Click the icon and select <strong className="text-cyan-300">"Always allow pop-ups and redirects from {currentHost}"</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>
                      Click <strong className="text-white">Done</strong>, then click <strong>"Continue with Google OAuth"</strong> again.
                    </span>
                  </li>
                </ol>
              </div>
            )}

            {activeTab === "safari" && (
              <ol className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Open <strong className="text-white">Safari</strong> &gt; <strong className="text-white">Settings for This Website</strong> (or Settings &gt; Websites &gt; Pop-up Windows).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    Change Pop-up Windows for <code className="text-cyan-300 font-mono text-[11px]">{currentHost}</code> to <strong className="text-emerald-400">Allow</strong>.
                  </span>
                </li>
              </ol>
            )}

            {activeTab === "brave" && (
              <ol className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Click the <strong className="text-orange-400">Lion Shield icon</strong> or <strong className="text-amber-400">Lock icon</strong> in the address bar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    Under Site Permissions, set <strong className="text-white">Pop-ups and redirects</strong> to <strong className="text-emerald-400">Allow</strong>.
                  </span>
                </li>
              </ol>
            )}
          </div>

          {/* Quick Fallback Action */}
          {onContinueRedirect && (
            <div className="pt-4 border-t border-white/10 relative z-10 flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Don't want to change browser settings?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onContinueRedirect();
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sign In via Redirect (No Popups Required)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PopupPermissionGuideModal;
