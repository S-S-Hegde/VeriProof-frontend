import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  Upload, FileText, AlertCircle, Loader2, X,
  FolderOpen, FileCheck, RefreshCw
} from "lucide-react";

import CandidateProcessingCenter from "./CandidateProcessingCenter";

export default function ResumeUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const { user, setUser } = useAuth();
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFileSize, setSelectedFileSize] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !uploading && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, uploading, isProcessing, onClose]);

  // Disable background scrolling & stop Lenis smooth scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const origBodyOverflow = document.body.style.overflow;
      const origHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (window.__lenis) window.__lenis.stop();
      return () => {
        document.body.style.overflow = origBodyOverflow || "";
        document.documentElement.style.overflow = origHtmlOverflow || "";
        if (window.__lenis) window.__lenis.start();
      };
    }
  }, [isOpen]);

  // Fetch profile when modal opens
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setUploadSuccess(false);
      setError(null);
      return;
    }
    let isMounted = true;
    setIsProcessing(false);
    setUploadSuccess(false);
    setError(null);

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/users/profile");
        if (!isMounted) return;
        setProfileData(data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [isOpen]);

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

      await api.post("/api/users/profile/resume-file", formData);

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Transition immediately to Candidate Processing Center
      setIsProcessing(true);
      
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  if (!isOpen) return null;

  const hasResume = Boolean(profileData?.resumeUrl);
  const isInvited = profileData?.origin === "recruiter_invited";

  if (!document.body) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto overscroll-contain pointer-events-auto"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => !uploading && onClose()}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[95vw] sm:max-w-lg md:max-w-xl max-h-[88vh] rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 sm:p-5 md:p-6 shadow-2xl z-10 overflow-y-auto overscroll-contain vp-glass"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[var(--color-border)]">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <FileText className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span className="vp-label-accent text-[10px]">Candidate_Verification</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter">
                {hasResume ? "Replace / Re-upload" : "Upload"} <span className="text-[var(--color-accent)] not-italic">Resume.</span>
              </h2>
            </div>
            <button
              onClick={() => !uploading && onClose()}
              disabled={uploading}
              className="p-1.5 rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-sunken)] transition-colors disabled:opacity-40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-7 h-7 animate-spin text-[var(--color-accent)]" />
            </div>
          ) : isProcessing ? (
            <div className="w-full">
              <CandidateProcessingCenter
                initialFileName={selectedFileName || profileData?.originalFileName || "resume.pdf"}
                onComplete={(freshData) => {
                  setIsProcessing(false);
                  setUploadSuccess(true);
                  if (onUploadSuccess) {
                    onUploadSuccess(freshData);
                  }
                  onClose();
                }}
              />
              <div className="mt-2.5 text-center">
                <button
                  onClick={() => {
                    setIsProcessing(false);
                    setProfileData((prev) => ({ ...prev, resumeStatus: "Not Uploaded" }));
                  }}
                  className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] underline cursor-pointer"
                >
                  Upload a different resume instead
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Upload Success Card */}
              {uploadSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-[var(--radius-lg)] mb-6 border border-emerald-500/30 bg-emerald-500/10"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-emerald-400">
                        Resume Uploaded Successfully
                      </h4>
                      <p className="text-xs text-[var(--color-muted)] font-mono">
                        {selectedFileName} ({selectedFileSize})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => onClose()}
                      className="vp-btn vp-btn-accent text-[10px] py-2 px-4 gap-2 cursor-pointer"
                    >
                      Done & Close
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

              {/* Upload Dropzone (ALWAYS VISIBLE & ACCESSIBLE) */}
              <div>
                {isInvited ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center bg-[var(--color-bg-sunken)] border border-[var(--color-border)] rounded-[var(--radius-lg)]">
                    <FileCheck className="w-10 h-10 text-[var(--color-accent)] mb-3 opacity-70" />
                    <p className="font-bold text-sm uppercase tracking-widest text-[var(--color-accent)] mb-2">Resume Submitted</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      Your resume has already been submitted by your recruiter. Upload and replacement is disabled.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-[var(--color-muted)] mb-4 leading-relaxed">
                      Select or drag your candidate resume file (PDF, DOCX, TXT) to upload and build your verified skill repository.
                    </p>

                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative w-full border-2 border-dashed rounded-[var(--radius-lg)] p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                        dragActive
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 scale-[1.01]"
                          : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/4"
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
                          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)] mb-1" />
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
                          <Upload className={`w-8 h-8 mb-3 transition-colors ${
                            dragActive ? "text-[var(--color-accent)]" : "text-[var(--color-muted)] opacity-40"
                          }`} />
                          
                          <p className="text-xs font-bold uppercase tracking-widest mb-1 text-center">
                            {dragActive ? "Drop File Here" : "Drag & Drop Resume Here"}
                          </p>
                          
                          <p className="text-[11px] text-[var(--color-muted)] mb-4 text-center">
                            Supported Formats: <strong className="text-[var(--color-text)]">PDF, DOC, DOCX, TXT</strong> (Max: <strong className="text-[var(--color-text)]">5MB</strong>)
                          </p>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="vp-btn vp-btn-accent text-[11px] py-2.5 px-5 gap-2 cursor-pointer shadow-md"
                          >
                            <FolderOpen className="w-4 h-4" /> Browse Files (Explorer)
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}

                {/* Error Notification */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-[var(--radius-md)]"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
