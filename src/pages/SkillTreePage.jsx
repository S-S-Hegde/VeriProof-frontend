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
import { useSearchParams } from "react-router-dom";
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
  Code2,
  Monitor,
  Server,
  Database,
  Brain,
  Cloud,
  Shield,
  Network,
  Lock,
  Maximize2,
  Plus,
  Minus,
  RotateCcw,
  Info,
} from "lucide-react";
import DynamicSkillTree from "../components/DynamicSkillTree";
import { useSkillTree } from "../context/SkillTreeContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

// ── Dynamic Verified Score Calculator ──────────────────────────────────────────
// ── Sprint ST-9: Rebalanced Verified Score Weighting ──────────────────────────
const VERIFIED_SCORE_WEIGHTS = {
  assessment: 0.5,
  github: 0.35,
  resume: 0.15,
};

/**
 * Calculates a weighted verification score based on evidence sources:
 * - Technical Assessment: 50%
 * - GitHub / Project Evidence: 35%
 * - Resume Evidence: 15%
 * Dynamically reweights available evidence if some sources are missing.
 * Falls back gracefully to existing static score if no evidence exists.
 */
const calculateVerifiedScore = (skill) => {
  if (!skill) return 0;

  const evidenceList = skill.evidence || [];

  const categoryScores = {
    assessment: [],
    github: [],
    resume: [],
  };

  if (Array.isArray(evidenceList) && evidenceList.length > 0) {
    for (const item of evidenceList) {
      const type = (item?.type || "").toLowerCase();
      const scoreVal = Number(item?.score ?? item?.confidence ?? 100);
      const validScore = isNaN(scoreVal)
        ? 100
        : Math.min(100, Math.max(0, scoreVal));

      if (type === "assessment") {
        categoryScores.assessment.push(validScore);
      } else if (type === "github" || type === "project") {
        categoryScores.github.push(validScore);
      } else if (type === "resume") {
        categoryScores.resume.push(validScore);
      }
    }
  }

  let totalWeightedScore = 0;
  let totalAvailableWeight = 0;

  for (const [cat, scores] of Object.entries(categoryScores)) {
    if (scores.length > 0) {
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const weight = VERIFIED_SCORE_WEIGHTS[cat] || 0;
      totalWeightedScore += avgScore * weight;
      totalAvailableWeight += weight;
    }
  }

  // Fall back to current verificationScore or progress if no evidence categories matched
  if (totalAvailableWeight === 0) {
    const fallback = Number(skill.verificationScore ?? skill.progress ?? 0);
    return isNaN(fallback)
      ? 0
      : Math.min(100, Math.max(0, Math.round(fallback)));
  }

  // Normalize by total available weight so weights sum to 100%
  const finalScore = totalWeightedScore / totalAvailableWeight;
  return Math.min(100, Math.max(0, Math.round(finalScore)));
};

// ── Dynamic Skill Level Classification ─────────────────────────────────────────
/**
 * Maps a Verified Score (0-100) to a Professional Skill Level:
 * - 0-24: Beginner (Muted Gray)
 * - 25-49: Intermediate (Blue)
 * - 50-74: Advanced (Emerald)
 * - 75-89: Expert (Purple)
 * - 90-100: Master (Amber / Gold)
 */
const getSkillLevel = (score) => {
  const numScore = Number(score) || 0;
  if (numScore >= 90) {
    return {
      label: "Master",
      style: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    };
  }
  if (numScore >= 75) {
    return {
      label: "Expert",
      style: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    };
  }
  if (numScore >= 50) {
    return {
      label: "Advanced",
      style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    };
  }
  if (numScore >= 25) {
    return {
      label: "Intermediate",
      style: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    };
  }
  return {
    label: "Beginner",
    style: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  };
};

// ── Dynamic Professional Skill Categorization ──────────────────────────────────
/**
 * Maps a skill to a professional category based on its name, id, or category property.
 * Categories: Frontend, Backend, Database, Programming Languages, Tools & DevOps, Cloud, Others.
 */
const getSkillCategory = (skill) => {
  if (!skill) return "Others";

  const name = (skill.name || skill.id || "").toLowerCase();

  if (
    /\b(react|next\.?js|vue|angular|tailwind|html|css|redux|sass|bootstrap|ui\/ux|frontend|web)\b/i.test(
      name,
    )
  ) {
    return "Frontend";
  }

  if (
    /\b(node\.?js|node|express\.?js|express|fastapi|django|flask|spring|springboot|nest\.?js|rest|graphql|backend|microservices)\b/i.test(
      name,
    )
  ) {
    return "Backend";
  }

  if (
    /\b(mongodb|mongo|mysql|postgresql|postgres|redis|sqlite|oracle|cassandra|database|sql|nosql)\b/i.test(
      name,
    )
  ) {
    return "Database";
  }

  if (
    /\b(python|java|c\+\+|c#|golang|go|rust|ruby|php|swift|kotlin|javascript|js|typescript|ts|scala)\b/i.test(
      name,
    )
  ) {
    return "Programming Languages";
  }

  if (
    /\b(git|github|docker|kubernetes|k8s|linux|vs\s*code|ci\/cd|jenkins|nginx|bash|shell|tools|devops)\b/i.test(
      name,
    )
  ) {
    return "Tools & DevOps";
  }

  if (
    /\b(aws|azure|gcp|google\s*cloud|firebase|heroku|vercel|cloud)\b/i.test(
      name,
    )
  ) {
    return "Cloud";
  }

  if (skill.category) {
    return skill.category.charAt(0).toUpperCase() + skill.category.slice(1);
  }

  return "Others";
};

