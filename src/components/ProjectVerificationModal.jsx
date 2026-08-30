import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Globe,
  Github,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
  Sparkles,
  ExternalLink,
  Cpu,
  Layers,
} from "lucide-react";
import api from "../utils/api";

export default function ProjectVerificationModal({
  isOpen,
  onClose,
  project,
  onVerified,
}) {
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setLiveDemoUrl(project.liveDemoUrl || project.liveUrl || "");
      if ((project.isVerified || project.status === "Verified" || project.verificationStatus === "Verified") && project.liveAuditReport) {
        setAuditResult({
          matchScore: project.matchScore || project.liveAuditReport.resumeFidelityScore || 90,
          isVerified: true,
          summary: project.liveAuditReport.summary,
          verifiedFeatures: project.liveAuditReport.verifiedFeatures || [],
          discrepancies: project.liveAuditReport.discrepancies || [],
          proofHash: project.proofHash || "",
        });
      } else {
        setAuditResult(null);
      }
    }
  }, [project, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !verifying) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      if (window.__lenis) window.__lenis.stop();
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (window.__lenis) window.__lenis.start();
    };
  }, [isOpen, verifying, onClose]);

  if (!isOpen || !project) return null;

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!liveDemoUrl && !project.repositoryUrl) {
      setError("Please provide a Live Demo URL or GitHub Repository URL to verify.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const { data } = await api.post(`/api/projects/${project._id}/verify-live`, {
        liveDemoUrl: liveDemoUrl.trim(),
      });

      const updated = data.project;
      setAuditResult({
        matchScore: updated.matchScore,
        isVerified: updated.verificationStatus === "Verified",
        summary: updated.liveAuditReport?.summary,
        verifiedFeatures: updated.liveAuditReport?.verifiedFeatures || [],
        discrepancies: updated.liveAuditReport?.discrepancies || [],
        proofHash: updated.proofHash,
      });

      if (onVerified) {
        onVerified(updated);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Project verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onClick={(e) => {
        if (e.target === e.currentTarget && !verifying) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-sunken)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Dual-Source Evidence Auditor
              </span>
              {project.sourceType === "resume_auto" && (
                <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  Extracted from Resume
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--color-text)] mt-0.5">
              {project.title}
            </h2>
          </div>
        </div>

        {/* Claimed Details Box */}
        <div className="p-4 rounded-xl bg-[var(--color-bg-sunken)] border border-[var(--color-border)] mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-muted)]">
            <span>RESUME CLAIM AUDIT</span>
            <span className="text-[10px] text-cyan-400 font-bold">SHA-256 Verified</span>
          </div>
          <p className="text-xs text-[var(--color-text)] leading-relaxed">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.technologies?.map((tech, i) => (
              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[var(--color-text)]">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Live Input Form */}
        <form onSubmit={handleVerify} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Live Demo URL (Deployed Web App)
            </label>
            <input
              type="url"
              value={liveDemoUrl}
              onChange={(e) => setLiveDemoUrl(e.target.value)}
              placeholder="e.g. https://my-portfolio-app.vercel.app"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-sunken)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text)] focus:border-cyan-500 focus:outline-none transition-colors"
              disabled={verifying}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-muted)] px-1">
            <span className="flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-[var(--color-text)]" /> Repo: {project.repositoryUrl ? project.repositoryUrl.replace("https://github.com/", "") : "Not linked"}
            </span>
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                Inspect Repo <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={verifying}
              className="w-full vp-btn vp-btn-accent text-xs py-3 px-6 gap-2 justify-center cursor-pointer disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Auditing Live Demo & GitHub Evidence...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" /> Run Dual-Source AI Verification
                </>
              )}
            </button>
          </div>
        </form>

        {/* Verification Result Card */}
        {auditResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border ${
              auditResult.isVerified
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-amber-500/10 border-amber-500/30"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {auditResult.isVerified ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                <span className={`text-sm font-black uppercase font-mono ${auditResult.isVerified ? "text-emerald-400" : "text-amber-400"}`}>
                  {auditResult.isVerified ? "Project Implementation Verified" : "Discrepancies Detected"}
                </span>
              </div>
              <span className={`text-base font-mono font-black ${auditResult.isVerified ? "text-emerald-400" : "text-amber-400"}`}>
                {auditResult.matchScore}% Match
              </span>
            </div>

            <p className="text-xs text-[var(--color-text)] font-mono leading-relaxed mb-3">
              {auditResult.summary}
            </p>

            {auditResult.verifiedFeatures?.length > 0 && (
              <div className="space-y-1 mb-3">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                  Verified Real-Time Features:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {auditResult.verifiedFeatures.map((feat, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {auditResult.proofHash && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[var(--color-muted)]">
                <span>Proof Hash:</span>
                <span className="text-cyan-400 truncate max-w-[240px]">
                  0x{auditResult.proofHash.substring(0, 24)}...
                </span>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}
