import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import {
  Upload, FileText, AlertCircle, CheckCircle, XCircle, Clock, Loader2, Sparkles, Eye, ArrowLeft,
  FolderOpen, Cloud, FileCheck, RefreshCw
} from "lucide-react";

const RESUME_STATUS_MAP = {
  "Pending Evaluation": { label: "Under Analysis", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Clock },
  "Verified":          { label: "Successfully Analyzed", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle },
  "Rejected":          { label: "Needs Re-upload", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle },
};

const ResumeUploadPage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFileSize, setSelectedFileSize] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState(null);
  const [analysisState, setAnalysisState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/api/users/profile");
        if (!isMounted) return;
        setProfileData(data);
        if (data.resumeStatus === "Pending Evaluation") {
          fetchAnalysisState();
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const fetchAnalysisState = async () => {
    try {
      const { data } = await api.get("/api/users/profile/resume-analysis");
      setAnalysisState(data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    const allowedMime = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const ext = file.name.split(".").pop().toLowerCase();
    const isAllowedExt = ["pdf", "doc", "docx", "txt"].includes(ext);

    if (!allowedMime.includes(file.type) && !isAllowedExt) {
      setError("Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    setError(null);
    setSelectedFileName(file.name);
    setSelectedFileSize(formatBytes(file.size));
    setUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 150);

      const { data } = await api.post("/api/users/profile/resume-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // Update local state
      setProfileData((prev) => ({
        ...prev,
        resumeUrl: data.resumeUrl,
        resumeStatus: data.resumeStatus,
        workflowState: prev ? { ...prev.workflowState, hasResume: true } : null,
      }));
      
      setUser((prev) => ({
        ...prev,
        resumeUrl: data.resumeUrl,
        resumeStatus: data.resumeStatus,
        workflowState: prev ? { ...prev.workflowState, hasResume: true } : null,
      }));

      // Start polling analysis state automatically
      fetchAnalysisState();
      
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  }, [setUser]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
        </div>
      </PageTransition>
    );
  }

  const workflowState = profileData?.workflowState;
  const resumeUrl = profileData?.resumeUrl;
  const resumeStatus = profileData?.resumeStatus;
  const hasResume = !!resumeUrl;
  
  if (workflowState?.hasVerificationRequest) {
    navigate("/dashboard");
    return null;
  }

  const statusInfo = RESUME_STATUS_MAP[resumeStatus] || null;
  const isAnalyzing = hasResume && (resumeStatus === "Pending Evaluation" || 
    (analysisState && ["Queued", "Parsing", "Extracting Information", "Updating Skill Tree"].includes(analysisState.status)));

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12 pb-28 lg:pb-12">
        <button 
          onClick={() => navigate("/dashboard")}
          className="vp-btn vp-btn-secondary text-[10px] py-2 px-4 gap-2 mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
        
        <div className="mb-10">
          <h1 className="font-black italic uppercase tracking-tighter text-4xl sm:text-5xl lg:text-6xl mb-2">
            Upload <span className="text-[var(--color-accent)] not-italic">Resume.</span>
          </h1>
          <p className="vp-label">Complete your profile to unlock intelligence analysis</p>
        </div>

        {/* If Analyzing */}
        {isAnalyzing && (
          <div className="vp-surface-1 p-6 sm:p-8 relative overflow-hidden mb-8">
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
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-end text-xs font-mono">
                <span className="text-[var(--color-accent)] uppercase tracking-wider">{analysisState?.stage || "Initializing..."}</span>
                <span className="opacity-70 font-bold">{analysisState?.progress || 10}%</span>
              </div>
              <div className="w-full h-3 bg-[var(--color-border)] rounded-full overflow-hidden border border-[var(--color-border)]">
                <motion.div
                  className="h-full bg-[var(--color-accent)] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${analysisState?.progress || 10}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Upload Success Card */}
        {uploadSuccess && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="vp-surface-1 p-6 sm:p-8 relative overflow-hidden mb-8 border border-emerald-500/30 bg-emerald-500/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-emerald-400">
                  Resume Uploaded Successfully
                </h3>
                <p className="text-xs text-[var(--color-muted)] font-mono">
                  {selectedFileName} ({selectedFileSize})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="vp-btn vp-btn-accent text-[10px] py-2 px-4 gap-2 cursor-pointer"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => { setUploadSuccess(false); fileInputRef.current?.click(); }}
                className="vp-btn vp-btn-secondary text-[10px] py-2 px-4 gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Replace Resume
              </button>
            </div>
          </motion.div>
        )}

        {/* Upload Interface */}
        {!isAnalyzing && (
          <div className="vp-surface-1 p-6 sm:p-8 relative overflow-hidden mb-8">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-60" />

            <div className="flex flex-col md:flex-row gap-8">
              {/* Left side: Current status if exists */}
              {hasResume && (
                <div className="flex-1 border-r border-[var(--color-border)] pr-8 hidden md:block">
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-4 h-4 text-[var(--color-accent)]" />
                    <span className="vp-label-accent">Current_Resume</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center ${statusInfo?.bg || "bg-[var(--color-accent-subtle)]"}`}>
                      {statusInfo?.icon ? <statusInfo.icon className={`w-5 h-5 ${statusInfo.color || "text-[var(--color-accent)]"}`} /> : <AlertCircle className="w-5 h-5 text-[var(--color-accent)]" />}
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">
                        {statusInfo?.label || resumeStatus}
                      </p>
                      <p className="vp-label mt-0.5">Resume on file</p>
                    </div>
                  </div>

                  {resumeUrl && (
                    <div className="aspect-[3/4] w-full bg-[var(--color-bg-sunken)] border border-[var(--color-border)] rounded-[var(--radius-md)] flex items-center justify-center flex-col gap-4 overflow-hidden relative group">
                      <FileText className="w-12 h-12 text-[var(--color-muted)] opacity-20" />
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <span className="vp-btn vp-btn-accent text-[10px] py-2 px-4 gap-2">
                          <Eye className="w-3.5 h-3.5" /> View Resume PDF
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-6">
                  <Upload className="w-4 h-4 text-[var(--color-accent)]" />
                  <span className="vp-label-accent">{hasResume ? "Replace_Resume" : "Action_Required"}</span>
                </div>

                <p className="text-sm text-[var(--color-muted)] mb-6 leading-relaxed">
                  Upload your latest resume to update your candidate claim repository.
                </p>

                {/* Dropzone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full border-2 border-dashed rounded-[var(--radius-md)] p-8 sm:p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                    dragActive
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/8 scale-[1.01]"
                      : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/3"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onClick={(e) => { e.target.value = null; }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  />

                  {uploading ? (
                    <div className="flex flex-col items-center gap-3 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                      <Loader2 className="w-10 h-10 animate-spin text-[var(--color-accent)] mb-2" />
                      <div className="flex justify-between w-full text-xs font-mono text-[var(--color-accent)]">
                        <span>Uploading File...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-accent)] transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-[10px] text-[var(--color-muted)] font-mono mt-1">{selectedFileName}</p>
                    </div>
                  ) : (
                    <>
                      <Upload className={`w-10 h-10 mb-4 transition-colors ${
                        dragActive ? "text-[var(--color-accent)]" : "text-[var(--color-muted)] opacity-40"
                      }`} />
                      
                      <p className="text-sm font-bold uppercase tracking-widest mb-1 text-center">
                        {dragActive ? "Drop File Here" : "Drag & Drop Resume Here"}
                      </p>
                      
                      <p className="text-xs text-[var(--color-muted)] mb-4 text-center">
                        Supported Formats: <strong className="text-[var(--color-text)]">PDF, DOC, DOCX, TXT</strong> (Max file size: <strong className="text-[var(--color-text)]">5MB</strong>)
                      </p>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="vp-btn vp-btn-accent text-xs py-2.5 px-5 gap-2 cursor-pointer shadow-md"
                      >
                        <FolderOpen className="w-4 h-4" /> Browse Files (Explorer)
                      </button>
                    </>
                  )}
                </div>

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

                {/* Cloud Integrations Section (Requirement 2) */}
                <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Cloud className="w-3.5 h-3.5 text-[var(--color-muted)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
                      Cloud Storage Imports
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      disabled
                      className="flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]/50 opacity-50 cursor-not-allowed relative group"
                      title="Google Drive import coming soon"
                    >
                      <span className="text-xs font-bold">Google Drive</span>
                      <span className="text-[9px] font-mono text-[var(--color-accent)] tracking-wider mt-1">
                        Coming Soon
                      </span>
                    </button>

                    <button
                      disabled
                      className="flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]/50 opacity-50 cursor-not-allowed relative group"
                      title="OneDrive import coming soon"
                    >
                      <span className="text-xs font-bold">OneDrive</span>
                      <span className="text-[9px] font-mono text-[var(--color-accent)] tracking-wider mt-1">
                        Coming Soon
                      </span>
                    </button>

                    <button
                      disabled
                      className="flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]/50 opacity-50 cursor-not-allowed relative group"
                      title="Dropbox import coming soon"
                    >
                      <span className="text-xs font-bold">Dropbox</span>
                      <span className="text-[9px] font-mono text-[var(--color-accent)] tracking-wider mt-1">
                        Coming Soon
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <Sparkles className="w-3 h-3 text-[var(--color-accent)] opacity-60" />
                  <span className="text-[10px] font-mono tracking-wider text-[var(--color-muted)]">
                    Upload unlocks Resume Analysis (+40 XP)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ResumeUploadPage;
