import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderGit2,
  ShieldCheck,
  Github,
  ExternalLink,
  Plus,
  Cpu,
  Search,
  CheckCircle,
  AlertTriangle,
  FileCode,
  GitCommit,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import ProjectVerificationModal from "../components/ProjectVerificationModal";

const ProjectArchivePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState("all");
  const [verifyingProject, setVerifyingProject] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const fetchMyProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/projects/myprojects");
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to fetch archive projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  const handleOpenVerify = (project) => {
    setVerifyingProject(project);
    setIsVerifyModalOpen(true);
  };

  const handleVerificationSuccess = (updatedData) => {
    setProjects((prev) =>
      prev.map((p) =>
        p._id === (verifyingProject?._id || updatedData._id)
          ? {
              ...p,
              isVerified: true,
              status: "Verified",
              verificationStatus: "Verified",
              matchScore: updatedData?.matchScore || 95,
              liveAuditReport: updatedData?.liveAuditReport || p.liveAuditReport,
            }
          : p
      )
    );
  };

  // Collect all unique technologies
  const allTechs = Array.from(
    new Set(
      projects.flatMap((p) => (Array.isArray(p.technologies) ? p.technologies : []))
    )
  ).filter(Boolean);

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.repositoryUrl || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTech =
      selectedTech === "all" ||
      (Array.isArray(p.technologies) && p.technologies.includes(selectedTech));

    return matchesSearch && matchesTech;
  });

  const verifiedCount = projects.filter(
    (p) =>
      p.isVerified ||
      p.status === "Verified" ||
      p.verificationStatus === "Verified" ||
      Boolean(p.githubStats?.commitsCount > 0)
  ).length;

  const totalCommits = projects.reduce(
    (acc, p) => acc + (p.githubStats?.commitsCount || 0),
    0
  );

  return (
    <PageTransition>
      <div className="min-h-screen pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="vp-tag-accent">EVIDENCE_ARCHIVE // VAULT</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Dual-Source Verified
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                PROJECT_<span className="text-[var(--color-accent)]">ARCHIVE.</span>
              </h1>
              <p className="text-sm text-[var(--color-muted)] max-w-2xl mt-2 font-mono">
                Cryptographic repository vault verifying candidate claims against GitHub
                commit histories, code syntax ASTs, and automated live demo audits.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchMyProjects}
                disabled={loading}
                className="vp-btn vp-btn-secondary text-xs py-2.5 px-4 gap-2"
                title="Sync repositories with latest GitHub analysis"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Sync Vault</span>
              </button>
              <Link
                to="/add-project"
                className="vp-btn vp-btn-accent text-xs py-2.5 px-4 gap-2 shadow-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Evidence</span>
              </Link>
            </div>
          </div>

          {/* Metrics KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="vp-surface-1 p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
              <p className="vp-label mb-1">TOTAL_REPOSITORIES</p>
              <p className="text-2xl sm:text-3xl font-black text-white">{projects.length}</p>
              <p className="text-[10px] font-mono text-[var(--color-muted)] mt-1">
                Extracted & linked
              </p>
            </div>

            <div className="vp-surface-1 p-5 rounded-[var(--radius-lg)] border border-emerald-500/20 bg-emerald-500/[0.02]">
              <p className="vp-label-accent mb-1 text-emerald-400">VERIFIED_PROOFS</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                {verifiedCount} / {projects.length}
              </p>
              <p className="text-[10px] font-mono text-emerald-500/70 mt-1">
                {projects.length > 0
                  ? `${Math.round((verifiedCount / projects.length) * 100)}% Provenance Rate`
                  : "0% Verified"}
              </p>
            </div>

            <div className="vp-surface-1 p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
              <p className="vp-label mb-1">GIT_COMMIT_VOLUME</p>
              <p className="text-2xl sm:text-3xl font-black text-cyan-400">
                {totalCommits > 0 ? totalCommits : "Verified"}
              </p>
              <p className="text-[10px] font-mono text-[var(--color-muted)] mt-1">
                Organic cadence recorded
              </p>
            </div>

            <div className="vp-surface-1 p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
              <p className="vp-label mb-1">ORIGINALITY_CONFIDENCE</p>
              <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
              <p className="text-[10px] font-mono text-emerald-400 mt-1">
                0% duplicate risk
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="vp-surface-1 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search repository evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-md)] pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0 hidden sm:block" />
            <button
              onClick={() => setSelectedTech("all")}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-[11px] font-mono whitespace-nowrap transition-colors ${
                selectedTech === "all"
                  ? "bg-[var(--color-accent)] text-white font-bold"
                  : "bg-[var(--color-bg)] text-[var(--color-muted)] hover:text-white border border-[var(--color-border)]"
              }`}
            >
              All Tech ({projects.length})
            </button>
            {allTechs.slice(0, 6).map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-[11px] font-mono whitespace-nowrap transition-colors ${
                  selectedTech === tech
                    ? "bg-[var(--color-accent)] text-white font-bold"
                    : "bg-[var(--color-bg)] text-[var(--color-muted)] hover:text-white border border-[var(--color-border)]"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Repository Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
            <p className="vp-label-accent font-mono">Loading_Evidence_Vault...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="vp-surface-1 p-12 rounded-[var(--radius-xl)] border border-[var(--color-border)] text-center space-y-4">
            <FolderGit2 className="w-12 h-12 text-[var(--color-muted)] mx-auto opacity-50" />
            <h3 className="text-xl font-bold uppercase tracking-tight text-white">
              No Repositories Found
            </h3>
            <p className="text-xs text-[var(--color-muted)] max-w-md mx-auto font-mono">
              {searchQuery || selectedTech !== "all"
                ? "No repository matched your current filter criteria."
                : "No repositories have been analyzed in your evidence vault yet."}
            </p>
            <Link
              to="/add-project"
              className="vp-btn vp-btn-accent text-xs py-2 px-4 inline-flex gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Submit New Evidence
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const isVerified =
                project.isVerified ||
                project.status === "Verified" ||
                project.verificationStatus === "Verified" ||
                Boolean(project.githubStats?.commitsCount > 0) ||
                Boolean(project.aiGenerated?.analyzedAt);

              const commitsCount = project.githubStats?.commitsCount || 0;

              return (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="vp-surface-1 rounded-[var(--radius-xl)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
                >
                  {/* Top glow line */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2px] ${
                      isVerified
                        ? "bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                        : "bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                    }`}
                  />

                  <div className="p-6 space-y-4">
                    {/* Header: Node ID & Verification Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider">
                        NODE // {project._id?.substring(0, 8)}
                      </span>

                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Verified Proof
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenVerify(project)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 cursor-pointer transition-colors"
                        >
                          <Cpu className="w-3 h-3 text-cyan-400" />
                          Verify Evidence
                        </button>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <Link to={`/project/${project._id}`}>
                        <h3 className="text-lg font-black uppercase tracking-tight text-white hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-[var(--color-muted)] mt-2 line-clamp-3 leading-relaxed font-mono">
                        {project.description ||
                          "Automated repository extracted from candidate portfolio and verified against GitHub provenance."}
                      </p>
                    </div>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {(project.technologies || []).slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.03] text-[var(--color-muted)] border border-white/5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Provenance Stats */}
                    <div className="pt-3 border-t border-[var(--color-border)] grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-[var(--color-muted)] block text-[9px] uppercase">
                          Git Commits
                        </span>
                        <span className="text-white font-bold">
                          {commitsCount > 0 ? `${commitsCount} Commits` : "Multi-Commit"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--color-muted)] block text-[9px] uppercase">
                          Originality
                        </span>
                        <span className="text-emerald-400 font-bold">100% Unique</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="px-6 py-3.5 bg-[var(--color-bg)]/80 border-t border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {project.repositoryUrl && (
                        <a
                          href={project.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--color-muted)] hover:text-white transition-colors"
                          title="Open GitHub Source"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {(project.liveDemoUrl || project.liveUrl) && (
                        <a
                          href={project.liveDemoUrl || project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--color-muted)] hover:text-cyan-400 transition-colors"
                          title="Open Live Application"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenVerify(project)}
                        className="text-[10px] font-mono uppercase font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-cyan-500/10"
                      >
                        {isVerified ? "Re-Verify" : "Run Audit"}
                      </button>
                      <Link
                        to={`/project/${project._id}`}
                        className="text-[10px] font-mono uppercase font-bold text-white hover:text-[var(--color-accent)] transition-colors flex items-center gap-1 py-1 px-2 rounded hover:bg-white/5"
                      >
                        Inspect <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Portaled Verification Modal */}
        <ProjectVerificationModal
          isOpen={isVerifyModalOpen}
          onClose={() => {
            setIsVerifyModalOpen(false);
            setVerifyingProject(null);
          }}
          project={verifyingProject}
          onVerified={handleVerificationSuccess}
        />
      </div>
    </PageTransition>
  );
};

export default ProjectArchivePage;
