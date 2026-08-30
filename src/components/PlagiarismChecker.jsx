import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  ShieldAlert, ShieldCheck, ShieldX, Shield,
  ChevronDown, ChevronUp, ExternalLink, Loader2
} from "lucide-react";

/* ── Risk config ───────────────────────────────────────────────── */
const RISK_CONFIG = {
  CLEAR:    { label: "Originality Verified",  color: "text-green-400",  border: "border-green-500/25",  bg: "bg-green-500/8",  Icon: ShieldCheck  },
  LOW:      { label: "Low Similarity",        color: "text-yellow-400", border: "border-yellow-500/25", bg: "bg-yellow-500/8", Icon: Shield       },
  MODERATE: { label: "Moderate Similarity",   color: "text-orange-400", border: "border-orange-500/35", bg: "bg-orange-500/8", Icon: ShieldAlert  },
  HIGH:     { label: "High Risk / Duplicate", color: "text-red-400",    border: "border-red-500/40",    bg: "bg-red-500/10",   Icon: ShieldX      },
};

const ScoreBar = ({ label, pct, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm text-gray-500 uppercase tracking-widest">
      <span>{label}</span><span className={color}>{pct}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: pct >= 75 ? "#ef4444" : pct >= 50 ? "#f97316" : pct >= 30 ? "#eab308" : "#22c55e" }}
      />
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════ */
export default function PlagiarismChecker({ projectId }) {
  const { user } = useAuth();
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState({});
  const [error, setError]       = useState("");

  const runCheck = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.get(`/api/projects/${projectId}/plagiarism`);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Check failed — try again");
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = (id) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const riskCfg = result ? RISK_CONFIG[result.overallRisk] : null;

  return (
    <div className="mt-8 space-y-4">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-orange-500" />
          <h3 className="font-black uppercase tracking-widest text-sm text-white">Plagiarism Check</h3>
        </div>
        <button
          onClick={runCheck}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-black tracking-widest uppercase text-xs shadow-[0_0_12px_rgba(255,69,0,0.4)] transition-all disabled:opacity-50"
        >
          {loading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning…</>
            : <><ShieldAlert className="w-3.5 h-3.5" /> Run Check</>}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Summary card */}
            <div className={`rounded-xl border ${riskCfg.border} ${riskCfg.bg} p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <riskCfg.Icon className={`w-6 h-6 ${riskCfg.color}`} />
                <div>
                  <p className={`text-base font-black ${riskCfg.color}`}>{riskCfg.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Compared against <span className="text-white font-bold">{result.totalChecked}</span> projects on the platform ·{" "}
                    <span className="text-white font-bold">{result.flagCount}</span> similar project{result.flagCount !== 1 ? "s" : ""} found
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <span className={`text-2xl font-black ${riskCfg.color}`}>
                    {result.originalityScore !== undefined ? `${result.originalityScore}%` : result.flags.length > 0 ? `${Math.max(0, 100 - result.flags[0].score)}%` : "100%"}
                  </span>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                    Originality Score
                  </p>
                </div>
              </div>

              {/* Commit Cadence & Provenance Insight */}
              {result.commitAnalysis && (
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    <span className="text-gray-300 font-bold">{result.commitAnalysis.status}:</span>
                    <span className="text-gray-400 text-[11px]">{result.commitAnalysis.detail}</span>
                  </div>
                  <span className="text-cyan-400 text-[10px] uppercase font-bold shrink-0">
                    {result.commitAnalysis.commitsCount} Commits Analyzed
                  </span>
                </div>
              )}

              <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mt-3">
                Checked at {new Date(result.checkedAt).toLocaleTimeString("en-IN")}
              </p>
            </div>

            {/* Flag list */}
            {result.flags.length > 0 && (
              <div className="space-y-3">
                <p className="text-gray-600 text-sm uppercase tracking-widest font-bold">
                  Similar Projects Detected
                </p>
                {result.flags.map((flag) => {
                  const fc = RISK_CONFIG[flag.risk];
                  const isExpanded = expanded[flag.projectId];
                  return (
                    <div key={flag.projectId}
                      className={`bg-black/60 border ${fc.border} rounded-xl overflow-hidden`}>
                      <button
                        onClick={() => toggleFlag(flag.projectId)}
                        className="w-full flex items-center gap-4 p-4 text-left"
                      >
                        <fc.Icon className={`w-4 h-4 ${fc.color} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-bold truncate">{flag.title}</p>
                          <p className="text-gray-600 text-xs">by {flag.ownerName}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {flag.exactUrl && (
                            <span className="text-sm bg-red-500/20 text-red-400 font-black uppercase tracking-widest px-2 py-0.5 rounded">
                              Exact URL
                            </span>
                          )}
                          <span className={`text-lg font-black ${fc.color}`}>{flag.score}%</span>
                          <span className={`text-sm font-black uppercase tracking-widest px-2 py-0.5 rounded ${fc.bg} ${fc.color}`}>
                            {flag.risk}
                          </span>
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-gray-600" />
                            : <ChevronDown className="w-4 h-4 text-gray-600" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-4 pb-4 space-y-3 border-t border-white/5 pt-4"
                          >
                            {flag.breakdown && (
                              <div className="space-y-2.5">
                                <ScoreBar label="Description Similarity" pct={flag.breakdown.description} color={fc.color} />
                                <ScoreBar label="Tech Stack Overlap"     pct={flag.breakdown.techStack}    color={fc.color} />
                                <ScoreBar label="Title Similarity"       pct={flag.breakdown.title}        color={fc.color} />
                              </div>
                            )}
                            {flag.repositoryUrl && (
                              <a
                                href={flag.repositoryUrl} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" /> View Repository
                              </a>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {result.flags.length === 0 && (
              <div className="flex items-center gap-3 text-green-400 text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold">No similar projects found — your project appears original.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