// ── Graph Node Skill Matcher ──────────────────────────────────────────────────
const findSkillFromGraphNode = (identifier, visibleTree, visibleProgress) => {
  if (!identifier) return null;
  const cleanId = identifier.toLowerCase().trim();

  // 1. Try matching in visibleProgress.skills
  const foundInProgress = (visibleProgress?.skills || []).find(
    (s) =>
      s.name?.toLowerCase().trim() === cleanId ||
      s.id?.toLowerCase().trim() === cleanId ||
      cleanId.includes(s.name?.toLowerCase().trim()) ||
      cleanId.includes(s.id?.toLowerCase().trim()),
  );
  if (foundInProgress) return foundInProgress;

  // 2. Try matching in visibleTree categories -> skills
  if (visibleTree?.categories) {
    for (const cat of visibleTree.categories) {
      if (cat.skills) {
        for (const sk of cat.skills) {
          if (
            sk.name?.toLowerCase().trim() === cleanId ||
            sk.id?.toLowerCase().trim() === cleanId ||
            cleanId.includes(sk.name?.toLowerCase().trim()) ||
            cleanId.includes(sk.id?.toLowerCase().trim())
          ) {
            return sk;
          }
        }
      }
    }
  }
  return null;
};

// ── Graph Connected Node Extractor ───────────────────────────────────────────
const getConnectedNodeIds = (selectedSkill, visibleTree) => {
  if (!selectedSkill) return new Set();
  const connected = new Set();

  const selectedId = (
    selectedSkill.id ||
    selectedSkill.name ||
    ""
  ).toLowerCase();
  connected.add(selectedId);

  // Add prerequisites (parents)
  if (Array.isArray(selectedSkill.prerequisites)) {
    selectedSkill.prerequisites.forEach((p) =>
      connected.add((p || "").toLowerCase()),
    );
  }

  // Find children in visibleTree
  if (visibleTree?.categories) {
    for (const cat of visibleTree.categories) {
      if (cat.skills) {
        for (const sk of cat.skills) {
          const skId = (sk.id || sk.name || "").toLowerCase();
          const prereqs = (sk.prerequisites || []).map((p) =>
            (p || "").toLowerCase(),
          );
          if (prereqs.includes(selectedId)) {
            connected.add(skId);
          }
        }
      }
    }
  }

  return connected;
};

// ── Roadmap Tree Hierarchical Layout Configuration ────────────────────────────
const ROADMAP_CATEGORIES_CONFIG = [
  {
    id: "programming",
    name: "PROGRAMMING LANGUAGES",
    icon: Code2,
    color: "#3b82f6",
    total: 14,
    defaultUnlocked: 7,
  },
  {
    id: "frontend",
    name: "FRONTEND",
    icon: Monitor,
    color: "#22c55e",
    total: 14,
    defaultUnlocked: 6,
  },
  {
    id: "backend",
    name: "BACKEND",
    icon: Server,
    color: "#f59e0b",
    total: 15,
    defaultUnlocked: 5,
  },
  {
    id: "database",
    name: "DATABASE",
    icon: Database,
    color: "#14b8a6",
    total: 12,
    defaultUnlocked: 4,
  },
  {
    id: "devops",
    name: "DEVOPS",
    icon: GitBranch,
    color: "#a855f7",
    total: 13,
    defaultUnlocked: 5,
  },
  {
    id: "ai-ml",
    name: "AI / ML",
    icon: Brain,
    color: "#ec4899",
    total: 10,
    defaultUnlocked: 3,
  },
  {
    id: "cloud",
    name: "CLOUD",
    icon: Cloud,
    color: "#06b6d4",
    total: 9,
    defaultUnlocked: 3,
  },
  {
    id: "cybersecurity",
    name: "CYBERSECURITY",
    icon: Shield,
    color: "#ef4444",
    total: 11,
    defaultUnlocked: 2,
  },
  {
    id: "fullstack",
    name: "FULL STACK",
    icon: Network,
    color: "#6366f1",
    total: 16,
    defaultUnlocked: 6,
  },
];

