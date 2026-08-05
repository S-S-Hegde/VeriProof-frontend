import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import ProjectCard3D from "../components/ProjectCard3D";
import SkillProgressPanel from "../components/SkillProgressPanel";
import {
  VerificationPipeline,
  ResumeStatusCard,
  ProfileCompletionCard,
} from "../components/OnboardingComponents";
import ResumeUploadModal from "../components/ResumeUploadModal";
import { useSkillTree } from "../context/SkillTreeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Upload,
  Database,
  Shield,
  Award,
  Activity,
  CheckCircle,
  ExternalLink,
  GitBranch,
  Terminal,
  Loader2,
  Github,
  Sparkles,
} from "lucide-react";

const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, filter: "blur(3px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

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

/**
 * GitHubAnalysisBanner — shown while GitHub repo analysis is running.
 * Appears between Resume Complete and Repos appearing.
 */
const GitHubAnalysisBanner = ({ status }) => {
  if (!status || status.status === "idle" || status.status === "complete") return null;

  const isFailed = status.status === "failed";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-4 px-5 py-4 rounded-[var(--radius-md)] border mb-4 ${
          isFailed
            ? "border-red-500/30 bg-red-500/10"
            : "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5"
        }`}
      >
        <div className="shrink-0">
          {isFailed ? (
            <Github className="w-5 h-5 text-red-400" />
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-5 h-5 text-[var(--color-accent)]" />
            </motion.div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.12em]">
            {isFailed ? "GitHub Analysis Failed" : "GitHub Repository Analysis Running"}
          </p>
          <p className="text-[10px] text-[var(--color-muted)] mt-0.5 truncate">
            {isFailed
              ? status.error || "Could not connect to analysis engine."
              : status.reposProcessed > 0
              ? `Processed ${status.reposProcessed} / ${status.totalRepos || 3} repositories — generating documentation...`
              : "Fetching top repositories and running intelligence analysis..."}
          </p>
        </div>
        {!isFailed && (
          <div className="shrink-0 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < (status.reposProcessed || 0)
                    ? "bg-emerald-500"
                    : "bg-[var(--color-border)]"
                }`}
                animate={i >= (status.reposProcessed || 0) ? { opacity: [0.3, 1, 0.3] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const StudentDashboard = () => {
  const { user, setUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [analysisState, setAnalysisState] = useState(null);
  const [githubAnalysisState, setGithubAnalysisState] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const navigate = useNavigate();
  const { progress } = useSkillTree();

  // ── Initial data load ───────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [profileRes, projectsRes] = await Promise.all([
          api.get("/api/users/profile"),
          api.get("/api/projects/myprojects"),
        ]);

        if (!isMounted) return;

        setProfileData(profileRes.data);
        setCertificates(profileRes.data.certificates || []);
        if (profileRes.data.workflowState && user) {
          setUser((prev) => ({
            ...prev,
            workflowState: profileRes.data.workflowState,
          }));
        }

        setProjects(projectsRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [setUser]);

  const workflowState = profileData?.workflowState || user?.workflowState;
  const resumeUrl = profileData?.resumeUrl || "";
  const resumeStatus = profileData?.resumeStatus || "Not Submitted";
  const profileImage = profileData?.profileImage || user?.profileImage || "";

  // ── Resume analysis polling ──────────────────────────────────────────────
  useEffect(() => {
    let intervalId;
    let isMounted = true;

    const checkAnalysisStatus = async () => {
      try {
        const { data } = await api.get("/api/users/profile/resume-analysis");
        if (!isMounted) return;
        setAnalysisState(data);

        if (
          data.status === "Analysis Complete" ||
          data.status === "Analysis Failed"
        ) {
          if (intervalId) clearInterval(intervalId);
          const profileRes = await api.get("/api/users/profile");
          if (!isMounted) return;
          setProfileData(profileRes.data);
          if (profileRes.data.workflowState) {
            setUser((prev) => ({
              ...prev,
              resumeStatus: profileRes.data.resumeStatus,
              workflowState: profileRes.data.workflowState,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to check resume analysis status:", err);
      }
    };

    if (resumeStatus === "Pending Evaluation") {
      checkAnalysisStatus();
      intervalId = setInterval(checkAnalysisStatus, 4000);
    } else {
      setAnalysisState(null);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [resumeStatus, setUser]);

  // ── GitHub analysis polling ──────────────────────────────────────────────
  // Polls every 5s when: resume is analyzed + repos not yet done + user has github
  useEffect(() => {
    let intervalId;
    let isMounted = true;

    const shouldPoll =
      workflowState?.isResumeAnalyzed &&
      !workflowState?.hasRepoAnalysis &&
      (user?.githubUsername || profileData?.githubUsername);

    if (!shouldPoll) return;

    const checkGitHubStatus = async () => {
      try {
        const { data } = await api.get("/api/github/status");
        if (!isMounted) return;
        setGithubAnalysisState(data);

        if (data.status === "complete") {
          if (intervalId) clearInterval(intervalId);
          // Refresh projects and profile to reflect newly auto-created projects
          const [profileRes, projectsRes] = await Promise.all([
            api.get("/api/users/profile"),
            api.get("/api/projects/myprojects"),
          ]);
          if (!isMounted) return;
          setProfileData(profileRes.data);
          setProjects(projectsRes.data || []);
          if (profileRes.data.workflowState) {
            setUser((prev) => ({
              ...prev,
              workflowState: profileRes.data.workflowState,
            }));
          }
        }
      } catch (err) {
        // Silence — GitHub status is non-critical
      }
    };

    // Start polling immediately
    checkGitHubStatus();
    intervalId = setInterval(checkGitHubStatus, 5000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    workflowState?.isResumeAnalyzed,
    workflowState?.hasRepoAnalysis,
    user?.githubUsername,
    profileData?.githubUsername,
    setUser,
  ]);

  const handleResumeUploadComplete = (data) => {
    setProfileData((prev) => ({
      ...prev,
      resumeUrl: data.resumeUrl,
      resumeStatus: data.resumeStatus,
      workflowState: { ...prev?.workflowState, hasResume: true },
    }));
    setUser((prev) => ({
      ...prev,
      resumeUrl: data.resumeUrl,
      resumeStatus: data.resumeStatus,
      workflowState: prev ? { ...prev.workflowState, hasResume: true } : null,
    }));
  };

  const stats = [
    {
      label: "Uploaded Projects",
      val: projects.length,
      icon: Database,
      id: "01",
    },
    {
      label: "Resume Status",
      val: resumeStatus.toUpperCase(),
      icon: Shield,
      id: "02",
    },
    { label: "Certifications", val: certificates.length, icon: Award, id: "03" },
    { label: "Skill Level", val: "Intermediate", icon: Activity, id: "04" },
  ];

  return (
    <PageTransition>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 lg:py-12 pb-28 lg:pb-12">
        <Reveal>
          <div className="mb-12 lg:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="vp-label-accent">
                Welcome back,{" "}
                {user?.name?.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <h1
                className="font-black italic uppercase tracking-tighter leading-[0.85]"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
              >
                Candidate{" "}
                <span className="text-[var(--color-accent)] not-italic">
                  Dashboard.
                </span>
              </h1>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/add-project")}
                  className="vp-btn vp-btn-accent text-[10px] py-3 px-6 gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload Projects
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/skill-tree")}
                  className="vp-btn vp-btn-secondary text-[10px] py-3 px-6 gap-2"
                >
                  <GitBranch className="w-3.5 h-3.5" /> Verified Skills
                </motion.button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="vp-status-dot" />
              <span className="vp-label">
                System Status:{" "}
                {githubAnalysisState?.status === "running"
                  ? "Analyzing Repositories"
                  : workflowState?.hasResume
                  ? "Active"
                  : "Awaiting Resume"}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12 lg:mb-16">
            <div className="lg:col-span-8 space-y-4">
              {/* GitHub Analysis Banner */}
              <GitHubAnalysisBanner status={githubAnalysisState} />

              <ResumeStatusCard
                resumeUrl={resumeUrl}
                resumeStatus={resumeStatus}
                analysisState={analysisState}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
              <VerificationPipeline
                workflowState={workflowState}
                githubAnalysisState={githubAnalysisState}
                onStepClick={(stepId) => {
                  if (stepId === "resume" || stepId === "analysis") {
                    setIsUploadModalOpen(true);
                  } else if (stepId === "repo") {
                    // If GitHub analysis hasn't started yet, trigger it
                    if (!githubAnalysisState || githubAnalysisState.status === "idle") {
                      api.post("/api/github/trigger").catch(console.error);
                    }
                    navigate("/add-project");
                  } else if (stepId === "assessment") {
                    navigate("/exams");
                  } else if (stepId === "verified") {
                    navigate("/analytics");
                  }
                }}
              />
            </div>
            <div className="lg:col-span-4">
              <ProfileCompletionCard
                user={profileData || user}
                resumeUrl={resumeUrl}
                profileImage={profileImage}
              />
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12 lg:mb-16">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={0.2 + i * 0.08}>
              <motion.div
                whileHover={{ y: -4, boxShadow: "var(--vp-surface-2-shadow)" }}
                className="vp-surface-1 p-6 group cursor-default transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)] flex items-center justify-center group-hover:bg-[var(--color-accent)] transition-colors">
                    <stat.icon className="w-4 h-4 text-[var(--color-accent)] group-hover:text-white transition-colors" />
                  </div>
                  <span className="vp-label">Stat_{stat.id}</span>
                </div>
                <p className="vp-label mb-2">{stat.label}</p>
                <p className="text-2xl font-black italic uppercase tracking-tight">
                  {stat.val}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <div className="mb-12 lg:mb-16">
            <SkillProgressPanel progress={progress} />
          </div>
        </Reveal>

        {certificates.length > 0 && (
          <Reveal delay={0.45}>
            <div className="mb-12 lg:mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Award className="w-5 h-5 text-[var(--color-accent)]" />
                <h3 className="text-xl font-black uppercase tracking-tight">
                  Verified_Credentials
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -3 }}
                    className="vp-surface-1 p-7 group relative overflow-hidden"
                  >
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-[var(--color-accent)] opacity-[0.04] rotate-45 pointer-events-none" />
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)] flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-[var(--color-accent)]" />
                      </div>
                      <span className="vp-label">
                        Issue: {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-lg font-black uppercase tracking-tight mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                      {cert.title}
                    </h4>
                    <p className="vp-label mb-5">{cert.issuer}</p>
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {cert.techStack?.map((tech, i) => (
                        <span key={i} className="vp-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-[var(--color-border)]">
                      <span className="vp-label" style={{ fontSize: "8px" }}>
                        ID: {cert.credentialId}
                      </span>
                      <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-accent)] hover:opacity-70 transition-opacity">
                        Verify <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        <Reveal delay={0.5}>
          <div className="flex items-center gap-3 mb-8">
            <Database className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="text-xl font-black uppercase tracking-tight">
              Evidence_Archive
            </h3>
            {githubAnalysisState?.status === "complete" && projects.length > 0 && (
              <span className="vp-label text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Auto-generated from GitHub
              </span>
            )}
          </div>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Reveal delay={0.55}>
            <div className="text-center py-20 vp-surface-1 relative overflow-hidden">
              <div className="relative z-10">
                <Database className="w-12 h-12 mx-auto text-[var(--color-muted)] opacity-20 mb-6" />
                <h3 className="text-2xl font-black italic uppercase tracking-tighter opacity-30 mb-3">
                  {githubAnalysisState?.status === "running"
                    ? "Scanning_Repositories"
                    : "Empty_Archive"}
                </h3>
                <p className="text-sm text-[var(--color-muted)] mb-8">
                  {githubAnalysisState?.status === "running"
                    ? `Analyzing ${githubAnalysisState.reposProcessed || 0} / ${githubAnalysisState.totalRepos || 3} repositories...`
                    : workflowState?.isResumeAnalyzed
                    ? "No evidence has been synchronized with this node."
                    : "Complete Resume Analysis to begin uploading project evidence."}
                </p>
                {githubAnalysisState?.status !== "running" && (
                  <motion.button
                    whileHover={
                      workflowState?.isResumeAnalyzed ? { scale: 1.03 } : {}
                    }
                    whileTap={
                      workflowState?.isResumeAnalyzed ? { scale: 0.97 } : {}
                    }
                    onClick={() =>
                      workflowState?.isResumeAnalyzed
                        ? navigate("/add-project")
                        : null
                    }
                    className={`vp-btn text-[11px] py-3 px-8 ${workflowState?.isResumeAnalyzed ? "vp-btn-primary" : "bg-[var(--color-bg-sunken)] text-[var(--color-muted)] cursor-not-allowed opacity-50"}`}
                  >
                    {workflowState?.isResumeAnalyzed
                      ? "Initiate_First_Sync"
                      : "Awaiting_Resume_Analysis"}
                  </motion.button>
                )}
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <ProjectCard3D project={project} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(data) => {
          handleResumeUploadComplete(data);
          api.get("/api/users/profile").then(({ data }) => setProfileData(data)).catch(console.error);
        }}
      />
    </PageTransition>
  );
};

export default StudentDashboard;
