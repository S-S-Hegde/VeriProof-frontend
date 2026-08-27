import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, Clock, HelpCircle, Sparkles, Send, X, ShieldCheck } from "lucide-react";

export default function AssessmentConfigModal({
  isOpen,
  onClose,
  onConfirm,
  jobTitle = "Software Engineering Role",
  candidateCount = 1,
  isProcessing = false,
}) {
  const [mode, setMode] = useState("default"); // "default" | "custom"
  const [questionCount, setQuestionCount] = useState(40);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [jdPercentage, setJdPercentage] = useState(70);

  if (!isOpen) return null;

  const currentQuestions = mode === "default" ? 40 : questionCount;
  const currentDuration = mode === "default" ? 45 : durationMinutes;
  const currentJdPercent = mode === "default" ? 70 : jdPercentage;

  const jdQuestions = Math.round(currentQuestions * (currentJdPercent / 100));
  const resumeQuestions = currentQuestions - jdQuestions;

  const handleApply = () => {
    onConfirm({
      questionCount: currentQuestions,
      durationMinutes: currentDuration,
      jdRatio: currentJdPercent / 100,
      resumeRatio: (100 - currentJdPercent) / 100,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="vp-glass w-full max-w-xl p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-2xl space-y-6 relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-5 right-5 text-[var(--color-muted)] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] uppercase tracking-wider mb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Assessment Calibration &amp; Invites</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white">
              Assessment <span className="text-[var(--color-accent)] not-italic">Configuration</span>
            </h2>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Set exam structure and time limits for <strong className="text-white">{candidateCount} candidate(s)</strong> applying to <strong className="text-[var(--color-accent)]">{jobTitle}</strong> before invites are sent.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-3 p-1 rounded-[var(--radius-lg)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setMode("default")}
              className={`py-2.5 px-3 rounded-[var(--radius-md)] text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 ${
                mode === "default"
                  ? "bg-[var(--color-accent)] text-black shadow-lg"
                  : "text-[var(--color-muted)] hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>System Default (40 Qs / 70-30)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("custom")}
              className={`py-2.5 px-3 rounded-[var(--radius-md)] text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 ${
                mode === "custom"
                  ? "bg-[var(--color-accent)] text-black shadow-lg"
                  : "text-[var(--color-muted)] hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Custom Manual Setup</span>
            </button>
          </div>

          {/* Mode Details */}
          {mode === "default" ? (
            <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-bg-sunken)]/60 border border-[var(--color-border)] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--color-muted)]">Standard Question Load:</span>
                <span className="font-bold text-white">40 Questions</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--color-muted)]">Assessment Timer:</span>
                <span className="font-bold text-white">45 Minutes</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--color-muted)]">Competency Balance:</span>
                <span className="font-bold text-emerald-400">70% Job Description (28 Qs) &bull; 30% Resume (12 Qs)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--color-muted)]">Difficulty Calibration:</span>
                <span className="font-bold text-sky-400">Easy &amp; Medium Practical Questions</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 rounded-[var(--radius-xl)] bg-[var(--color-bg-sunken)]/60 border border-[var(--color-border)]">
              {/* Question Count Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--color-muted)]">Number of Questions:</span>
                  <span className="font-bold text-[var(--color-accent)] text-sm">{questionCount} Questions</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--color-accent)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[var(--color-muted)]">
                  <span>10 (Quick)</span>
                  <span>40 (Recommended)</span>
                  <span>60 (In-Depth)</span>
                </div>
              </div>

              {/* Timer Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--color-muted)]">Timer / Duration Limit:</span>
                  <span className="font-bold text-[var(--color-accent)] text-sm">{durationMinutes} Minutes</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--color-accent)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[var(--color-muted)]">
                  <span>15 Mins</span>
                  <span>45 Mins</span>
                  <span>90 Mins</span>
                </div>
              </div>

              {/* JD vs Resume Ratio Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--color-muted)]">Competency Distribution:</span>
                  <span className="font-bold text-emerald-400 text-xs">
                    {jdPercentage}% JD ({jdQuestions} Qs) / {100 - jdPercentage}% Resume ({resumeQuestions} Qs)
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={jdPercentage}
                  onChange={(e) => setJdPercentage(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[var(--color-muted)]">
                  <span>50/50 Equal</span>
                  <span>70/30 (Standard)</span>
                  <span>90/10 Role-Heavy</span>
                </div>
              </div>
            </div>
          )}

          {/* Live Blueprint Summary Badge */}
          <div className="flex items-center gap-2 p-3 rounded-[var(--radius-lg)] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              Configured: <strong>{currentQuestions} Questions</strong> ({jdQuestions} JD Core + {resumeQuestions} Resume) &bull; <strong>{currentDuration} Mins</strong> &bull; Proctored
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="vp-btn vp-btn-secondary text-xs px-4 py-2.5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing}
              className="vp-btn vp-btn-accent text-xs px-6 py-2.5 gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply &amp; Dispatch Invites ({candidateCount})</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
