import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Plus, UploadCloud, FileText, X,
  Loader2, Trash2, CheckCircle, ChevronDown, Tag,
  AlertCircle, RefreshCw,
} from "lucide-react";
import api from "../utils/api";

/* ═══════════════════════════════════════════════════
   BLUEPRINT — Job Creation & Management
   Recruiter creates jobs by uploading a JD PDF or
   typing manually. Parsed skills shown as tags.
   ═══════════════════════════════════════════════════ */

const SkillTag = ({ skill }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/8 text-[var(--color-accent)]">
    <Tag className="w-2.5 h-2.5" />
    {skill}
  </span>
);

const StatusBadge = ({ status }) => {
  const map = {
    active:   "text-emerald-400 border-emerald-400/30 bg-emerald-400/8",
    closed:   "text-red-400 border-red-400/30 bg-red-400/8",
    draft:    "text-yellow-400 border-yellow-400/30 bg-yellow-400/8",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-widest border ${map[status] || map.draft}`}>
      {status || "active"}
    </span>
  );
};

export default function Blueprint() {
  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [mode, setMode]               = useState("list");   // "list" | "upload" | "manual"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg]   = useState("");
  const [expandedJob, setExpandedJob] = useState(null);

  // Upload mode
  const [uploadFile, setUploadFile]   = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [isDragging, setIsDragging]   = useState(false);
  const fileRef = useRef(null);

  // Manual mode
  const [manualForm, setManualForm] = useState({ title: "", description: "" });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/verify/my-jobs");
      setJobs(data || []);
    } catch {
      setError("Failed to load jobs. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // ── Upload JD PDF ──────────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setUploadFile(f);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setIsSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("jobDescription", uploadFile);
      if (uploadTitle.trim()) fd.append("title", uploadTitle.trim());
      const { data } = await api.post("/api/verify/job/from-file", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setJobs(prev => [data, ...prev]);
      setSuccessMsg(`Job Role "${data.title}" created — ${data.targetSkills?.length || 0} skills extracted.`);
      setMode("list");
      setUploadFile(null);
      setUploadTitle("");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Is the AI engine running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Manual JD ─────────────────────────────────────────────────────────
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.title.trim() || !manualForm.description.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/api/verify/job", {
        title: manualForm.title.trim(),
        description: manualForm.description.trim(),
      });
      setJobs(prev => [data, ...prev]);
      setSuccessMsg(`Job Role "${data.title}" saved.`);
      setMode("list");
      setManualForm({ title: "", description: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job role?")) return;
    try {
      await api.delete(`/api/verify/job/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
    } catch {
      setError("Failed to delete.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="vp-label-accent mb-1">Recruiter / Job Roles</p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Job <span className="text-[var(--color-accent)] not-italic">Roles</span>
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Create job roles from PDF descriptions or manually. Skills are auto-extracted.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setMode(mode === "upload" ? "list" : "upload")}
            className="vp-btn vp-btn-secondary text-xs px-4 py-2 gap-2"
          >
            <UploadCloud className="w-3.5 h-3.5" /> PDF Upload
          </button>
          <button
            onClick={() => setMode(mode === "manual" ? "list" : "manual")}
            className="vp-btn vp-btn-accent text-xs px-4 py-2 gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> Manual
          </button>
        </div>
      </div>

      {/* ── Feedback banners ── */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-mono"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            {successMsg}
            <button className="ml-auto" onClick={() => setSuccessMsg("")}><X className="w-3.5 h-3.5" /></button>
          </motion.div>
        )}
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

      {/* ── PDF Upload Panel ── */}
      <AnimatePresence>
        {mode === "upload" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="vp-glass p-6 rounded-[var(--radius-xl)] space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-[var(--color-border)] pb-3">
                Parse JD from PDF
              </h2>
              <input
                type="text"
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
                placeholder="Job title (optional — extracted from filename if blank)"
                className="vp-input w-full"
              />
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-[var(--radius-lg)] p-10 flex flex-col items-center text-center cursor-pointer transition-colors ${
                  isDragging ? "border-[var(--color-accent)] bg-[var(--color-accent)]/8" : "border-[var(--color-border)] hover:border-[var(--color-text)]"
                }`}
              >
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { if (e.target.files[0]) setUploadFile(e.target.files[0]); }} />
                <UploadCloud className="w-10 h-10 text-[var(--color-muted)] mb-3" />
                {uploadFile
                  ? <p className="text-sm font-mono text-[var(--color-accent)]">{uploadFile.name}</p>
                  : <><p className="font-bold text-[var(--color-text)]">Drop your Job Description PDF here</p>
                     <p className="text-xs text-[var(--color-muted)] mt-1">or click to browse · PDF only · max 5MB</p></>
                }
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setMode("list"); setUploadFile(null); }} className="vp-btn vp-btn-secondary text-xs px-4 py-2">Cancel</button>
                <button
                  disabled={!uploadFile || isSubmitting}
                  onClick={handleUploadSubmit}
                  className="vp-btn vp-btn-accent text-xs px-6 py-2 gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Parsing…</> : "Parse & Create"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Manual Panel ── */}
      <AnimatePresence>
        {mode === "manual" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleManualSubmit} className="vp-glass p-6 rounded-[var(--radius-xl)] space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-[var(--color-border)] pb-3">
                Create Job Manually
              </h2>
              <input
                required
                type="text"
                value={manualForm.title}
                onChange={e => setManualForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Job Title (e.g. Senior Backend Engineer)"
                className="vp-input w-full"
              />
              <textarea
                required
                rows={6}
                value={manualForm.description}
                onChange={e => setManualForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Paste the full job description here — skills, experience, responsibilities…"
                className="vp-input w-full resize-none"
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setMode("list")} className="vp-btn vp-btn-secondary text-xs px-4 py-2">Cancel</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="vp-btn vp-btn-accent text-xs px-6 py-2 gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : "Save Blueprint"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Job List ── */}
      <div className="vp-glass rounded-[var(--radius-xl)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Active Blueprints ({jobs.length})
          </h2>
          <button onClick={fetchJobs} className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-[var(--color-muted)]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-mono text-xs uppercase tracking-widest">Loading blueprints…</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-[var(--color-muted)]">
            <Briefcase className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No blueprints yet — upload a JD or create one manually.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {jobs.map(job => (
              <div key={job._id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-bold text-sm uppercase tracking-wide truncate">{job.title}</h3>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="text-xs text-[var(--color-muted)] font-mono">
                      Created {new Date(job.createdAt).toLocaleDateString()} ·{" "}
                      {job.targetSkills?.length || 0} skills extracted
                    </p>
                    {expandedJob === job._id && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 space-y-3"
                      >
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-4">
                          {job.description}
                        </p>
                        {job.targetSkills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {job.targetSkills.map((s, i) => <SkillTag key={i} skill={s} />)}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                      className="p-2 rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-sunken)] transition-all"
                      title="Expand"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedJob === job._id ? "rotate-180" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="p-2 rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-red-500/8 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
