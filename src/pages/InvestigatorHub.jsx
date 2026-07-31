import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { motion } from "framer-motion";
import { Search, Users, ShieldCheck, Activity, ExternalLink, CheckCircle } from "lucide-react";
import api from "../utils/api";
import ProjectCard3D from "../components/ProjectCard3D";
import SaveProjectButton from "../components/SaveProjectButton";

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [pendingResumes, setPendingResumes] = useState([]);
  const [savingProjectId, setSavingProjectId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, resumesRes, savedRes] = await Promise.all([
          api.get("/api/projects", { params: { sort: "verified", limit: 24 } }),
          api.get("/api/users/resumes/pending"),
          api.get("/api/users/profile/saved-projects"),
        ]);

        setProjects(projectsRes.data.projects || []);
        setPendingResumes(resumesRes.data);
        setSavedProjects(savedRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleVerifyResume = async (studentId) => {
    try {
      await api.put(`/api/users/${studentId}/verify-resume`, { status: "Verified" });
      setPendingResumes(pendingResumes.filter(r => r._id !== studentId));
    } catch {
      alert("Failed to verify resume");
    }
  };

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

  return (
    <PageTransition>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-12 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-accent)] opacity-[0.02] blur-[150px] -z-10 pointer-events-none" />

        <div className="md:flex md:items-end md:justify-between mb-24 border-b border-[var(--color-border)] pb-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-8 h-[1px] bg-[var(--color-accent)]" />
              <p className="text-sm font-mono tracking-[0.5em] uppercase text-[var(--color-accent)] font-bold">
                Recruiter Dashboard // {user.name?.toUpperCase()}
              </p>
            </div>
            <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-4">
              Over<span className="text-[var(--color-accent)] not-italic">view.</span>
            </h2>
            <p className="text-sm font-medium opacity-40 uppercase tracking-widest flex items-center gap-3">
              <Activity className="w-4 h-4 animate-pulse" /> Live Status: Tracking Candidates
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="mt-12 md:mt-0 flex">
            <Link
              to="/discover"
              className="px-10 py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-sm flex items-center gap-4 hover:bg-[var(--color-accent)] hover:text-white transition-all group"
            >
              <Search className="w-4 h-4 group-hover:scale-110 transition-transform" /> Global Search
            </Link>
          </motion.div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-20 border border-[var(--color-border)] bg-[var(--color-bg)]/40 backdrop-blur-md">
          {[
            { label: "Total Candidates", val: projects.length, id: "01" },
            { label: "Pending Checks", val: pendingResumes.length, id: "02" },
            { label: "Saved Profiles", val: savedProjects.length, id: "03" }
          ].map((stat, i) => (
            <div key={i} className="p-10 border-r border-b md:border-b-0 last:border-r-0 border-[var(--color-border)] group hover:bg-[var(--color-text)]/[0.02] transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 font-mono text-[10px] opacity-20 group-hover:text-[var(--color-accent)] group-hover:opacity-100 transition-all">STAT_{stat.id}</div>
              <p className="text-xs font-mono tracking-[0.2em] uppercase opacity-50 mb-2">{stat.label}</p>
              <p className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* Verification Queue Data Feed */}
        {pendingResumes.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <ShieldCheck className="w-6 h-6 text-[var(--color-accent)] animate-pulse" />
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Verification Queue</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {pendingResumes.map((student) => (
                <motion.div variants={itemVariants} key={student._id} className="bg-white/5 dark:bg-black/20 backdrop-blur-md border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 group hover:border-[var(--color-accent)] transition-all">
                  <div className="flex items-center space-x-6">
                    <div className="h-16 w-16 bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center font-black italic uppercase text-2xl text-[var(--color-text)] opacity-50 group-hover:text-[var(--color-accent)] group-hover:opacity-100 transition-all">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2">{student.name}</h4>
                      <p className="text-xs tracking-[0.3em] uppercase opacity-40 font-mono flex items-center gap-2">
                        <Activity className="w-3 h-3" /> GH_HANDLE: @{student.githubUsername}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-[var(--color-border)]">
                    <a 
                      href={student.resumeUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase opacity-60 hover:opacity-100 hover:text-[var(--color-accent)] transition-colors"
                    >
                      Examine_Docs <ExternalLink className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => handleVerifyResume(student._id)}
                      className="px-6 py-3 bg-green-500/10 text-green-500 border border-green-500/30 text-xs tracking-[0.2em] uppercase font-bold hover:bg-green-500 hover:text-white transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Authenticate Flow
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Verified Artifacts Library */}
        <div className="flex items-center gap-4 mb-10">
          <Users className="w-6 h-6 text-[var(--color-accent)]" />
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">Verified Artifacts Library</h3>
        </div>

        {savedProjects.length > 0 && (
          <div className="mb-16">
            <div className="mb-8 flex items-center gap-4">
              <ShieldCheck className="w-6 h-6 text-[var(--color-accent)]" />
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Shortlisted Projects</h3>
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
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-[var(--color-border)] bg-black/5 dark:bg-white/5">
             <div className="w-12 h-[1px] bg-[var(--color-accent)] animate-pulse mb-6" />
             <p className="text-xs font-mono tracking-[0.4em] uppercase opacity-30 animate-pulse">Fetching_Archive_Data...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center bg-white/5 dark:bg-black/20 backdrop-blur-md py-32 border border-[var(--color-border)] opacity-60">
            <h3 className="text-sm font-mono uppercase tracking-[0.4em]">
              No_Authenticated_Evidence_Discovered
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
                <div className="p-8 pb-10 flex-grow relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700 pointer-events-none">
                     <Activity className="w-24 h-24" />
                  </div>

                  <div className="flex items-center space-x-4 mb-8">
                    <div className="h-10 w-10 border border-[var(--color-border)] flex items-center justify-center font-black italic uppercase text-lg bg-[var(--color-text)] text-[var(--color-bg)] shadow-inner">
                      {project.user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold tracking-widest uppercase opacity-60">
                        {project.user.name}
                      </h3>
                      <p className="text-xs font-mono uppercase tracking-[0.2em] mt-1 text-[var(--color-accent)]">
                        @{project.user.githubUsername}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8 grid grid-cols-3 gap-2">
                    {[
                      { label: "Trust", value: `${project.user.skillProgress?.trustScore || 0}%` },
                      { label: "Verified", value: project.user.skillProgress?.verifiedCount || 0 },
                      { label: "Level", value: project.user.skillProgress?.level || 1 },
                    ].map((metric) => (
                      <div key={metric.label} className="border border-[var(--color-border)] bg-[var(--color-text)]/[0.02] p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-35">{metric.label}</p>
                        <p className="mt-1 text-lg font-black tracking-tighter">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Link to={`/project/${project._id}`} className="block hover:opacity-70 transition-opacity">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight mb-4 line-clamp-2">
                      {project.title}
                    </h3>
                  </Link>

                  <div className="text-sm opacity-50 font-medium leading-relaxed line-clamp-3 mb-8">
                    {project.description}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 4).map((tech, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-3 py-1.5 text-[10px] tracking-[0.2em] font-bold uppercase bg-[var(--color-text)]/[0.03] border border-[var(--color-border)]"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="inline-flex items-center px-3 py-1.5 text-[10px] tracking-[0.2em] font-bold uppercase opacity-50 border border-[var(--color-border)]">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Footer Bar */}
                <div className="px-8 py-5 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-text)]/[0.02]">
                  <div className="flex items-center gap-4">
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-mono tracking-[0.3em] font-bold group/link flex items-center gap-2 text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
                    >
                      REPOSITORY_LINK
                    </a>
                    <span className={`inline-flex items-center px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-bold border ${project.isVerified ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-[var(--color-border)] opacity-40 bg-[var(--color-text)]/[0.02]"}`}>
                      {project.isVerified ? "AUTHENTICATED" : "PENDING_REVIEW"}
                    </span>
                    <Link
                      to={`/skill-tree?candidate=${project.user._id}`}
                      className="text-[10px] font-mono tracking-[0.2em] font-bold text-[var(--color-accent)] hover:opacity-70"
                    >
                      SKILL_TREE
                    </Link>
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
    </PageTransition>
  );
};

export default RecruiterDashboard;
