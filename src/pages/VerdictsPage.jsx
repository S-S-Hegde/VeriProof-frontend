import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BarChart3, Download, RefreshCw, Filter, ChevronDown,
  ChevronUp, Mail, AlertCircle, Loader2, FileText,
  CheckCircle, X, ArrowUpDown, Trophy, Trash2, GraduationCap,
  Clock, ShieldCheck, GripVertical, Star, StarOff, Send, CheckSquare,
  Brain, Sparkles, CheckCircle2, XCircle, Tag,
} from "lucide-react";
import api from "../utils/api";
import ConfirmModal from "../components/ConfirmModal";

const ExamBadge = ({ status, score }) => {
  if (status === "Attended") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] uppercase font-bold">
      <GraduationCap className="w-3 h-3" /> Attended ({score ?? 0}%)
    </span>
  );
  if (status === "In Progress") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 font-mono text-[9px] uppercase font-bold">
      <Loader2 className="w-3 h-3 animate-spin" /> In Progress
    </span>
  );
  if (status === "Not Attended") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[9px] uppercase font-bold">
      <Clock className="w-3 h-3" /> Not Attended
    </span>
  );
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-500/30 bg-slate-500/10 text-slate-400 font-mono text-[9px] uppercase">Unregistered</span>;
};

const ScoreBar = ({ score }) => {
  const colour = score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-sunken)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: colour, height: "100%", borderRadius: 99 }}
        />
      </div>
      <span className="font-mono text-[11px] font-bold w-8 text-right" style={{ color: colour }}>{score}%</span>
    </div>
  );
};

