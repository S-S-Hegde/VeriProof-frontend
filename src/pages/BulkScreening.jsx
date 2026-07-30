import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, FileText, X, AlertCircle, CheckCircle,
  Users, Loader2, Mail, Clock, RefreshCw, ChevronDown,
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
  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter(
      f => f.type === "application/pdf" ||
           f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
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
    files.forEach(f => fd.append("resumes", f));

    try {
      const { data } = await api.post("/api/verify/applicants/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        // Long timeout — serial processing with 800ms gaps
        timeout: files.length * 30000 + 5000,
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

  const selectedJob = jobs.find(j => j._id === selectedJobId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <p className="vp-label-accent mb-1">Recruiter / Intake</p>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">
          In<span className="text-[var(--color-accent)] not-italic">take</span>
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Drop resumes in bulk. AI parses each one and sends an invite email to the candidate.
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

        {/* ── Left: Drop zone + job selector ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Job selector */}
          <div className="vp-glass p-4 rounded-[var(--radius-xl)]">
            <label className="vp-label mb-2 block">Select Blueprint (Job Role)</label>
            {jobs.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)] font-mono py-2">
                No blueprints found — create one in the Blueprint page first.
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
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`vp-glass border-2 border-dashed rounded-[var(--radius-xl)] p-10 flex flex-col items-center text-center cursor-pointer transition-colors min-h-[240px] justify-center ${
              isDragging
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/8"
                : "border-[var(--color-border)] hover:border-[var(--color-text)]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx"
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />
            <motion.div animate={{ y: isDragging ? -8 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
              <UploadCloud className="w-12 h-12 text-[var(--color-muted)] mb-3 mx-auto" />
            </motion.div>
            <p className="font-bold text-[var(--color-text)] mb-1">Drop Resumes Here</p>
            <p className="text-xs text-[var(--color-muted)] mb-4">
              PDF or DOCX · up to 5MB each · duplicates ignored
            </p>
            <button className="vp-btn vp-btn-secondary text-xs px-5 py-2" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              Browse Files
            </button>
          </div>

          {/* Rate-limit note */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-yellow-500/8 border border-yellow-500/20">
            <Clock className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-[10px] font-mono text-yellow-400/80 leading-relaxed">
              Resumes are processed one-at-a-time (free-tier AI rate-limit). Allow ~{files.length > 0 ? files.length * 5 : 5}–{files.length > 0 ? files.length * 10 : 10}s per file. Do not close the page.
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
                : <><UploadCloud className="w-3.5 h-3.5" /> Initiate Intake</>
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
                  <p className="text-sm font-bold">Intake Complete</p>
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
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
