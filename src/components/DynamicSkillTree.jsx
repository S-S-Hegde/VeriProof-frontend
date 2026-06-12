import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck, Brain, ChevronDown, Cloud, Code2, Database,
  GitBranch, Lock, Monitor, Network, Server, Shield,
  Sparkles, Trophy,
} from "lucide-react";

const ICONS = {
  frontend: Monitor, backend: Server, database: Database,
  devops: GitBranch, "ai-ml": Brain, programming: Code2,
  cloud: Cloud, cybersecurity: Shield, fullstack: Network,
};

const STATUS_CONFIG = {
  verified: {
    border: "var(--color-success)",
    bg: "var(--color-success)",
    text: "#fff",
    glow: "0 0 20px color-mix(in srgb, var(--color-success) 40%, transparent)",
  },
  in_progress: {
    border: "var(--color-accent)",
    bg: "var(--color-accent)",
    text: "#fff",
    glow: "0 0 18px color-mix(in srgb, var(--color-accent) 30%, transparent)",
  },
  unlocked: {
    border: "var(--color-warning)",
    bg: "var(--color-warning)",
    text: "#000",
    glow: "0 0 14px color-mix(in srgb, var(--color-warning) 25%, transparent)",
  },
  locked: {
    border: "var(--color-border-strong)",
    bg: "var(--color-bg-sunken)",
    text: "var(--color-muted)",
    glow: "none",
  },
};

const statusLabel = { verified: "Verified", in_progress: "In Progress", unlocked: "Unlocked", locked: "Locked" };

const buildPath = (from, to) => {
  const startX = from.x + (from.type === "category" ? 64 : 34);
  const startY = from.y;
  const endX = to.x - 36;
  const endY = to.y;
  const midX = startX + Math.max(80, (endX - startX) * 0.52);
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
};

/* ─── Tooltip ─── */
const SkillTooltip = ({ node }) => (
  <motion.div
    initial={{ opacity: 0, y: 6, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 6, scale: 0.95 }}
    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    className="pointer-events-none absolute left-1/2 top-full z-30 mt-3 w-64 -translate-x-1/2 vp-glass p-4 text-left"
  >
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-sm font-black uppercase tracking-tight text-[var(--color-text)]">{node.name}</p>
      <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">
        {statusLabel[node.status]}
      </span>
    </div>
    <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-sunken)]">
      <motion.div
        className="h-full rounded-full bg-[var(--color-accent)]"
        initial={{ width: 0 }}
        animate={{ width: `${node.progress || 0}%` }}
        transition={{ duration: 0.6 }}
      />
    </div>
    <div className="grid grid-cols-3 gap-2 text-center">
      {[
        { l: "XP", v: node.xp || 0 },
        { l: "Score", v: node.verificationScore || node.progress || 0 },
        { l: "Level", v: node.level || 1 },
      ].map((s) => (
        <div key={s.l} className="vp-surface-1 p-2">
          <p className="vp-label">{s.l}</p>
          <p className="font-mono text-sm font-bold text-[var(--color-text)]">{s.v}</p>
        </div>
      ))}
    </div>
    {node.prerequisites?.length > 0 && (
      <p className="mt-3 text-[11px] text-[var(--color-muted)]">Requires: {node.prerequisites.join(", ")}</p>
    )}
    {node.evidence?.length > 0 && (
      <p className="mt-2 line-clamp-2 text-[11px] text-[var(--color-success)]">
        Latest: {node.evidence[node.evidence.length - 1]?.label}
      </p>
    )}
  </motion.div>
);

/* ─── Node ─── */
const SkillNode = ({ node, scale }) => {
  const Icon = node.type === "category" ? ICONS[node.id] || Sparkles : BadgeCheck;
  const [hovered, setHovered] = useState(false);
  const config = STATUS_CONFIG[node.status] || STATUS_CONFIG.locked;
  const size = node.type === "category" ? 68 : 54;
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: node.x * scale, top: node.y * scale }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        type="button"
        className="relative grid place-items-center rounded-full transition-all duration-300"
        style={{
          width: size, height: size,
          border: `2px solid ${config.border}`,
          background: config.bg,
          color: config.text,
          boxShadow: config.glow,
          filter: node.status === "locked" ? "grayscale(0.6)" : "none",
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`${node.name} ${statusLabel[node.status]}`}
      >
        {node.status === "locked" ? <Lock className="h-4 w-4" /> : <Icon className="h-5 w-5" />}
        {node.status === "verified" && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
            className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white shadow-md"
            style={{ color: "var(--color-success)" }}
          >
            <Trophy className="h-3 w-3" />
          </motion.span>
        )}
        {/* Progress ring */}
        <svg className="absolute inset-[-4px] h-[calc(100%+8px)] w-[calc(100%+8px)] -rotate-90">
          <circle cx="50%" cy="50%" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="2.5" opacity="0.3" />
          <motion.circle
            cx="50%" cy="50%" r={radius}
            fill="none"
            stroke={node.accent || "var(--color-accent)"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - ((node.progress || 0) / 100) * circumference }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
        </svg>
      </motion.button>
      <div className="mt-2.5 w-28 -translate-x-5 text-center">
        <p className="truncate text-[11px] font-bold uppercase tracking-tight text-[var(--color-text)]">{node.name}</p>
        <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--color-muted)]">
          {node.progress || 0}% / L{node.level || 1}
        </p>
      </div>
      <AnimatePresence>{hovered && <SkillTooltip node={node} />}</AnimatePresence>
    </motion.div>
  );
};

