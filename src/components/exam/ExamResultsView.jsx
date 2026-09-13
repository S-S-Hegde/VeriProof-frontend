import React from "react";
import {
  CheckCircle2,
  XCircle,
  Award,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Home,
  Check,
  Activity,
  Zap,
  Target
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
        <div className="my-6 py-6 rounded-xl bg-slate-900/60 border border-slate-800 max-w-md mx-auto shadow-inner px-4">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            {result.isAdaptive ? "Adaptive Composite Rank Score" : "Overall Score"}
          </p>
          <h3
            className={`text-5xl font-black my-2 ${
              isTerminated ? "text-rose-500" : isPassed ? "text-blue-400" : "text-amber-400"
            }`}
          >
            {result.isAdaptive ? result.adaptiveRankScore : scorePercent}%
          </h3>
          <p className="text-xs text-slate-400 font-semibold">
            {result.correctAnswers || 0} / {result.totalQuestions || 35} Correct Answers
          </p>
          
          {result.isAdaptive && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-4">
              <div className="flex flex-col items-center">
                <span className="text-slate-500 uppercase tracking-wider mb-1">Calibration (Part 1)</span>
                <span className="text-lg font-bold text-slate-300">{result.calibrationScore}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-500 uppercase tracking-wider mb-1">Adaptive (Part 2)</span>
                <span className="text-lg font-bold text-indigo-400">{result.adaptiveScore}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Adaptive Skill DNA Insights (If Adaptive) */}
        {result.isAdaptive && result.candidateDNA && result.candidateDNA.length > 0 && (
          <div className="p-5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 mb-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Adaptive Skill DNA Breakdown
              </span>
              <span className="text-xs font-mono font-bold text-indigo-200">
                Consistency Index: {result.consistencyIndex}%
              </span>
            </div>
            
            <div className="space-y-3">
              {result.candidateDNA.map((dna, idx) => (
                <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-200 text-sm">{dna.skill}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${dna.trueLevel === 'Expert' ? 'bg-indigo-500/20 text-indigo-300' : dna.trueLevel === 'Advanced' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}`}>
                      {dna.trueLevel}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${dna.calibrationAccuracy}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Calibration: {Math.round(dna.calibrationAccuracy)}%</span>
                    {dna.trapCapped && (
                      <span className="flex items-center gap-1 text-rose-400"><AlertTriangle className="w-3 h-3" /> Trap Penalty</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
            <div className="flex items-center gap-3">
              {result.isAdaptive && (
                <span className={`text-xs font-mono font-bold ${result.trustScore >= 70 ? "text-blue-400" : "text-amber-400"}`}>
                  Trust Score: {result.trustScore}%
                </span>
              )}
              <span className={`text-xs font-mono font-bold ${integrityScore >= 75 ? "text-emerald-400" : "text-rose-400"}`}>
                Integrity Score: {integrityScore}%
              </span>
            </div>
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
