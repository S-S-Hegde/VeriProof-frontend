import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, FileText, X, AlertCircle, CheckCircle,
  Users, Loader2, Mail, Clock, RefreshCw, ChevronDown, Trash2,
} from "lucide-react";
import api from "../utils/api";

/* ═══════════════════════════════════════════════════
   INTAKE — Bulk Resume Upload
   Recruiter picks a job, drops resumes, backend parses
   them serially and sends invite emails to candidates.
   ═══════════════════════════════════════════════════ */

const STATUS_ICON = {
  Completed: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  Failed:    <AlertCircle className="w-4 h-4 text-red-400" />,
  Processing:<Loader2     className="w-4 h-4 text-yellow-400 animate-spin" />,
};

const EMAIL_BADGE = {
  sent:      "text-emerald-400 border-emerald-400/30 bg-emerald-400/8",
  failed:    "text-red-400 border-red-400/30 bg-red-400/8",
  not_found: "text-[var(--color-muted)] border-[var(--color-border)]",
};

const EMAIL_LABEL = {
  sent:      "Email Sent",
  failed:    "Email Failed",
  not_found: "No Email Found",
};

export default function Intake() {
  const [jobs, setJobs]               = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [files, setFiles]             = useState([]);
  const [isDragging, setIsDragging]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults]         = useState([]);
  const [error, setError]             = useState("");
  const [emailsSent, setEmailsSent]   = useState(0);
  const [strictMode, setStrictMode]   = useState(false);
  const fileInputRef = useRef(null);

  const fetchJobs = useCallback(async () => {
    try {
      const { data } = await api.get("/api/verify/my-jobs");
      setJobs(data || []);
      if (data?.length) setSelectedJobId(data[0]._id);
    } catch {
      setError("Could not load your jobs. Create one in Blueprint first.");
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // ── File handling ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("docs"); // "docs" | "ats"

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => {
      const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
      return (
        f.type.includes("pdf") ||
        f.type.includes("wordprocessingml") ||
        f.type.includes("msword") ||
        f.type.includes("text") ||
        f.type.includes("csv") ||
        f.type.includes("spreadsheet") ||
        f.type.includes("excel") ||
        f.type.includes("json") ||
        f.type.includes("zip") ||
        [".pdf", ".docx", ".doc", ".txt", ".csv", ".xlsx", ".xls", ".json", ".zip"].includes(ext)
      );
    });
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...valid.filter(f => !names.has(f.name))];
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedJobId || !files.length) return;
    setIsProcessing(true);
    setError("");
    setResults([]);
    setEmailsSent(0);

    const fd = new FormData();
    fd.append("jobId", selectedJobId);
    fd.append("strictMode", strictMode);
    files.forEach(f => fd.append("resumes", f));

    try {
      const { data } = await api.post("/api/verify/applicants/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      setResults(data);
      const sent = data.filter(r => r.emailStatus === "sent").length;
      setEmailsSent(sent);
      setFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Check your connection and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteApplicant = async (applicantId) => {
    if (!applicantId) return;
    try {
      await api.delete(`/api/verify/applicants/${applicantId}`);
      setResults(prev => prev.filter(r => r._id !== applicantId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove applicant.");
    }
  };

  const selectedJob = jobs.find(j => j._id === selectedJobId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <p className="vp-label-accent mb-1">Recruiter / Intake Engine</p>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">
          Candidate <span className="text-[var(--color-accent)] not-italic">Multi-Format Upload</span>
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Import candidate datasets via ATS CSV, Excel, JSON exports, ZIP resume bundles, or PDF documents.
        </p>
      </div>

      {/* ── Error banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button className="ml-auto" onClick={() => setError("")}><X className="w-3.5 h-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Mode Selector + Drop zone + job selector ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Job selector */}
          <div className="vp-glass p-4 rounded-[var(--radius-xl)]">
            <label className="vp-label mb-2 block">Select Target Job Blueprint</label>
            {jobs.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)] font-mono py-2">
                No job roles found — create one in the Job Roles page first.
              </p>
            ) : (
              <div className="relative">
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="vp-input w-full appearance-none pr-8"
                >
                  {jobs.map(j => (
                    <option key={j._id} value={j._id}>{j.title}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
              </div>
            )}
            {selectedJob?.targetSkills?.length > 0 && (
              <p className="mt-2 text-[10px] font-mono text-[var(--color-muted)]">
                Matching against: {selectedJob.targetSkills.slice(0, 5).join(" · ")}{selectedJob.targetSkills.length > 5 ? ` +${selectedJob.targetSkills.length - 5} more` : ""}
              </p>
            )}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--color-border)]">
              <input
                type="checkbox"
                id="strictMode"
                checked={strictMode}
                onChange={e => setStrictMode(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-bg-sunken)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer"
              />
              <label htmlFor="strictMode" className="text-xs font-mono text-[var(--color-text-secondary)] cursor-pointer select-none">
                Enable Double-Verification (Strict Claim Check)
              </label>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-[var(--radius-lg)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]">
            <button
              onClick={() => setActiveTab("docs")}
              className={`flex-1 py-2 px-3 text-xs font-bold font-mono rounded-[var(--radius-md)] transition-all ${
                activeTab === "docs"
                  ? "bg-[var(--color-accent)] text-black shadow"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              📄 Documents &amp; ZIP Archives (.pdf, .docx, .zip)
            </button>
            <button
              onClick={() => setActiveTab("ats")}
              className={`flex-1 py-2 px-3 text-xs font-bold font-mono rounded-[var(--radius-md)] transition-all ${
                activeTab === "ats"
                  ? "bg-[var(--color-accent)] text-black shadow"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              📊 ATS Data Exports (.csv, .xlsx, .json)
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`vp-glass border-2 border-dashed rounded-[var(--radius-xl)] p-8 flex flex-col items-center text-center cursor-pointer transition-colors min-h-[220px] justify-center ${
              isDragging
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/8"
                : "border-[var(--color-border)] hover:border-[var(--color-text)]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={activeTab === "docs" ? ".pdf,.docx,.doc,.txt,.zip" : ".csv,.xlsx,.xls,.json"}
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />
            <motion.div animate={{ y: isDragging ? -8 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
              <UploadCloud className="w-10 h-10 text-[var(--color-muted)] mb-2 mx-auto" />
            </motion.div>
            <p className="font-bold text-[var(--color-text)] text-sm mb-1">
              {activeTab === "docs" ? "Drop PDF, DOCX, or ZIP Resume Archives" : "Drop Candidate CSV, Excel, or JSON ATS Files"}
            </p>
            <p className="text-xs text-[var(--color-muted)] mb-4 font-mono">
              {activeTab === "docs"
                ? "Multi-resume PDFs, DOCX documents, or ZIP bundles (150 candidates max/batch)"
                : "Exported tabular datasets from Greenhouse, Lever, Workday, or Excel"}
            </p>
            <button className="vp-btn vp-btn-secondary text-xs px-5 py-2" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              Select {activeTab === "docs" ? "Document / ZIP Files" : "ATS CSV / Spreadsheet Files"}
            </button>
          </div>

          {/* High-speed intake note */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-emerald-500/8 border border-emerald-500/20">
            <Clock className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-[10px] font-mono text-emerald-400/90 leading-relaxed">
              ⚡ Multi-Engine Orchestrator: Ingests ATS spreadsheets, ZIPs &amp; PDFs in 150-candidate parallel chunks across Groq, Gemini &amp; NVIDIA NIM APIs.
            </p>
          </div>
        </div>

        {/* ── Right: Staged files + action ── */}
        <div className="vp-glass p-5 rounded-[var(--radius-xl)] flex flex-col h-[500px]">
          <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[var(--color-border)] pb-3 mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            Staged ({files.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <AnimatePresence>
              {files.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-[var(--color-muted)]"
                >
                  <FileText className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs text-center">No files staged yet</p>
                </motion.div>
              ) : (
                files.map((file, idx) => (
                  <motion.div
                    key={`${file.name}-${idx}`}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                      <p className="text-[10px] truncate font-mono text-[var(--color-text)]">{file.name}</p>
                    </div>
                    <button onClick={() => removeFile(idx)} className="text-[var(--color-muted)] hover:text-[var(--color-error)] transition-colors p-0.5 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4 border-t border-[var(--color-border)] mt-auto space-y-2">
            {isProcessing && (
              <p className="text-[10px] font-mono text-yellow-400 text-center animate-pulse">
                Processing… do not close this page
              </p>
            )}
            <button
              disabled={!files.length || !selectedJobId || isProcessing || jobs.length === 0}
              onClick={handleSubmit}
              className="vp-btn vp-btn-accent w-full py-3 text-xs gap-2 disabled:opacity-40"
            >
              {isProcessing
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing Batch…</>
                : <><UploadCloud className="w-3.5 h-3.5" /> Upload Resumes</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="vp-glass rounded-[var(--radius-xl)] overflow-hidden"
          >
            {/* Summary bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-bold">Upload Complete</p>
                  <p className="text-xs text-[var(--color-muted)] font-mono">
                    {results.filter(r => r.status === "Completed").length}/{results.length} processed ·{" "}
                    <span className="text-emerald-400 flex items-center gap-1 inline-flex">
                      <Mail className="w-3 h-3" /> {emailsSent} invite{emailsSent !== 1 ? "s" : ""} sent
                    </span>
                  </p>
                </div>
              </div>
              <button onClick={() => { setResults([]); setEmailsSent(0); }} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Per-file result rows */}
            <div className="divide-y divide-[var(--color-border)]">
              {results.map((r, i) => (
                <div key={r._id || i} className="px-6 py-3 flex items-center gap-4">
                  <div className="shrink-0">{STATUS_ICON[r.status] || STATUS_ICON.Processing}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono truncate">{r.originalFileName}</p>
                    <p className="text-[10px] text-[var(--color-muted)]">
                      {r.extractedName || "Unknown"} · Score: <span className="text-[var(--color-accent)]">{r.alignmentScore}%</span>
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider border ${EMAIL_BADGE[r.emailStatus]}`}>
                    <Mail className="w-2.5 h-2.5" />
                    {EMAIL_LABEL[r.emailStatus]}
                  </span>
                  {r.status === "Failed" && (
                    <span className="text-[10px] text-red-400 font-mono max-w-[160px] truncate">{r.error}</span>
                  )}
                  {r._id && (
                    <button
                      onClick={() => handleDeleteApplicant(r._id)}
                      className="p-1.5 rounded text-[var(--color-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                      title="Remove applicant & resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
