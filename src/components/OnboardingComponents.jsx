import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { resolveFileUrl } from "../utils/fileUrl";
import {
  Upload, FileText, CheckCircle, Clock, AlertCircle, XCircle,
  GitBranch, Shield, Award, ChevronRight, Loader2, Eye,
  Camera, User, Github, Sparkles, Lock, ArrowRight,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   VeriProof Onboarding Components
   Candidate verification journey UI
   ═══════════════════════════════════════════════════ */

// ─── Verification Progress Pipeline ─────────────────────────
const PIPELINE_STEPS = [
  { id: "resume",     label: "Upload Resume",        icon: Upload,    xp: 40  },
  { id: "analysis",   label: "Resume Analysis",      icon: FileText,  xp: 60  },
  { id: "repo",       label: "Repository Analysis",  icon: GitBranch, xp: 80  },
  { id: "assessment", label: "Technical Assessment",  icon: Shield,    xp: 120 },
  { id: "verified",   label: "Verification Complete", icon: Award,     xp: 200 },
];

const getStepStatus = (stepId, workflowState) => {
  if (!workflowState) return "locked";
  switch (stepId) {
    case "resume":
      return workflowState.hasResume ? "complete" : "active";
    case "analysis":
      if (!workflowState.hasResume) return "locked";
      return workflowState.isResumeAnalyzed ? "complete" : "active";
    case "repo":
      if (!workflowState.isResumeAnalyzed) return "locked";
      return workflowState.hasRepoAnalysis ? "complete" : "active";
    case "assessment":
      if (!workflowState.hasRepoAnalysis) return "locked";
      return workflowState.hasExamPassed ? "complete" : "active";
    case "verified":
      if (!workflowState.hasExamPassed) return "locked";
      return (workflowState.isVerificationComplete || workflowState.hasVerificationRequest || workflowState.hasExamPassed) ? "complete" : "active";
    default:
      return "locked";
  }
};

const PREREQUISITES = {
  resume: "Step 1: Upload candidate resume",
  analysis: "Complete resume upload to unlock automated claim extraction",
  repo: "Complete resume analysis to unlock repository intelligence",
  assessment: "Complete repository analysis to unlock technical assessments",
  verified: "Pass technical assessments to unlock final verification report",
};

export const VerificationPipeline = ({ workflowState, githubAnalysisState, onStepClick }) => {
  const completedCount = PIPELINE_STEPS.filter(
    (s) => getStepStatus(s.id, workflowState) === "complete"
  ).length;
  const progressPercent = Math.round((completedCount / PIPELINE_STEPS.length) * 100);

  const isGitHubRunning = githubAnalysisState?.status === "running";

  return (
    <div className="vp-surface-1 p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-40" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="vp-label-accent">Verification_Pipeline</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            Verification <span className="text-[var(--color-accent)] not-italic">Journey.</span>
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="vp-label">{completedCount}/{PIPELINE_STEPS.length} Complete</span>
          <div className="w-28 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {PIPELINE_STEPS.map((step, i) => {
          const status = getStepStatus(step.id, workflowState);
          const Icon = step.icon;
          const prerequisiteHint = PREREQUISITES[step.id];

          // Live GitHub analysis state on the repo step
          const isRepoStepRunning = step.id === "repo" && isGitHubRunning;
          const reposProcessed = githubAnalysisState?.reposProcessed || 0;
          const totalRepos = githubAnalysisState?.totalRepos || 3;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => {
                if (onStepClick) {
                  onStepClick(step.id);
                }
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              title={status === "locked" ? `Locked: ${prerequisiteHint}` : `Navigate to ${step.label}`}
              className={`flex items-center gap-4 p-3.5 sm:p-4 rounded-[var(--radius-md)] cursor-pointer transition-all duration-300 relative group ${
                status === "complete"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  : status === "active"
                  ? isRepoStepRunning
                    ? "bg-blue-500/10 border-2 border-blue-400/60 shadow-md shadow-blue-500/10"
                    : "bg-[var(--color-accent)]/15 border-2 border-[var(--color-accent)] shadow-md shadow-[var(--color-accent)]/10"
                  : "bg-[var(--color-bg-sunken)] border border-[var(--color-border)]/60 opacity-50 hover:opacity-80"
              }`}
            >
              {/* Status icon */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                status === "complete"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : status === "active"
                  ? isRepoStepRunning
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-[var(--color-accent)] text-white shadow-sm"
                  : "bg-[var(--color-border)] text-[var(--color-muted)]"
              }`}>
                {status === "complete" ? (
                  <CheckCircle className="w-4.5 h-4.5" />
                ) : status === "active" ? (
                  isRepoStepRunning ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <div className="relative flex items-center justify-center">
                      <Icon className="w-4 h-4 z-10" />
                      <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-30" />
                    </div>
                  )
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Step info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-bold uppercase tracking-[0.12em] truncate ${
                    status === "complete" ? "text-emerald-400" : status === "active" ? "text-[var(--color-text)] font-extrabold" : "text-[var(--color-muted)]"
                  }`}>
                    {step.label}
                  </p>
                  {status === "active" && !isRepoStepRunning && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent)]"></span>
                    </span>
                  )}
                </div>
                <p className={`text-[10px] font-mono tracking-wider mt-0.5 ${
                  status === "complete"
                    ? "text-emerald-500/80"
                    : status === "active"
                    ? isRepoStepRunning
                      ? "text-blue-300"
                      : "text-[var(--color-accent)] font-bold"
                    : "text-[var(--color-muted)] opacity-70"
                }`}>
                  {status === "complete"
                    ? "Completed Stage"
                    : status === "active"
                    ? isRepoStepRunning
                      ? `Analyzing repo ${reposProcessed}/${totalRepos} — AI processing...`
                      : "Current Active Step • Click to Action"
                    : `Locked: ${prerequisiteHint}`}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {status === "complete" ? (
                  <span className="text-[9px] font-mono tracking-wider px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-sm font-bold">
                    Completed • +{step.xp} XP
                  </span>
                ) : status === "active" ? (
                  isRepoStepRunning ? (
                    <span className="text-[9px] font-mono tracking-wider px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-sm font-bold">
                      {reposProcessed}/{totalRepos} Repos
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono tracking-wider px-2.5 py-1 bg-[var(--color-accent)] text-white rounded-sm font-bold animate-pulse">
                      Active Step
                    </span>
                  )
                ) : (
                  <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 bg-[var(--color-border)] text-[var(--color-muted)] rounded-sm">
                    Locked
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};


// ─── Resume Upload Card ─────────────────────────────────────
const RESUME_STATUS_MAP = {
  "Pending Evaluation": { label: "Under Analysis", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Clock },
  "Verified":          { label: "Successfully Analyzed", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle },
  "Rejected":          { label: "Needs Re-upload", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle },
};

export const ResumeUploadCard = ({ resumeUrl, resumeStatus, onUploadComplete, analysisState }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const hasResume = !!resumeUrl;
  const statusInfo = RESUME_STATUS_MAP[resumeStatus] || null;

  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    // Validate file type
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowed.includes(file.type)) {
      setError("Invalid file type. Please upload PDF, DOCX, or TXT.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const { data } = await api.post("/api/users/profile/resume-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (onUploadComplete) {
        onUploadComplete(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  // ─── Resume under analysis / processing status ───
  const isAnalyzing = hasResume && (resumeStatus === "Pending Evaluation" || 
    (analysisState && ["Queued", "Parsing", "Extracting Information", "Updating Skill Tree"].includes(analysisState.status)));

  if (isAnalyzing) {
    const progress = analysisState?.progress || 10;
    const stage = analysisState?.stage || "Initializing resume analysis pipeline...";
    const estRemaining = analysisState?.estimatedRemainingStage || "Calculating...";

    return (
      <div className="vp-surface-1 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-60" />

        <div className="flex items-center gap-2 mb-6">
          <Loader2 className="w-4 h-4 text-[var(--color-accent)] animate-spin" />
          <span className="vp-label-accent">Analysis_In_Progress</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-3">
          Analyzing Your <span className="text-[var(--color-accent)]">Resume.</span>
        </h3>

        <p className="text-sm text-[var(--color-muted)] mb-6 max-w-lg leading-relaxed">
          VeriProof is parsing your resume to identify claimed skills, projects, and education. 
          This establishes your Candidate Claim Repository which will later be verified using evidence.
        </p>

        {/* Progress Bar & Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-end text-xs font-mono">
            <span className="text-[var(--color-accent)] uppercase tracking-wider">{stage}</span>
            <span className="opacity-70 font-bold">{progress}%</span>
          </div>

          <div className="w-full h-3 bg-[var(--color-border)] rounded-full overflow-hidden border border-[var(--color-border)]">
            <motion.div
              className="h-full bg-[var(--color-accent)] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono opacity-50 uppercase tracking-widest pt-2">
            <span>Est. Remaining: {estRemaining}</span>
            <span>Status: {analysisState?.status || "Processing"}</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Resume already uploaded ───
  if (hasResume) {
    const StatusIcon = statusInfo?.icon || AlertCircle;
    return (
      <div className="vp-surface-1 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-30" />

        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="vp-label-accent">Resume_Status</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Status */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center ${statusInfo?.bg || "bg-[var(--color-accent-subtle)]"}`}>
                <StatusIcon className={`w-5 h-5 ${statusInfo?.color || "text-[var(--color-accent)]"}`} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">
                  {statusInfo?.label || resumeStatus}
                </p>
                <p className="vp-label mt-0.5">Resume on file</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {resumeUrl && (
                <a
                  href={resolveFileUrl(resumeUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="vp-btn vp-btn-secondary text-[10px] py-2 px-4 gap-1.5"
                >
                  <Eye className="w-3 h-3" /> View_Resume
                </a>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="vp-btn vp-btn-secondary text-[10px] py-2 px-4 gap-1.5"
              >
                <Upload className="w-3 h-3" /> Replace_Resume
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleUpload(e.target.files?.[0])}
                className="hidden"
                accept=".pdf,.docx,.txt"
              />
            </div>
          </div>

          {/* XP placeholder */}
          <div className="flex items-start">
            <span className="text-[9px] font-mono tracking-wider px-2.5 py-1 bg-green-500/10 text-green-500 rounded-sm">
              +40 XP Earned
            </span>
          </div>
        </div>

        {uploading && (
          <div className="mt-4 flex items-center gap-3 text-[var(--color-accent)]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="vp-label">Replacing resume...</span>
          </div>
        )}
      </div>
    );
  }

  // ─── No resume — upload prompt ───
  return (
    <div className="vp-surface-1 p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-60" />

      <div className="flex items-center gap-2 mb-2">
        <Upload className="w-4 h-4 text-[var(--color-accent)]" />
        <span className="vp-label-accent">Action_Required</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-3">
        Upload Your <span className="text-[var(--color-accent)]">Resume.</span>
      </h3>

      <p className="text-sm text-[var(--color-muted)] mb-6 max-w-lg leading-relaxed">
        Your resume is the foundation of your verification journey. We extract your skills,
        education, and experience to build your verified candidate profile and unlock
        Repository Analysis, Technical Assessments, and more.
      </p>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full border-2 border-dashed rounded-[var(--radius-md)] p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/8 scale-[1.01]"
            : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/3"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleUpload(e.target.files?.[0])}
          className="hidden"
          accept=".pdf,.docx,.txt"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-accent)]" />
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-accent)]">
              Uploading...
            </p>
          </div>
        ) : (
          <>
            <Upload className={`w-10 h-10 mb-4 transition-colors ${
              dragActive ? "text-[var(--color-accent)]" : "text-[var(--color-muted)] opacity-40"
            }`} />
            <p className="text-sm font-bold uppercase tracking-widest mb-1">
              {dragActive ? "Drop to Upload" : "Drag & Drop or Click"}
            </p>
            <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">
              PDF • DOC • DOCX • TXT (Max 5MB)
            </p>
          </>
        )}
      </div>

      {/* XP teaser */}
      <div className="flex items-center gap-2 mt-4">
        <Sparkles className="w-3 h-3 text-[var(--color-accent)] opacity-60" />
        <span className="text-[10px] font-mono tracking-wider text-[var(--color-muted)]">
          Reward: +40 XP
        </span>
      </div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-[var(--radius-md)]"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* What it unlocks */}
      <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
        <p className="vp-label mb-3">Uploading your resume unlocks:</p>
        <div className="flex flex-wrap gap-2">
          {["Resume Analysis", "Skill Extraction", "Repository Analysis", "Technical Assessment"].map((item) => (
            <span key={item} className="vp-tag">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Resume Status Card (Read-Only) ────────────────────────
export const ResumeStatusCard = ({ resumeUrl, resumeStatus, analysisState, user, onOpenUploadModal }) => {
  const navigate = useNavigate();
  const isInvited = user?.origin === "recruiter_invited";
  const hasResume = !!resumeUrl || isInvited || ["Analyzed", "Verified", "Pending Evaluation"].includes(resumeStatus) || user?.workflowState?.hasResume;
  const statusInfo = RESUME_STATUS_MAP[resumeStatus] || null;

  // ─── Resume under analysis / processing status ───
  const isAnalyzing = !isInvited && hasResume && (resumeStatus === "Pending Evaluation" || 
    (analysisState && ["Queued", "Parsing", "Extracting Information", "Updating Skill Tree"].includes(analysisState.status)));

  if (isAnalyzing) {
    const progress = analysisState?.progress || 10;
    const stage = analysisState?.stage || "Initializing resume analysis pipeline...";
    const estRemaining = analysisState?.estimatedRemainingStage || "Calculating...";

    return (
      <div className="vp-surface-1 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-60" />

        <div className="flex items-center gap-2 mb-6">
          <Loader2 className="w-4 h-4 text-[var(--color-accent)] animate-spin" />
          <span className="vp-label-accent">Analysis_In_Progress</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-3">
          Analyzing Your <span className="text-[var(--color-accent)]">Resume.</span>
        </h3>

        <p className="text-sm text-[var(--color-muted)] mb-6 max-w-lg leading-relaxed">
          VeriProof is parsing your resume to identify claimed skills, projects, and education. 
          This establishes your Candidate Claim Repository which will later be verified using evidence.
        </p>

        {/* Progress Bar & Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-end text-xs font-mono">
            <span className="text-[var(--color-accent)] uppercase tracking-wider">{stage}</span>
            <span className="opacity-70 font-bold">{progress}%</span>
          </div>

          <div className="w-full h-3 bg-[var(--color-border)] rounded-full overflow-hidden border border-[var(--color-border)]">
            <motion.div
              className="h-full bg-[var(--color-accent)] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono opacity-50 uppercase tracking-widest pt-2">
            <span>Est. Remaining: {estRemaining}</span>
            <span>Status: {analysisState?.status || "Processing"}</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Resume already uploaded or Recruiter Invited ───
  if (hasResume) {
    const isAssessmentCompleted = user?.pipelineStage === "verification_complete" || user?.examStatus === "Attended" || user?.examStatus === "Completed";
    const StatusIcon = isInvited ? CheckCircle : (statusInfo?.icon || CheckCircle);
    const effectiveResumeUrl = resumeUrl || user?.resumeUrl || "/uploads/candidate-resumes/verified_resume.pdf";

    return (
      <div className="vp-surface-1 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-30" />

        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="vp-label-accent">{isInvited ? "RECRUITER_INVITED_PROFILE" : "Resume_Status"}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Status */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center ${isInvited ? "bg-emerald-500/10" : (statusInfo?.bg || "bg-emerald-500/10")}`}>
                <StatusIcon className={`w-5 h-5 ${isInvited ? "text-emerald-400" : (statusInfo?.color || "text-emerald-400")}`} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">
                  {isInvited ? "Pre-Verified Candidate Profile" : (statusInfo?.label || (resumeStatus === "Not Submitted" ? "Resume on File" : resumeStatus))}
                </p>
                <p className="vp-label mt-0.5">
                  {isInvited ? "Uploaded & pre-analyzed by recruiter during intake" : "Verified candidate resume on file"}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {isAssessmentCompleted ? (
                <button
                  type="button"
                  disabled
                  className="vp-btn vp-btn-secondary text-[10px] py-2 px-4 gap-1.5 opacity-80 cursor-not-allowed border border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Assessment Completed (Single Attempt)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/exams")}
                  className="vp-btn vp-btn-accent text-[10px] py-2 px-4 gap-1.5 cursor-pointer shadow-md"
                >
                  <Shield className="w-3 h-3" /> Attend Technical Assessment
                </button>
              )}

              <a
                href={resolveFileUrl(effectiveResumeUrl)}
                target="_blank"
                rel="noreferrer"
                className="vp-btn vp-btn-secondary text-[10px] py-2 px-4 gap-1.5 hover:text-[var(--color-accent)]"
              >
                <Eye className="w-3 h-3 text-cyan-400" /> View_Resume
              </a>

              {onOpenUploadModal && (
                <button
                  type="button"
                  onClick={onOpenUploadModal}
                  className="vp-btn vp-btn-secondary text-[10px] py-2 px-4 gap-1.5 opacity-75 hover:opacity-100 cursor-pointer"
                >
                  <Upload className="w-3 h-3" /> Upload New Version
                </button>
              )}
            </div>
          </div>

          {/* XP badge */}
          <div className="flex items-start">
            <span className="text-[9px] font-mono tracking-wider px-2.5 py-1 bg-green-500/10 text-green-500 rounded-sm">
              +100 XP Pre-Verified
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ─── No resume ───
  return (
    <div className="vp-surface-1 p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-60" />

      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4 text-[var(--color-accent)]" />
        <span className="vp-label-accent">Action_Required</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-3">
        Missing <span className="text-[var(--color-accent)]">Resume.</span>
      </h3>

      <p className="text-sm text-[var(--color-muted)] mb-6 max-w-lg leading-relaxed">
        Your verified candidate profile cannot be built without a resume. Click below to open the Resume Upload modal.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onOpenUploadModal ? onOpenUploadModal() : navigate("/resume-upload")}
          className="vp-btn vp-btn-accent text-xs py-3 px-6 gap-2 cursor-pointer shadow-md"
        >
          <Upload className="w-4 h-4" /> Go to Resume Upload Page
        </button>
      </div>
    </div>
  );
};

// ─── Profile Completion Card ────────────────────────────────
export const ProfileCompletionCard = ({ user, resumeUrl, profileImage }) => {
  const navigate = useNavigate();

  const isResumeDone = Boolean(
    resumeUrl ||
    user?.resumeUrl ||
    user?.origin === "recruiter_invited" ||
    user?.resumeStatus === "Analyzed" ||
    user?.resumeStatus === "Verified" ||
    user?.workflowState?.hasResume ||
    user?.workflowState?.isResumeAnalyzed
  );

  const items = [
    {
      label: "Profile Picture",
      status: profileImage ? "complete" : "pending",
      required: false,
      action: () => navigate("/settings"),
      icon: Camera,
    },
    {
      label: "Resume",
      status: isResumeDone ? "complete" : "pending",
      required: true,
      action: null,
      icon: FileText,
    },
    {
      label: "GitHub Connection",
      status: user?.githubUsername ? "complete" : "pending",
      required: false,
      action: () => navigate("/settings"),
      icon: Github,
    },
  ];

  const completedCount = items.filter((i) => i.status === "complete").length;

  return (
    <div className="vp-surface-1 p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-4 h-4 text-[var(--color-accent)]" />
        <span className="vp-label-accent">Profile_Completion</span>
        <span className="ml-auto vp-label">{completedCount}/{items.length}</span>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] hover:bg-[var(--color-accent)]/3 transition-colors group"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                item.status === "complete"
                  ? "bg-green-500/15 text-green-500"
                  : "bg-[var(--color-border)] text-[var(--color-muted)]"
              }`}>
                {item.status === "complete" ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.1em]">{item.label}</p>
              </div>

              <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                item.status === "complete"
                  ? "bg-green-500/10 text-green-500"
                  : item.required
                  ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "bg-[var(--color-border)] text-[var(--color-muted)]"
              }`}>
                {item.status === "complete" ? "Done" : item.required ? "Required" : "Optional"}
              </span>

              {item.status !== "complete" && item.action && (
                <button
                  onClick={item.action}
                  className="text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
