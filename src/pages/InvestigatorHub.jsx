import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { motion } from "framer-motion";
import { Search, Users, ShieldCheck, Activity, ExternalLink, CheckCircle, ArrowRight, Trophy, Briefcase, FileText } from "lucide-react";
import api from "../utils/api";
import ProjectCard3D from "../components/ProjectCard3D";
import SaveProjectButton from "../components/SaveProjectButton";

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [savingProjectId, setSavingProjectId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, savedRes, applicantsRes, jobsRes] = await Promise.all([
          api.get("/api/projects", { params: { sort: "verified", limit: 24 } }),
          api.get("/api/users/profile/saved-projects"),
          api.get("/api/verify/applicants"),
          api.get("/api/verify/my-jobs"),
        ]);

        setProjects(projectsRes.data.projects || []);
        setSavedProjects(savedRes.data || []);
        setApplicants(applicantsRes.data || []);
        setJobs(jobsRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const toggleSavedProject = async (projectId) => {
    try {
      setSavingProjectId(projectId);
      const { data } = await api.put(`/api/users/profile/saved-projects/${projectId}`);
      setSavedProjects((current) =>
        data.saved
          ? [...current, projects.find((project) => project._id === projectId)].filter(Boolean)
          : current.filter((project) => project._id !== projectId),
      );
    } catch {
      alert("Failed to update shortlist");
    } finally {
      setSavingProjectId("");
    }
  };

  const topApplicants = [...applicants]
    .sort((a, b) => (b.alignmentScore || 0) - (a.alignmentScore || 0))
    .slice(0, 5);

  const completedApplicantsCount = applicants.filter((a) => a.status === "Completed").length;

  return (
    <PageTransition>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-12 relative space-y-16">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-accent)] opacity-[0.02] blur-[150px] -z-10 pointer-events-none" />

        {/* ── Header ── */}
        <div className="md:flex md:items-end md:justify-between pb-8 border-b border-[var(--color-border)]">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-8 h-[1px] bg-[var(--color-accent)]" />
              <p className="text-sm font-mono tracking-[0.4em] uppercase text-[var(--color-accent)] font-bold">
                Recruiter Hub // {user.name?.toUpperCase()}
              </p>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">
              Over<span className="text-[var(--color-accent)] not-italic">view.</span>
            </h2>
            <p className="text-xs font-mono opacity-50 uppercase tracking-widest flex items-center gap-3">
              <Activity className="w-4 h-4 text-[var(--color-accent)] animate-pulse" /> Live Verification Pipeline
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="mt-8 md:mt-0 flex gap-4">
            <Link
              to="/verdicts"
              className="px-8 py-4 bg-[var(--color-accent)] text-white font-bold tracking-[0.2em] uppercase text-xs flex items-center gap-3 hover:opacity-90 transition-all"
            >
              <Trophy className="w-4 h-4" /> View Rankings
            </Link>
            <Link
              to="/discover"
              className="px-8 py-4 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.2em] uppercase text-xs flex items-center gap-3 hover:bg-[var(--color-accent)] hover:text-white transition-all group"
            >
              <Search className="w-4 h-4 group-hover:scale-110 transition-transform" /> Candidate Search
            </Link>
          </motion.div>
        </div>

        {/* ── Dynamic Stats Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-[var(--color-border)] bg-[var(--color-bg)]/40 backdrop-blur-md">
          {[
            { label: "Total Applicants", val: applicants.length, id: "01", icon: Users },
            { label: "AI Verified", val: completedApplicantsCount, id: "02", icon: ShieldCheck },
            { label: "Job Blueprints", val: jobs.length, id: "03", icon: Briefcase },
            { label: "Saved Projects", val: savedProjects.length, id: "04", icon: FileText }
          ].map((stat, i) => (
            <div key={i} className="p-8 border-r border-b md:border-b-0 last:border-r-0 border-[var(--color-border)] group hover:bg-[var(--color-text)]/[0.02] transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 font-mono text-[10px] opacity-20 group-hover:text-[var(--color-accent)] group-hover:opacity-100 transition-all">
                METRIC_{stat.id}
              </div>
              <div className="flex items-center gap-2 mb-2 text-[var(--color-muted)]">
                <stat.icon className="w-4 h-4 text-[var(--color-accent)]" />
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase">{stat.label}</p>
              </div>
              <p className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* ── Top Ranked Candidates Live Feed ── */}
        {topApplicants.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Top Ranked Candidates</h3>
              </div>
              <Link to="/verdicts" className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] hover:underline flex items-center gap-2">
                All Verdicts <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {topApplicants.map((app, idx) => (
                <motion.div variants={itemVariants} key={app._id} className="bg-white/5 dark:bg-black/20 backdrop-blur-md border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 group hover:border-[var(--color-accent)] transition-all">
                  <div className="flex items-center space-x-5">
                    <div className="h-12 w-12 bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center font-black italic uppercase text-xl text-[var(--color-text)] opacity-70 group-hover:text-[var(--color-accent)] transition-all">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-1">
                        {app.extractedName || app.originalFileName}
                      </h4>
                      <p className="text-[10px] tracking-[0.2em] uppercase opacity-50 font-mono flex items-center gap-2">
                        Target Role: <span className="text-[var(--color-accent)]">{app.jobId?.title || "General Intake"}</span>
                        {app.extractedEmail && ` · ${app.extractedEmail}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--color-border)]">
                    <div className="text-right">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-muted)]">Alignment Score</p>
                      <p className="text-xl font-black italic text-emerald-400">{app.alignmentScore || 0}%</p>
                    </div>
                    <Link
                      to="/verdicts"
                      className="px-5 py-2.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 text-xs tracking-[0.2em] uppercase font-bold hover:bg-[var(--color-accent)] hover:text-white transition-all flex items-center gap-2"
                    >
                      Examine <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Shortlisted Projects Library ── */}
        {savedProjects.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[var(--color-accent)]" />
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Shortlisted Candidate Projects</h3>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {savedProjects.slice(0, 3).map((project) => (
                <ProjectCard3D
                  key={`saved-${project._id}`}
                  project={project}
                  isSaved
                  onToggleSaved={() => toggleSavedProject(project._id)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* ── Verified Candidate Projects Library ── */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-[var(--color-accent)]" />
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Candidate Evidence Library</h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[var(--color-border)] bg-black/5 dark:bg-white/5">
               <div className="w-12 h-[1px] bg-[var(--color-accent)] animate-pulse mb-6" />
               <p className="text-xs font-mono tracking-[0.4em] uppercase opacity-30 animate-pulse">Loading Candidate Library…</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center bg-white/5 dark:bg-black/20 backdrop-blur-md py-24 border border-[var(--color-border)] opacity-60">
              <h3 className="text-sm font-mono uppercase tracking-[0.4em]">
                No Candidate Projects Found
              </h3>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {projects.map((project) => (
                <motion.div
                  variants={itemVariants}
                  key={project._id}
                  className="bg-white/5 dark:bg-[var(--color-bg)]/80 backdrop-blur-xl border border-[var(--color-border)] group flex flex-col transition-all duration-500 hover:shadow-[0_0_40px_var(--color-accent)]/10 hover:border-[var(--color-accent)]"
                >
                  <div className="p-8 pb-8 flex-grow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700 pointer-events-none">
                       <Activity className="w-24 h-24" />
                    </div>

                    <div className="flex items-center space-x-4 mb-6">
                      <div className="h-10 w-10 border border-[var(--color-border)] flex items-center justify-center font-black italic uppercase text-lg bg-[var(--color-text)] text-[var(--color-bg)] shadow-inner">
                        {project.user?.name?.charAt(0) || "C"}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold tracking-widest uppercase opacity-60">
                          {project.user?.name || "Candidate"}
                        </h3>
                        <p className="text-xs font-mono uppercase tracking-[0.2em] mt-1 text-[var(--color-accent)]">
                          @{project.user?.githubUsername || "unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6 grid grid-cols-3 gap-2">
                      {[
                        { label: "Trust", value: `${project.user?.skillProgress?.trustScore || 85}%` },
                        { label: "Verified", value: project.user?.skillProgress?.verifiedCount || 1 },
                        { label: "Level", value: project.user?.skillProgress?.level || 1 },
                      ].map((metric) => (
                        <div key={metric.label} className="border border-[var(--color-border)] bg-[var(--color-text)]/[0.02] p-3">
                          <p className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-35">{metric.label}</p>
                          <p className="mt-1 text-base font-black tracking-tighter">{metric.value}</p>
                        </div>
                      ))}
                    </div>
                    
                    <Link to={`/project/${project._id}`} className="block hover:opacity-70 transition-opacity">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter leading-tight mb-3 line-clamp-2">
                        {project.title}
                      </h3>
                    </Link>

                    <div className="text-xs opacity-50 font-medium leading-relaxed line-clamp-3 mb-6">
                      {project.description}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.technologies?.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-1 text-[9px] tracking-[0.2em] font-bold uppercase bg-[var(--color-text)]/[0.03] border border-[var(--color-border)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Footer Bar */}
                  <div className="px-8 py-4 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-text)]/[0.02]">
                    <div className="flex items-center gap-3">
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono tracking-[0.2em] font-bold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
                      >
                        REPO
                      </a>
                      <span className={`inline-flex items-center px-2 py-0.5 text-[9px] tracking-[0.2em] uppercase font-bold border ${project.isVerified ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-[var(--color-border)] opacity-40"}`}>
                        {project.isVerified ? "AUTHENTICATED" : "REVIEW"}
                      </span>
                    </div>
                    <SaveProjectButton
                      isSaved={savedProjects.some((savedProject) => savedProject._id === project._id)}
                      onToggle={() => toggleSavedProject(project._id)}
                      busy={savingProjectId === project._id}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default RecruiterDashboard;
