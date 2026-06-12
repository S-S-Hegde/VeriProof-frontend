import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, GitBranch, ShieldCheck, Trophy, Zap } from "lucide-react";

/* ─── Circular Progress Ring ─── */
const ProgressRing = ({ percent = 0, size = 56, stroke = 4 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />
    </svg>
  );
};

const SkillProgressPanel = ({ progress, compact = false, candidateId }) => {
  const skills = progress?.skills || [];
  const verified = skills.filter((skill) => skill.status === "verified").slice(0, compact ? 6 : 10);
  const href = candidateId ? `/skill-tree?candidate=${candidateId}` : "/skill-tree";
  const progressPercent = progress?.progressPercent || 0;

  const stats = [
    { label: "Trust", value: `${progress?.trustScore || 0}%`, icon: ShieldCheck },
    { label: "XP", value: progress?.totalXp || 0, icon: Zap },
    { label: "Level", value: progress?.level || 1, icon: Trophy },
    { label: "GitHub", value: `${progress?.githubScore || 0}%`, icon: GitBranch },
  ];

  return (
    <section className="vp-surface-2 p-6 lg:p-8 overflow-hidden">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {/* Circular progress indicator */}
          <div className="relative flex-shrink-0">
            <ProgressRing percent={progressPercent} size={52} stroke={3.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-mono font-bold text-[var(--color-accent)]">
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">
              Skill_Proof_Graph
            </h3>
            <p className="vp-label mt-0.5">
              {progress?.verifiedCount || 0} verified / {progress?.totalSkills || 0} mapped
            </p>
          </div>
        </div>
        <Link
          to={href}
          className="vp-btn vp-btn-secondary text-[10px] py-2.5 px-5 gap-2"
        >
          Open_Tree <GitBranch className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stats Mini Grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="vp-surface-1 p-4 group"
          >
            <stat.icon className="mb-3 h-4 w-4 text-[var(--color-accent)]" />
            <p className="vp-label">{stat.label}</p>
            <p className="mt-1 text-xl font-black tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Gradient Progress Bar */}
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-[var(--color-bg-sunken)] border border-[var(--color-border)]">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 60%, white))",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        />
      </div>

      {/* Verified Skill Badges */}
      <div className="flex flex-wrap gap-2">
        {verified.length > 0 ? verified.map((skill) => (
          <motion.span
            key={skill.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-success)]/30 bg-[var(--color-success)]/8 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-success)]"
          >
            <BadgeCheck className="h-3 w-3" /> {skill.id.replaceAll("-", " ")}
          </motion.span>
        )) : (
          <span className="vp-label">
            Verified skills will appear after exams, project checks, or recruiter assessments.
          </span>
        )}
      </div>
    </section>
  );
};

export default SkillProgressPanel;
