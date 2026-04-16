import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import PageTransition from "../components/PageTransition";
import ProjectCard3D from "../components/ProjectCard3D";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

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
          setProjects([]);
        }
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = window.setTimeout(fetchProjects, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search, selectedTech, verifiedOnly, sort]);

  const verifiedCount = useMemo(
    () => projects.filter((project) => project.isVerified).length,
    [projects],
  );

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
      <div className="space-y-12">
        <section className="border border-[var(--color-border)] bg-[var(--color-bg)]/70 p-8 md:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3 text-[var(--color-accent)]">
                <Search className="h-4 w-4" />
                <span className="text-xs font-mono uppercase tracking-[0.35em]">Discover Network</span>
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">
                Browse Verified <span className="text-[var(--color-accent)]">Project Evidence</span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm uppercase tracking-[0.18em] opacity-50">
                Search live portfolio records, inspect stacks, and filter toward recruiter-ready work instead of scrolling a placeholder shell.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="border border-[var(--color-border)] p-4">
                <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Visible</p>
                <p className="mt-2 text-3xl font-black">{projects.length}</p>
              </div>
              <div className="border border-[var(--color-border)] p-4">
                <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Verified</p>
                <p className="mt-2 text-3xl font-black text-[var(--color-accent)]">{verifiedCount}</p>
              </div>
              <div className="border border-[var(--color-border)] p-4">
                <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Stacks</p>
                <p className="mt-2 text-3xl font-black">{availableTechnologies.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 border border-[var(--color-border)] bg-[var(--color-bg)]/40 p-6 md:grid-cols-4">
          <label className="md:col-span-2">
            <span className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] opacity-50">
              <Search className="h-3.5 w-3.5" />
              Search
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="React dashboards, plagiarism engine, VTU tools..."
              className="w-full border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
            />
          </label>

          <label>
            <span className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] opacity-50">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Stack
            </span>
            <select
              value={selectedTech}
              onChange={(event) => setSelectedTech(event.target.value)}
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
            >
              <option value="">All technologies</option>
              {availableTechnologies.map((technology) => (
                <option key={technology} value={technology}>
                  {technology}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] opacity-50">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sort
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
            >
              <option value="latest">Latest</option>
              <option value="verified">Verified first</option>
              <option value="title">Title A-Z</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>

          <label className="md:col-span-4 flex items-center gap-3 border border-[var(--color-border)] px-4 py-3 text-sm uppercase tracking-[0.2em]">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(event) => setVerifiedOnly(event.target.checked)}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            Show verified projects only
          </label>
        </section>

        <section>
          {loading ? (
            <div className="border border-dashed border-[var(--color-border)] p-16 text-center text-sm uppercase tracking-[0.25em] opacity-40">
              Synchronizing project archive...
            </div>
          ) : projects.length === 0 ? (
            <div className="border border-[var(--color-border)] p-16 text-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter opacity-60">No matching records</h3>
              <p className="mt-3 text-sm uppercase tracking-[0.2em] opacity-40">
                Try a broader search or clear the active filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard3D
                  key={project._id}
                  project={project}
                  isSaved={savedProjects.includes(project._id)}
                  saveBusy={savingProjectId === project._id}
                  onToggleSaved={user?.role === "recruiter" ? () => toggleSavedProject(project._id) : undefined}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
};
export default Discover;