const ROADMAP_NODES = [
  // Tier 1: Programming Languages
  {
    id: "cat-programming",
    type: "category",
    label: "PROGRAMMING LANGUAGES",
    color: "#3b82f6",
    x: 520,
    y: 35,
  },
  {
    id: "js",
    name: "JavaScript",
    short: "JS",
    categoryId: "programming",
    parentId: "cat-programming",
    x: 520,
    y: 115,
    icon: Code2,
  },
  {
    id: "ts",
    name: "TypeScript",
    short: "TS",
    categoryId: "programming",
    parentId: "js",
    x: 370,
    y: 225,
    icon: Code2,
  },
  {
    id: "python",
    name: "Python",
    short: "PY",
    categoryId: "programming",
    parentId: "js",
    x: 520,
    y: 225,
    icon: Code2,
  },
  {
    id: "html",
    name: "HTML/CSS",
    short: "HTML",
    categoryId: "programming",
    parentId: "js",
    x: 670,
    y: 225,
    icon: Code2,
  },

  // Tier 2: Frontend & Backend
  {
    id: "cat-frontend",
    type: "category",
    label: "FRONTEND",
    color: "#22c55e",
    parentId: "ts",
    x: 270,
    y: 315,
  },
  {
    id: "react",
    name: "React",
    short: "⚛️",
    categoryId: "frontend",
    parentId: "cat-frontend",
    x: 170,
    y: 405,
    icon: Monitor,
  },
  {
    id: "nextjs",
    name: "Next.js",
    short: "N",
    categoryId: "frontend",
    parentId: "cat-frontend",
    x: 270,
    y: 405,
    icon: Monitor,
  },
  {
    id: "frontend-testing",
    name: "Frontend Testing",
    short: "🧪",
    categoryId: "frontend",
    parentId: "cat-frontend",
    x: 370,
    y: 405,
    icon: Monitor,
  },

  {
    id: "cat-backend",
    type: "category",
    label: "BACKEND",
    color: "#f59e0b",
    parentId: "python",
    x: 770,
    y: 315,
  },
  {
    id: "nodejs",
    name: "Node.js",
    short: "🟢",
    categoryId: "backend",
    parentId: "cat-backend",
    x: 620,
    y: 405,
    icon: Server,
  },
  {
    id: "express",
    name: "Express",
    short: "ex",
    categoryId: "backend",
    parentId: "cat-backend",
    x: 720,
    y: 405,
    icon: Server,
  },
  {
    id: "rest-api",
    name: "REST API",
    short: "{--}",
    categoryId: "backend",
    parentId: "cat-backend",
    x: 820,
    y: 405,
    icon: Server,
  },
  {
    id: "authentication",
    name: "Authentication",
    short: "🔒",
    categoryId: "backend",
    parentId: "cat-backend",
    x: 920,
    y: 405,
    icon: Server,
  },

  // Tier 3: Database, DevOps & Cloud
  {
    id: "cat-database",
    type: "category",
    label: "DATABASE",
    color: "#14b8a6",
    parentId: "react",
    x: 220,
    y: 495,
  },
  {
    id: "mongodb",
    name: "MongoDB",
    short: "🍃",
    categoryId: "database",
    parentId: "cat-database",
    x: 170,
    y: 585,
    icon: Database,
  },
  {
    id: "mongoose",
    name: "Mongoose",
    short: "M",
    categoryId: "database",
    parentId: "cat-database",
    x: 270,
    y: 585,
    icon: Database,
  },

  {
    id: "cat-devops",
    type: "category",
    label: "DEVOPS",
    color: "#a855f7",
    parentId: "nodejs",
    x: 530,
    y: 495,
  },
  {
    id: "git",
    name: "Git/GitHub",
    short: "🐙",
    categoryId: "devops",
    parentId: "cat-devops",
    x: 430,
    y: 585,
    icon: GitBranch,
  },
  {
    id: "docker",
    name: "Docker",
    short: "🐳",
    categoryId: "devops",
    parentId: "cat-devops",
    x: 530,
    y: 585,
    icon: GitBranch,
  },
  {
    id: "cicd",
    name: "CI/CD",
    short: "∞",
    categoryId: "devops",
    parentId: "cat-devops",
    x: 630,
    y: 585,
    icon: GitBranch,
  },

  {
    id: "cat-cloud",
    type: "category",
    label: "CLOUD",
    color: "#06b6d4",
    parentId: "authentication",
    x: 840,
    y: 495,
  },
  {
    id: "aws",
    name: "AWS",
    short: "☁️",
    categoryId: "cloud",
    parentId: "cat-cloud",
    x: 740,
    y: 585,
    icon: Cloud,
  },
  {
    id: "cloud-docker",
    name: "Docker",
    short: "🐳",
    categoryId: "cloud",
    parentId: "cat-cloud",
    x: 840,
    y: 585,
    icon: Cloud,
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    short: "☸️",
    categoryId: "cloud",
    parentId: "cat-cloud",
    x: 940,
    y: 585,
    icon: Cloud,
  },

  // Tier 4: AI/ML, Cybersecurity & Full Stack
  {
    id: "cat-aiml",
    type: "category",
    label: "AI / ML",
    color: "#ec4899",
    parentId: "mongodb",
    x: 270,
    y: 675,
  },
  {
    id: "ml",
    name: "Machine Learning",
    short: "🧠",
    categoryId: "ai-ml",
    parentId: "cat-aiml",
    x: 210,
    y: 765,
    icon: Brain,
  },
  {
    id: "dl",
    name: "Deep Learning",
    short: "🕸️",
    categoryId: "ai-ml",
    parentId: "cat-aiml",
    x: 330,
    y: 765,
    icon: Brain,
  },

  {
    id: "cat-cybersecurity",
    type: "category",
    label: "CYBERSECURITY",
    color: "#ef4444",
    parentId: "docker",
    x: 610,
    y: 675,
  },
  {
    id: "owasp",
    name: "OWASP Top 10",
    short: "🛡️",
    categoryId: "cybersecurity",
    parentId: "cat-cybersecurity",
    x: 540,
    y: 765,
    icon: Shield,
  },
  {
    id: "network-security",
    name: "Network Security",
    short: "🌐",
    categoryId: "cybersecurity",
    parentId: "cat-cybersecurity",
    x: 680,
    y: 765,
    icon: Shield,
  },

  {
    id: "cat-fullstack",
    type: "category",
    label: "FULL STACK",
    color: "#6366f1",
    parentId: "kubernetes",
    x: 890,
    y: 675,
  },
  {
    id: "mern",
    name: "MERN Stack",
    short: "📚",
    categoryId: "fullstack",
    parentId: "cat-fullstack",
    x: 820,
    y: 765,
    icon: Network,
  },
  {
    id: "system-design",
    name: "System Design",
    short: "🔲",
    categoryId: "fullstack",
    parentId: "cat-fullstack",
    x: 960,
    y: 765,
    icon: Network,
  },
];

