/**
 * VerificationPanel.jsx
 *
 * Recruiter-facing Project Authenticity Verification Report.
 *
 * Can be used two ways:
 *   1. As a standalone page at /verification-panel/:candidateId
 *   2. Embedded as a component: <VerificationPanel candidateId="..." candidateName="..." />
 *
 * Renders, per claimed project:
 *  - authenticityScore + reviewStatus badge
 *  - Per-signal flag breakdown (ownership, fingerprint, style, pattern)
 *  - Interrogation Q&A pairs with LLM-assigned specificity scores
 *
 * Design: matches vp-glass / vp-btn / CSS variable conventions from
 * JobRolesManager.jsx and VerificationRequests.jsx.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  GitBranch,
  Clock,
  Code2,
  User,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  MessageSquare,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import api from "../utils/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v ?? 0)));

/** Colour + label for reviewStatus badges */
const STATUS_CONFIG = {
  auto_pass: {
    label: "Auto Pass",
    icon: CheckCircle,
    cls: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    dot: "bg-emerald-400",
  },
  auto_flag: {
    label: "Auto Flagged",
    icon: XCircle,
    cls: "text-red-400 border-red-400/30 bg-red-400/10",
    dot: "bg-red-400",
  },
  manual_review_required: {
    label: "Manual Review",
    icon: ShieldQuestion,
    cls: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    dot: "bg-amber-400",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    cls: "text-[var(--color-muted)] border-[var(--color-border)] bg-[var(--color-bg-raised)]",
    dot: "bg-[var(--color-muted)]",
  },
};

/** Score bar colour based on value */
const scoreColour = (score) => {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 45) return "bg-amber-400";
  return "bg-red-500";
};

