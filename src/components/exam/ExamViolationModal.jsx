import React from "react";
import { AlertTriangle } from "lucide-react";

const ExamViolationModal = ({
  isOpen,
  violationCount,
  maxViolations = 3,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const isTerminated = violationCount >= maxViolations;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-card rounded-2xl max-w-md w-full p-6 text-center border border-rose-500/50 shadow-2xl animate-pulse">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>

        <h3 className="text-xl font-extrabold text-white mb-2">
          {isTerminated ? "Exam Terminated (Limit Exceeded)" : "Proctoring Violation Warning"}
        </h3>

        <p className="text-xs text-rose-300 mb-4 leading-relaxed">
          {isTerminated
            ? "3 or more security violations / cheating attempts were detected. Your assessment has been automatically terminated and submitted."
            : "Exiting fullscreen, switching tabs/windows, or attempting restricted key shortcuts is strictly prohibited during the proctored assessment."}
        </p>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mb-6 text-xs text-slate-300">
          Violation Count:{" "}
          <strong className={isTerminated ? "text-rose-400 font-bold" : "text-amber-400 font-bold"}>
            {violationCount} / {maxViolations}
          </strong>
        </div>

        <button
          onClick={onDismiss}
          className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition ${
            isTerminated
              ? "bg-rose-700 hover:bg-rose-600 text-white"
              : "bg-rose-600 hover:bg-rose-500 text-white"
          }`}
        >
          {isTerminated ? "View Assessment Results" : "I Understand & Resume Assessment"}
        </button>
      </div>
    </div>
  );
};

export default ExamViolationModal;
