import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
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
      return workflowState.hasVerificationRequest ? "complete" : "active";
    default:
      return "locked";
  }
};

export const VerificationPipeline = ({ workflowState, onStepClick }) => {
  const completedCount = PIPELINE_STEPS.filter(
    (s) => getStepStatus(s.id, workflowState) === "complete"
  ).length;
  const progressPercent = Math.round((completedCount / PIPELINE_STEPS.length) * 100);

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
          <div className="w-24 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-accent)] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {PIPELINE_STEPS.map((step, i) => {
          const status = getStepStatus(step.id, workflowState);
          const Icon = step.icon;
          const isClickable = status === "active" || status === "complete";
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => {
                if (isClickable && onStepClick) {
                  onStepClick(step.id);
                }
              }}
              whileHover={isClickable ? { scale: 1.01 } : {}}
              whileTap={isClickable ? { scale: 0.99 } : {}}
              className={`flex items-center gap-4 p-3 sm:p-4 rounded-[var(--radius-md)] transition-all duration-300 ${
                isClickable ? "cursor-pointer hover:bg-[var(--color-bg-sunken)]" : ""
              } ${
                status === "active"
                  ? "bg-[var(--color-accent)]/8 border border-[var(--color-accent)]/20"
                  : status === "complete"
                  ? "opacity-70"
                  : "opacity-30"
              }`}
            >
              {/* Status indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                status === "complete"
                  ? "bg-green-500/15 text-green-500"
                  : status === "active"
                  ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                  : "bg-[var(--color-border)] text-[var(--color-muted)]"
              }`}>
                {status === "complete" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : status === "active" ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold uppercase tracking-[0.12em] truncate ${
                  status === "active" ? "text-[var(--color-text)]" : ""
                }`}>
                  {step.label}
                </p>
                {status === "active" && (
                  <p className="text-[10px] text-[var(--color-accent)] font-mono tracking-wider mt-0.5">
                    Next Step
                  </p>
                )}
              </div>

              {/* XP badge (UI-ready, inactive) */}
              <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-sm ${
                status === "complete"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-[var(--color-border)] text-[var(--color-muted)]"
              }`}>
                +{step.xp} XP
              </span>
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
  const isAnalyzing = resumeStatus === "Pending Evaluation" || 
    (analysisState && ["Queued", "Parsing", "Extracting Information", "Updating Skill Tree"].includes(analysisState.status));

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
                  href={resumeUrl}
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
export const ResumeStatusCard = ({ resumeUrl, resumeStatus, analysisState }) => {
  const hasResume = !!resumeUrl;
  const statusInfo = RESUME_STATUS_MAP[resumeStatus] || null;

  // ─── Resume under analysis / processing status ───
  const isAnalyzing = resumeStatus === "Pending Evaluation" || 
    (analysisState && ["Queued", "Parsing", "Extracting Information", "Updating Skill Tree"].includes(analysisState.status));

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
            
            <div className="flex flex-wrap gap-2 mt-4">
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="vp-btn vp-btn-secondary text-[10px] py-2 px-4 gap-1.5"
                >
                  <Eye className="w-3 h-3" /> View_Resume
                </a>
              )}
            </div>
          </div>

          {/* XP placeholder */}
          <div className="flex items-start">
            <span className="text-[9px] font-mono tracking-wider px-2.5 py-1 bg-green-500/10 text-green-500 rounded-sm">
              +40 XP Earned
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
        Your verified candidate profile cannot be built without a resume. Please upload your resume by clicking the Upload Resume step in the Verification Journey pipeline below.
      </p>
    </div>
  );
};

// ─── Profile Completion Card ────────────────────────────────
export const ProfileCompletionCard = ({ user, resumeUrl, profileImage }) => {
  const navigate = useNavigate();

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
      status: resumeUrl ? "complete" : "pending",
      required: true,
      action: null, // handled by ResumeUploadCard
      icon: FileText,
    },
    {
      label: "GitHub Connection",
      status: user?.githubUsername ? "complete" : "pending",
      required: false, // becomes required after resume analysis
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
