import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldCheck, SlidersHorizontal, Sparkles, Orbit, ScanSearch } from "lucide-react";
import PageTransition from "../components/PageTransition";
import ProjectCard3D from "../components/ProjectCard3D";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

/* ─── Skeleton ─── */
const SkeletonCard = () => (
  <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-7 space-y-4 animate-pulse">
    <div className="h-3 w-24 rounded bg-[var(--color-border)]" />
    <div className="h-6 w-3/4 rounded bg-[var(--color-border)]" />
    <div className="h-4 w-full rounded bg-[var(--color-border)]" />
    <div className="h-4 w-2/3 rounded bg-[var(--color-border)]" />
    <div className="flex gap-2 mt-4">
      <div className="h-6 w-14 rounded bg-[var(--color-border)]" />
      <div className="h-6 w-14 rounded bg-[var(--color-border)]" />
    </div>
  </div>
);

const Discover = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [availableTechnologies, setAvailableTechnologies] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [savingProjectId, setSavingProjectId] = useState("");

  useEffect(() => {
    if (user?.role !== "recruiter") return;
    const fetchSavedProjects = async () => {
      try {
        const { data } = await api.get("/api/users/profile/saved-projects");
        setSavedProjects(data.map((p) => p._id));
      } catch (error) {
        console.error("Failed to fetch saved projects", error);
      }
    };
    fetchSavedProjects();
  }, [user?.role]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/projects", {
          params: { search: search || undefined, tech: selectedTech || undefined, verified: verifiedOnly || undefined, sort, limit: 30 },
          signal: controller.signal,
        });
        setProjects(data.projects || []);
        setAvailableTechnologies(data.filters?.technologies || []);
      } catch (error) {
        if (error.name !== "CanceledError") { console.error("Failed to fetch", error); setProjects([]); }
      } finally { setLoading(false); }
    };
    const tid = setTimeout(fetchProjects, 220);
    return () => { clearTimeout(tid); controller.abort(); };
  }, [search, selectedTech, verifiedOnly, sort]);

  const verifiedCount = useMemo(() => projects.filter((p) => p.isVerified).length, [projects]);
  const trendingTechnologies = useMemo(() => availableTechnologies.slice(0, 8), [availableTechnologies]);

  const toggleSavedProject = async (projectId) => {
    try {
      setSavingProjectId(projectId);
      const { data } = await api.put(`/api/users/profile/saved-projects/${projectId}`);
      setSavedProjects((c) => data.saved ? [...c, projectId] : c.filter((e) => e !== projectId));
    } catch (error) { console.error("Failed to toggle saved project", error);
    } finally { setSavingProjectId(""); }
  };

  return (
    <PageTransition>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8 pb-28 lg:pb-12">

        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden vp-surface-3 px-6 py-10 md:px-10 md:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-accent),transparent_45%)] opacity-[0.08]" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.35fr_0.95fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/60"
              >
                <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                <span className="vp-label-accent">Curated_Discovery_System</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="max-w-4xl font-black uppercase tracking-tighter leading-[0.85]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)" }}
              >
                Talent signals,<br />
                <span className="text-[var(--color-accent)] not-italic">not noisy portfolios.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.16 }}
                className="mt-6 max-w-xl text-sm text-[var(--color-muted)] leading-relaxed"
              >
                The recruiter-facing archive layer: verified builds, searchable stacks, shortlist-ready cards, and high-confidence candidates.
              </motion.p>

              {/* Tech filter pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.24 }}
                className="mt-8 flex flex-wrap gap-2"
              >
                {trendingTechnologies.length > 0 ? trendingTechnologies.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => setSelectedTech((c) => c === tech ? "" : tech)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border transition-all ${
                      selectedTech === tech
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                        : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    }`}
                  >
                    {tech}
                  </button>
                )) : (
                  <span className="vp-tag opacity-40">Indexing_Technologies...</span>
                )}
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.12 }}
              className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
            >
              {[
                { label: "Live_Archive", val: projects.length, accent: "Networked" },
                { label: "Verified_Signal", val: verifiedCount, accent: "Trust-first" },
                { label: "Stack_Coverage", val: availableTechnologies.length, accent: "Cross-indexed" },
              ].map((stat) => (
                <div key={stat.label} className="vp-surface-1 p-5">
                  <p className="vp-label">{stat.label}</p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <p className="text-3xl font-black tracking-tight">{stat.val}</p>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">{stat.accent}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══ FILTER + RESULTS ═══ */}
        <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* Filter Sidebar */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-fit vp-glass p-6 xl:sticky xl:top-28 space-y-5"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="vp-label-accent">Filter_Matrix</p>
                <h2 className="mt-1 text-lg font-black uppercase tracking-tight">Refine</h2>
              </div>
              <ScanSearch className="h-5 w-5 text-[var(--color-accent)]" />
            </div>

            <label className="block">
              <span className="vp-label mb-2 flex items-center gap-2">
                <Search className="h-3 w-3" /> Search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="React, AI engine, resume..."
                className="vp-input"
              />
            </label>

            <label className="block">
              <span className="vp-label mb-2 flex items-center gap-2">
                <SlidersHorizontal className="h-3 w-3" /> Stack
              </span>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="vp-input"
              >
                <option value="">All technologies</option>
                {availableTechnologies.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="vp-label mb-2 flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" /> Sort
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="vp-input"
              >
                <option value="latest">Latest first</option>
                <option value="verified">Verified first</option>
                <option value="title">Title A-Z</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>

            <label className="flex items-center gap-3 vp-surface-1 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] cursor-pointer">
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent)]" />
              Verified_Only
            </label>

            <button
              type="button"
              onClick={() => { setSearch(""); setSelectedTech(""); setVerifiedOnly(false); setSort("latest"); }}
              className="vp-btn vp-btn-secondary w-full text-[10px] py-2.5"
            >
              Reset_Filters
            </button>
          </motion.aside>

          {/* Results */}
          <div className="space-y-6">
            {/* Results header */}
            <div className="vp-surface-1 p-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="vp-label-accent">Discovery_Pulse</p>
                <h2 className="mt-1 text-2xl font-black uppercase tracking-tight">
                  {loading ? "Scanning_Archive..." : `${projects.length} Projects_Ready`}
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: "Verified", v: verifiedCount },
                  { l: "Saved", v: savedProjects.length },
                  { l: "Mode", v: verifiedOnly ? "Trust" : "Wide" },
                ].map((s) => (
                  <div key={s.l} className="vp-surface-1 px-4 py-3 text-center">
                    <p className="vp-label">{s.l}</p>
                    <p className="mt-1 text-lg font-black">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Project grid */}
            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="vp-surface-1 p-16 text-center">
                <Orbit className="mx-auto h-10 w-10 text-[var(--color-accent)] opacity-50 mb-5" />
                <h3 className="text-2xl font-black uppercase tracking-tight opacity-50 mb-3">No_Matching_Records</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  Try a broader search, a different stack, or switch off verified-only mode.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {projects.map((project, i) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.2), ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProjectCard3D
                      project={project}
                      isSaved={savedProjects.includes(project._id)}
                      saveBusy={savingProjectId === project._id}
                      onToggleSaved={user?.role === "recruiter" ? () => toggleSavedProject(project._id) : undefined}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Discover;