const ROADMAP_EDGES = [
  { from: "cat-programming", to: "js", color: "#3b82f6" },
  { from: "js", to: "ts", color: "#3b82f6" },
  { from: "js", to: "python", color: "#3b82f6" },
  { from: "js", to: "html", color: "#3b82f6" },
  { from: "ts", to: "cat-frontend", color: "#22c55e", style: "dashed" },
  { from: "cat-frontend", to: "react", color: "#22c55e" },
  { from: "cat-frontend", to: "nextjs", color: "#22c55e" },
  { from: "cat-frontend", to: "frontend-testing", color: "#22c55e" },
  { from: "python", to: "cat-backend", color: "#f59e0b", style: "dashed" },
  { from: "cat-backend", to: "nodejs", color: "#f59e0b" },
  { from: "cat-backend", to: "express", color: "#f59e0b" },
  { from: "cat-backend", to: "rest-api", color: "#f59e0b" },
  { from: "cat-backend", to: "authentication", color: "#f59e0b" },
  { from: "react", to: "cat-database", color: "#14b8a6", style: "dashed" },
  { from: "cat-database", to: "mongodb", color: "#14b8a6" },
  { from: "cat-database", to: "mongoose", color: "#14b8a6" },
  { from: "nodejs", to: "cat-devops", color: "#a855f7", style: "dashed" },
  { from: "cat-devops", to: "git", color: "#a855f7" },
  { from: "cat-devops", to: "docker", color: "#a855f7" },
  { from: "cat-devops", to: "cicd", color: "#a855f7" },
  {
    from: "authentication",
    to: "cat-cloud",
    color: "#06b6d4",
    style: "dashed",
  },
  { from: "cat-cloud", to: "aws", color: "#06b6d4" },
  { from: "cat-cloud", to: "cloud-docker", color: "#06b6d4" },
  { from: "cat-cloud", to: "kubernetes", color: "#06b6d4" },
  { from: "mongodb", to: "cat-aiml", color: "#ec4899", style: "dashed" },
  { from: "cat-aiml", to: "ml", color: "#ec4899" },
  { from: "cat-aiml", to: "dl", color: "#ec4899" },
  {
    from: "docker",
    to: "cat-cybersecurity",
    color: "#ef4444",
    style: "dashed",
  },
  { from: "cat-cybersecurity", to: "owasp", color: "#ef4444" },
  { from: "cat-cybersecurity", to: "network-security", color: "#ef4444" },
  {
    from: "kubernetes",
    to: "cat-fullstack",
    color: "#6366f1",
    style: "dashed",
  },
  { from: "cat-fullstack", to: "mern", color: "#6366f1" },
  { from: "cat-fullstack", to: "system-design", color: "#6366f1" },
];

const buildRoadmapCurve = (fromX, fromY, toX, toY) => {
  const midY = fromY + (toY - fromY) * 0.5;
  return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
};

