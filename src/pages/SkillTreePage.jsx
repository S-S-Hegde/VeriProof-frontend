import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import DynamicSkillTree from "../components/DynamicSkillTree";
import api from "../utils/api";
import {
  Shield,
  GitBranch,
  FileText,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle2,
  FlaskConical,
  Lightbulb,
} from "lucide-react";

// ─── Theme tokens ────────────────────────────────────────────────────────────
const THEME = {
  light: {
    cardBg: "rgba(255,255,255,0.7)",
    cardBorder: "#E2E8F0",
    inputBg: "#FFFFFF",
    inputBorder: "#CBD5E1",
    inputText: "#0F172A",
    buttonPrimary: "#2563EB",
    buttonPrimaryHover: "#1D4ED8",
    buttonText: "#FFFFFF",
    accentText: "#2563EB",
    mutedText: "#64748B",
    text: "#0F172A",
    dangerBg: "#FEF2F2",
    dangerBorder: "#FECACA",
    dangerText: "#991B1B",
    statBg: "rgba(37,99,235,0.06)",
    statBorder: "#DBEAFE",
  },
  dark: {
    cardBg: "rgba(15,23,42,0.7)",
    cardBorder: "#1E293B",
    inputBg: "#1E293B",
    inputBorder: "#334155",
    inputText: "#F1F5F9",
    buttonPrimary: "#F59E0B",
    buttonPrimaryHover: "#D97706",
    buttonText: "#0F172A",
    accentText: "#F59E0B",
    mutedText: "#94A3B8",
    text: "#F1F5F9",
    dangerBg: "rgba(127,29,29,0.2)",
    dangerBorder: "#7F1D1D",
    dangerText: "#FCA5A5",
    statBg: "rgba(245,158,11,0.08)",
    statBorder: "#78350F",
  },
};

