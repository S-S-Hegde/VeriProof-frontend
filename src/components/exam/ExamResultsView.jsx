import React from "react";
import {
  CheckCircle2,
  XCircle,
  Award,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Home,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const ExamResultsView = ({ result, candidateName, onReset }) => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleReturnToDashboard = async () => {
    try {
      const { data } = await api.get("/api/users/profile");
      if (data && data.workflowState) {
        setUser((prev) => ({
          ...prev,
          resumeStatus: data.resumeStatus,
          workflowState: data.workflowState,
        }));
      }
    } catch (err) {
      console.error("Profile sync error:", err);
    } finally {
      navigate("/student-dashboard");
    }
  };

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="glass-card rounded-2xl p-10 shadow-2xl border border-slate-800 space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <h3 className="text-xl font-bold text-white">Grading Technical Assessment & Verifying Proctoring Integrity...</h3>
          <p className="text-xs text-blue-400 font-mono">Transmitting Telemetry Strikes to Recruiter Pipeline</p>
        </div>
      </div>
    );
  }

  const isTerminated = result.disqualified || result.isTerminated || result.status === "Terminated";
  const isPassed = !isTerminated && (result.status === "Passed" || result.status === "Pass" || result.score >= 70);
  const scorePercent = result.score !== undefined ? result.score : 0;
  const integrityScore = result.integrityScore !== undefined ? result.integrityScore : (isTerminated ? 0 : Math.max(0, 100 - ((result.violationCount || 0) * 25)));
  const violationCount = result.violationCount || (isTerminated ? 3 : 0);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="glass-card rounded-2xl p-8 text-center mb-6 shadow-2xl border border-slate-800 relative">
        <div
          className={`inline-block px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-3 border ${
            isTerminated
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
              : isPassed
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
          }`}
        >
          Status: {isTerminated ? "Disqualified / Terminated" : isPassed ? "Pass / Certified" : "Needs Improvement"}
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-1">
          Assessment Evaluation Result
        </h2>
        <p className="text-slate-400 text-sm">
          Candidate: {candidateName || "Candidate"}
        </p>

        {/* Overall Score */}
        <div className="my-6 py-6 rounded-xl bg-slate-900/60 border border-slate-800 max-w-xs mx-auto shadow-inner">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Overall Score
          </p>
          <h3
            className={`text-5xl font-black my-1 ${
              isTerminated ? "text-rose-500" : isPassed ? "text-blue-400" : "text-amber-400"
            }`}
          >
            {scorePercent}%
          </h3>
          <p className="text-xs text-slate-400 font-semibold">
            {result.correctAnswers || 0} / {result.totalQuestions || 35} Correct Answers
          </p>
        </div>

        {/* Proctoring & Integrity Summary Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-6 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              {violationCount === 0 ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              )}
              AI Proctoring Integrity Audit
            </span>
            <span className={`text-xs font-mono font-bold ${integrityScore >= 75 ? "text-emerald-400" : "text-rose-400"}`}>
              Integrity Score: {integrityScore}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mt-3">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Penalty Strikes</span>
              <strong className={`font-mono text-sm ${violationCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {violationCount} / 3 Strikes
              </strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Compliance Status</span>
              <strong className={`font-mono text-sm ${isTerminated ? "text-rose-400" : "text-emerald-400"}`}>
                {isTerminated ? "Flagged Disqualified" : "Verified Authentic"}
              </strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs">
          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
            <span className="text-slate-400 block">Attempted</span>
            <strong className="text-slate-200 text-sm font-bold">
              {result.answeredQuestions || result.totalQuestions || 35}
            </strong>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-emerald-400 block">Correct</span>
            <strong className="text-emerald-300 text-sm font-bold">
              {result.correctAnswers || 0}
            </strong>
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <span className="text-rose-400 block">Wrong</span>
            <strong className="text-rose-300 text-sm font-bold">
              {(result.totalQuestions || 35) - (result.correctAnswers || 0)}
            </strong>
          </div>
        </div>
      </div>

      {result.certificate && (
        <div className="glass-card rounded-2xl p-6 mb-6 border border-emerald-500/40 bg-emerald-500/5 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {result.certificate.title}
              </h4>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                Credential ID: {result.certificate.credentialId}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            Verified
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center items-center">
        <button
          onClick={handleReturnToDashboard}
          className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm transition flex items-center gap-2 shadow-xl shadow-blue-600/30 border border-blue-400/30 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to Candidate Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default ExamResultsView;