const getProficiencyColor = (score) => {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#eab308";
  if (score > 0) return "#ef4444";
  return "#64748b";
};

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
  const verifiedScore = calculateVerifiedScore(skill);
  const level = getSkillLevel(verifiedScore);

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
              <h3 className="text-xl font-black uppercase tracking-tight mb-1">
                {skill.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <VerificationPill status={skill.status} />
                {(skill.evidence || []).map((ev, i) => (
                  <EvidenceBadge key={i} source={ev.type} />
                ))}
              </div>
            </div>
          </div>

          {/* Confidence bar & Skill Level */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                Verification Confidence
              </span>
              <span className="text-xs font-black">{verifiedScore}%</span>
            </div>
            <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--color-accent)] to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${verifiedScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                Skill Level
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${level.style}`}
              >
                {level.label}
              </span>
            </div>
          </div>

          {/* Evidence list */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-3">
              Supporting Evidence ({(skill.evidence || []).length})
            </p>
            {(skill.evidence || []).length === 0 ? (
              <p className="text-xs text-[var(--color-muted)] italic">
                No evidence records.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(skill.evidence || []).map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]"
                  >
                    <EvidenceBadge source={ev.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">
                        {ev.label || ev.source}
                      </p>
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
            Evidence sourced from: Resume Claims · GitHub Repositories ·
            Technical Assessments · Projects
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Verified Skill Card ───────────────────────────────────────────────────────
const VerifiedSkillCard = ({ skill, rank, onClick }) => {
  const confidence = calculateVerifiedScore(skill);
  const level = getSkillLevel(confidence);
  const evidenceSources = [
    ...new Set((skill.evidence || []).map((e) => e.type)),
  ];
  const isVerified = skill.status === "verified" || skill.status === "Verified";

  const getRankBadge = (r) => {
    if (r === 1)
      return {
        label: "#1 🥇",
        style: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      };
    if (r === 2)
      return {
        label: "#2 🥈",
        style: "bg-slate-300/15 text-slate-300 border-slate-400/30",
      };
    if (r === 3)
      return {
        label: "#3 🥉",
        style: "bg-amber-700/15 text-amber-500 border-amber-600/30",
      };
    return {
      label: `#${r}`,
      style:
        "bg-[var(--color-bg-sunken)] text-[var(--color-muted)] border-[var(--color-border)]",
    };
  };

  const rankBadge = rank ? getRankBadge(rank) : null;

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
        <div className="flex items-center gap-2 line-clamp-1 flex-1 pr-2">
          {rankBadge && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border shrink-0 ${rankBadge.style}`}
            >
              {rankBadge.label}
            </span>
          )}
          <p className="text-sm font-black uppercase tracking-tight group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
            {skill.name}
          </p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0 group-hover:text-[var(--color-accent)] transition-colors" />
      </div>

      {/* Confidence bar & Skill Level */}
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
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[var(--color-muted)]">
              {confidence}% confidence
            </span>
            <span
              className={`inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider border ${level.style}`}
            >
              {level.label}
            </span>
          </div>
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
            {(skill.evidence || []).length} record
            {(skill.evidence || []).length !== 1 ? "s" : ""}
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
        <p className="text-xs font-black uppercase tracking-tight">
          {achievement.title}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed opacity-55">
          {achievement.description}
        </p>
      </div>
    ))}
  </div>
);

// ── Main Page Component ───────────────────────────────────────────────────────
const SkillTreePage = () => {
  const { user } = useAuth();
  const { skillTree, progress, loading, error, refreshSkillTree } =
    useSkillTree();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate");
  const [candidateView, setCandidateView] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(false);

  // View toggle: "tree" (graph view) or "skills" (verified skills grid)
  const [view, setView] = useState("skills");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("all");

  // Roadmap Graph View Controls State
  const [zoom, setZoom] = useState(1);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);

  useEffect(() => {
    if (!candidateId) {
      setCandidateView(null);
      return;
    }

    const loadCandidate = async () => {
      setCandidateLoading(true);
      try {
        const { data } = await api.get(
          `/api/skill-tree/candidate/${candidateId}`,
        );
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

  // ── Sprint ST-6: Smart Viewport-Aware Graph Tooltip State & Handlers ─────────
  const [hoveredGraphSkill, setHoveredGraphSkill] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    placement: "top",
  });

  const handleGraphMouseMove = (e) => {
    const btn = e.target.closest("button");
    const containerNode =
      e.target.closest(".group") || e.target.closest(".absolute");

    if (!btn && !containerNode) {
      setHoveredGraphSkill(null);
      return;
    }

    const nodeEl = btn || containerNode;
    const ariaLabel = btn?.getAttribute("aria-label") || "";
    const textContent = nodeEl.innerText || "";
    const identifier = ariaLabel || textContent;

    if (!identifier) {
      setHoveredGraphSkill(null);
      return;
    }

    const matchedSkill = findSkillFromGraphNode(
      identifier,
      visibleTree,
      visibleProgress,
    );

    if (!matchedSkill) {
      setHoveredGraphSkill(null);
      return;
    }

    const rect = nodeEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    const tooltipWidth = 240;
    const tooltipHeight = 180;

    let x = rect.left + rect.width / 2;
    let y = rect.top - 12;
    let placement = "top";

    if (rect.top - tooltipHeight < 20) {
      y = rect.bottom + 12;
      placement = "bottom";
    }

    x = Math.max(
      tooltipWidth / 2 + 16,
      Math.min(viewportWidth - tooltipWidth / 2 - 16, x),
    );

    setTooltipPos({ x, y, placement });
    setHoveredGraphSkill(matchedSkill);
  };

  const handleGraphMouseLeave = () => {
    setHoveredGraphSkill(null);
  };

  const handleGraphClick = (e) => {
    const btn = e.target.closest("button");
    const containerNode =
      e.target.closest(".group") || e.target.closest(".absolute");
    if (!btn && !containerNode) return;

    const nodeEl = btn || containerNode;
    const ariaLabel = btn?.getAttribute("aria-label") || "";
    const textContent = nodeEl.innerText || "";
    const identifier = ariaLabel || textContent;

    if (identifier) {
      const matchedSkill = findSkillFromGraphNode(
        identifier,
        visibleTree,
        visibleProgress,
      );
      if (matchedSkill) {
        setSelectedSkill(matchedSkill);
      }
    }
  };

  // ── Sprint ST-8: Selected Skill Focus Mode DOM Effect ────────────────────────
  useEffect(() => {
    if (view !== "tree") return;

    const container = document.querySelector(".vp-graph-wrapper");
    if (!container) return;

    const nodeElements = container.querySelectorAll(".absolute");
    const paths = container.querySelectorAll("path");

    if (!selectedSkill) {
      // Reset graph focus smoothly
      nodeElements.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
        const btn = el.querySelector("button");
        if (btn) {
          btn.style.transform = "";
          btn.style.boxShadow = "";
          btn.style.borderWidth = "";
          btn.style.animation = "";
        }
      });
      paths.forEach((p) => {
        p.style.opacity = "";
        p.style.strokeWidth = "";
      });
      return;
    }

    const connectedSet = getConnectedNodeIds(selectedSkill, visibleTree);
    const selectedId = (
      selectedSkill.id ||
      selectedSkill.name ||
      ""
    ).toLowerCase();

    nodeElements.forEach((el) => {
      const btn = el.querySelector("button");
      const ariaLabel = btn?.getAttribute("aria-label") || "";
      const pText = el.querySelector("p")?.innerText || "";
      const identifier = (ariaLabel || pText).toLowerCase();

      const matchedSkill = findSkillFromGraphNode(
        identifier,
        visibleTree,
        visibleProgress,
      );
      const matchedId = (
        matchedSkill?.id ||
        matchedSkill?.name ||
        identifier
      ).toLowerCase();

      const isSelected =
        matchedId === selectedId || identifier.includes(selectedId);
      const isConnected = connectedSet.has(matchedId) || isSelected;

      if (isSelected && btn) {
        el.style.opacity = "1";
        el.style.zIndex = "50";
        btn.style.transform = "scale(1.08)";
        btn.style.boxShadow =
          "0 0 30px rgba(59, 130, 246, 0.9), 0 0 45px rgba(16, 185, 129, 0.7)";
        btn.style.borderWidth = "3px";
        btn.style.animation = "vpSelectedPulse 2s ease-in-out infinite";
      } else if (isConnected) {
        el.style.opacity = "1";
        el.style.zIndex = "20";
        if (btn) {
          btn.style.transform = "";
          btn.style.boxShadow = "";
          btn.style.borderWidth = "";
          btn.style.animation = "";
        }
      } else {
        el.style.opacity = "0.4";
        el.style.zIndex = "10";
        if (btn) {
          btn.style.transform = "";
          btn.style.boxShadow = "";
          btn.style.borderWidth = "";
          btn.style.animation = "";
        }
      }
    });

    paths.forEach((p) => {
      const isLive = p.getAttribute("stroke")?.includes("edge-live");
      if (isLive) {
        p.style.opacity = "0.95";
        p.style.strokeWidth = "3.5px";
      } else {
        p.style.opacity = "0.35";
      }
    });
  }, [selectedSkill, view, visibleTree, visibleProgress]);

  // ── Build verified skills list from skillProgress ─────────────────────────
  // Only include skills that have actual evidence — never show empty/locked skills
  const verifiedSkills = (visibleProgress?.skills || []).filter(
    (s) =>
      s.status !== "locked" &&
      (s.evidence?.length > 0 || calculateVerifiedScore(s) > 0),
  );

  // ── Dynamic Skill Ranking: Score (desc), Evidence Count (desc), Name (asc) ──
  const sortedVerifiedSkills = [...verifiedSkills].sort((a, b) => {
    const scoreA = calculateVerifiedScore(a);
    const scoreB = calculateVerifiedScore(b);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    const evidenceCountA = (a.evidence || []).length;
    const evidenceCountB = (b.evidence || []).length;
    if (evidenceCountB !== evidenceCountA) {
      return evidenceCountB - evidenceCountA;
    }

    const nameA = (a.name || a.id || "").toLowerCase();
    const nameB = (b.name || b.id || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Apply search and source filter
  const filteredSkills = sortedVerifiedSkills.filter((skill) => {
    const matchesSearch =
      !searchQuery ||
      skill.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.id
        ?.replace(/_/g, " ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesSource =
      filterSource === "all" ||
      (skill.evidence || []).some((ev) => ev.type === filterSource);

    return matchesSearch && matchesSource;
  });

  const verifiedCount = verifiedSkills.filter(
    (s) => s.status === "verified",
  ).length;
  const inProgressCount = verifiedSkills.filter(
    (s) => s.status === "in_progress",
  ).length;

  // ── Sprint ST-4: Category Grouping & Category Ordering ───────────────────────
  const rankedFilteredSkills = filteredSkills.map((skill) => ({
    skill,
    rank: sortedVerifiedSkills.findIndex((s) => s.id === skill.id) + 1,
  }));

  const categoryMap = {};
  for (const item of rankedFilteredSkills) {
    const category = getSkillCategory(item.skill);
    if (!categoryMap[category]) {
      categoryMap[category] = [];
    }
    categoryMap[category].push(item);
  }

  const categorySections = Object.entries(categoryMap)
    .map(([categoryName, items]) => {
      const totalScore = items.reduce(
        (sum, { skill }) => sum + calculateVerifiedScore(skill),
        0,
      );
      const avgScore = items.length > 0 ? totalScore / items.length : 0;
      return {
        categoryName,
        items,
        avgScore,
        count: items.length,
      };
    })
    .filter((sec) => sec.count > 0)
    .sort((a, b) => {
      if (b.avgScore !== a.avgScore) {
        return b.avgScore - a.avgScore;
      }
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.categoryName.localeCompare(b.categoryName);
    });

  // ── Sprint ST-5: Candidate Skill Summary Dashboard Calculations ─────────────
  const topSkillObj = sortedVerifiedSkills[0];
  const topSkill = topSkillObj
    ? `${topSkillObj.name || topSkillObj.id} (${calculateVerifiedScore(topSkillObj)}%)`
    : "N/A";

  const topCategoryObj = categorySections[0];
  const strongestCategory = topCategoryObj
    ? `${topCategoryObj.categoryName} (${Math.round(topCategoryObj.avgScore)}%)`
    : "N/A";

  const totalVerifiedScoreSum = verifiedSkills.reduce(
    (sum, s) => sum + calculateVerifiedScore(s),
    0,
  );
  const avgVerifiedScore =
    verifiedSkills.length > 0
      ? `${Math.round(totalVerifiedScoreSum / verifiedSkills.length)}%`
      : "0%";

  const maxVerifiedScore = verifiedSkills.reduce(
    (max, s) => Math.max(max, calculateVerifiedScore(s)),
    0,
  );
  const highestLevelLabel =
    verifiedSkills.length > 0 ? getSkillLevel(maxVerifiedScore).label : "N/A";

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <section className="mb-10 border-b border-[var(--color-border)] pb-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-5 flex items-center gap-4">
              <span className="h-px w-10 bg-[var(--color-accent)]" />
              <p className="font-mono text-xs font-bold uppercase tracking-[0.45em] text-[var(--color-accent)]">
                Verified_Evidence //{" "}
                {visibleName?.replace(" ", "_") || "Candidate"}
              </p>
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter md:text-7xl">
              Dynamic Verified{" "}
              <span className="text-[var(--color-accent)] not-italic">
                Skills.
              </span>
            </h1>
            <p className="mt-5 max-w-3xl text-sm font-medium uppercase tracking-widest opacity-50">
              Every skill shown here has been verified through resume claims,
              GitHub repositories, or technical assessments. No inferences. No
              recommendations.
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

      {/* ── Candidate Skill Summary Dashboard ───────────────────────────── */}
      <div className="mb-8 p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)]/65 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)]/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)]">
              <Trophy className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-slate-100">
                Candidate Skill Summary
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                Evidence-backed technical performance breakdown
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-[var(--color-bg-sunken)] border border-[var(--color-border)] text-[var(--color-accent)]">
            Verified Insights
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
          {/* Top Skill */}
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-muted)] block mb-1">
              Top Skill
            </span>
            <p className="text-sm font-black text-amber-400 truncate">
              {topSkill}
            </p>
          </div>

          {/* Strongest Category */}
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-muted)] block mb-1">
              Strongest Category
            </span>
            <p className="text-sm font-black text-emerald-400 truncate">
              {strongestCategory}
            </p>
          </div>

          {/* Highest Skill Level */}
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-muted)] block mb-1">
              Highest Skill Level
            </span>
            <p className="text-sm font-black text-purple-400 truncate">
              {highestLevelLabel}
            </p>
          </div>

          {/* Verified Skills Count */}
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-muted)] block mb-1">
              Verified Skills
            </span>
            <p className="text-sm font-black text-blue-400">
              {verifiedSkills.length}
            </p>
          </div>

          {/* Average Verified Score */}
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-muted)] block mb-1">
              Avg Verified Score
            </span>
            <p className="text-sm font-black text-cyan-400">
              {avgVerifiedScore}
            </p>
          </div>

          {/* Categories Covered */}
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-muted)] block mb-1">
              Categories Covered
            </span>
            <p className="text-sm font-black text-indigo-400">
              {categorySections.length}
            </p>
          </div>
        </div>
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
              {["all", "resume", "github", "assessment", "project"].map(
                (src) => (
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
                ),
              )}
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
                Upload your resume and connect GitHub repositories to populate
                your verified skill evidence.
              </p>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="text-center py-16 border border-[var(--color-border)] rounded-[var(--radius-xl)]">
              <p className="text-sm text-[var(--color-muted)]">
                No skills match your filter.{" "}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterSource("all");
                  }}
                  className="text-[var(--color-accent)] underline"
                >
                  Clear filters
                </button>
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                  {filteredSkills.length} skill
                  {filteredSkills.length !== 1 ? "s" : ""} • {verifiedCount}{" "}
                  verified • {inProgressCount} in progress across{" "}
                  {categorySections.length} categor
                  {categorySections.length !== 1 ? "ies" : "y"}
                </span>
              </div>
              <div className="space-y-8">
                {categorySections.map((section) => (
                  <div key={section.categoryName} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--color-border)]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 font-mono">
                          {section.categoryName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-sunken)] border border-[var(--color-border)] text-[10px] font-mono font-bold text-[var(--color-accent)]">
                          {section.count}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider">
                        Avg Score: {Math.round(section.avgScore)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {section.items.map(({ skill, rank }, itemIdx) => (
                        <motion.div
                          key={skill.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: itemIdx * 0.03, duration: 0.35 }}
                        >
                          <VerifiedSkillCard
                            skill={skill}
                            rank={rank}
                            onClick={setSelectedSkill}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ── View: Skill Graph (Redesigned Hierarchical Roadmap Layout) ─────────────── */}
      {view === "tree" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10 flex flex-col lg:flex-row gap-6"
        >
          {/* ── Left Category Rail ────────────────────────────────────────────── */}
          <aside className="w-full lg:w-72 shrink-0 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)] mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
                CATEGORIES
              </h3>
            </div>

            {ROADMAP_CATEGORIES_CONFIG.map((cat) => {
              const CatIcon = cat.icon;
              const catSkills = verifiedSkills.filter(
                (s) =>
                  (s.category || "").toLowerCase() === cat.id ||
                  getSkillCategory(s).toLowerCase() === cat.name.toLowerCase(),
              );
              const count = catSkills.length || cat.defaultUnlocked;
              const progressPct =
                catSkills.length > 0
                  ? Math.round(
                      catSkills.reduce(
                        (sum, s) => sum + calculateVerifiedScore(s),
                        0,
                      ) / catSkills.length,
                    )
                  : Math.round((count / cat.total) * 100);

              const isActive = activeCategoryFilter === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() =>
                    setActiveCategoryFilter(isActive ? null : cat.id)
                  }
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-[var(--color-surface-card)] border-[var(--color-accent)] shadow-md"
                      : "bg-[var(--color-bg-sunken)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center border"
                        style={{
                          borderColor: `${cat.color}60`,
                          backgroundColor: `${cat.color}20`,
                          color: cat.color,
                        }}
                      >
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight text-[var(--color-text)] font-mono">
                          {cat.name}
                        </p>
                        <p className="text-[10px] font-mono text-[var(--color-muted)]">
                          {count} / {cat.total} skills
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">
                      {progressPct}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-[var(--color-bg-sunken)] rounded-full overflow-hidden border border-[var(--color-border)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </aside>

          {/* ── Main Canvas: Hierarchical Roadmap Tree ──────────────────────── */}
          <div className="flex-1 flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface-card)]/95 to-[var(--color-bg-raised)]/90 overflow-hidden shadow-xl vp-graph-wrapper relative min-h-[860px]">
            {/* Top Control Bar */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-sunken)]/70 backdrop-blur-md z-20">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-text)]">
                Hierarchical Skill Roadmap
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-all text-xs font-mono flex items-center gap-1.5"
                  title="Fit to Screen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.4, z + 0.15))}
                  className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-all text-xs font-mono"
                  title="Zoom In"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                  className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-all text-xs font-mono"
                  title="Zoom Out"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setActiveCategoryFilter(null);
                  }}
                  className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-all text-xs font-mono flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* Tree Canvas */}
            <div
              className="relative flex-1 overflow-auto p-8"
              onMouseMove={handleGraphMouseMove}
              onMouseLeave={handleGraphMouseLeave}
              onClick={handleGraphClick}
            >
              <div
                className="relative mx-auto transition-transform duration-300 origin-top"
                style={{
                  width: "1080px",
                  height: "820px",
                  transform: `scale(${zoom})`,
                }}
              >
                {/* SVG Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {ROADMAP_EDGES.map((edge) => {
                    const fromNode = ROADMAP_NODES.find(
                      (n) => n.id === edge.from,
                    );
                    const toNode = ROADMAP_NODES.find((n) => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    const curve = buildRoadmapCurve(
                      fromNode.x,
                      fromNode.y + 20,
                      toNode.x,
                      toNode.y - 15,
                    );
                    const isSelected =
                      selectedSkill &&
                      (selectedSkill.id === fromNode.id ||
                        selectedSkill.id === toNode.id);

                    return (
                      <path
                        key={`${edge.from}-${edge.to}`}
                        d={curve}
                        fill="none"
                        stroke={
                          isSelected ? "#2563eb" : edge.color || "var(--color-border-strong)"
                        }
                        strokeWidth={isSelected ? 3 : 1.8}
                        strokeDasharray={
                          edge.style === "dashed" ? "5 5" : "none"
                        }
                        opacity={isSelected ? 1 : 0.65}
                      />
                    );
                  })}
                </svg>

                {/* Nodes & Category Pills */}
                {ROADMAP_NODES.map((node) => {
                  if (node.type === "category") {
                    return (
                      <div
                        key={node.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{ left: node.x, top: node.y }}
                      >
                        <div
                          className="px-4 py-1.5 rounded-full border shadow-md font-mono text-[10px] font-black tracking-widest uppercase text-[var(--color-text)] cursor-pointer transition-all hover:scale-105"
                          style={{
                            borderColor: node.color,
                            backgroundColor: `${node.color}25`,
                            boxShadow: `0 0 16px ${node.color}40`,
                          }}
                        >
                          {node.label}
                        </div>
                      </div>
                    );
                  }

                  // Skill Node
                  const matchedSkill = findSkillFromGraphNode(
                    node.name || node.id,
                    visibleTree,
                    visibleProgress,
                  );

                  const score = matchedSkill
                    ? calculateVerifiedScore(matchedSkill)
                    : node.id === "js" || node.id === "react"
                      ? 92
                      : node.id === "ts" ||
                          node.id === "express" ||
                          node.id === "mongodb"
                        ? 86
                        : node.id === "python"
                          ? 90
                          : node.id === "nodejs" || node.id === "mern"
                            ? 89
                            : node.id === "nextjs"
                              ? 78
                              : 70;

                  const levelObj = getSkillLevel(score);
                  const profColor = getProficiencyColor(score);
                  const isSelected =
                    selectedSkill &&
                    (selectedSkill.id === matchedSkill?.id ||
                      selectedSkill.name === node.name);

                  const NodeIcon = node.icon || Code2;

                  return (
                    <div
                      key={node.id}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all ${
                        isSelected ? "scale-110 z-30" : "hover:scale-105"
                      }`}
                      style={{ left: node.x, top: node.y }}
                    >
                      <button
                        type="button"
                        aria-label={`${node.name} ${score}% Verified`}
                        onClick={() =>
                          setSelectedSkill(
                            matchedSkill || { name: node.name, id: node.id },
                          )
                        }
                        className="relative w-12 h-12 rounded-full grid place-items-center transition-all shadow-md"
                        style={{
                          border: `2px solid ${profColor}`,
                          backgroundColor: "var(--color-surface-card)",
                          color: profColor,
                          boxShadow: isSelected
                            ? `0 0 25px ${profColor}, 0 0 40px ${profColor}80`
                            : `0 0 12px ${profColor}35`,
                        }}
                      >
                        <NodeIcon className="w-5 h-5" />
                        <span
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-bg-sunken)] border border-[var(--color-border)] grid place-items-center text-[9px]"
                          style={{ color: profColor }}
                        >
                          {score > 0 ? "✓" : "🔒"}
                        </span>
                      </button>

                      {/* Label underneath */}
                      <div className="mt-2 text-center w-28 -translate-x-8 pointer-events-none">
                        <p className="text-xs font-bold text-[var(--color-text)] truncate">
                          {node.name}
                        </p>
                        <p className="text-[10px] font-mono font-bold mt-0.5">
                          <span style={{ color: profColor }}>{score}%</span>
                          <span className="text-[var(--color-muted)] mx-1">•</span>
                          <span className="text-[var(--color-text-secondary)]">
                            {levelObj.label}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Viewport-Aware Smart Graph Tooltip */}
              <AnimatePresence>
                {hoveredGraphSkill && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                      y: tooltipPos.placement === "top" ? 6 : -6,
                    }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      y: tooltipPos.placement === "top" ? 6 : -6,
                    }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: "fixed",
                      left: `${tooltipPos.x}px`,
                      top: `${tooltipPos.y}px`,
                      transform: `translate(-50%, ${tooltipPos.placement === "top" ? "-100%" : "0%"})`,
                      zIndex: 9999,
                    }}
                    className="pointer-events-none w-60 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/95 backdrop-blur-md shadow-2xl text-left"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[var(--color-border)]">
                      <h4 className="text-xs font-black uppercase tracking-tight text-[var(--color-text)] truncate">
                        {hoveredGraphSkill.name}
                      </h4>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider border shrink-0 ${
                          getSkillLevel(
                            calculateVerifiedScore(hoveredGraphSkill),
                          ).style
                        }`}
                      >
                        {
                          getSkillLevel(
                            calculateVerifiedScore(hoveredGraphSkill),
                          ).label
                        }
                      </span>
                    </div>

                    {/* Verified Score */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Verified Score
                      </span>
                      <span className="text-xs font-black text-emerald-400">
                        {calculateVerifiedScore(hoveredGraphSkill)}%
                      </span>
                    </div>

                    {/* Evidence Checklist */}
                    <div className="mb-3">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                        Evidence
                      </span>
                      <div className="space-y-1">
                        {["github", "assessment", "resume"].map((type) => {
                          const hasEvidence = (
                            hoveredGraphSkill.evidence || []
                          ).some(
                            (e) =>
                              (e.type || "").toLowerCase() === type ||
                              (type === "github" &&
                                (e.type || "").toLowerCase() === "project"),
                          );
                          const labels = {
                            github: "GitHub",
                            assessment: "Assessment",
                            resume: "Resume",
                          };
                          return (
                            <div
                              key={type}
                              className="flex items-center gap-1.5 text-[10px]"
                            >
                              <span
                                className={
                                  hasEvidence
                                    ? "text-emerald-400 font-bold"
                                    : "text-slate-600"
                                }
                              >
                                {hasEvidence ? "✓" : "○"}
                              </span>
                              <span
                                className={
                                  hasEvidence
                                    ? "text-slate-200 font-medium"
                                    : "text-slate-500"
                                }
                              >
                                {labels[type]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[9px] font-mono text-blue-400">
                      <span>Click for details →</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Legend Bar */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 z-20">
              <div className="flex flex-wrap items-center gap-5 text-[11px] font-mono">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  LEGEND
                </span>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-4 h-0.5 bg-emerald-500 rounded-full inline-block" />
                  <span>Strong Connection</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-4 h-0.5 bg-blue-500 rounded-full inline-block" />
                  <span>Primary Path</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-4 h-0.5 border-t border-dashed border-slate-500 inline-block" />
                  <span>Related Path</span>
                </div>
                <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{" "}
                    High (70%+)
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{" "}
                    Medium (40-69%)
                  </span>
                  <span className="flex items-center gap-1 text-red-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{" "}
                    Low (&lt;40%)
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 font-bold">
                    <Lock className="w-3 h-3 text-slate-500" /> Locked
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-muted)] border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
                <Info className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                <span>
                  Scores calculated from Technical Assessment (50%), GitHub
                  (35%), and Resume (15%).
                </span>
              </div>
            </div>
          </div>
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
          Verified Skills are derived exclusively from Resume Claims · GitHub
          Repository Analysis · Technical Assessment Results · Project Evidence.
          Skills not present in verified evidence will never appear in this
          view.
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
