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
  Sliders,
  Sparkles,
} from "lucide-react";
import api from "../../utils/api";

const QUESTION_CONFIGS = [
  { count: 10, duration: 15, label: "10 MCQs", desc: "Quick Diagnostic (15 Mins)" },
  { count: 20, duration: 25, label: "20 MCQs", desc: "Standard Assessment (25 Mins)" },
  { count: 35, duration: 40, label: "35 MCQs", desc: "Full Comprehensive (40 Mins)" },
  { count: 50, duration: 60, label: "50 MCQs", desc: "Deep Technical Mastery (60 Mins)" },
];

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
  const [hasSkills, setHasSkills] = useState(false);
  const [sourceDescription, setSourceDescription] = useState("Stored Candidate Profile");
  const [selectedConfig, setSelectedConfig] = useState(QUESTION_CONFIGS[2]); // Default 35 MCQs

  const isInvited = user?.origin === "recruiter_invited";

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
        ];

        const extracted = [...new Set(
          rawSkills
            .map((s) => (typeof s === "string" ? s : s?.name || s?.skill || ""))
            .filter(Boolean)
        )];

        if (isInvited) {
          // Recruiter invited candidate
          setResumeData(data);
          setSkills(extracted.length > 0 ? extracted : ["Software Engineering", "Full Stack Development", "API Design", "Databases"]);
          setIsResumeVerified(true);
          setHasSkills(true);
          setSourceDescription("Recruiter Pre-Analyzed Assessment Blueprint");
        } else {
          // Self-registered candidate: strictly require completed resume analysis
          if (data && data.status === "Analysis Complete" && extracted.length > 0) {
            setResumeData(data);
            setSkills(extracted);
            setIsResumeVerified(true);
            setHasSkills(true);
            setSourceDescription("Dashboard AI Resume Analysis");
          } else {
            setResumeData(data);
            setSkills([]);
            setIsResumeVerified(false);
            setHasSkills(false);
            setSourceDescription("Awaiting Resume Analysis");
          }
        }
      } catch (err) {
        console.warn("Resume analysis auto-fetch notice:", err.message);
        if (isInvited) {
          const defaultBlueprint = ["Software Engineering", "Full Stack Development", "System Architecture", "API Design"];
          setSkills(defaultBlueprint);
          setIsResumeVerified(true);
          setHasSkills(true);
          setSourceDescription("Recruiter Pre-Analyzed Assessment Blueprint");
        } else {
          setSkills([]);
          setIsResumeVerified(false);
          setHasSkills(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardResumeAnalysis();
  }, [user, isInvited, setSkills]);

  const candidateName = resumeData?.claims?.name || user?.name || "Candidate";
  const effectiveSkillsList = skills || [];

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
        <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight mb-2">
          Candidate Assessment Lobby
        </h2>
        <p className="text-[var(--color-text-secondary)] text-sm max-w-xl mx-auto">
          Your technical examination is automatically synthesized based on the AI
          resume analysis stored in your candidate profile.
        </p>
      </div>

      {/* NO RESUME FOUND / ANALYSIS REQUIRED GATE */}
      {!hasSkills ? (
        <div className="glass-card rounded-2xl p-8 text-center border border-amber-500/40 bg-amber-500/5 shadow-2xl space-y-6">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-3xl shadow-inner">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              Resume Analysis Required
            </span>
            <h3 className="text-xl font-bold text-[var(--color-text)] mt-3 mb-2">
              Missing Verified Resume Skills
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
              Technical assessment questions are dynamically tailored to your verified resume skills. You have not uploaded or analyzed your resume yet. Please upload your resume first to unlock your personalized examination.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/resume-upload")}
              className="px-6 py-3 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-sm shadow-lg transition inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Go to Resume Upload Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/student-dashboard")}
              className="px-5 py-3 rounded-xl bg-[var(--color-bg-sunken)] hover:bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] font-semibold text-xs transition border border-[var(--color-border)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      ) : (
        /* ASSESSMENT SUMMARY CARD */
        <div className="glass-card rounded-2xl p-8 border border-[var(--color-border)] bg-[var(--color-surface-card)] shadow-xl space-y-6">
          <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-[var(--color-border)]">
            <div>
              <span className="px-3 py-1 rounded-md bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/30 text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider">
                Assessment Ready
              </span>
              <h3 className="text-2xl font-extrabold text-[var(--color-text)] mt-2">
                {candidateName}
              </h3>
            </div>

            {isResumeVerified ? (
              <span className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4" /> Resume Verified
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-amber-500" /> Stored Profile Skills
              </span>
            )}
          </div>

          {/* Assessment Specifications Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--color-bg-raised)] border border-[var(--color-border)]">
              <span className="text-[var(--color-muted)] block mb-1">Questions</span>
              <strong className="text-[var(--color-text)] text-base font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[var(--color-accent)]" />{" "}
                {isInvited ? 35 : selectedConfig.count} MCQs
              </strong>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--color-bg-raised)] border border-[var(--color-border)]">
              <span className="text-[var(--color-muted)] block mb-1">Duration</span>
              <strong className="text-[var(--color-text)] text-base font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />{" "}
                {isInvited ? 40 : selectedConfig.duration} Minutes
              </strong>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--color-bg-raised)] border border-[var(--color-border)]">
              <span className="text-[var(--color-muted)] block mb-1">Question Source</span>
              <strong className="text-[var(--color-accent)] text-xs font-semibold block truncate">
                {sourceDescription}
              </strong>
            </div>
          </div>

          {/* QUESTION COUNT SELECTOR (Only for self-registered candidates) */}
          {!isInvited && (
            <div className="p-4 rounded-xl bg-[var(--color-bg-sunken)] border border-[var(--color-border)] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Choose Assessment Length
                </label>
                <span className="text-[11px] font-mono text-[var(--color-accent)]">
                  {selectedConfig.desc}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QUESTION_CONFIGS.map((cfg) => {
                  const isSelected = selectedConfig.count === cfg.count;
                  return (
                    <button
                      key={cfg.count}
                      type="button"
                      onClick={() => setSelectedConfig(cfg)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md scale-[1.02]"
                          : "bg-[var(--color-surface-card)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
                      }`}
                    >
                      <p className="text-xs font-black">{cfg.count} Questions</p>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? "text-white/80" : "text-[var(--color-muted)]"}`}>
                        {cfg.duration} Mins
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detected Technical Skills List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] mb-3">
              Detected Technical Skills ({effectiveSkillsList.length}):
            </h4>
            <div className="flex flex-wrap gap-2">
              {effectiveSkillsList.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-border)] text-xs font-semibold flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"></span>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Primary & Secondary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onGenerateQuestions(isInvited ? 35 : selectedConfig.count, isInvited ? 40 : selectedConfig.duration)}
              disabled={isGenerating}
              className="flex-1 py-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-base shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Generating {isInvited ? 35 : selectedConfig.count} AI Questions...
                </span>
              ) : (
                <>
                  <span>Generate {isInvited ? 35 : selectedConfig.count} AI Exam Questions</span>
                  <Wand2 className="w-5 h-5 ml-1" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/student-dashboard")}
              className="px-5 py-4 rounded-xl bg-[var(--color-bg-sunken)] hover:bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] font-semibold text-xs transition border border-[var(--color-border)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Manage Resume in Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-[var(--color-muted)]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamLobby;