const SkillTreePage = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const t = isDarkMode ? THEME.dark : THEME.light;

  // ── State ──
  const [skillTree, setSkillTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [githubData, setGithubData] = useState("");
  const [showInputs, setShowInputs] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);

  // ── Fetch existing skill tree on mount ──
  useEffect(() => {
    fetchSkillTree();
  }, []);

  const fetchSkillTree = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/api/skill-tree");
      setSkillTree(data.skillTree);
      setLastGenerated(data.skillTree.generatedAt);
      setShowInputs(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setSkillTree(null);
        setShowInputs(true);
      } else {
        setError(err.response?.data?.message || "Failed to fetch skill tree");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Generate skill tree via LLM ──
  const handleGenerate = async () => {
    if (!resumeText.trim() && !githubData.trim()) {
      setError("Please provide at least your resume text or GitHub repository data.");
      return;
    }

    let parsedGithubData = null;
    if (githubData.trim()) {
      try {
        parsedGithubData = JSON.parse(githubData);
      } catch {
        setError("GitHub data must be valid JSON. Example: { \"repos\": [{ \"name\": \"my-app\", \"languages\": [\"JavaScript\", \"Python\"] }] }");
        return;
      }
    }

    try {
      setGenerating(true);
      setError(null);
      const { data } = await api.post("/api/skill-tree/generate", {
        resumeText: resumeText.trim(),
        githubData: parsedGithubData,
      });

      setSkillTree(data.skillTree);
      setLastGenerated(data.skillTree.generatedAt);
      setShowInputs(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate skill tree. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // ── Stat counts ──
  const stats = skillTree?.nodes
    ? {
        verified: skillTree.nodes.filter((n) => n.category === "verified").length,
        foundational: skillTree.nodes.filter((n) => n.category === "foundational").length,
        recommended: skillTree.nodes.filter((n) => n.category === "recommended").length,
        total: skillTree.nodes.length,
      }
    : null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GitBranch size={28} style={{ color: t.accentText }} strokeWidth={2.5} />
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ color: t.accentText }}
          >
            Skill Topology
          </h1>
        </div>
        <p
          className="font-mono text-xs tracking-[0.15em] uppercase"
          style={{ color: t.mutedText }}
        >
          Evidence-Based Verification Tree &mdash;{" "}
          {user?.name || "Candidate"}
        </p>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div
          className="flex items-start gap-3 rounded-lg p-4 mb-6 border"
          style={{
            background: t.dangerBg,
            borderColor: t.dangerBorder,
          }}
        >
          <AlertTriangle size={18} style={{ color: t.dangerText }} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium" style={{ color: t.dangerText }}>
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="text-xs underline mt-1 opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: t.dangerText }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Stats Bar ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Verified", value: stats.verified, icon: CheckCircle2, color: isDarkMode ? "#F59E0B" : "#2563EB" },
            { label: "Foundational", value: stats.foundational, icon: FlaskConical, color: isDarkMode ? "#EAB308" : "#0EA5E9" },
            { label: "Recommended", value: stats.recommended, icon: Lightbulb, color: isDarkMode ? "#475569" : "#94A3B8" },
            { label: "Total Nodes", value: stats.total, icon: GitBranch, color: t.accentText },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg px-4 py-3 border backdrop-blur-sm"
              style={{ background: t.statBg, borderColor: t.statBorder }}
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon size={14} style={{ color: stat.color }} />
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.15em]"
                  style={{ color: t.mutedText }}
                >
                  {stat.label}
                </span>
              </div>
              <p
                className="text-2xl font-black tabular-nums"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Controls Bar ── */}
      {skillTree && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {lastGenerated && (
              <span
                className="font-mono text-[10px] tracking-wider"
                style={{ color: t.mutedText }}
              >
                Generated: {new Date(lastGenerated).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowInputs((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
            style={{
              borderColor: t.cardBorder,
              color: t.accentText,
              background: t.cardBg,
            }}
          >
            <RefreshCw size={14} />
            Regenerate
            {showInputs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      )}

      {/* ── Input Panel ── */}
      {showInputs && (
        <div
          className="rounded-xl border backdrop-blur-md p-6 mb-8 transition-all duration-300"
          style={{
            background: t.cardBg,
            borderColor: t.cardBorder,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} style={{ color: t.accentText }} />
            <h2
              className="text-lg font-bold tracking-tight"
              style={{ color: t.text }}
            >
              Generate Skill Tree
            </h2>
          </div>
          <p
            className="text-sm mb-6 leading-relaxed"
            style={{ color: t.mutedText }}
          >
            Paste your resume text and/or GitHub repository data below. Our AI
            engine will analyze your evidence and construct a verified skill
            topology.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Text */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <FileText size={14} style={{ color: t.accentText }} />
                <span
                  className="font-mono text-xs uppercase tracking-[0.1em] font-semibold"
                  style={{ color: t.text }}
                >
                  Resume Text
                </span>
              </label>
              <textarea
                id="skill-tree-resume-input"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                placeholder="Paste your full resume text here...&#10;&#10;e.g. 'Software Engineer with 3 years of experience in React, Node.js, and PostgreSQL. Built microservice architectures using Docker and Kubernetes...'"
                className="w-full rounded-lg border px-4 py-3 text-sm font-mono resize-none transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  background: t.inputBg,
                  borderColor: t.inputBorder,
                  color: t.inputText,
                  focusRingColor: t.accentText,
                }}
              />
            </div>

            {/* GitHub Data */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <GitBranch size={14} style={{ color: t.accentText }} />
                <span
                  className="font-mono text-xs uppercase tracking-[0.1em] font-semibold"
                  style={{ color: t.text }}
                >
                  GitHub Data (JSON)
                </span>
              </label>
              <textarea
                id="skill-tree-github-input"
                value={githubData}
                onChange={(e) => setGithubData(e.target.value)}
                rows={10}
                placeholder={`{\n  "repos": [\n    {\n      "name": "my-portfolio",\n      "languages": ["JavaScript", "CSS", "HTML"],\n      "topics": ["react", "tailwindcss"]\n    },\n    {\n      "name": "api-server",\n      "languages": ["TypeScript", "Python"],\n      "topics": ["express", "fastapi", "docker"]\n    }\n  ]\n}`}
                className="w-full rounded-lg border px-4 py-3 text-sm font-mono resize-none transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  background: t.inputBg,
                  borderColor: t.inputBorder,
                  color: t.inputText,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p
              className="text-[11px] font-mono flex items-center gap-1.5"
              style={{ color: t.mutedText }}
            >
              <Lock size={11} />
              Data processed securely via AI — not stored externally
            </p>
            <button
              id="skill-tree-generate-btn"
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide uppercase transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: generating ? t.mutedText : t.buttonPrimary,
                color: t.buttonText,
              }}
            >
              {generating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Generate Topology
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Skill Tree Visualization ── */}
      <div
        className="rounded-xl border backdrop-blur-md overflow-hidden"
        style={{
          background: t.cardBg,
          borderColor: t.cardBorder,
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{ borderColor: t.cardBorder }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: t.accentText }}
            />
            <span
              className="font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: t.mutedText }}
            >
              {skillTree ? "Live Topology Render" : "Awaiting Data Input"}
            </span>
          </div>
          {skillTree && (
            <span
              className="font-mono text-[10px] tabular-nums"
              style={{ color: t.mutedText }}
            >
              {stats?.total} nodes &bull; {skillTree.nodes?.filter((n) => n.parentId !== null).length || 0} edges
            </span>
          )}
        </div>

        <div className="p-4">
          <DynamicSkillTree
            nodes={skillTree?.nodes || []}
            isLoading={loading || generating}
          />
        </div>
      </div>
    </div>
  );
};

export default SkillTreePage;
