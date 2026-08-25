import React from "react";
import { AlertTriangle, ShieldAlert, XCircle, AlertOctagon } from "lucide-react";

const ExamViolationModal = ({
  isOpen,
  violationCount,
  maxViolations = 3,
  violationReason = "Security Violation",
  onDismiss,
}) => {
  if (!isOpen) return null;

  const isTerminated = violationCount >= maxViolations;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="glass-card rounded-2xl max-w-lg w-full p-6 text-center border-2 border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.35)] relative overflow-hidden">
        {/* Top Warning Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse" />

        <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
          {isTerminated ? (
            <XCircle className="w-10 h-10 text-rose-500 animate-bounce" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-rose-400 animate-pulse" />
          )}
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">
          {isTerminated ? "EXAM TERMINATED" : "PROCTORING VIOLATION DETECTED"}
        </h3>

        {/* Highlighted Violation Reason Box */}
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 mb-4 text-sm font-semibold text-rose-200 flex items-center justify-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{violationReason || "Suspicious Activity Detected"}</span>
        </div>

        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          {isTerminated
            ? "You have reached the maximum allowed violation limit (3 strikes). Your assessment has been permanently locked and auto-submitted."
            : "AI Vision & Hardware proctoring detected a compliance breach. Please refocus on your screen and ensure all secondary devices and apps are removed."}
        </p>

        {/* Strike Indicator Badge */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mb-6 flex items-center justify-between px-6">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Penalty Strike Status</span>
          <span className={`text-base font-black font-mono ${isTerminated ? "text-rose-400" : "text-amber-400"}`}>
            STRIKE {violationCount} OF {maxViolations}
          </span>
        </div>

        <button
          onClick={onDismiss}
          className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wider uppercase shadow-xl transition cursor-pointer ${
            isTerminated
              ? "bg-rose-700 hover:bg-rose-600 text-white shadow-rose-900/50"
              : "bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-600/30"
          }`}
        >
          {isTerminated ? "View Assessment Results" : "I Understand & Resume Assessment"}
        </button>
      </div>
    </div>
  );
};

export default ExamViolationModal;
