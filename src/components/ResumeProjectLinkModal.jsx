import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import {
  GitBranch,
  Lock,
  CheckCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  FolderGit2,
} from "lucide-react";

export const ResumeProjectLinkModal = ({ isOpen, onClose, onLinked }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repoInputs, setRepoInputs] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchClaims = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data } = await api.get("/api/projects/resume-claims");
      setClaims(data.claims || []);
      const initialInputs = {};
      (data.claims || []).forEach((c) => {
        if (c.repositoryUrl) {
          initialInputs[c.id] = c.repositoryUrl;
        }
      });
      setRepoInputs(initialInputs);
    } catch (err) {
      console.error("Failed to load resume project claims:", err);
      setErrorMsg(err.response?.data?.message || "Failed to load resume claims.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchClaims();
    }
  }, [isOpen]);

  const handleLinkRepo = async (claimId) => {
    const repositoryUrl = repoInputs[claimId]?.trim();
    if (!repositoryUrl) {
      setErrorMsg("Please enter a valid GitHub repository URL.");
      return;
    }

    if (!repositoryUrl.includes("github.com") && !repositoryUrl.startsWith("http")) {
      setErrorMsg("Please provide a valid GitHub repository URL (e.g., https://github.com/user/repo).");
      return;
    }

    setSubmittingId(claimId);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data } = await api.post("/api/projects/link-resume-claim", {
        claimId,
        repositoryUrl,
      });

      setSuccessMsg(`Repository linked successfully to "${data.claim.title}"!`);

      // Update local claims state
      setClaims((prev) =>
        prev.map((c) =>
          c.id === claimId
            ? { ...c, repoLinked: true, repositoryUrl, verificationStatus: "Verified" }
            : c
        )
      );

      if (onLinked) {
        onLinked(data);
      }
    } catch (err) {
      console.error("Failed to link repository:", err);
      setErrorMsg(err.response?.data?.message || "Failed to link repository.");
    } finally {
      setSubmittingId(null);
    }
  };

  if (!isOpen) return null;

  const linkedCount = claims.filter((c) => c.repoLinked).length;
  const totalCount = claims.length;
  const isComplete = totalCount > 0 && linkedCount === totalCount;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Header Accent Line */}
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-[var(--color-accent)] to-emerald-500" />

          {/* Modal Header */}
          <div className="p-6 sm:p-8 border-b border-[var(--color-border)] flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FolderGit2 className="w-5 h-5 text-[var(--color-accent)]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Mandatory_Dependency // Project_Auditing
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                Link Resume <span className="text-[var(--color-accent)]">Repositories.</span>
              </h2>
              <p className="text-xs text-[var(--color-muted)] mt-1.5 leading-relaxed max-w-lg">
                Choose the GitHub repository for each project mentioned in your resume. 
                Project titles and descriptions are strictly <strong className="text-purple-400 font-bold">locked from your resume</strong> to ensure credential integrity.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[var(--color-border)]/30 hover:bg-[var(--color-border)] text-[var(--color-muted)] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Banner */}
          <div className="px-6 sm:px-8 py-3 bg-[var(--color-bg-sunken)] border-b border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--color-muted)]">
                Status: <strong className="text-[var(--color-text)]">{linkedCount}/{totalCount} Linked</strong>
              </span>
              {isComplete && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle className="w-3 h-3" /> All Projects Connected
                </span>
              )}
            </div>

            <div className="w-32 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-accent)] to-emerald-500 transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (linkedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Notifications */}
          {errorMsg && (
            <div className="mx-6 sm:mx-8 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-[var(--radius-md)] flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mx-6 sm:mx-8 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-[var(--radius-md)] flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 sm:p-8 max-h-[55vh] overflow-y-auto space-y-4">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
                <span className="text-xs font-mono text-[var(--color-muted)]">
                  Loading resume project claims...
                </span>
              </div>
            ) : claims.length === 0 ? (
              <div className="py-8 text-center space-y-3 bg-[var(--color-bg-sunken)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]">
                <ShieldAlert className="w-8 h-8 mx-auto text-amber-400 opacity-80" />
                <p className="text-sm font-bold uppercase tracking-tight">No Extracted Projects Found</p>
                <p className="text-xs text-[var(--color-muted)] max-w-sm mx-auto">
                  Your resume has not been analyzed yet or contains no identifiable projects. Upload or re-analyze your resume to extract claims.
                </p>
              </div>
            ) : (
              claims.map((claim) => {
                const isLinked = claim.repoLinked;
                const isSubmitting = submittingId === claim.id;

                return (
                  <div
                    key={claim.id}
                    className={`p-5 rounded-[var(--radius-lg)] border transition-all duration-300 ${
                      isLinked
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-[var(--color-surface-card)] border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
                    }`}
                  >
                    {/* Claim Title & Locked Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black uppercase tracking-tight text-[var(--color-text)]">
                          {claim.title}
                        </h4>
                        <span className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          <Lock className="w-2.5 h-2.5" /> Locked from Resume
                        </span>
                      </div>

                      {isLinked ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                          <CheckCircle className="w-3 h-3" /> Linked & Verified
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          Pending Repository
                        </span>
                      )}
                    </div>

                    {/* Immutable Description Block */}
                    {claim.description && (
                      <p className="text-xs text-[var(--color-muted)] bg-[var(--color-bg-sunken)] p-3 rounded-[var(--radius-sm)] border border-[var(--color-border)]/50 mb-4 line-clamp-3 italic">
                        "{claim.description}"
                      </p>
                    )}

                    {/* Repo Input & Submit */}
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                      <div className="relative flex-1">
                        <GitBranch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                        <input
                          type="url"
                          value={repoInputs[claim.id] || ""}
                          onChange={(e) =>
                            setRepoInputs({ ...repoInputs, [claim.id]: e.target.value })
                          }
                          placeholder="https://github.com/username/project-repo"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none font-mono text-[var(--color-text)]"
                        />
                      </div>

                      <button
                        onClick={() => handleLinkRepo(claim.id)}
                        disabled={isSubmitting}
                        className={`vp-btn text-[10px] py-2 px-4 gap-1.5 shrink-0 cursor-pointer ${
                          isLinked
                            ? "vp-btn-secondary hover:border-emerald-500/50"
                            : "vp-btn-accent shadow-md"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Linking...</span>
                          </>
                        ) : isLinked ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Update Repo</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-3 h-3" />
                            <span>Link Repository</span>
                          </>
                        )}
                      </button>

                      {isLinked && claim.repositoryUrl && (
                        <a
                          href={claim.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white transition-colors flex items-center justify-center shrink-0"
                          title="View on GitHub"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-sunken)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-[var(--color-muted)] font-mono text-center sm:text-left">
              Assessment unlocks when all project repos are linked & certificates are verified.
            </p>

            <button
              onClick={onClose}
              className="vp-btn vp-btn-primary text-xs py-2.5 px-6 cursor-pointer w-full sm:w-auto"
            >
              Done & Return to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ResumeProjectLinkModal;
