/**
 * SkillTreePage.jsx — Dynamic Verified Skills
 *
 * Candidate-only view that visualizes ONLY evidence-backed verified skills.
 * Every skill displayed must originate from:
 *   - Resume claims (from ResumeAnalysis)
 *   - GitHub repository analysis (from Project.aiGenerated.techStack)
 *   - Technical assessment results (from User.certificates)
 *   - Skill Progression Service (from User.skillProgress)
 *
 * What this page does NOT do:
 *   ❌ No recommendations
 *   ❌ No "Learn Next"
 *   ❌ No AI career advice
 *   ❌ No gamification
 *   ❌ No suggestions for skills to acquire
 *
 * This page explains "What VeriProof verified" — nothing else.
 */

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Flame,
  GitBranch,
  RefreshCw,
  ShieldCheck,
  Trophy,
  Zap,
  FileText,
  Github,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  X,
  ExternalLink,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import DynamicSkillTree from "../components/DynamicSkillTree";
import { useSkillTree } from "../context/SkillTreeContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

// ── Evidence source badges ────────────────────────────────────────────────────
const SOURCE_CONFIG = {
  resume: {
    label: "Resume",
    icon: FileText,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  github: {
    label: "GitHub",
    icon: Github,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  assessment: {
    label: "Assessment",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  project: {
    label: "Project",
    icon: GitBranch,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
};

const EvidenceBadge = ({ source }) => {
  const config = SOURCE_CONFIG[source] || SOURCE_CONFIG.resume;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${config.bg} ${config.color} ${config.border}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
};

// ── Verification status pill ──────────────────────────────────────────────────
const VerificationPill = ({ status }) => {
  if (status === "verified" || status === "Verified")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <CheckCircle className="w-2.5 h-2.5" /> Verified
      </span>
    );
  if (status === "in_progress")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
        <Clock className="w-2.5 h-2.5" /> In Progress
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
      <AlertCircle className="w-2.5 h-2.5" /> Pending
    </span>
  );
};

// ── Stat tile ────────────────────────────────────────────────────────────────
const StatTile = ({ icon: Icon, label, value, sub }) => (
  <div className="border border-[var(--color-border)] bg-[var(--color-bg)]/65 p-5 backdrop-blur-xl">
    <div className="mb-5 flex items-start justify-between gap-4">
      <Icon className="h-5 w-5 text-[var(--color-accent)]" />
      <span className="font-mono text-[10px] uppercase tracking-[0.24em] opacity-35">
        {label}
      </span>
    </div>
    <p className="text-3xl font-black uppercase tracking-tighter">{value}</p>
    {sub && (
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] opacity-45">
        {sub}
      </p>
    )}
  </div>
);

// ── Skill detail drawer ──────────────────────────────────────────────────────
const SkillDetailDrawer = ({ skill, onClose }) => {
  if (!skill) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-7 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[var(--color-accent)]" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-1">{skill.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <VerificationPill status={skill.status} />
                {(skill.evidence || []).map((ev, i) => (
                  <EvidenceBadge key={i} source={ev.type} />
                ))}
              </div>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                Verification Confidence
              </span>
              <span className="text-xs font-black">
                {skill.verificationScore || skill.progress || 0}%
              </span>
            </div>
            <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--color-accent)] to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${skill.verificationScore || skill.progress || 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Evidence list */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-3">
              Supporting Evidence ({(skill.evidence || []).length})
            </p>
            {(skill.evidence || []).length === 0 ? (
              <p className="text-xs text-[var(--color-muted)] italic">No evidence records.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(skill.evidence || []).map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]"
                  >
                    <EvidenceBadge source={ev.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{ev.label || ev.source}</p>
                      <p className="text-[10px] text-[var(--color-muted)]">
                        Score: {ev.score || 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer note */}
          <p className="mt-5 text-[10px] text-[var(--color-muted)] text-center">
            Evidence sourced from: Resume Claims · GitHub Repositories · Technical Assessments · Projects
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Verified Skill Card ───────────────────────────────────────────────────────
const VerifiedSkillCard = ({ skill, onClick }) => {
  const confidence = skill.verificationScore || skill.progress || 0;
  const evidenceSources = [...new Set((skill.evidence || []).map((e) => e.type))];
  const isVerified = skill.status === "verified" || skill.status === "Verified";

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(skill)}
      className={`p-5 rounded-[var(--radius-lg)] border cursor-pointer transition-all duration-200 group ${
        isVerified
          ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
          : "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <p className="text-sm font-black uppercase tracking-tight group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
          {skill.name}
        </p>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0 group-hover:text-[var(--color-accent)] transition-colors" />
      </div>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isVerified ? "bg-emerald-500" : "bg-[var(--color-accent)]"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[var(--color-muted)]">{confidence}% confidence</span>
          <VerificationPill status={skill.status} />
        </div>
      </div>

      {/* Evidence source tags */}
      <div className="flex flex-wrap gap-1">
        {evidenceSources.map((src, i) => (
          <EvidenceBadge key={i} source={src} />
        ))}
        {(skill.evidence || []).length > 0 && (
          <span className="text-[9px] text-[var(--color-muted)] self-center ml-1">
            {(skill.evidence || []).length} record{(skill.evidence || []).length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </motion.div>
  );
};

// ── Achievement strip ─────────────────────────────────────────────────────────
const AchievementStrip = ({ achievements = [] }) => (
  <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
    {achievements.map((achievement) => (
      <div
        key={achievement.id}
        className={`border p-4 transition-all ${
          achievement.unlocked
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
            : "border-[var(--color-border)] bg-[var(--color-bg)]/45 opacity-50"
        }`}
      >
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-current">
          {achievement.unlocked ? (
            <Trophy className="h-5 w-5" />
          ) : (
            <Award className="h-5 w-5" />
          )}
        </div>
        <p className="text-xs font-black uppercase tracking-tight">{achievement.title}</p>
        <p className="mt-2 text-[11px] leading-relaxed opacity-55">{achievement.description}</p>
      </div>
    ))}
  </div>
);

// ── Main Page Component ───────────────────────────────────────────────────────
const SkillTreePage = () => {
  const { user } = useAuth();
  const { skillTree, progress, loading, error, refreshSkillTree } = useSkillTree();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate");
  const [candidateView, setCandidateView] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(false);

  // View toggle: "tree" (graph view) or "skills" (verified skills grid)
  const [view, setView] = useState("skills");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("all");

  useEffect(() => {
    if (!candidateId) {
      setCandidateView(null);
      return;
    }

    const loadCandidate = async () => {
      setCandidateLoading(true);
      try {
        const { data } = await api.get(`/api/skill-tree/candidate/${candidateId}`);
        setCandidateView(data);
      } finally {
        setCandidateLoading(false);
      }
    };

    loadCandidate();
  }, [candidateId]);

  const visibleTree = candidateView?.skillTree || skillTree;
  const visibleProgress = candidateView?.progress || progress;
  const visibleName = candidateView?.candidate?.name || user?.name;

  // ── Build verified skills list from skillProgress ─────────────────────────
  // Only include skills that have actual evidence — never show empty/locked skills
  const verifiedSkills = (visibleProgress?.skills || []).filter(
    (s) =>
      s.status !== "locked" &&
      (s.evidence?.length > 0 || s.verificationScore > 0 || s.progress > 0)
  );

  // Apply search and source filter
  const filteredSkills = verifiedSkills.filter((skill) => {
    const matchesSearch =
      !searchQuery ||
      skill.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.id?.replace(/_/g, " ").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource =
      filterSource === "all" ||
      (skill.evidence || []).some((ev) => ev.type === filterSource);

    return matchesSearch && matchesSource;
  });

  const verifiedCount = verifiedSkills.filter(
    (s) => s.status === "verified"
  ).length;
  const inProgressCount = verifiedSkills.filter(
    (s) => s.status === "in_progress"
  ).length;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <section className="mb-10 border-b border-[var(--color-border)] pb-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-5 flex items-center gap-4">
              <span className="h-px w-10 bg-[var(--color-accent)]" />
              <p className="font-mono text-xs font-bold uppercase tracking-[0.45em] text-[var(--color-accent)]">
                Verified_Evidence // {visibleName?.replace(" ", "_") || "Candidate"}
              </p>
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter md:text-7xl">
              Dynamic Verified{" "}
              <span className="text-[var(--color-accent)] not-italic">Skills.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-sm font-medium uppercase tracking-widest opacity-50">
              Every skill shown here has been verified through resume claims, GitHub repositories, or technical assessments. No inferences. No recommendations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setView(view === "skills" ? "tree" : "skills")}
              className="inline-flex items-center gap-3 border border-[var(--color-border)] px-5 py-3 text-xs font-black uppercase tracking-[0.24em] transition-all hover:border-[var(--color-accent)]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {view === "skills" ? "Graph View" : "Grid View"}
            </button>
            <button
              onClick={() => refreshSkillTree()}
              className="inline-flex items-center gap-3 border border-[var(--color-border)] px-5 py-3 text-xs font-black uppercase tracking-[0.24em] transition-all hover:border-[var(--color-accent)]"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>
      </section>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-8 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatTile
          icon={Zap}
          label="XP"
          value={visibleProgress?.totalXp || 0}
          sub={`Level ${visibleProgress?.level || 1}`}
        />
        <StatTile
          icon={BadgeCheck}
          label="Verified"
          value={verifiedCount}
          sub={`${verifiedSkills.length} with evidence`}
        />
        <StatTile
          icon={ShieldCheck}
          label="Trust"
          value={`${visibleProgress?.trustScore || 0}%`}
          sub="Verification signal"
        />
        <StatTile
          icon={GitBranch}
          label="GitHub"
          value={`${visibleProgress?.githubScore || 0}%`}
          sub="Repo evidence"
        />
        <StatTile
          icon={Flame}
          label="Streak"
          value={visibleProgress?.streakDays || 0}
          sub="Proof days"
        />
      </div>

      {/* ── View: Verified Skills Grid ───────────────────────────────────── */}
      {view === "skills" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
              <input
                type="text"
                placeholder="Search verified skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-[var(--color-border)] bg-[var(--color-bg)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] transition-colors font-mono uppercase tracking-wider"
              />
            </div>
            <div className="flex gap-2">
              {["all", "resume", "github", "assessment", "project"].map((src) => (
                <button
                  key={src}
                  onClick={() => setFilterSource(src)}
                  className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-[var(--radius-sm)] border transition-all ${
                    filterSource === src
                      ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                      : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/50"
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          {/* Empty state */}
          {verifiedSkills.length === 0 && !loading && !candidateLoading ? (
            <div className="text-center py-24 border border-[var(--color-border)] rounded-[var(--radius-xl)] bg-[var(--color-bg)]">
              <ShieldCheck className="w-12 h-12 mx-auto text-[var(--color-muted)] opacity-20 mb-6" />
              <h3 className="text-xl font-black italic uppercase tracking-tight opacity-30 mb-3">
                No_Verified_Skills
              </h3>
              <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto">
                Upload your resume and connect GitHub repositories to populate your verified skill evidence.
              </p>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="text-center py-16 border border-[var(--color-border)] rounded-[var(--radius-xl)]">
              <p className="text-sm text-[var(--color-muted)]">
                No skills match your filter.{" "}
                <button
                  onClick={() => { setSearchQuery(""); setFilterSource("all"); }}
                  className="text-[var(--color-accent)] underline"
                >
                  Clear filters
                </button>
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                  {filteredSkills.length} skill{filteredSkills.length !== 1 ? "s" : ""} •{" "}
                  {verifiedCount} verified • {inProgressCount} in progress
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredSkills.map((skill, i) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.35 }}
                  >
                    <VerifiedSkillCard
                      skill={skill}
                      onClick={setSelectedSkill}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ── View: Skill Graph (existing DynamicSkillTree) ─────────────────── */}
      {view === "tree" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          <DynamicSkillTree
            graph={visibleTree}
            isLoading={loading || candidateLoading}
          />
        </motion.div>
      )}

      {/* ── Achievement badges ────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="mb-5 flex items-center gap-3">
          <Trophy className="h-5 w-5 text-[var(--color-accent)]" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">
            Verification Badges
          </h2>
        </div>
        <AchievementStrip achievements={visibleProgress?.achievements || []} />
      </section>

      {/* ── Footer note ─────────────────────────────────────────────────── */}
      <div className="mt-4 mb-8 p-4 border border-[var(--color-border)]/50 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)]">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] text-center">
          Verified Skills are derived exclusively from Resume Claims · GitHub Repository Analysis · Technical Assessment Results · Project Evidence.
          Skills not present in verified evidence will never appear in this view.
        </p>
      </div>

      {/* ── Skill Detail Drawer ────────────────────────────────────────── */}
      <SkillDetailDrawer
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
      />
    </div>
  );
};

export default SkillTreePage;
