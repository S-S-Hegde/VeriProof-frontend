import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { motion } from "framer-motion";
import { Search, Users, ShieldCheck, Activity, CheckCircle, ArrowRight, Trophy, Briefcase, FileText, Sparkles, RefreshCw } from "lucide-react";
import api from "../utils/api";
import ProjectCard3D from "../components/ProjectCard3D";

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
};

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [savedProjects, setSavedProjects] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecruiterData = async () => {
    try {
      setLoading(true);
      const [savedRes, applicantsRes, jobsRes] = await Promise.all([
        api.get("/api/users/profile/saved-projects"),
        api.get("/api/verify/applicants"),
        api.get("/api/verify/my-jobs"),
      ]);

      setSavedProjects(savedRes.data || []);
      setApplicants(applicantsRes.data || []);
      setJobs(jobsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch recruiter dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecruiterData();
    }
  }, [user]);

  const topApplicants = [...applicants]
    .sort((a, b) => (b.alignmentScore || 0) - (a.alignmentScore || 0))
    .slice(0, 8);

  const completedApplicantsCount = applicants.filter((a) => a.status === "Completed" || a.examStatus === "Attended").length;

  return (
    <PageTransition>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-12 relative space-y-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-accent)] opacity-[0.02] blur-[150px] -z-10 pointer-events-none" />

        {/* ── Header ── */}
        <div className="md:flex md:items-end md:justify-between pb-8 border-b border-[var(--color-border)]">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-8 h-[1px] bg-[var(--color-accent)]" />
              <p className="text-sm font-mono tracking-[0.4em] uppercase text-[var(--color-accent)] font-bold">
                Recruiter Hub // {user.name?.toUpperCase()}
              </p>
            </div>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4 text-white">
              Talent Pipeline <span className="text-[var(--color-accent)] not-italic">Overview.</span>
            </h2>
            <p className="text-xs font-mono opacity-60 uppercase tracking-widest flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> Real-Time Candidate Intake & Evaluation Matrix
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="mt-8 md:mt-0 flex flex-wrap gap-3">
            <button
              onClick={fetchRecruiterData}
              disabled={loading}
              className="px-5 py-3.5 bg-white/5 border border-[var(--color-border)] text-white font-mono uppercase text-xs flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <Link
              to="/verdicts"
              className="px-6 py-3.5 bg-[var(--color-accent)] text-white font-bold tracking-[0.15em] uppercase text-xs flex items-center gap-2.5 shadow-lg hover:opacity-90 transition-all"
            >
              <Trophy className="w-4 h-4" /> Candidate Rankings
            </Link>
            <Link
              to="/bulk-screening"
              className="px-6 py-3.5 bg-white text-black font-bold tracking-[0.15em] uppercase text-xs flex items-center gap-2.5 hover:bg-[var(--color-accent)] hover:text-white transition-all shadow-md"
            >
              <Users className="w-4 h-4" /> Upload Resumes
            </Link>
          </motion.div>
        </div>

        {/* ── Dynamic Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-[var(--color-border)] bg-[var(--color-bg)]/40 backdrop-blur-md">
          {[
            { label: "Total Intake Applicants", val: applicants.length, id: "01", icon: Users },
            { label: "AI Verified Candidates", val: completedApplicantsCount, id: "02", icon: ShieldCheck },
            { label: "Active Job Roles", val: jobs.length, id: "03", icon: Briefcase },
            { label: "Saved Profiles", val: savedProjects.length, id: "04", icon: FileText }
          ].map((stat, i) => (
            <div key={i} className="p-6 sm:p-8 border-r border-b md:border-b-0 last:border-r-0 border-[var(--color-border)] group hover:bg-[var(--color-text)]/[0.02] transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 font-mono text-[10px] opacity-20 group-hover:text-[var(--color-accent)] group-hover:opacity-100 transition-all">
                METRIC_{stat.id}
              </div>
              <div className="flex items-center gap-2 mb-2 text-[var(--color-muted)]">
                <stat.icon className="w-4 h-4 text-[var(--color-accent)]" />
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase">{stat.label}</p>
              </div>
              <p className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-white">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* ── Top Ranked Candidates Live Feed ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Top Evaluated Candidates</h3>
            </div>
            <Link to="/verdicts" className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] hover:underline flex items-center gap-2">
              View All Rankings ({applicants.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 border border-dashed border-[var(--color-border)]">
              <RefreshCw className="w-6 h-6 text-[var(--color-accent)] animate-spin" />
              <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted)]">Loading Evaluated Candidates...</p>
            </div>
          ) : topApplicants.length === 0 ? (
            <div className="p-12 text-center border border-[var(--color-border)] bg-black/20 rounded-xl space-y-4">
              <Users className="w-10 h-10 text-gray-500 mx-auto" />
              <h4 className="text-lg font-bold uppercase tracking-tight text-white">No Candidate Applications Yet</h4>
              <p className="text-xs text-gray-400 font-mono max-w-md mx-auto">
                Upload resumes or invite candidates to your job blueprints to start automated AI proctoring and ranking.
              </p>
              <Link to="/bulk-screening" className="vp-btn vp-btn-accent text-xs py-2.5 px-5 inline-flex gap-2">
                <Users className="w-4 h-4" /> Upload Resumes Now
              </Link>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-3">
              {topApplicants.map((app, idx) => (
                <motion.div
                  variants={itemVariants}
                  key={app._id}
                  className="bg-white/5 dark:bg-black/20 backdrop-blur-md border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 group hover:border-[var(--color-accent)] transition-all rounded-lg"
                >
                  <div className="flex items-center space-x-5">
                    <div className="h-12 w-12 bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center font-black italic uppercase text-xl text-white opacity-90 group-hover:text-[var(--color-accent)] transition-all">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter leading-none mb-1 text-white">
                        {app.extractedName || app.originalFileName}
                      </h4>
                      <p className="text-[10px] tracking-[0.15em] uppercase opacity-60 font-mono flex flex-wrap items-center gap-2">
                        Target Role: <span className="text-[var(--color-accent)] font-bold">{app.jobId?.title || "General Intake"}</span>
                        {app.extractedEmail && <span className="text-gray-400">· {app.extractedEmail}</span>}
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
                      className="px-5 py-2.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 text-xs tracking-[0.15em] uppercase font-bold hover:bg-[var(--color-accent)] hover:text-white transition-all flex items-center gap-2 rounded"
                    >
                      Examine <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* ── Saved / Shortlisted Candidates ── */}
        {savedProjects.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[var(--color-accent)]" />
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Shortlisted Portfolios</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {savedProjects.map((project) => (
                <ProjectCard3D
                  key={`saved-${project._id}`}
                  project={project}
                  isSaved
                  onToggleSaved={async () => {
                    await api.put(`/api/users/profile/saved-projects/${project._id}`);
                    setSavedProjects((p) => p.filter((item) => item._id !== project._id));
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default RecruiterDashboard;