/** Specificity score badge */
const SpecBadge = ({ score }) => {
  if (score === null || score === undefined)
    return (
      <span className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-widest">
        Not yet graded
      </span>
    );
  const colour =
    score >= 70
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/25"
      : score >= 40
      ? "text-amber-400 bg-amber-400/10 border-amber-400/25"
      : "text-red-400 bg-red-400/10 border-red-400/25";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border font-mono text-[10px] uppercase tracking-widest ${colour}`}
    >
      {score}/100
    </span>
  );
};

// ── Signal Flag Row ───────────────────────────────────────────────────────────

const FlagRow = ({ label, value, description, isBool = false, invert = false }) => {
  let status; // "good" | "warn" | "bad" | "neutral"
  let displayText;

  if (isBool) {
    // For boolean flags: true = bad when invert=false (e.g. bulkImportFlag=true is bad)
    status = value === null || value === undefined
      ? "neutral"
      : invert
      ? value ? "good" : "bad"   // repoOwnerVerified: true=good
      : value ? "bad" : "good";  // bulkImportFlag: true=bad
    displayText = value === null ? "Checking…" : value ? "Yes" : "No";
  } else {
    const n = Number(value) || 0;
    status = n < 40 ? "good" : n < 65 ? "warn" : "bad";
    displayText = `${Math.round(n)} / 100`;
  }

  const colourMap = {
    good:    "text-emerald-400",
    warn:    "text-amber-400",
    bad:     "text-red-400",
    neutral: "text-[var(--color-muted)]",
  };
  const dotMap = {
    good:    "bg-emerald-400",
    warn:    "bg-amber-400",
    bad:     "bg-red-400",
    neutral: "bg-[var(--color-muted)]",
  };

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[var(--color-border)] last:border-0">
      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotMap[status]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-[var(--color-text-secondary)] font-medium">{label}</span>
          <span className={`font-mono text-xs font-semibold ${colourMap[status]}`}>{displayText}</span>
        </div>
        {description && (
          <p className="text-[11px] text-[var(--color-muted)] mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
};

// ── ScoreRing ─────────────────────────────────────────────────────────────────

const ScoreRing = ({ score, size = 72 }) => {
  const s = clamp(score);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (s / 100) * circ;
  const colour = s >= 70 ? "#34d399" : s >= 45 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={5}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colour}
          strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm"
        style={{ color: colour }}
      >
        {s === null || s === undefined ? "—" : s}
      </span>
    </div>
  );
};

// ── Interrogation Q&A Card ────────────────────────────────────────────────────

const InterrogationCard = ({ question, idx }) => {
  const [open, setOpen] = useState(false);
  const hasAnswer = Boolean(question.candidateAnswer);

  return (
    <motion.div
      layout
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] overflow-hidden"
    >
      <button
        id={`interrogation-q-${idx}`}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[var(--vp-glass-bg)] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/30 flex items-center justify-center font-mono text-[10px] text-[var(--color-accent)]">
            {idx + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-[var(--color-text)] font-medium truncate">
              {question.question}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {question.commitSha && (
                <span className="font-mono text-[9px] text-[var(--color-muted)] uppercase tracking-widest">
                  commit {question.commitSha}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <SpecBadge score={question.specificityScore} />
          {open ? (
            <ChevronUp className="w-4 h-4 text-[var(--color-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--color-muted)]" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-3 border-t border-[var(--color-border)]">
              {/* Question */}
              <div className="pt-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1">
                  Question
                </p>
                <p className="text-sm text-[var(--color-text)]">{question.question}</p>
              </div>

              {/* Candidate answer */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1">
                  Candidate's answer
                </p>
                {hasAnswer ? (
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-bg-sunken)] rounded-lg px-3 py-2.5">
                    {question.candidateAnswer}
                  </p>
                ) : (
                  <p className="text-sm text-[var(--color-muted)] italic">Not yet answered.</p>
                )}
              </div>

              {/* Grader rationale */}
              {question.graderRationale && (
                <div className="rounded-lg border border-[var(--color-accent)]/20 bg-[var(--color-accent-subtle)] px-3 py-2.5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)] mb-1">
                    Grader Assessment
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{question.graderRationale}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Project Authenticity Card ─────────────────────────────────────────────────

const ProjectAuthCard = ({ record, idx }) => {
  const [expanded, setExpanded] = useState(idx === 0);

  const status = record.reviewStatus || "pending";
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const score = clamp(record.authenticityScore);

  const maxPeerMatch = Math.max(
    0,
    ...(record.fingerprintSimilarity?.peerCandidateMatch || []).map((m) => m.score || 0)
  );

  const repoLabel = record.repoUrl
    ? record.repoUrl.replace(/^https?:\/\/github\.com\//, "")
    : "Unknown repository";

  const questions = record.interrogation?.questions || [];
  const answeredCount = questions.filter((q) => q.candidateAnswer).length;

  return (
    <motion.article
      layout
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--vp-glass-bg)] backdrop-blur overflow-hidden"
      style={{ boxShadow: "var(--vp-glass-shadow)" }}
    >
      {/* ── Card header ─────────────────────────────────────────────── */}
      <div
        className="flex items-start justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-[var(--vp-glass-bg)] transition-colors"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        aria-expanded={expanded}
        id={`auth-card-${record._id || idx}`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <ScoreRing score={score} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest ${cfg.cls}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <StatusIcon className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
            <p className="text-sm font-medium text-[var(--color-text)] mt-1 truncate max-w-xs">
              {repoLabel}
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] text-[var(--color-muted)] font-mono">
                {record.isFork ? "Fork" : "Original"}
              </span>
              {record.commitCount > 0 && (
                <span className="text-[10px] text-[var(--color-muted)] font-mono">
                  {record.commitCount} commits
                </span>
              )}
              {questions.length > 0 && (
                <span className="text-[10px] text-[var(--color-muted)] font-mono">
                  {answeredCount}/{questions.length} Q&amp;As
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {record.repoUrl && (
            <a
              href={record.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors text-[var(--color-muted)]"
              title="Open repository"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--color-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--color-muted)]" />
          )}
        </div>
      </div>

      {/* ── Expandable detail ────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 space-y-5 border-t border-[var(--color-border)]">

              {/* ── Signal breakdown ──────────────────────────────────── */}
              <div className="pt-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-2 flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" />
                  Signal Breakdown
                </p>
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] px-4 py-1 divide-y divide-[var(--color-border)]">
                  <FlagRow
                    label="Ownership verified"
                    value={record.repoOwnerVerified}
                    isBool
                    invert
                    description="≥30% of commits authored by this candidate's email or GitHub handle"
                  />
                  <FlagRow
                    label="Bulk import detected"
                    value={record.bulkImportFlag}
                    isBool
                    description="All commits pushed within 10 minutes with >5 commits (clone-and-push pattern)"
                  />
                  <FlagRow
                    label="Fork of another repo"
                    value={record.isFork}
                    isBool
                    description={record.forkUpstream ? `Upstream: ${record.forkUpstream}` : undefined}
                  />
                  <FlagRow
                    label="Known corpus similarity"
                    value={record.fingerprintSimilarity?.knownCorpusMatch ?? null}
                    description="File-tree overlap with popular scaffold templates (CRA, Vite, Express-generator)"
                  />
                  <FlagRow
                    label="Peer candidate similarity"
                    value={maxPeerMatch}
                    description="Highest file-tree overlap with other candidates in the same job pool"
                  />
                  <FlagRow
                    label="Style deviation"
                    value={record.styleDeviationScore ?? null}
                    description="How unlike this repo is vs. the candidate's own baseline fingerprint (higher = more deviant)"
                  />
                  <FlagRow
                    label="Development pattern"
                    value={
                      record.developmentPatternScore !== null && record.developmentPatternScore !== undefined
                        ? 100 - record.developmentPatternScore // invert for display: lower naturalness = worse
                        : null
                    }
                    description="Commit cadence naturalness — high value here means suspicious cleanliness"
                  />
                </div>
              </div>

              {/* ── Interrogation Q&A ─────────────────────────────────── */}
              {questions.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-3 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" />
                    Commit-Defence Q&amp;A ({answeredCount} of {questions.length} answered)
                  </p>
                  <div className="space-y-2">
                    {questions.map((q, qi) => (
                      <InterrogationCard key={q._id || qi} question={q} idx={qi} />
                    ))}
                  </div>
                </div>
              )}

              {questions.length === 0 && (
                <div className="rounded-xl border border-dashed border-[var(--color-border)] py-6 text-center">
                  <MessageSquare className="w-5 h-5 text-[var(--color-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--color-muted)]">
                    No interrogation questions were generated for this project.
                  </p>
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    This may happen if the pipeline ran before the exam completed or if the repo has no qualifying commits.
                  </p>
                </div>
              )}

              {/* Computed at */}
              {record.computedAt && (
                <p className="text-[10px] text-[var(--color-muted)] font-mono">
                  Pipeline ran: {new Date(record.computedAt).toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

// ── Main VerificationPanel ────────────────────────────────────────────────────

export default function VerificationPanel({ candidateId: propCandidateId, candidateName }) {
  // Support both embedded-component usage (prop) and standalone route usage (URL param)
  const params = useParams();
  const candidateId = propCandidateId || params.candidateId;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const fetchRecords = useCallback(async () => {
    if (!candidateId) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(
        `/api/exams/recruiter/candidate/${candidateId}/project-authenticity`
      );
      setRecords(data.records || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load project authenticity records."
      );
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ── Aggregate summary ──────────────────────────────────────────────────────
  const flaggedCount = records.filter((r) => r.reviewStatus === "auto_flag").length;
  const passedCount  = records.filter((r) => r.reviewStatus === "auto_pass").length;
  const manualCount  = records.filter((r) => r.reviewStatus === "manual_review_required").length;
  const avgAuth = records.length > 0
    ? Math.round(records.reduce((s, r) => s + clamp(r.authenticityScore), 0) / records.length)
    : null;

  return (
    <section
      id="verification-panel"
      className="space-y-6"
      aria-label="Project Authenticity Verification Panel"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-[var(--color-accent)]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text)]">
              Project Authenticity
            </h2>
            {candidateName && (
              <p className="text-xs text-[var(--color-muted)]">
                {candidateName} · {records.length} project{records.length !== 1 ? "s" : ""} analysed
              </p>
            )}
          </div>
        </div>
        <button
          id="verification-panel-refresh"
          onClick={fetchRecords}
          disabled={loading}
          className="vp-btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
          title="Refresh records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Aggregate stats row ──────────────────────────────────────────────── */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Avg. Auth. Score",
              value: avgAuth !== null ? `${avgAuth}/100` : "—",
              colour: avgAuth >= 70 ? "text-emerald-400" : avgAuth >= 45 ? "text-amber-400" : "text-red-400",
            },
            {
              label: "Auto Passed",
              value: passedCount,
              colour: "text-emerald-400",
            },
            {
              label: "Manual Review",
              value: manualCount,
              colour: "text-amber-400",
            },
            {
              label: "Auto Flagged",
              value: flaggedCount,
              colour: "text-red-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--vp-glass-bg)] px-4 py-3"
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1">
                {stat.label}
              </p>
              <p className={`text-xl font-bold font-mono ${stat.colour}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Disclaimer ────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <strong className="text-[var(--color-text)]">Authenticity signals are proxies, not ground truth.</strong>{" "}
          Specificity scores reflect plausibility of first-hand authorship based on commit-specific
          answers and fingerprint analysis. Manual review is always recommended when signals are
          ambiguous. Do not reject candidates solely on this module's output.
        </p>
      </div>

      {/* ── States ──────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="w-5 h-5 text-[var(--color-accent)] animate-spin" />
          <span className="text-sm text-[var(--color-muted)]">Loading project authenticity records…</span>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 flex items-center gap-3">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-16 flex flex-col items-center gap-3 text-center">
          <ShieldQuestion className="w-10 h-10 text-[var(--color-muted)]" />
          <p className="text-sm font-medium text-[var(--color-text)]">
            No authenticity records yet
          </p>
          <p className="text-xs text-[var(--color-muted)] max-w-xs">
            Records are generated automatically during the Purgatory Intermission when the
            candidate submits Part 1 of the exam.
          </p>
        </div>
      )}

      {/* ── Records list ────────────────────────────────────────────────────── */}
      {!loading && !error && records.length > 0 && (
        <motion.div layout className="space-y-4">
          <AnimatePresence>
            {records.map((record, idx) => (
              <motion.div
                key={record._id || record.repoUrl || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: idx * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProjectAuthCard record={record} idx={idx} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
