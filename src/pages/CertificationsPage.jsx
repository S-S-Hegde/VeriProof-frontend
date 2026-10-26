import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import ConfirmModal from "../components/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { resolveFileUrl } from "../utils/fileUrl";
import {
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSearch,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  UploadCloud,
  X,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  Layers,
  Zap,
  Tag,
  Download,
  Info,
  Clock,
  Check,
  AlertCircle,
} from "lucide-react";

export const getCertificateProofUrl = (cert) => {
  if (!cert) return "";
  if (
    cert.fileUrl &&
    (cert.fileUrl.startsWith("http://") ||
      cert.fileUrl.startsWith("https://") ||
      cert.fileUrl.startsWith("blob:") ||
      cert.fileUrl.startsWith("data:"))
  ) {
    return cert.fileUrl;
  }
  const apiBase = (
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
      ? "https://veriproof-backend.onrender.com"
      : "http://localhost:5000")
  ).replace(/\/$/, "");

  if (cert._id) {
    return `${apiBase}/api/certificates/${cert._id}/file`;
  }
  if (cert.fileUrl) {
    return resolveFileUrl(cert.fileUrl);
  }
  return "";
};

// Status Badge Helper Component (Section 4 & 9: Distinct color + icon + text + tooltip)
const StatusChip = ({ status, reason, checkedAt }) => {
  const configs = {
    ISSUER_CONFIRMED: {
      label: "Issuer Confirmed",
      icon: ShieldCheck,
      classes: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    },
    DOCUMENT_READ: {
      label: "Read From Document, Issuer Unconfirmed",
      icon: FileSearch,
      classes: "bg-sky-500/15 border-sky-500/30 text-sky-400",
    },
    UNVERIFIED: {
      label: "Unverified",
      icon: Clock,
      classes: "bg-slate-500/15 border-slate-500/30 text-slate-400",
    },
    NAME_MISMATCH: {
      label: "Name Mismatch (Needs Review)",
      icon: AlertTriangle,
      classes: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    },
    REJECTED: {
      label: "Rejected",
      icon: XCircle,
      classes: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    },
    DUPLICATE: {
      label: "Duplicate",
      icon: Copy,
      classes: "bg-zinc-500/15 border-zinc-500/30 text-zinc-400",
    },
  };

  const current = configs[status] || configs.UNVERIFIED;
  const IconComponent = current.icon;

  const tooltipText = `${reason || "Status recorded."}${
    checkedAt ? ` · Checked ${new Date(checkedAt).toLocaleDateString()}` : ""
  }`;

  return (
    <div
      title={tooltipText}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border transition-colors ${current.classes}`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{current.label}</span>
    </div>
  );
};

export default function CertificationsPage() {
  const { user, setUser } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    issuerConfirmed: 0,
    documentRead: 0,
    needsReview: 0,
    rejected: 0,
    duplicates: 0,
    totalXp: 0,
    totalTrustBoost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Multi-file upload states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState([]); // [{ name, status: 'queued'|'processing'|'done'|'failed', error, cert }]
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Detail Drawer state
  const [selectedDrawerCert, setSelectedDrawerCert] = useState(null);

  // View Proof Modal
  const [previewCert, setPreviewCert] = useState(null);
  const [previewError, setPreviewError] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [notification, setNotification] = useState("");
  const fileInputRef = useRef(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/certificates");
      if (data) {
        setCertificates(data.certificates || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.warn("[Certifications] Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Multi-file drag & drop handlers
  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
    }
  };

  const addFilesToQueue = (newFiles) => {
    const validFiles = newFiles.filter(
      (f) =>
        f.type === "application/pdf" ||
        f.type.startsWith("image/") ||
        f.name.toLowerCase().endsWith(".pdf")
    );
    setQueuedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeQueuedFile = (index) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = async () => {
    if (queuedFiles.length === 0) return;
    setIsUploading(true);

    const initialProgress = queuedFiles.map((f) => ({
      name: f.name,
      status: "processing",
      error: null,
    }));
    setUploadProgress(initialProgress);

    try {
      const formData = new FormData();
      queuedFiles.forEach((f) => {
        formData.append("certificates", f);
      });

      const { data } = await api.post("/api/certificates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data && data.results) {
        setUploadProgress(data.results);
      }

      setNotification(`Processed ${queuedFiles.length} certificates.`);
      setTimeout(() => setNotification(""), 6000);

      // Refresh certificates & user progress
      await fetchCertificates();
      setQueuedFiles([]);
    } catch (err) {
      setUploadProgress(
        queuedFiles.map((f) => ({
          name: f.name,
          status: "failed",
          error: err.response?.data?.message || err.message,
        }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteRequest = (certId) => {
    setCertToDelete(certId);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!certToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/certificates/${certToDelete}`);
      setDeleteModalOpen(false);
      setCertToDelete(null);
      await fetchCertificates();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete certificate.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      cert.title?.toLowerCase().includes(q) ||
      cert.issuer?.toLowerCase().includes(q) ||
      cert.credentialId?.toLowerCase().includes(q) ||
      cert.recipient_as_printed?.toLowerCase().includes(q) ||
      (cert.skills || []).some((s) => s.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (activeFilter === "all") return true;
    if (activeFilter === "ISSUER_CONFIRMED") return cert.verificationStatus === "ISSUER_CONFIRMED";
    if (activeFilter === "DOCUMENT_READ") return cert.verificationStatus === "DOCUMENT_READ";
    if (activeFilter === "NEEDS_REVIEW")
      return cert.verificationStatus === "NAME_MISMATCH" || cert.verificationStatus === "UNVERIFIED";
    if (activeFilter === "REJECTED") return cert.verificationStatus === "REJECTED";
    if (activeFilter === "DUPLICATE") return cert.verificationStatus === "DUPLICATE";
    return true;
  });

  return (
    <PageTransition>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10 pb-32">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#0a0f24]/10 dark:border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ff] animate-pulse" />
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#00d4ff] font-bold uppercase">
                FORENSIC_EVIDENCE // CREDENTIAL_INTELLIGENCE
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-[#0a0f24] dark:text-white">
              Certifications &amp; <span className="text-[#00d4ff] not-italic">Badges.</span>
            </h1>
            <p className="text-xs sm:text-sm font-mono text-[#0a0f24]/60 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Forensic validation of candidate credentials against issuing registries. Every credential is checked for printed accuracy, recipient attribution, and authentic evidence score weighting.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 bg-[#00d4ff] text-[#050816] font-mono text-xs uppercase tracking-wider font-bold rounded flex items-center gap-2 hover:bg-[#38bdf8] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Upload Certificates
            </button>
            <button
              onClick={fetchCertificates}
              className="px-4 py-2.5 border border-[#0a0f24]/20 dark:border-white/20 text-xs font-mono rounded flex items-center gap-2 hover:bg-[#0a0f24]/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs font-mono text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Summary Metric Tiles (Driven by real tallies) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded border border-[#0a0f24]/10 dark:border-white/10 bg-[#0a0f24]/[0.02] dark:bg-white/[0.02]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#0a0f24]/50 dark:text-slate-400">
              Total Cataloged
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[#0a0f24] dark:text-white mt-1">
              {summary.total}
            </div>
          </div>

          <div className="p-4 rounded border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Issuer Confirmed
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {summary.issuerConfirmed}
            </div>
          </div>

          <div className="p-4 rounded border border-sky-500/20 bg-sky-500/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Read, Unconfirmed
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-sky-600 dark:text-sky-400 mt-1">
              {summary.documentRead}
            </div>
          </div>

          <div className="p-4 rounded border border-amber-500/20 bg-amber-500/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Needs Review
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-amber-600 dark:text-amber-400 mt-1">
              {summary.needsReview}
            </div>
          </div>

          <div className="p-4 rounded border border-[#00d4ff]/20 bg-[#00d4ff]/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a3c4]">
              XP Earned
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[#00a3c4] mt-1">
              +{summary.totalXp}
            </div>
          </div>

          <div className="p-4 rounded border border-indigo-500/20 bg-indigo-500/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
              Trust Boost
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-indigo-400 mt-1">
              +{summary.totalTrustBoost}%
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All" },
              { id: "ISSUER_CONFIRMED", label: "Issuer Confirmed" },
              { id: "DOCUMENT_READ", label: "Read Only" },
              { id: "NEEDS_REVIEW", label: "Needs Review" },
              { id: "REJECTED", label: "Rejected" },
              { id: "DUPLICATE", label: "Duplicates" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === f.id
                    ? "bg-[#00d4ff] text-[#050816] font-bold"
                    : "border border-[#0a0f24]/15 dark:border-white/10 hover:bg-[#0a0f24]/5 dark:hover:bg-white/5 text-[#0a0f24]/70 dark:text-slate-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#0a0f24]/40 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, roll no, issuer..."
              className="w-full pl-9 pr-3 py-1.5 rounded border border-[#0a0f24]/15 dark:border-white/10 bg-transparent text-xs font-mono text-[#0a0f24] dark:text-white placeholder:text-[#0a0f24]/40 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>
        </div>

        {/* Certificate Cards Grid */}
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#0a0f24]/15 dark:border-white/10 rounded-lg">
            <FileText className="w-12 h-12 mx-auto text-[#0a0f24]/30 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-mono font-bold uppercase text-[#0a0f24] dark:text-white">
              No matching credentials found
            </h3>
            <p className="text-xs font-mono text-[#0a0f24]/50 dark:text-slate-400 mt-1">
              Upload candidate certificates to initiate deterministic verification.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert) => (
              <div
                key={cert._id}
                className="relative flex flex-col justify-between p-6 rounded-lg border border-[#0a0f24]/10 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm hover:border-[#00d4ff]/40 transition-all duration-200 group"
              >
                <div>
                  {/* Top Status & Type */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <StatusChip
                      status={cert.verificationStatus}
                      reason={cert.verificationReason}
                      checkedAt={cert.checkedAt}
                    />
                    <span className="text-[10px] font-mono text-[#0a0f24]/50 dark:text-slate-500 uppercase">
                      {cert.certificate_type || "Certificate"}
                    </span>
                  </div>

                  {/* Title as printed (Never invented) */}
                  <h3 className="text-lg font-mono font-bold text-[#0a0f24] dark:text-white leading-snug">
                    {cert.title_as_printed || cert.title || "Not stated on certificate"}
                  </h3>

                  {/* Issuer as printed */}
                  <p className="text-xs font-mono text-[#0a0f24]/70 dark:text-slate-400 mt-1">
                    {cert.issuer_as_printed || cert.issuer || "Not stated on certificate"}
                  </p>

                  {/* Dates: Issue date + Upload date */}
                  <div className="mt-4 pt-3 border-t border-[#0a0f24]/10 dark:border-white/10 flex items-center justify-between text-[11px] font-mono">
                    <div>
                      <span className="text-[#0a0f24]/50 dark:text-slate-500 block text-[9px] uppercase">
                        Issued Date
                      </span>
                      <span className="font-semibold text-[#0a0f24] dark:text-slate-200">
                        {cert.issueDate
                          ? new Date(cert.issueDate).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Not stated on certificate"}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[#0a0f24]/40 dark:text-slate-500 block text-[9px] uppercase">
                        Uploaded
                      </span>
                      <span className="text-[#0a0f24]/60 dark:text-slate-400">
                        {cert.uploaded_at
                          ? new Date(cert.uploaded_at).toLocaleDateString()
                          : "Recently"}
                      </span>
                    </div>
                  </div>

                  {/* Credential ID / Roll Number */}
                  {cert.credentialId && (
                    <div className="mt-3 text-[11px] font-mono">
                      <span className="text-[#0a0f24]/50 dark:text-slate-500 block text-[9px] uppercase">
                        {cert.credentialId.startsWith("NPTEL") ? "Roll No" : "Credential ID"}
                      </span>
                      <span className="font-bold text-[#00a3c4] break-all select-all">
                        {cert.credentialId}
                      </span>
                    </div>
                  )}

                  {/* Key Scores for NPTEL / Proctored Credentials */}
                  {cert.score_details?.consolidated_score && (
                    <div className="mt-3 p-2.5 rounded bg-[#0a0f24]/[0.03] dark:bg-white/[0.03] border border-[#0a0f24]/10 dark:border-white/10 font-mono text-[11px] space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span>Consolidated Score:</span>
                        <span className="text-[#00d4ff]">
                          {cert.score_details.consolidated_score}
                          {cert.score_details.elite_badge ? " (Elite)" : ""}
                        </span>
                      </div>
                      {cert.score_details.online_assignments && (
                        <div className="flex justify-between items-center text-[#0a0f24]/70 dark:text-slate-400 text-[10px]">
                          <span>Online Assignments:</span>
                          <span>{cert.score_details.online_assignments}</span>
                        </div>
                      )}
                      {cert.score_details.proctored_exam && (
                        <div className="flex justify-between items-center text-[#0a0f24]/70 dark:text-slate-400 text-[10px]">
                          <span>Proctored Exam:</span>
                          <span>{cert.score_details.proctored_exam}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Derived Tags (Strictly from title keywords) */}
                  {cert.skills && cert.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {cert.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[#0a0f24]/5 dark:bg-white/5 border border-[#0a0f24]/10 dark:border-white/10 text-[10px] font-mono text-[#0a0f24]/80 dark:text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Separate Resume Cross-Check Chip (Section 8) */}
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        cert.resumeMatched
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {cert.resumeMatched ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{cert.resumeMatchDetails || "Matched in resume"}</span>
                        </>
                      ) : (
                        <span>Not in resume</span>
                      )}
                    </span>
                  </div>

                  {/* XP Earned Reason */}
                  <div className="mt-3 text-[10px] font-mono text-[#0a0f24]/50 dark:text-slate-400 flex items-center justify-between">
                    <span>Evidence Score:</span>
                    <strong className="text-[#00d4ff] font-bold">
                      +{cert.xpAwarded || 0} XP
                    </strong>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 pt-3 border-t border-[#0a0f24]/10 dark:border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDrawerCert(cert)}
                      className="px-2.5 py-1 text-xs font-mono rounded border border-[#0a0f24]/20 dark:border-white/20 hover:border-[#00d4ff] text-[#0a0f24] dark:text-white transition-colors cursor-pointer"
                    >
                      Audit Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewError(false);
                        setPreviewCert(cert);
                      }}
                      className="px-2.5 py-1 text-xs font-mono rounded bg-[#0a0f24]/5 dark:bg-white/10 hover:bg-[#00d4ff]/10 text-[#0a0f24] dark:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View Proof
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteRequest(cert._id)}
                    className="p-1 text-[#0a0f24]/40 dark:text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remove from ledger"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MULTI-FILE UPLOAD MODAL ── */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-[#0a0f24] border border-white/15 rounded-lg p-6 sm:p-8 text-white space-y-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-mono font-bold uppercase tracking-wider">
                      Batch Certificate Intake
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      Deterministic forensic extraction. Up to 10 files processed in parallel.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isUploading) {
                        setIsUploadModalOpen(false);
                        setQueuedFiles([]);
                        setUploadProgress([]);
                      }
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                    dragActive
                      ? "border-[#00d4ff] bg-[#00d4ff]/10"
                      : "border-white/20 hover:border-white/40 bg-white/[0.02]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <UploadCloud className="w-10 h-10 mx-auto text-[#00d4ff] mb-2" />
                  <p className="text-sm font-mono font-bold">
                    Drop PDF / Image certificates here, or browse
                  </p>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Accepts 4 golden fixtures, Infosys Springboard, NPTEL, university degrees
                  </p>
                </div>

                {/* Queued Files List */}
                {queuedFiles.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Queued for verification ({queuedFiles.length})
                    </span>
                    {queuedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded bg-white/5 border border-white/10 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-[#00d4ff] shrink-0" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-500">
                            ({(file.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        {!isUploading && (
                          <button
                            onClick={() => removeQueuedFile(idx)}
                            className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Results Progress */}
                {uploadProgress.length > 0 && (
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Processing Results
                    </span>
                    {uploadProgress.map((res, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-white/5 text-xs font-mono"
                      >
                        <span className="truncate max-w-xs">{res.filename || res.name}</span>
                        <span
                          className={`font-semibold uppercase text-[10px] ${
                            res.status === "done"
                              ? "text-emerald-400"
                              : res.status === "failed"
                              ? "text-rose-400"
                              : "text-amber-400"
                          }`}
                        >
                          {res.status === "done" ? "✓ Verified" : res.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      setQueuedFiles([]);
                      setUploadProgress([]);
                    }}
                    disabled={isUploading}
                    className="px-4 py-2 font-mono text-xs text-slate-300 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleStartUpload}
                    disabled={isUploading || queuedFiles.length === 0}
                    className="px-5 py-2 font-mono text-xs uppercase tracking-wider font-bold bg-[#00d4ff] text-[#050816] rounded hover:bg-[#38bdf8] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isUploading ? "Verifying..." : `Verify ${queuedFiles.length} Documents`}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── DETAIL AUDIT DRAWER ── */}
        <AnimatePresence>
          {selectedDrawerCert && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-xl h-full bg-[#0a0f24] border-l border-white/15 p-6 sm:p-8 text-white overflow-y-auto space-y-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#00d4ff]">
                    Credential Forensic Audit
                  </h3>
                  <button
                    onClick={() => setSelectedDrawerCert(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">
                      Title As Printed
                    </span>
                    <strong className="text-base text-white font-bold">
                      {selectedDrawerCert.title_as_printed || selectedDrawerCert.title}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">
                      Issuer As Printed
                    </span>
                    <span className="text-slate-200">
                      {selectedDrawerCert.issuer_as_printed || selectedDrawerCert.issuer}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">
                      Recipient As Printed
                    </span>
                    <span className="text-slate-200">
                      {selectedDrawerCert.recipient_as_printed || "Not stated on certificate"}
                    </span>
                  </div>

                  {selectedDrawerCert.signatory && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Signatory</span>
                      <span className="text-slate-300">{selectedDrawerCert.signatory}</span>
                    </div>
                  )}

                  {selectedDrawerCert.session_or_period && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">
                        Session / Duration
                      </span>
                      <span className="text-slate-300">
                        {selectedDrawerCert.session_or_period}
                      </span>
                    </div>
                  )}

                  {selectedDrawerCert.credentialId && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">
                        Credential ID / Roll Number
                      </span>
                      <code className="text-[#00d4ff] select-all font-bold">
                        {selectedDrawerCert.credentialId}
                      </code>
                    </div>
                  )}

                  {selectedDrawerCert.verification_url && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">
                        Verification URL
                      </span>
                      <a
                        href={selectedDrawerCert.verification_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00d4ff] underline break-all inline-flex items-center gap-1 hover:text-[#38bdf8]"
                      >
                        {selectedDrawerCert.verification_url} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {selectedDrawerCert.file_hash && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">
                        SHA-256 Proof Hash
                      </span>
                      <code className="text-[10px] text-slate-400 break-all select-all">
                        {selectedDrawerCert.file_hash}
                      </code>
                    </div>
                  )}

                  {/* Audit Log Box */}
                  <div className="p-4 rounded bg-white/5 border border-white/10 space-y-2 mt-6">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Audit Verification Log
                    </span>
                    <div className="text-[11px] text-slate-300">
                      Status: <strong>{selectedDrawerCert.verificationStatus}</strong>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Reason: {selectedDrawerCert.verificationReason}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Method: {selectedDrawerCert.extraction_method || "template"}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setPreviewError(false);
                      setPreviewCert(selectedDrawerCert);
                    }}
                    className="px-4 py-2 font-mono text-xs bg-[#00d4ff] text-[#050816] font-bold rounded flex items-center gap-1 hover:bg-[#38bdf8]"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Original Document
                  </button>
                  <button
                    onClick={() => setSelectedDrawerCert(null)}
                    className="px-3 py-2 font-mono text-xs text-slate-400 hover:text-white"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── VIEW PROOF MODAL ── */}
        <AnimatePresence>
          {previewCert && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-4xl h-[85vh] bg-[#0a0f24] border border-white/15 rounded-lg flex flex-col text-white shadow-2xl overflow-hidden"
              >
                {/* Modal Top Bar */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
                  <div className="truncate">
                    <h3 className="text-sm font-mono font-bold truncate">
                      {previewCert.title_as_printed || previewCert.title}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      {previewCert.issuer_as_printed || previewCert.issuer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`${getCertificateProofUrl(previewCert)}?download=true`}
                      className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-mono flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <button
                      onClick={() => setPreviewCert(null)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Content / Document Preview or Friendly Unavailable State */}
                <div className="flex-1 bg-black/40 relative">
                  {!previewError ? (
                    <iframe
                      src={getCertificateProofUrl(previewCert)}
                      title="Certificate Proof"
                      className="w-full h-full border-0"
                      onError={() => setPreviewError(true)}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                      <AlertCircle className="w-12 h-12 text-amber-400" />
                      <h4 className="text-base font-mono font-bold">
                        Proof file unavailable on storage
                      </h4>
                      <p className="text-xs font-mono text-slate-400 max-w-md">
                        The raw certificate file is no longer present. Re-upload the file to restore verification evidence.
                      </p>
                      <button
                        onClick={() => {
                          setPreviewCert(null);
                          setIsUploadModalOpen(true);
                        }}
                        className="px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider bg-[#00d4ff] text-[#050816] rounded hover:bg-[#38bdf8]"
                      >
                        Re-upload To Restore
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModalOpen}
          title="Remove Certificate"
          message="Are you sure you want to remove this certificate? Any earned XP and trust boosts from this credential will be recalculated."
          confirmText={isDeleting ? "Removing..." : "Remove"}
          cancelText="Cancel"
          onConfirm={executeDelete}
          onCancel={() => setDeleteModalOpen(false)}
          type="danger"
        />
      </div>
    </PageTransition>
  );
}
