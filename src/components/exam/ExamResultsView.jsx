import React from "react";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  BarChart3,
  Home,
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
          <h3 className="text-xl font-bold text-white">Grading Technical Assessment...</h3>
          <p className="text-xs text-blue-400 font-mono">Computing Forensic Trust Score &amp; Notifying Recruiter</p>
        </div>
      </div>
    );
  }

  const isPassed =
    result.status === "Passed" ||
    result.status === "Pass" ||
    result.score >= 70;
  const scorePercent =
    result.score !== undefined
      ? result.score
      : Math.round(
          ((result.correctAnswers || 0) / (result.totalQuestions || 35)) * 100,
        );

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="glass-card rounded-2xl p-8 text-center mb-6 shadow-2xl border border-slate-800">
        <div
          className={`inline-block px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-3 border ${
            isPassed
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/20 text-rose-400 border-rose-500/30"
          }`}
        >
          Status: {isPassed ? "Pass / Certified" : "Needs Improvement"}
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-1">
          Assessment Evaluation Result
        </h2>
        <p className="text-slate-400 text-sm">
          Candidate: {candidateName || "Candidate"}
        </p>

        <div className="my-6 py-6 rounded-xl bg-slate-900/60 border border-slate-800 max-w-xs mx-auto shadow-inner">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Overall Score
          </p>
          <h3
            className={`text-5xl font-black my-1 ${isPassed ? "text-blue-400" : "text-amber-400"}`}
          >
            {scorePercent}%
          </h3>
          <p className="text-xs text-slate-400 font-semibold">
            {result.correctAnswers || 0} / {result.totalQuestions || 35} Correct
            Answers
          </p>
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
          <Home className="w-5 h-5" /> Return to Student Dashboard
        </button>
      </div>
      <p className="text-center text-xs font-mono text-slate-500 uppercase tracking-widest mt-4">
        🔒 Single Attempt Policy Enforced &middot; Result Encoded to Recruiter Pipeline
      </p>
    </div>
  );
};

export default ExamResultsView;
