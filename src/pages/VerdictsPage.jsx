import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Download, RefreshCw, Filter, ChevronDown,
  ChevronUp, Mail, AlertCircle, Loader2, FileText,
  CheckCircle, X, ArrowUpDown, Trophy, Trash2, GraduationCap, Clock, ShieldCheck
} from "lucide-react";
import api from "../utils/api";
import ConfirmModal from "../components/ConfirmModal";


/* ═══════════════════════════════════════════════════
   VERDICTS — Ranked Results & Export
   Shows all applicants ranked by alignment score.
   Filter by job, sort any column, export to CSV.
   ═══════════════════════════════════════════════════ */

const ExamBadge = ({ status, score }) => {
  if (status === "Attended") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] uppercase font-bold">
        <GraduationCap className="w-3 h-3" />
        Attended ({score ?? 0}%)
      </span>
    );
  }
  if (status === "In Progress") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 font-mono text-[9px] uppercase font-bold">
        <Loader2 className="w-3 h-3 animate-spin" />
        In Progress
      </span>
    );
  }
  if (status === "Not Attended") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[9px] uppercase font-bold">
        <Clock className="w-3 h-3" />
        Not Attended
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-500/30 bg-slate-500/10 text-slate-400 font-mono text-[9px] uppercase">
      Unregistered
    </span>
  );
};

// ── Score bar ──────────────────────────────────────────────────────────
const ScoreBar = ({ score }) => {
  const colour =
    score >= 70 ? "#34d399" :
    score >= 40 ? "#fbbf24" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-sunken)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: colour, height: "100%", borderRadius: 99 }}
        />
      </div>
      <span className="font-mono text-[11px] font-bold w-8 text-right" style={{ color: colour }}>
        {score}%
      </span>
    </div>
  );
};

