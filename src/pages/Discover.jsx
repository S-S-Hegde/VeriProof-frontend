import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldCheck, SlidersHorizontal, Sparkles, Orbit, ScanSearch } from "lucide-react";
import PageTransition from "../components/PageTransition";
import ProjectCard3D from "../components/ProjectCard3D";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const statCards = [
  { label: "Live archive", accent: "Networked" },
  { label: "Verified signal", accent: "Trust-first" },
  { label: "Stack coverage", accent: "Cross-indexed" },
];

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
        setSavedProjects(data.map((project) => project._id));
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
          params: {
            search: search || undefined,
            tech: selectedTech || undefined,
            verified: verifiedOnly || undefined,
            sort,
            limit: 30,
          },
          signal: controller.signal,
        });

        setProjects(data.projects || []);
        setAvailableTechnologies(data.filters?.technologies || []);
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Failed to fetch discover projects", error);
          setProjects([]);
        }
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = window.setTimeout(fetchProjects, 220);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search, selectedTech, verifiedOnly, sort]);

  const verifiedCount = useMemo(
    () => projects.filter((project) => project.isVerified).length,
    [projects],
  );

  const trendingTechnologies = useMemo(
    () => availableTechnologies.slice(0, 8),
    [availableTechnologies],
  );

  const heroStats = [
    { ...statCards[0], value: projects.length },
    { ...statCards[1], value: verifiedCount },
    { ...statCards[2], value: availableTechnologies.length },
  ];

  const toggleSavedProject = async (projectId) => {
    try {
      setSavingProjectId(projectId);
      const { data } = await api.put(`/api/users/profile/saved-projects/${projectId}`);
      setSavedProjects((current) =>
        data.saved
          ? [...current, projectId]
          : current.filter((entry) => entry !== projectId),
      );
    } catch (error) {
      console.error("Failed to toggle saved project", error);
    } finally {
      setSavingProjectId("");
    }
  };

  return (
    <PageTransition>
      <div className="space-y-10 pb-12">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.74),rgba(255,255,255,0.18))] px-6 py-10 md:px-10 md:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-accent),transparent_45%)] opacity-[0.12]" />
          <div className="absolute -left-24 top-20 h-56 w-56 rounded-full border border-[var(--color-border)] opacity-30" />
          <div className="absolute right-10 top-10 h-32 w-32 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.35fr_0.95fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/70 px-4 py-2"
              >
                <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-[var(--color-accent)]">
                  Curated discovery system
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.08 }}
                className="max-w-4xl text-5xl font-black uppercase tracking-[-0.08em] md:text-7xl"
              >
                Talent signals,
                <span className="block text-[var(--color-accent)]">not noisy portfolios.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.16 }}
                className="mt-6 max-w-2xl text-sm uppercase tracking-[0.18em] opacity-60 md:text-base"
              >
                This is the recruiter-facing archive layer: verified builds, searchable stacks, shortlist-ready cards, and faster scanning for high-confidence candidates.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.24 }}
                className="mt-10 flex flex-wrap gap-3"
              >
                {trendingTechnologies.length > 0 ? trendingTechnologies.map((technology) => (
                  <button
                    key={technology}
                    type="button"
                    onClick={() => setSelectedTech((current) => current === technology ? "" : technology)}
                    className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.26em] transition-all ${
                      selectedTech === technology
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-bg)]/70 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    }`}
                  >
                    {technology}
                  </button>
                )) : (
                  <span className="rounded-full border border-[var(--color-border)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.26em] opacity-40">
                    Indexing technologies...
                  </span>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.12 }}
              className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
            >
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-bg)]/78 p-5 backdrop-blur-xl"
                >
                  <p className="text-[10px] font-mono uppercase tracking-[0.34em] opacity-40">
                    {stat.label}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <p className="text-4xl font-black tracking-tighter md:text-5xl">{stat.value}</p>
                    <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                      {stat.accent}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="h-fit rounded-[1.8rem] border border-[var(--color-border)] bg-[var(--color-bg)]/65 p-6 backdrop-blur-xl xl:sticky xl:top-28"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.32em] opacity-40">Filter matrix</p>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-tighter">Refine the archive</h2>
              </div>
              <ScanSearch className="h-5 w-5 text-[var(--color-accent)]" />
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] opacity-50">
                  <Search className="h-3.5 w-3.5" />
                  Search
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Fraud engine, React ops, resume AI..."
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] opacity-50">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Stack
                </span>
                <select
                  value={selectedTech}
                  onChange={(event) => setSelectedTech(event.target.value)}
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                >
                  <option value="">All technologies</option>
                  {availableTechnologies.map((technology) => (
                    <option key={technology} value={technology}>
                      {technology}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] opacity-50">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Sort
                </span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                >
                  <option value="latest">Latest first</option>
                  <option value="verified">Verified first</option>
                  <option value="title">Title A-Z</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm uppercase tracking-[0.18em]">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(event) => setVerifiedOnly(event.target.checked)}
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
                Verified projects only
              </label>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedTech("");
                  setVerifiedOnly(false);
                  setSort("latest");
                }}
                className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.3em] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Reset filters
              </button>
            </div>
          </motion.aside>

          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="rounded-[1.8rem] border border-[var(--color-border)] bg-[var(--color-bg)]/65 p-6 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.32em] text-[var(--color-accent)]">
                    Discovery pulse
                  </p>
                  <h2 className="mt-2 text-3xl font-black uppercase tracking-tighter">
                    {loading ? "Scanning indexed projects..." : `${projects.length} projects ready for review`}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--color-border)] px-4 py-3">
                    <p className="text-[10px] font-mono uppercase tracking-[0.28em] opacity-40">Verified</p>
                    <p className="mt-2 text-2xl font-black">{verifiedCount}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)] px-4 py-3">
                    <p className="text-[10px] font-mono uppercase tracking-[0.28em] opacity-40">Saved</p>
                    <p className="mt-2 text-2xl font-black">{savedProjects.length}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)] px-4 py-3 col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-mono uppercase tracking-[0.28em] opacity-40">Mode</p>
                    <p className="mt-2 text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                      {verifiedOnly ? "Trust-first" : "Wide scan"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {loading ? (
              <div className="rounded-[1.8rem] border border-dashed border-[var(--color-border)] p-16 text-center text-sm uppercase tracking-[0.25em] opacity-40">
                Synchronizing project archive...
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-[1.8rem] border border-[var(--color-border)] p-16 text-center">
                <Orbit className="mx-auto h-10 w-10 text-[var(--color-accent)] opacity-70" />
                <h3 className="mt-5 text-3xl font-black uppercase tracking-tighter opacity-70">No matching records</h3>
                <p className="mt-3 text-sm uppercase tracking-[0.18em] opacity-40">
                  Try a broader search, a different stack, or switch off verified-only mode.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 2xl:grid-cols-3">
                {projects.map((project, index) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.24) }}
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
