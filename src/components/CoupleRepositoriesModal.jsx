import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  X,
  Plus,
  Trash2,
  Github,
  CheckCircle,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  Server,
  Layout,
  Cpu,
  Database,
} from "lucide-react";
import api from "../utils/api";

const SERVICE_ROLES = [
  { id: "Frontend", label: "Frontend UI", icon: Layout, placeholder: "e.g. React / Next.js / Vite" },
  { id: "Backend", label: "Backend API", icon: Server, placeholder: "e.g. Node.js / Express / Spring" },
  { id: "AI Engine", label: "AI / Python Engine", icon: Cpu, placeholder: "e.g. FastAPI / PyTorch / Gemini" },
  { id: "Database", label: "Database / Infra", icon: Database, placeholder: "e.g. MongoDB / PostgreSQL / Docker" },
];

export default function CoupleRepositoriesModal({
  isOpen,
  onClose,
  existingProjects = [],
  onCoupled,
}) {
  const [mode, setMode] = useState("select"); // "select" or "custom"
  const [selectedIds, setSelectedIds] = useState([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [customRepos, setCustomRepos] = useState([
    { name: "Frontend", role: "Frontend", repositoryUrl: "", technologies: "React, JavaScript, TailwindCSS" },
    { name: "Backend", role: "Backend", repositoryUrl: "", technologies: "Node.js, Express, MongoDB" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const toggleSelectProject = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustomRepo = () => {
    setCustomRepos((prev) => [
      ...prev,
      { name: `Microservice ${prev.length + 1}`, role: "AI Engine", repositoryUrl: "", technologies: "" },
    ]);
  };

  const handleRemoveCustomRepo = (index) => {
    setCustomRepos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCustomRepoChange = (index, field, value) => {
    setCustomRepos((prev) =>
      prev.map((repo, i) => (i === index ? { ...repo, [field]: value } : repo))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      let payload = {
        title: projectTitle.trim() || (selectedIds.length > 0 ? "Coupled Multi-Service Project" : "Composite Full-Stack Project"),
        description: projectDescription.trim() || "Integrated multi-repository ecosystem coupling frontend, backend, and AI/engine services.",
        liveUrl: liveUrl.trim(),
      };

      if (mode === "select") {
        if (selectedIds.length < 2) {
          setError("Please select at least 2 repositories from your archive to couple into a single project.");
          setSubmitting(false);
          return;
        }
        payload.selectedProjectIds = selectedIds;
      } else {
        const validCustomRepos = customRepos.filter((r) => r.repositoryUrl.trim());
        if (validCustomRepos.length < 2) {
          setError("Please provide at least 2 valid repository URLs to couple.");
          setSubmitting(false);
          return;
        }
        payload.linkedRepositories = validCustomRepos.map((r) => ({
          name: r.name || "Microservice",
          role: r.role || "Service",
          repositoryUrl: r.repositoryUrl.trim(),
          technologies: r.technologies.split(",").map((t) => t.trim()).filter(Boolean),
          isVerified: true,
        }));
      }

      const res = await api.post("/api/projects/couple", payload);
      if (onCoupled) {
        onCoupled(res.data.project);
      }
      onClose();
    } catch (err) {
      console.error("Coupling failed:", err);
      setError(err.response?.data?.message || "Failed to couple repositories. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!submitting ? onClose : undefined}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-[var(--color-surface-1,#121629)] border border-[var(--color-border,#242b4d)] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 max-h-[90vh] flex flex-col"
      >
        {/* Glow accent header line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent,#6b8aff)] to-transparent opacity-80" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-[var(--color-accent,#6b8aff)]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent,#6b8aff)] font-bold">
                MULTI_REPO_ORCHESTRATOR
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Couple Repositories into <span className="text-[var(--color-accent,#6b8aff)]">One Project</span>
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Bundle frontend, backend, and AI microservices into a unified full-stack verified architecture.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5 mb-6 shrink-0">
          <button
            type="button"
            onClick={() => setMode("select")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
              mode === "select"
                ? "bg-[var(--color-accent,#6b8aff)] text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Bundle Existing Repos ({existingProjects.length})
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
              mode === "custom"
                ? "bg-[var(--color-accent,#6b8aff)] text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Add New Multi-Repo URLs
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Unified Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-1.5 font-bold">
                Composite Project Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VeriProof Full-Stack Ecosystem"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent,#6b8aff)]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-1.5 font-bold">
                Live Unified Demo URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://my-app.vercel.app"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent,#6b8aff)]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-1.5 font-bold">
              Architectural Concept & Overview
            </label>
            <textarea
              rows={2}
              placeholder="Describe how the frontend, backend, and AI engine interact..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent,#6b8aff)] leading-relaxed"
            />
          </div>

          {/* Mode 1: Select Existing Repositories */}
          {mode === "select" && (
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">
                Select Repositories to Couple ({selectedIds.length} Selected)
              </label>
              {existingProjects.length === 0 ? (
                <p className="text-xs text-gray-500 font-mono p-4 border border-white/5 rounded-lg text-center">
                  No repositories found in archive. Switch to "Add New Multi-Repo URLs" above.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                  {existingProjects.map((proj) => {
                    const isSelected = selectedIds.includes(proj._id);
                    return (
                      <div
                        key={proj._id}
                        onClick={() => toggleSelectProject(proj._id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? "bg-[var(--color-accent,#6b8aff)]/15 border-[var(--color-accent,#6b8aff)] text-white shadow-md"
                            : "bg-black/30 border-white/5 text-gray-300 hover:border-white/20"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? "bg-[var(--color-accent,#6b8aff)] border-[var(--color-accent,#6b8aff)] text-white"
                              : "border-gray-500 bg-transparent"
                          }`}
                        >
                          {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-mono truncate">{proj.title}</p>
                          <p className="text-[10px] text-gray-500 font-mono truncate mt-0.5">
                            {proj.repositoryUrl}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {(proj.technologies || []).slice(0, 3).map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-gray-400"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Custom Multi-Repo URLs */}
          {mode === "custom" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  Coupled Microservices / Repositories ({customRepos.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddCustomRepo}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--color-accent,#6b8aff)] hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Repo
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {customRepos.map((repo, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Service Name (e.g. Frontend UI)"
                        value={repo.name}
                        onChange={(e) => handleCustomRepoChange(idx, "name", e.target.value)}
                        className="bg-transparent border-b border-white/10 text-xs font-mono font-bold text-white focus:outline-none focus:border-[var(--color-accent,#6b8aff)] w-1/2 pb-1"
                      />
                      <select
                        value={repo.role}
                        onChange={(e) => handleCustomRepoChange(idx, "role", e.target.value)}
                        className="bg-black border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-gray-300 focus:outline-none"
                      >
                        {SERVICE_ROLES.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      {customRepos.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomRepo(idx)}
                          className="text-gray-500 hover:text-red-400 p-1"
                          title="Remove repository"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="url"
                        required
                        placeholder="https://github.com/user/repository"
                        value={repo.repositoryUrl}
                        onChange={(e) => handleCustomRepoChange(idx, "repositoryUrl", e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent,#6b8aff)]"
                      />
                      <input
                        type="text"
                        placeholder="Technologies (comma separated)"
                        value={repo.technologies}
                        onChange={(e) => handleCustomRepoChange(idx, "technologies", e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent,#6b8aff)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-xs font-mono text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="vp-btn vp-btn-accent text-xs py-2.5 px-5 gap-2 shadow-lg cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Coupling Ecosystem...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Couple & Verify Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}