const EmailBadge = ({ status }) => {
  const map = {
    sent:      { cls: "text-emerald-400 border-emerald-400/30", label: "Sent" },
    failed:    { cls: "text-red-400 border-red-400/30",         label: "Failed" },
    not_found: { cls: "text-[var(--color-muted)] border-[var(--color-border)]", label: "Not Found" },
  };
  const cfg = map[status] || map.not_found;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider border ${cfg.cls}`}>
      <Mail className="w-2.5 h-2.5" /> {cfg.label}
    </span>
  );
};

const SortHeader = ({ label, field, sortField, sortDir, onSort }) => (
  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] cursor-pointer select-none hover:text-[var(--color-text)] transition-colors" onClick={() => onSort(field)}>
    <div className="flex items-center gap-1">{label}{sortField === field ? sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-30" />}</div>
  </th>
);

const exportCSV = (rows, jobTitle) => {
  const headers = ["Rank", "Candidate Name", "Email", "Original File", "Job Blueprint", "Alignment Score (%)", "Exam Score (%)", "Final Score (%)", "Matched Skills Count", "Matched Skills", "Exam Status", "Email Status", "Github Username", "Processed Date"];
  const lines = rows.map((r, i) => [
    i + 1,
    r.extractedName || "",
    r.emailSentTo || r.extractedEmail || "",
    r.originalFileName || "",
    r.jobId?.title || jobTitle || "",
    r.alignmentScore ?? 0,
    r.examScore ?? "N/A",
    r.finalScore != null ? r.finalScore : "Pending Candidate Exam",
    (r.matchedSkills || []).length,
    (r.matchedSkills || []).join("; "),
    r.examStatus || "Not Attended",
    r.emailStatus || "not_found",
    r.githubUsername || "",
    r.processedAt ? new Date(r.processedAt).toISOString() : new Date().toISOString(),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ats_export_${(jobTitle || "candidates").replace(/\s+/g, "_")}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportJSON = (rows, jobTitle) => {
  const payload = {
    exportTimestamp: new Date().toISOString(),
    jobTitle: jobTitle || "All Roles",
    totalCandidates: rows.length,
    candidates: rows.map((r, i) => ({
      rank: i + 1,
      candidateId: r._id,
      name: r.extractedName || "Candidate",
      email: r.emailSentTo || r.extractedEmail || "",
      githubUsername: r.githubUsername || "",
      originalFileName: r.originalFileName || "",
      jobTitle: r.jobId?.title || jobTitle || "",
      scores: {
        alignmentScore: r.alignmentScore ?? 0,
        examScore: r.examScore ?? null,
        finalScore: r.finalScore ?? null,
      },
      examStatus: r.examStatus || "Not Attended",
      emailStatus: r.emailStatus || "not_found",
      matchedSkills: r.matchedSkills || [],
      missingSkills: r.missingSkills || [],
      processedAt: r.processedAt || new Date(),
    })),
  };
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ats_payload_${(jobTitle || "candidates").replace(/\s+/g, "_")}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportExcel = (rows, jobTitle) => {
  const headers = ["Rank", "Name", "Email", "Job Title", "Alignment %", "Exam %", "Final Score %", "Matched Skills", "Exam Status"];
  let tableHtml = `<table border="1"><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>`;
  rows.forEach((r, i) => {
    tableHtml += `<tr>
      <td>${i + 1}</td>
      <td>${r.extractedName || ""}</td>
      <td>${r.emailSentTo || r.extractedEmail || ""}</td>
      <td>${r.jobId?.title || jobTitle || ""}</td>
      <td>${r.alignmentScore ?? 0}%</td>
      <td>${r.examScore ?? "—"}</td>
      <td>${r.finalScore != null ? r.finalScore + "%" : "Pending Exam"}</td>
      <td>${(r.matchedSkills || []).join(", ")}</td>
      <td>${r.examStatus || "Not Attended"}</td>
    </tr>`;
  });
  tableHtml += `</tbody></table>`;
  const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ats_spreadsheet_${(jobTitle || "candidates").replace(/\s+/g, "_")}_${Date.now()}.xls`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportPDFReport = (rows, jobTitle) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  const titleStr = `VeriProof ATS Candidate Ranking Verdicts - ${jobTitle || "All Roles"}`;
  const rowsHtml = rows.map((r, i) => `
    <tr>
      <td style="padding:8px;border:1px solid #ccc;font-weight:bold;text-align:center;">${i + 1}</td>
      <td style="padding:8px;border:1px solid #ccc;">${r.extractedName || "Candidate"}</td>
      <td style="padding:8px;border:1px solid #ccc;">${r.emailSentTo || r.extractedEmail || "N/A"}</td>
      <td style="padding:8px;border:1px solid #ccc;text-align:center;">${r.alignmentScore ?? 0}%</td>
      <td style="padding:8px;border:1px solid #ccc;text-align:center;">${r.examScore !== null && r.examScore !== undefined ? r.examScore + '%' : '—'}</td>
      <td style="padding:8px;border:1px solid #ccc;font-weight:bold;text-align:center;color:#059669;">${r.finalScore != null ? r.finalScore + '%' : 'Pending Exam'}</td>
      <td style="padding:8px;border:1px solid #ccc;">${(r.matchedSkills || []).join(", ") || "None"}</td>
      <td style="padding:8px;border:1px solid #ccc;text-align:center;">${r.examStatus || "Not Attended"}</td>
    </tr>
  `).join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${titleStr}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #111; }
          h1 { margin-bottom: 4px; font-size: 22px; }
          p { color: #666; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f3f4f6; padding: 10px 8px; border: 1px solid #ccc; text-align: left; }
        </style>
      </head>
      <body>
        <h1>${titleStr}</h1>
        <p>Generated on ${new Date().toLocaleString()} · Total Candidates: ${rows.length}</p>
        <table>
          <thead>
            <tr>
              <th>Rank</th><th>Candidate Name</th><th>Email</th><th>Alignment</th><th>Exam Score</th><th>Final Verdict</th><th>Matched Skills</th><th>Status</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <script>window.onload = function() { window.print(); };</script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

const SortableRow = React.memo(function SortableRow({ r, idx, isShortlisted, isSelected, onToggleSelect, cutoff, expandedId, setExpandedId, onToggleShortlist, onDelete, runningPipelines, runVerificationPipeline }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: r._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    willChange: "transform",
    transformStyle: "preserve-3d",
    backfaceVisibility: "hidden",
  };
  const isAtCutoff = idx === cutoff - 1 && cutoff > 0;

  return (
    <>
      <tr ref={setNodeRef} style={style} className={`hover:bg-[var(--color-bg-sunken)]/40 transition-colors ${isSelected ? "bg-[var(--color-accent)]/10" : ""} ${isDragging?"shadow-2xl bg-[var(--color-bg-sunken)]":""}`}>
        <td className="px-2 py-3 w-8" onClick={e=>e.stopPropagation()}>
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-[var(--color-muted)] hover:text-[var(--color-text)]"><GripVertical className="w-4 h-4" /></div>
        </td>
        <td className="px-2 py-3 w-8 text-center" onClick={e=>e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={()=>onToggleSelect(r._id)}
            className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)] cursor-pointer"
          />
        </td>
        <td className="px-3 py-3 font-mono text-xs text-[var(--color-muted)]" onClick={()=>setExpandedId(expandedId===r._id?null:r._id)}>
          {idx===0&&<Trophy className="w-3.5 h-3.5 text-yellow-400 inline mr-1"/>}{idx+1}
        </td>
        <td className="px-2 py-3 w-8" onClick={e=>e.stopPropagation()}>
          <button onClick={()=>onToggleShortlist(r._id)} className={`p-1.5 rounded transition-all ${isShortlisted?"text-yellow-400 hover:text-yellow-300":"text-[var(--color-muted)] hover:text-yellow-400"}`}>
            {isShortlisted?<Star className="w-3.5 h-3.5 fill-current"/>:<StarOff className="w-3.5 h-3.5"/>}
          </button>
        </td>
        <td className="px-4 py-3" onClick={()=>setExpandedId(expandedId===r._id?null:r._id)}>
          <p className="font-bold text-xs truncate max-w-[140px]">{r.extractedName||<span className="text-[var(--color-muted)]">Unknown</span>}</p>
          {r.emailSentTo&&<p className="text-[10px] font-mono text-[var(--color-muted)] truncate max-w-[140px]">{r.emailSentTo}</p>}
        </td>
        <td className="px-4 py-3 font-mono text-[10px] text-[var(--color-muted)] max-w-[140px]" onClick={()=>setExpandedId(expandedId===r._id?null:r._id)}><p className="truncate">{r.originalFileName}</p></td>
        <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)] max-w-[110px]" onClick={()=>setExpandedId(expandedId===r._id?null:r._id)}><p className="truncate">{r.jobId?.title||"—"}</p></td>
        <td className="px-4 py-3 min-w-[110px]" onClick={()=>setExpandedId(expandedId===r._id?null:r._id)}><ScoreBar score={r.alignmentScore||0}/></td>
        <td className="px-4 py-3 font-mono text-xs text-center" onClick={()=>setExpandedId(expandedId===r._id?null:r._id)}>
          {r.examScore!=null?<span className={`font-bold ${r.examScore>=70?"text-emerald-400":"text-red-400"}`}>{r.examScore}%</span>:<span className="text-[var(--color-muted)]">—</span>}
        </td>
        <td className="px-4 py-3 font-mono text-xs text-center" onClick={()=>setExpandedId(expandedId===r._id?null:r._id)}>
          {r.finalScore != null ? (
            <span className={`font-bold text-sm ${r.finalScore>=70?"text-emerald-400":r.finalScore>=40?"text-yellow-400":"text-red-400"}`}>{r.finalScore}%</span>
          ) : (
            <span className="text-[10px] font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 whitespace-nowrap">Pending Exam</span>
          )}
        </td>
        <td className="px-4 py-3" onClick={()=>setExpandedId(expandedId===r._id?null:r._id)}><EmailBadge status={r.emailStatus}/></td>
        <td className="px-4 py-3" onClick={()=>setExpandedId(expandedId===r._id?null:r._id)}><ExamBadge status={r.examStatus} score={r.examScore}/></td>
        <td className="px-4 py-3 text-right" onClick={e=>e.stopPropagation()}>
          <button onClick={()=>onDelete(r)} className="p-1.5 rounded text-[var(--color-muted)] hover:text-red-400 hover:bg-red-500/8 transition-all"><Trash2 className="w-4 h-4"/></button>
        </td>
      </tr>
      {isAtCutoff&&(
        <tr><td colSpan={12} className="p-0">
          <div className="flex items-center gap-3 px-4 py-1 bg-yellow-500/5 border-y border-yellow-400/30">
            <div className="flex-1 h-px bg-yellow-400/50"/>
            <span className="text-yellow-400 font-mono text-[9px] uppercase tracking-widest whitespace-nowrap">▼ Shortlist Cut-off</span>
            <div className="flex-1 h-px bg-yellow-400/50"/>
          </div>
        </td></tr>
      )}
      {expandedId===r._id&&(
        <tr><td colSpan={12} className="px-6 py-4 bg-[var(--color-bg-sunken)]/30 border-b border-[var(--color-border)]">
          <div className="space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-sky-400" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-muted)]">Candidate Resume Intelligence &amp; Score Reasoning</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e=>{e.stopPropagation();onDelete(r);}} className="vp-btn text-[10px] px-3 py-1 text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 flex items-center gap-1.5 transition-colors">
                  <Trash2 className="w-3 h-3"/>Remove Applicant
                </button>
                <button onClick={e=>{e.stopPropagation();runVerificationPipeline(r._id,true);}} disabled={runningPipelines[r._id]} className="vp-btn vp-btn-secondary px-3 py-1 text-[10px]">
                  {runningPipelines[r._id]?<Loader2 className="w-3 h-3 animate-spin"/>:<RefreshCw className="w-3 h-3"/>}{r.v2Report?"Re-run V2 Pipeline":"Run V2 Verification"}
                </button>
              </div>
            </div>

            {/* ── AI Alignment Score Reasoning Card ── */}
            <div className="vp-glass p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] space-y-3 bg-[var(--color-bg-surface)]/80">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[var(--color-border)]/50">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-[var(--color-muted)]">Target Alignment:</span>
                  <span className={`px-2.5 py-0.5 rounded font-bold uppercase border ${
                    r.alignmentScore >= 70 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                    r.alignmentScore >= 40 ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                    "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    {r.alignmentScore ?? 0}% Match — {
                      (r.alignmentScore ?? 0) >= 70 ? "Strong Skill Alignment" :
                      (r.alignmentScore ?? 0) >= 40 ? "Moderate Skill Alignment" :
                      "Low Skill Alignment"
                    }
                  </span>
                </div>
                {r.jobId?.title && (
                  <span className="text-[10px] text-[var(--color-muted)] font-mono">
                    Job Role: <span className="text-[var(--color-text)] font-bold">{r.jobId.title}</span>
                  </span>
                )}
              </div>

              {/* Reasoning Quote Banner */}
              <div className="p-3 rounded bg-[var(--color-bg-sunken)] border border-[var(--color-border)]/60 text-xs text-[var(--color-text)] font-sans leading-relaxed flex gap-2.5 items-start">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Score Breakdown Reasoning
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {r.reasoning || (
                      (r.matchedSkills && r.matchedSkills.length > 0) ? (
                        `Candidate matched ${r.matchedSkills.length} required skill(s): ${r.matchedSkills.join(", ")}.` +
                        (r.missingSkills?.length ? ` Skill gaps: ${r.missingSkills.join(", ")}.` : "")
                      ) : (
                        `Candidate resume scored at ${r.alignmentScore || 0}% alignment based on general keyword density and profile match.`
                      )
                    )}
                  </p>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {/* Matched Skills */}
                <div className="p-2.5 rounded bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Matched Target Skills ({r.matchedSkills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.matchedSkills?.length ? (
                      r.matchedSkills.map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-semibold">
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-mono text-[var(--color-muted)] italic">No direct matches</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-2.5 rounded bg-red-500/5 border border-red-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-red-400 uppercase">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Missing Skill Gaps ({r.missingSkills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.missingSkills?.length ? (
                      r.missingSkills.map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] font-mono font-semibold">
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400 italic">No skill gaps detected</span>
                    )}
                  </div>
                </div>

                {/* Extracted Claimed Resume Skills */}
                {(() => {
                  const extractedSkillsList = (r.claimedSkills && r.claimedSkills.length > 0)
                    ? r.claimedSkills
                    : ((r.claims?.skills && r.claims.skills.length > 0)
                        ? r.claims.skills
                        : (r.matchedSkills || []));
                  return (
                    <div className="p-2.5 rounded bg-sky-500/5 border border-sky-500/20 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-400 uppercase">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Extracted Resume Skills ({extractedSkillsList.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar">
                        {extractedSkillsList.length ? (
                          extractedSkillsList.map((sk, idx) => {
                            const skillName = typeof sk === "string" ? sk : sk.skill || sk.name || "";
                            return skillName ? (
                              <span key={idx} className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-mono font-semibold">
                                {skillName}
                              </span>
                            ) : null;
                          })
                        ) : (
                          <span className="text-[10px] font-mono text-[var(--color-muted)] italic">No claimed skills extracted</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ── V2 Verification Pipeline Section ── */}
            {!r.v2Report&&!runningPipelines[r._id]&&(
              <div className="py-4 px-6 text-center text-[var(--color-muted)] flex flex-col items-center border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)]">
                <ShieldCheck className="w-6 h-6 mb-1 opacity-30"/>
                <p className="uppercase tracking-widest text-[10px]">Deep V2 Verification Report Not Generated</p>
                <button onClick={e=>{e.stopPropagation();runVerificationPipeline(r._id,false);}} className="mt-2 vp-btn vp-btn-accent px-4 py-1.5 text-[10px]">
                  Run V2 Verification Pipeline
                </button>
              </div>
            )}
            {runningPipelines[r._id]&&<div className="py-6 flex flex-col items-center text-[var(--color-accent)] gap-3"><Loader2 className="w-6 h-6 animate-spin"/><span className="uppercase tracking-[0.2em] text-[10px] animate-pulse">Running Modules 1-12...</span></div>}
            {r.v2Report&&!runningPipelines[r._id]&&(
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div className="vp-glass p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                  <p className="text-[10px] uppercase font-bold text-[var(--color-accent)] mb-1">Recruiter Decision</p>
                  <p className={`text-xl font-black italic ${r.v2Report.recruiter_decision?.recommendation==="Strong Hire"?"text-emerald-400":r.v2Report.recruiter_decision?.recommendation==="Reject"?"text-red-400":"text-yellow-400"}`}>{r.v2Report.recruiter_decision?.recommendation||"N/A"}</p>
                  <p className="text-2xl font-black mt-2">Trust: {r.v2Report.trust_score?.final_trust_score||0}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--color-accent)] mb-2">Competencies</p>
                  <div className="space-y-2">{Object.entries(r.v2Report.competencies?.scores||{}).map(([c,s],i)=>(
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[9px] uppercase w-24 truncate">{c.replace(/_/g," ")}</span>
                      <div className="flex-1 h-1.5 bg-[var(--color-bg-sunken)] rounded-full overflow-hidden"><div className="h-full bg-sky-400 rounded-full" style={{width:`${s}%`}}/></div>
                      <span className="text-[9px] w-6 text-right font-bold">{s}</span>
                    </div>
                  ))}</div>
                </div>
              </div>
            )}
          </div>
        </td></tr>
      )}
    </>
  );
});

export default function Verdicts() {
  const [jobs, setJobs]         = useState([]);
  const [jobFilter, setJobFilter] = useState("all");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [sortField, setSortField] = useState("finalScore");
  const [sortDir, setSortDir]   = useState("desc");
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [topN, setTopN]         = useState(20);
  const [topNInput, setTopNInput] = useState("20");
  const [shortlistOrder, setShortlistOrder] = useState([]);
  const [isSavingShortlist, setIsSavingShortlist] = useState(false);
  const [digestSending, setDigestSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [runningPipelines, setRunningPipelines] = useState({});
  const [selectedIds, setSelectedIds]           = useState(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting]     = useState(false);

  const toggleSelectRow = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const runVerificationPipeline = async (candidateId, force=false) => {
    setRunningPipelines(prev=>({...prev,[candidateId]:true}));
    try {
      const {data} = await api.post(`/api/verify/candidate/${candidateId}`,{force});
      setApplicants(prev=>prev.map(app=>app._id===candidateId?{...app,v2Report:data}:app));
    } catch(err) { setError(err.response?.data?.message||"Pipeline failed."); }
    finally { setRunningPipelines(prev=>({...prev,[candidateId]:false})); }
  };

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [jobsRes,appRes] = await Promise.all([
        api.get("/api/verify/my-jobs"),
        api.get("/api/verify/applicants",{params:jobFilter!=="all"?{jobId:jobFilter}:{}}),
      ]);
      setJobs(jobsRes.data||[]);
      const fetched = appRes.data||[];
      setApplicants(fetched);
      const savedOrder = fetched.filter(a=>a.shortlisted).sort((a,b)=>(a.shortlistRank??999)-(b.shortlistRank??999)).map(a=>a._id);
      setShortlistOrder(savedOrder.length>0?savedOrder:fetched.slice(0,topN).map(a=>a._id));
    } catch { setError("Failed to load verdicts."); }
    finally { setLoading(false); }
  }, [jobFilter]);

  useEffect(()=>{fetchData();},[fetchData]);

  const sorted = useMemo(()=>[...applicants].sort((a,b)=>{
    let av=a[sortField],bv=b[sortField];
    if(typeof av==="string")av=av.toLowerCase();
    if(typeof bv==="string")bv=bv.toLowerCase();
    if(av<bv)return sortDir==="asc"?-1:1;
    if(av>bv)return sortDir==="asc"?1:-1;
    return 0;
  }),[applicants,sortField,sortDir]);

  const shortlistedIds = useMemo(()=>{
    const top = sorted.slice(0,topN).map(a=>a._id);
    if(shortlistOrder.length===0)return top;
    const result = shortlistOrder.filter(id=>top.includes(id));
    const orderSet = new Set(shortlistOrder);
    top.forEach(id=>{if(!orderSet.has(id))result.push(id);});
    return result.slice(0,topN);
  },[sorted,topN,shortlistOrder]);

  const shortlistIdSet = useMemo(()=>new Set(shortlistedIds),[shortlistedIds]);

  const handleSort = field => {
    if(sortField===field)setSortDir(d=>d==="asc"?"desc":"asc");
    else{setSortField(field);setSortDir("desc");}
  };

  const handleTopNInput = val => {
    setTopNInput(val);
    const n=parseInt(val,10);
    if(!isNaN(n)&&n>0&&n<=applicants.length)setTopN(n);
  };

  const handleToggleShortlist = id => {
    setShortlistOrder(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  };

  const handleDragEnd = ({active,over}) => {
    if(!over||active.id===over.id)return;
    setShortlistOrder(prev=>{
      const oi=prev.indexOf(active.id);const ni=prev.indexOf(over.id);
      if(oi===-1||ni===-1)return prev;
      return arrayMove(prev,oi,ni);
    });
  };

  const saveShortlist = async () => {
    setIsSavingShortlist(true);
    try {
      const rankings = shortlistedIds.map((id,idx)=>({id,shortlistRank:idx+1,shortlisted:true}));
      const nonShortlisted = applicants.filter(a=>!shortlistIdSet.has(a._id)).map(a=>({id:a._id,shortlistRank:null,shortlisted:false}));
      await api.put("/api/verify/applicants/shortlist",{rankings:[...rankings,...nonShortlisted]});
    } catch { setError("Failed to save shortlist."); }
    finally { setIsSavingShortlist(false); }
  };

  const sendDigest = async () => {
    setDigestSending(true);
    try { const {data}=await api.post("/api/verify/daily-digest"); alert(data.message); }
    catch(err) { setError(err.response?.data?.message||"Failed to send digest."); }
    finally { setDigestSending(false); }
  };

  const confirmDelete = async () => {
    if(!deleteTarget)return; setIsDeleting(true);
    try {
      await api.delete(`/api/verify/applicants/${deleteTarget._id}`);
      setApplicants(prev=>prev.filter(a=>a._id!==deleteTarget._id));
      setShortlistOrder(prev=>prev.filter(id=>id!==deleteTarget._id));
      setDeleteTarget(null);
    } catch(err) { setError(err.response?.data?.message||"Failed to remove."); }
    finally { setIsDeleting(false); }
  };

  const topScore = sorted[0]?.finalScore??sorted[0]?.alignmentScore??0;
  const avgScore = applicants.length?Math.round(applicants.reduce((s,r)=>s+((r.finalScore ?? r.alignmentScore) || 0),0)/applicants.length):0;
  const examDone = applicants.filter(r=>r.examStatus==="Attended").length;
  const selectedJobTitle = jobs.find(j=>j._id===jobFilter)?.title;
  const shortlistRows = shortlistedIds.map(id=>applicants.find(a=>a._id===id)).filter(Boolean);
  const displayRows = activeTab==="shortlist"?shortlistRows:sorted;

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === displayRows.length && displayRows.length > 0) {
        return new Set();
      }
      return new Set(displayRows.map(r => r._id));
    });
  }, [displayRows]);

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      await api.post("/api/verify/applicants/bulk-delete", {
        applicantIds: Array.from(selectedIds),
      });
      setApplicants(prev => prev.filter(a => !selectedIds.has(a._id)));
      setShortlistOrder(prev => prev.filter(id => !selectedIds.has(id)));
      setSelectedIds(new Set());
      setBulkDeleteModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete selected candidates.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="vp-label-accent mb-1">Recruiter / Verdicts</p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Ver<span className="text-[var(--color-accent)] not-italic">dicts</span></h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">Ranked results · drag to reorder shortlist · export top-N</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchData} className="vp-btn vp-btn-secondary text-xs px-4 py-2 gap-2"><RefreshCw className={`w-3.5 h-3.5 ${loading?"animate-spin":""}`}/>Refresh</button>
          <button onClick={sendDigest} disabled={digestSending} className="vp-btn vp-btn-secondary text-xs px-4 py-2 gap-2 disabled:opacity-40">{digestSending?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Send className="w-3.5 h-3.5"/>}Send Digest</button>
          <button onClick={saveShortlist} disabled={isSavingShortlist} className="vp-btn vp-btn-secondary text-xs px-4 py-2 gap-2 disabled:opacity-40">{isSavingShortlist?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Star className="w-3.5 h-3.5 text-yellow-400"/>}Save Shortlist</button>
          <div className="relative group">
            <button disabled={displayRows.length===0} className="vp-btn vp-btn-accent text-xs px-4 py-2 gap-2 disabled:opacity-40">
              <Download className="w-3.5 h-3.5"/>Export ATS Verdicts ({displayRows.length})
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70"/>
            </button>
            <div className="absolute right-0 mt-1 w-56 bg-[var(--color-bg-sunken)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-2xl p-1 z-50 hidden group-hover:block group-focus-within:block">
              <button onClick={()=>exportCSV(displayRows,selectedJobTitle)} className="w-full text-left px-3 py-2 text-xs font-mono rounded hover:bg-[var(--color-accent)]/15 hover:text-[var(--color-accent)] transition-colors flex items-center gap-2">
                📄 CSV ATS Export (.csv)
              </button>
              <button onClick={()=>exportExcel(displayRows,selectedJobTitle)} className="w-full text-left px-3 py-2 text-xs font-mono rounded hover:bg-[var(--color-accent)]/15 hover:text-[var(--color-accent)] transition-colors flex items-center gap-2">
                📊 Excel Spreadsheet (.xls)
              </button>
              <button onClick={()=>exportJSON(displayRows,selectedJobTitle)} className="w-full text-left px-3 py-2 text-xs font-mono rounded hover:bg-[var(--color-accent)]/15 hover:text-[var(--color-accent)] transition-colors flex items-center gap-2">
                📦 JSON ATS Payload (.json)
              </button>
              <button onClick={()=>exportPDFReport(displayRows,selectedJobTitle)} className="w-full text-left px-3 py-2 text-xs font-mono rounded hover:bg-[var(--color-accent)]/15 hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 border-t border-[var(--color-border)] mt-1 pt-2">
                📝 PDF Ranking Report (.pdf)
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>{error&&(<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono"><AlertCircle className="w-4 h-4 shrink-0"/>{error}<button className="ml-auto" onClick={()=>setError("")}><X className="w-3.5 h-3.5"/></button></motion.div>)}</AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{label:"Total",value:applicants.length,icon:FileText,color:"text-[var(--color-accent)]"},{label:"Top Score",value:`${topScore}%`,icon:Trophy,color:"text-yellow-400"},{label:"Avg Score",value:`${avgScore}%`,icon:BarChart3,color:"text-sky-400"},{label:"Exams Done",value:examDone,icon:GraduationCap,color:"text-emerald-400"}].map(({label,value,icon:Icon,color})=>(
          <div key={label} className="vp-glass p-4 rounded-[var(--radius-xl)]"><div className="flex items-center gap-2 mb-1"><Icon className={`w-3.5 h-3.5 ${color}`}/><p className="vp-label">{label}</p></div><p className={`text-2xl font-black ${color}`}>{value}</p></div>
        ))}
      </div>

      {/* Top-N selector */}
      <div className="vp-glass rounded-[var(--radius-xl)] p-5 border border-yellow-400/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div><p className="vp-label-accent mb-1 flex items-center gap-2"><Star className="w-3.5 h-3.5 text-yellow-400"/>Shortlist Builder</p><p className="text-xs text-[var(--color-muted)]">Select how many top candidates to shortlist. Drag rows to reorder.</p></div>
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            {[10,15,20,30].map(n=>(
              <button key={n} onClick={()=>{setTopN(n);setTopNInput(String(n));}} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${topN===n?"bg-yellow-400/20 border-yellow-400/60 text-yellow-300":"border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"}`}>Top {n}</button>
            ))}
            <div className="flex items-center gap-2"><span className="text-xs text-[var(--color-muted)]">Custom:</span><input type="number" min={1} max={applicants.length||100} value={topNInput} onChange={e=>handleTopNInput(e.target.value)} className="vp-input w-20 py-1.5 text-xs text-center"/></div>
            <span className="text-xs font-mono text-yellow-400 font-bold">{Math.min(topN,applicants.length)} shortlisted</span>
          </div>
        </div>
      </div>

      {/* Tabs + Job filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          {[{id:"all",label:`All (${applicants.length})`},{id:"shortlist",label:`⭐ Shortlist (${shortlistRows.length})`}].map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${activeTab===tab.id?"bg-[var(--color-accent)]/15 border-[var(--color-accent)]/40 text-[var(--color-accent)]":"border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"}`}>{tab.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-[var(--color-muted)]"/>
          <label className="vp-label">Job:</label>
          <div className="relative">
            <select value={jobFilter} onChange={e=>setJobFilter(e.target.value)} className="vp-input py-1.5 pr-8 text-xs appearance-none">
              <option value="all">All Jobs</option>
              {jobs.map(j=><option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)] pointer-events-none"/>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="vp-glass rounded-[var(--radius-xl)] overflow-hidden">
        {loading?(
          <div className="flex items-center justify-center py-20 gap-3 text-[var(--color-muted)]"><Loader2 className="w-5 h-5 animate-spin"/><span className="font-mono text-xs uppercase tracking-widest">Loading verdicts…</span></div>
        ):displayRows.length===0?(
          <div className="flex flex-col items-center py-20 text-[var(--color-muted)]"><BarChart3 className="w-10 h-10 mb-3 opacity-30"/><p className="text-sm">{activeTab==="shortlist"?"No candidates shortlisted yet.":"No results — use Intake to process resumes."}</p></div>
        ):(
          <div className="overflow-x-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={displayRows.map(r=>r._id)} strategy={verticalListSortingStrategy}>
                <table className="w-full text-sm">
                  <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg-sunken)]/50">
                    <tr>
                      <th className="px-2 py-3 w-8"><GripVertical className="w-3.5 h-3.5 mx-auto opacity-30"/></th>
                      <th className="px-2 py-3 w-8 text-center" title="Select All / Deselect All">
                        <input
                          type="checkbox"
                          checked={displayRows.length > 0 && selectedIds.size === displayRows.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)] cursor-pointer"
                        />
                      </th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] w-10">#</th>
                      <th className="px-2 py-3 w-8 text-yellow-400/50" title="Star to shortlist"><Star className="w-3.5 h-3.5 mx-auto"/></th>
                      <SortHeader label="Candidate" field="extractedName" sortField={sortField} sortDir={sortDir} onSort={handleSort}/>
                      <SortHeader label="File" field="originalFileName" sortField={sortField} sortDir={sortDir} onSort={handleSort}/>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">Job</th>
                      <SortHeader label="Alignment" field="alignmentScore" sortField={sortField} sortDir={sortDir} onSort={handleSort}/>
                      <SortHeader label="Exam %" field="examScore" sortField={sortField} sortDir={sortDir} onSort={handleSort}/>
                      <SortHeader label="Final Score" field="finalScore" sortField={sortDir} sortDir={sortDir} onSort={handleSort}/>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">Email</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">Exam</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] w-12">Del</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {displayRows.map((r,idx)=>(
                      <SortableRow key={r._id} r={r} idx={idx} isShortlisted={shortlistIdSet.has(r._id)} isSelected={selectedIds.has(r._id)} onToggleSelect={toggleSelectRow} cutoff={activeTab==="all"?topN:0} expandedId={expandedId} setExpandedId={setExpandedId} onToggleShortlist={handleToggleShortlist} onDelete={setDeleteTarget} runningPipelines={runningPipelines} runVerificationPipeline={runVerificationPipeline}/>
                    ))}
                  </tbody>
                </table>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {displayRows.length>0&&<p className="text-center text-[10px] font-mono text-[var(--color-muted)]">{activeTab==="all"?`${displayRows.length} total · ⭐ ${shortlistedIds.length} shortlisted · Drag rows to reorder · ⭐ to add/remove from shortlist`:`${shortlistRows.length} in shortlist · Drag to reorder · Export CSV exports only this list`}</p>}

      <ConfirmModal isOpen={Boolean(deleteTarget)} onClose={()=>!isDeleting&&setDeleteTarget(null)} onConfirm={confirmDelete} title="Remove Applicant" message="Remove this applicant from the ranking list?" subtitle={deleteTarget?`${deleteTarget.extractedName||"Unknown"} — ${deleteTarget.originalFileName}`:""} confirmText="Remove" cancelText="Cancel" variant="danger" loading={isDeleting}/>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-[var(--radius-xl)] shadow-2xl border border-[var(--color-accent)]/30 flex items-center gap-4 bg-[var(--color-bg-raised)]/95 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 font-mono text-xs">
              <CheckSquare className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="font-bold text-[var(--color-text)]">{selectedIds.size} candidate{selectedIds.size > 1 ? "s" : ""} selected</span>
            </div>

            <div className="h-4 w-px bg-[var(--color-border)]" />

            <button
              onClick={toggleSelectAll}
              className="text-xs font-mono text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {selectedIds.size === displayRows.length ? "Deselect All" : "Select All"}
            </button>

            <button
              onClick={() => setBulkDeleteModalOpen(true)}
              className="vp-btn text-xs px-3.5 py-1.5 bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove Selected ({selectedIds.size})
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal isOpen={bulkDeleteModalOpen} onClose={() => !isBulkDeleting && setBulkDeleteModalOpen(false)} onConfirm={handleBulkDelete} title={`Remove ${selectedIds.size} Applicants`} message={`Are you sure you want to permanently remove ${selectedIds.size} selected candidate(s)? This will clean up their resume records and evaluation data.`} confirmText="Remove Selected" cancelText="Cancel" variant="danger" loading={isBulkDeleting} />
    </div>
  );
}