// ── Email badge ────────────────────────────────────────────────────────
const EmailBadge = ({ status }) => {
  const map = {
    sent:      { cls: "text-emerald-400 border-emerald-400/30", label: "Sent" },
    failed:    { cls: "text-red-400 border-red-400/30",         label: "Failed" },
    not_found: { cls: "text-[var(--color-muted)] border-[var(--color-border)]", label: "—" },
  };
  const cfg = map[status] || map.not_found;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider border ${cfg.cls}`}>
      <Mail className="w-2.5 h-2.5" /> {cfg.label}
    </span>
  );
};

// ── Sortable column header ─────────────────────────────────────────────
const SortHeader = ({ label, field, sortField, sortDir, onSort }) => (
  <th
    className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] cursor-pointer select-none hover:text-[var(--color-text)] transition-colors"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1">
      {label}
      {sortField === field
        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        : <ArrowUpDown className="w-3 h-3 opacity-30" />}
    </div>
  </th>
);

// ── CSV export ─────────────────────────────────────────────────────────
const exportCSV = (rows, jobTitle) => {
  const headers = ["Rank","Name","File","Job","Score (%)","Skills Matched","Status","Email Status","Email Sent To","Processed At"];
  const lines = rows.map((r, i) => [
    i + 1,
    r.extractedName || "",
    r.originalFileName,
    r.jobId?.title || "",
    r.alignmentScore,
    (r.matchedSkills || []).length,
    r.status,
    r.emailStatus,
    r.emailSentTo || "",
    r.processedAt ? new Date(r.processedAt).toLocaleString() : "",
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `verdicts_${(jobTitle || "all").replace(/\s+/g, "_")}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ══════════════════════════════════════════════════════════════════════
export default function Verdicts() {
  const [jobs, setJobs]             = useState([]);
  const [jobFilter, setJobFilter]   = useState("all");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [sortField, setSortField]   = useState("alignmentScore");
  const [sortDir, setSortDir]       = useState("desc");
  const [expandedId, setExpandedId] = useState(null);

  // Modal deletion state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  // V2 Pipeline state
  const [runningPipelines, setRunningPipelines] = useState({});

  const runVerificationPipeline = async (candidateId, force = false) => {
    setRunningPipelines(prev => ({ ...prev, [candidateId]: true }));
    try {
      const { data } = await api.post(`/api/verify/candidate/${candidateId}`, { force });
      setApplicants(prev => prev.map(app => 
        app._id === candidateId ? { ...app, v2Report: data } : app
      ));
    } catch (err) {
      setError(err.response?.data?.message || "Verification pipeline failed.");
    } finally {
      setRunningPipelines(prev => ({ ...prev, [candidateId]: false }));
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [jobsRes, appRes] = await Promise.all([
        api.get("/api/verify/my-jobs"),
        api.get("/api/verify/applicants", {
          params: jobFilter !== "all" ? { jobId: jobFilter } : {},
        }),
      ]);
      setJobs(jobsRes.data || []);
      setApplicants(appRes.data || []);
    } catch {
      setError("Failed to load verdicts. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [jobFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const handleDeleteApplicant = (app) => {
    setDeleteTarget(app);
  };

  const confirmDeleteApplicant = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/verify/applicants/${deleteTarget._id}`);
      setApplicants(prev => prev.filter(app => app._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove applicant.");
    } finally {
      setIsDeleting(false);
    }
  };


  // Sort + filter
  const sorted = useMemo(() => {
    return [...applicants].sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [applicants, sortField, sortDir]);

  const topScore = sorted[0]?.alignmentScore ?? 0;
  const avgScore = applicants.length
    ? Math.round(applicants.reduce((s, r) => s + (r.alignmentScore || 0), 0) / applicants.length)
    : 0;
  const emailsSent = applicants.filter(r => r.emailStatus === "sent").length;

  const selectedJobTitle = jobs.find(j => j._id === jobFilter)?.title;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="vp-label-accent mb-1">Recruiter / Verdicts</p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Ver<span className="text-[var(--color-accent)] not-italic">dicts</span>
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Ranked applicant results with AI alignment scores and outreach status.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="vp-btn vp-btn-secondary text-xs px-4 py-2 gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => exportCSV(sorted, selectedJobTitle)}
            disabled={sorted.length === 0}
            className="vp-btn vp-btn-accent text-xs px-5 py-2 gap-2 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono"
          >
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            <button className="ml-auto" onClick={() => setError("")}><X className="w-3.5 h-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Applicants", value: applicants.length, icon: FileText, color: "text-[var(--color-accent)]" },
          { label: "Top Score",        value: `${topScore}%`,    icon: Trophy,   color: "text-yellow-400" },
          { label: "Avg Score",        value: `${avgScore}%`,    icon: BarChart3,color: "text-sky-400" },
          { label: "Emails Sent",      value: emailsSent,        icon: Mail,     color: "text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="vp-glass p-4 rounded-[var(--radius-xl)]">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <p className="vp-label">{label}</p>
            </div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Job filter ── */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-[var(--color-muted)]" />
        <label className="vp-label">Filter by Job:</label>
        <div className="relative">
          <select
            value={jobFilter}
            onChange={e => setJobFilter(e.target.value)}
            className="vp-input py-1.5 pr-8 text-xs appearance-none"
          >
            <option value="all">All Jobs</option>
            {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)] pointer-events-none" />
        </div>
        <span className="font-mono text-[10px] text-[var(--color-muted)]">
          {sorted.length} result{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="vp-glass rounded-[var(--radius-xl)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-[var(--color-muted)]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-mono text-xs uppercase tracking-widest">Loading verdicts…</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-[var(--color-muted)]">
            <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No results yet — use Intake to process resumes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg-sunken)]/50">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] w-10">#</th>
                  <SortHeader label="Candidate"  field="extractedName"   sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="File"       field="originalFileName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">Job</th>
                  <SortHeader label="Score"      field="alignmentScore"   sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Status"     field="status"           sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Email"      field="emailStatus"      sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Exam Status" field="examStatus"      sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Processed"  field="processedAt"      sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {sorted.map((r, idx) => (
                  <React.Fragment key={r._id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
                      className="hover:bg-[var(--color-bg-sunken)]/40 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">
                        {idx === 0 && <Trophy className="w-3.5 h-3.5 text-yellow-400 inline mr-1" />}
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-xs truncate max-w-[140px]">
                          {r.extractedName || <span className="text-[var(--color-muted)]">Unknown</span>}
                        </p>
                        {r.emailSentTo && (
                          <p className="text-[10px] font-mono text-[var(--color-muted)] truncate max-w-[140px]">{r.emailSentTo}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[var(--color-muted)] max-w-[160px]">
                        <p className="truncate">{r.originalFileName}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)] max-w-[120px]">
                        <p className="truncate">{r.jobId?.title || "—"}</p>
                      </td>
                      <td className="px-4 py-3 min-w-[120px]">
                        <ScoreBar score={r.alignmentScore || 0} />
                      </td>
                      <td className="px-4 py-3">
                        {r.status === "Completed"
                          ? <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono uppercase"><CheckCircle className="w-3 h-3" /> Done</span>
                          : r.status === "Failed"
                          ? <span className="flex items-center gap-1 text-red-400 text-[10px] font-mono uppercase"><AlertCircle className="w-3 h-3" /> Failed</span>
                          : <span className="flex items-center gap-1 text-yellow-400 text-[10px] font-mono uppercase"><Loader2 className="w-3 h-3 animate-spin" /> Processing</span>
                        }
                      </td>
                      <td className="px-4 py-3"><EmailBadge status={r.emailStatus} /></td>
                      <td className="px-4 py-3"><ExamBadge status={r.examStatus} score={r.examScore} /></td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[var(--color-muted)]">
                        {r.processedAt ? new Date(r.processedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDeleteApplicant(r)}
                          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-red-400 hover:bg-red-500/8 transition-all"
                          title="Remove applicant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                    {expandedId === r._id && (
                      <tr>
                        <td colSpan={10} className="px-6 py-4 bg-[var(--color-bg-sunken)]/30 border-b border-[var(--color-border)]">
                          <div className="space-y-4 font-mono text-xs">
                            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-muted)]">V2 Pipeline Intelligence</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); runVerificationPipeline(r._id, true); }}
                                  disabled={runningPipelines[r._id]}
                                  className="vp-btn vp-btn-secondary px-3 py-1 text-[10px]"
                                >
                                  {runningPipelines[r._id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                  {r.v2Report ? "Re-run Verification" : "Run Verification"}
                                </button>
                              </div>
                            </div>
                            
                            {!r.v2Report && !runningPipelines[r._id] && (
                              <div className="py-6 text-center text-[var(--color-muted)] flex flex-col items-center">
                                <ShieldCheck className="w-8 h-8 mb-2 opacity-30" />
                                <p className="uppercase tracking-widest text-[10px]">No verification report generated.</p>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); runVerificationPipeline(r._id, false); }}
                                  className="mt-3 vp-btn vp-btn-accent px-4 py-2 text-[10px]"
                                >
                                  Run V2 Verification Pipeline
                                </button>
                              </div>
                            )}

                            {runningPipelines[r._id] && (
                              <div className="py-8 flex flex-col items-center justify-center text-[var(--color-accent)] gap-3">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="uppercase tracking-[0.2em] text-[10px] animate-pulse">Running Modules 1-12...</span>
                              </div>
                            )}

                            {r.v2Report && !runningPipelines[r._id] && (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                                {/* Left Column */}
                                <div className="space-y-6">
                                  {/* Trust Score & Decision */}
                                  <div className="vp-glass p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <p className="text-[10px] uppercase font-bold text-[var(--color-accent)]">Recruiter Decision</p>
                                        <p className={`text-xl font-black italic tracking-tight ${r.v2Report.recruiter_decision?.recommendation === 'Strong Hire' ? 'text-emerald-400' : r.v2Report.recruiter_decision?.recommendation === 'Reject' ? 'text-red-400' : 'text-yellow-400'}`}>
                                          {r.v2Report.recruiter_decision?.recommendation || "N/A"}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-[var(--color-muted)]">Trust Score</p>
                                        <p className="text-2xl font-black">{r.v2Report.trust_score?.final_trust_score || 0}%</p>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      {r.v2Report.recruiter_decision?.supported_by?.map((sup, i) => (
                                        <p key={i} className="text-[9px] text-[var(--color-muted)] flex items-center gap-1">
                                          <CheckCircle className="w-3 h-3 text-emerald-500/50" /> {sup}
                                        </p>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Candidate Profile */}
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-[var(--color-accent)] mb-2">Candidate Profile</p>
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                      <div className="bg-[var(--color-bg-sunken)] p-2 rounded">
                                        <span className="text-[var(--color-muted)]">Persona:</span> {r.v2Report.candidate_profile?.classification || "Unknown"}
                                      </div>
                                      <div className="bg-[var(--color-bg-sunken)] p-2 rounded">
                                        <span className="text-[var(--color-muted)]">Seniority:</span> {r.v2Report.candidate_profile?.seniority || "Unknown"}
                                      </div>
                                      <div className="bg-[var(--color-bg-sunken)] p-2 rounded col-span-2">
                                        <span className="text-[var(--color-muted)]">Strengths:</span> {r.v2Report.candidate_profile?.primary_strengths?.join(", ") || "None detected"}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Evidence */}
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-[var(--color-accent)] mb-2">Evidence Processed</p>
                                    <div className="flex flex-wrap gap-2">
                                      {r.v2Report.pipeline_execution?.filter(x => x.status === "Completed").map((exec, i) => (
                                        <span key={i} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] rounded-full">
                                          {exec.module}
                                        </span>
                                      ))}
                                      {r.v2Report.pipeline_execution?.filter(x => x.status === "Skipped").map((exec, i) => (
                                        <span key={i} className="px-2 py-1 bg-[var(--color-muted)]/10 border border-[var(--color-muted)]/20 text-[var(--color-muted)] text-[9px] rounded-full" title={exec.reason}>
                                          {exec.module} (Skipped)
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                  {/* Competencies */}
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-[var(--color-accent)] mb-2">Competencies & Capabilities</p>
                                    <div className="space-y-2">
                                      {Object.entries(r.v2Report.competencies?.scores || {}).map(([comp, score], i) => (
                                        <div key={i} className="flex items-center gap-2">
                                          <span className="text-[9px] uppercase tracking-wider w-24 truncate" title={comp}>{comp.replace(/_/g, ' ')}</span>
                                          <div className="flex-1 h-1.5 bg-[var(--color-bg-sunken)] rounded-full overflow-hidden">
                                            <div className="h-full bg-sky-400 rounded-full" style={{ width: `${score}%` }} />
                                          </div>
                                          <span className="text-[9px] w-6 text-right font-bold">{score}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Risks & Recommendations */}
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-red-400 mb-2">Identified Risks</p>
                                    {r.v2Report.recruiter_decision?.risk_flags?.length > 0 ? (
                                      <ul className="space-y-1">
                                        {r.v2Report.recruiter_decision.risk_flags.map((risk, i) => (
                                          <li key={i} className="text-[9px] text-[var(--color-text)] flex items-start gap-1">
                                            <AlertCircle className="w-3 h-3 text-red-400 shrink-0" /> {risk.description || risk}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-[9px] text-[var(--color-muted)]">No critical risks identified.</p>
                                    )}
                                  </div>

                                  {/* Audit Trail */}
                                  <div className="border-t border-[var(--color-border)] pt-4 mt-2">
                                    <p className="text-[9px] uppercase tracking-widest text-[var(--color-muted)] mb-1 flex items-center gap-1">
                                      <FileText className="w-3 h-3" /> System Audit Trail
                                    </p>
                                    <p className="text-[9px] text-[var(--color-muted)]/70">
                                      Pipeline Version: {r.v2Report.recruiter_decision?.audit_trail?.pipeline_version || "2.0"} <br/>
                                      Processed At: {r.v2Report.recruiter_decision?.audit_trail?.decision_timestamp ? new Date(r.v2Report.recruiter_decision.audit_trail.decision_timestamp).toLocaleString() : "Unknown"} <br/>
                                      Req ID: {r.v2Report.request_id || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export reminder */}
      {sorted.length > 0 && (
        <p className="text-center text-[10px] font-mono text-[var(--color-muted)]">
          {sorted.length} candidates ranked by {sortField} ({sortDir}) · Click column headers to re-sort · CSV export includes all data
        </p>
      )}

      {/* Remove Applicant Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={confirmDeleteApplicant}
        title="Remove Applicant"
        message="Are you sure you want to remove this applicant from the ranking list?"
        subtitle={deleteTarget ? `${deleteTarget.extractedName || "Unknown Candidate"} — ${deleteTarget.originalFileName}` : ""}
        confirmText="Remove Applicant"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
