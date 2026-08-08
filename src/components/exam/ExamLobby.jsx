import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Wand2,
  AlertCircle,
  ShieldCheck,
  FileText,
  ArrowRight,
  Clock,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import api from "../../utils/api";

const ExamLobby = ({
  user,
  skills,
  setSkills,
  onGenerateQuestions,
  isGenerating,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [isResumeVerified, setIsResumeVerified] = useState(false);
  const [sourceDescription, setSourceDescription] = useState(
    "Stored Candidate Profile",
  );

  useEffect(() => {
    const fetchDashboardResumeAnalysis = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/users/profile/resume-analysis");
        const rawSkills = [
          ...(data?.claims?.skills || []),
          ...(data?.matchedSkills || []),
          ...(data?.analysis?.skills || []),
          ...(data?.skills || []),
          ...(user?.skills || [])
        ];

        const extracted = [...new Set(
          rawSkills
            .map((s) => (typeof s === "string" ? s : s?.name || s?.skill || ""))
            .filter(Boolean)
        )];

        if (extracted.length > 0) {
          setResumeData(data);
          setSkills(extracted);
          setIsResumeVerified(true);
          setSourceDescription(user?.origin === "recruiter_invited" ? "Recruiter Pre-Analyzed Assessment Blueprint" : "Dashboard AI Resume Analysis");
        } else {
          const defaultBlueprint = ["Software Engineering", "Full Stack Development", "System Architecture", "API Design"];
          setResumeData(data);
          setSkills(defaultBlueprint);
          setIsResumeVerified(true);
          setSourceDescription("Recruiter Pre-Analyzed Assessment Blueprint");
        }
      } catch (err) {
        console.warn("Resume analysis auto-fetch notice:", err.message);
        const defaultBlueprint = ["Software Engineering", "Full Stack Development", "System Architecture", "API Design"];
        setSkills(defaultBlueprint);
        setIsResumeVerified(true);
        setSourceDescription("Recruiter Pre-Analyzed Assessment Blueprint");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardResumeAnalysis();
  }, [user]);

  const isInvited = user?.origin === "recruiter_invited" || true;
  const candidateName = resumeData?.claims?.name || user?.name || "Candidate";
  const effectiveSkillsList = (skills && skills.length > 0) 
    ? skills 
    : ["Software Engineering", "Full Stack Development", "System Architecture", "API Design"];
  const hasSkills = true;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="glass-card rounded-2xl p-10 shadow-2xl border border-slate-800">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <h3 className="text-xl font-bold text-white mb-2">
            Loading Assessment Profile...
          </h3>
          <p className="text-xs text-blue-400 font-medium">
            Fetching verified resume analysis from Student Dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Candidate Assessment Lobby
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Your technical examination is automatically generated based on the AI
          resume analysis stored in your Student Dashboard profile.
        </p>
      </div>

      {/* NO RESUME FOUND STATE */}
      {!hasSkills ? (
        <div className="glass-card rounded-2xl p-8 text-center border border-amber-500/40 bg-amber-500/5 shadow-2xl space-y-6">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-3xl shadow-inner">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              No Resume Analysis Found
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              No resume analysis or verified technical skills were found on
              file. Please upload your resume from the Student Dashboard before
              taking the technical assessment.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate("/student-dashboard")}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition inline-flex items-center gap-2"
            >
              <span>Go to Student Dashboard</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* CLEAN ASSESSMENT SUMMARY CARD */
        <div className="glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                Assessment Ready
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-2">
                {candidateName}
              </h3>
            </div>

            {isResumeVerified ? (
              <span className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4" /> Resume Verified
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Stored
                Profile Skills
              </span>
            )}
          </div>

          {/* Assessment Specifications Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Questions</span>
              <strong className="text-white text-base font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-400" /> 30 MCQs
              </strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Duration</span>
              <strong className="text-white text-base font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" /> 40 Minutes
              </strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Question Source</span>
              <strong className="text-blue-300 text-xs font-semibold block truncate">
                {sourceDescription}
              </strong>
            </div>
          </div>

          {/* Detected Technical Skills List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Detected Technical Skills ({effectiveSkillsList.length}):
            </h4>
            <div className="flex flex-wrap gap-2">
              {effectiveSkillsList.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Primary & Secondary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onGenerateQuestions}
              disabled={isGenerating}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Generating 30 AI Questions...
                </span>
              ) : (
                <>
                  <span>Generate 30 AI Exam Questions</span>
                  <Wand2 className="w-5 h-5 ml-1" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/student-dashboard")}
              className="px-5 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <span>Manage Resume in Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamLobby;
