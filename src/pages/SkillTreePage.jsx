import { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Flame,
  GitBranch,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import DynamicSkillTree from "../components/DynamicSkillTree";
import { useSkillTree } from "../context/SkillTreeContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const StatTile = ({ icon: Icon, label, value, sub }) => (
  <div className="border border-[var(--color-border)] bg-[var(--color-bg)]/65 p-5 backdrop-blur-xl">
    <div className="mb-5 flex items-start justify-between gap-4">
      <Icon className="h-5 w-5 text-[var(--color-accent)]" />
      <span className="font-mono text-[10px] uppercase tracking-[0.24em] opacity-35">{label}</span>
    </div>
    <p className="text-3xl font-black uppercase tracking-tighter">{value}</p>
    {sub && <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] opacity-45">{sub}</p>}
  </div>
);

const AchievementStrip = ({ achievements = [] }) => (
  <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
    {achievements.map((achievement) => (
      <div
        key={achievement.id}
        className={`border p-4 transition-all ${achievement.unlocked ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10" : "border-[var(--color-border)] bg-[var(--color-bg)]/45 opacity-50"}`}
      >
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-current">
          {achievement.unlocked ? <Trophy className="h-5 w-5" /> : <Award className="h-5 w-5" />}
        </div>
        <p className="text-xs font-black uppercase tracking-tight">{achievement.title}</p>
        <p className="mt-2 text-[11px] leading-relaxed opacity-55">{achievement.description}</p>
      </div>
    ))}
  </div>
);

const SkillTreePage = () => {
  const { user } = useAuth();
  const { skillTree, progress, loading, error, refreshSkillTree, recordSkillEvent } = useSkillTree();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate");
  const [candidateView, setCandidateView] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

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

  const simulateProof = async () => {
    setSimulating(true);
    try {
      await recordSkillEvent({
        type: "demo_assessment",
        label: "React Exam Passed",
        technologies: ["JavaScript", "React", "Frontend Testing"],
        score: 91,
        xp: 180,
        completed: true,
        source: "skill-tree-demo",
      });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
      <section className="mb-10 border-b border-[var(--color-border)] pb-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-5 flex items-center gap-4">
              <span className="h-px w-10 bg-[var(--color-accent)]" />
              <p className="font-mono text-xs font-bold uppercase tracking-[0.45em] text-[var(--color-accent)]">
                Live_Proof_Graph // {visibleName?.replace(" ", "_") || "Candidate"}
              </p>
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter md:text-7xl">
              Dynamic Skill <span className="text-[var(--color-accent)] not-italic">Tree.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-sm font-medium uppercase tracking-widest opacity-50">
              Exams, verified projects, recruiter assessments, and GitHub signals unlock dependent technologies in real time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => refreshSkillTree()}
              className="inline-flex items-center gap-3 border border-[var(--color-border)] px-5 py-3 text-xs font-black uppercase tracking-[0.24em] transition-all hover:border-[var(--color-accent)]"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            {!candidateId && (
              <button
                onClick={simulateProof}
                disabled={simulating}
                className="inline-flex items-center gap-3 bg-[var(--color-text)] px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-[var(--color-bg)] transition-all hover:bg-[var(--color-accent)] disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" /> Demo Proof
              </button>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-8 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatTile icon={Zap} label="XP" value={visibleProgress?.totalXp || 0} sub={`Level ${visibleProgress?.level || 1}`} />
        <StatTile icon={BadgeCheck} label="Verified" value={visibleProgress?.verifiedCount || 0} sub={`${visibleProgress?.unlockedCount || 0}/${visibleProgress?.totalSkills || 0} unlocked`} />
        <StatTile icon={ShieldCheck} label="Trust" value={`${visibleProgress?.trustScore || 0}%`} sub="Recruiter signal" />
        <StatTile icon={GitBranch} label="GitHub" value={`${visibleProgress?.githubScore || 0}%`} sub="Repo evidence" />
        <StatTile icon={Flame} label="Streak" value={visibleProgress?.streakDays || 0} sub="Proof days" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-10"
      >
        <DynamicSkillTree graph={visibleTree} isLoading={loading || candidateLoading} />
      </motion.div>

      <section className="mb-10">
        <div className="mb-5 flex items-center gap-3">
          <Trophy className="h-5 w-5 text-[var(--color-accent)]" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Achievement Badges</h2>
        </div>
        <AchievementStrip achievements={visibleProgress?.achievements || []} />
      </section>
    </div>
  );
};

export default SkillTreePage;