/* ─── Category Rail ─── */
const CategoryRail = ({ categories, active, onToggle }) => (
  <div className="grid gap-2 lg:w-64">
    {categories.map((category) => {
      const Icon = ICONS[category.id] || Sparkles;
      const isActive = active.includes(category.id);
      return (
        <motion.button
          key={category.id}
          type="button"
          onClick={() => onToggle(category.id)}
          className={`group vp-surface-1 p-4 text-left transition-all ${isActive ? "border-[var(--color-accent)]! bg-[var(--color-accent-subtle)]!" : ""}`}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border"
                style={{ borderColor: category.accent, color: category.accent }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-tight">{category.name}</p>
                <p className="vp-label">{category.progress}%</p>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-[var(--color-muted)] transition-transform ${isActive ? "rotate-180" : ""}`} />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-sunken)]">
            <motion.div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${category.progress}%`, backgroundColor: category.accent }}
            />
          </div>
        </motion.button>
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════
   DYNAMIC SKILL TREE
   ═══════════════════════════════════════════════════ */
const DynamicSkillTree = ({ graph, isLoading = false }) => {
  const categories = useMemo(() => graph?.categories || [], [graph]);
  const [selectedCategories, setSelectedCategories] = useState(null);
  const defaultActiveCategories = useMemo(() => categories.slice(0, 5).map((c) => c.id), [categories]);
  const activeCategories = selectedCategories || defaultActiveCategories;

  const toggleCategory = (id) => {
    setSelectedCategories((curr) => {
      const current = curr || defaultActiveCategories;
      return current.includes(id) ? current.filter((cid) => cid !== id) : [...current, id];
    });
  };

  const { nodes, edges, width, height } = useMemo(() => {
    const visible = categories.filter((c) => activeCategories.includes(c.id));
    const rowGap = 170;
    const nextNodes = [];

    visible.forEach((cat, ci) => {
      const baseY = 90 + ci * rowGap;
      nextNodes.push({
        id: cat.id, type: "category", name: cat.name, accent: cat.accent,
        status: cat.unlocked ? "unlocked" : "locked", progress: cat.progress,
        x: 90, y: baseY + 28,
      });
      cat.skills.forEach((skill, si) => {
        nextNodes.push({ ...skill, x: 280 + skill.level * 150, y: baseY + si * 36 });
      });
    });

    const nodeMap = new Map(nextNodes.map((n) => [n.id, n]));
    const nextEdges = [];
    visible.forEach((cat) => {
      cat.skills.forEach((skill) => {
        const prereqs = skill.prerequisites?.length ? skill.prerequisites : [cat.id];
        prereqs.forEach((pre) => {
          const from = nodeMap.get(pre) || nodeMap.get(cat.id);
          const to = nodeMap.get(skill.id);
          if (from && to) nextEdges.push({ id: `${from.id}-${to.id}`, from, to, unlocked: skill.status !== "locked" });
        });
      });
    });

    return {
      nodes: nextNodes, edges: nextEdges,
      width: 1040, height: Math.max(420, visible.length * rowGap + 70),
    };
  }, [activeCategories, categories]);

  if (isLoading) {
    return (
      <div className="grid min-h-[520px] place-items-center vp-surface-1">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--color-border)]" />
            <div className="absolute inset-0 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
          </div>
          <p className="vp-label-accent animate-pulse">Recomputing_Proof_Graph</p>
        </div>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="grid min-h-[420px] place-items-center vp-surface-1">
        <p className="vp-label">No_Skill_Graph_Available</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <CategoryRail categories={categories} active={activeCategories} onToggle={toggleCategory} />

      <div className="relative min-h-[560px] overflow-auto vp-surface-2">
        {/* Grid dot background */}
        <div
          className="relative"
          style={{
            width, height,
            backgroundImage: "radial-gradient(circle at 1px 1px, var(--grid-color) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        >
          <svg className="absolute inset-0 z-10" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id="edge-live" x1="0%" x2="100%">
                <stop offset="0%" stopColor="var(--color-accent)" />
                <stop offset="50%" stopColor="var(--color-success)" />
                <stop offset="100%" stopColor="var(--color-warning)" />
              </linearGradient>
            </defs>
            {edges.map((edge, index) => (
              <motion.path
                key={edge.id}
                d={buildPath(edge.from, edge.to)}
                fill="none"
                stroke={edge.unlocked ? "url(#edge-live)" : "var(--color-border)"}
                strokeWidth={edge.unlocked ? 2.5 : 1.5}
                strokeDasharray={edge.unlocked ? "0" : "6 6"}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.02, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </svg>

          {nodes.map((node) => (
            <SkillNode key={node.id} node={node} scale={1} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DynamicSkillTree;
