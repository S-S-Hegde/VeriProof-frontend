import { useState, useEffect, useRef } from "react";
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
import ProjectVerificationModal from "../components/ProjectVerificationModal";
import ResumeProjectLinkModal from "../components/ResumeProjectLinkModal";
import { resolveFileUrl } from "../utils/fileUrl";
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
  X,
  AlertCircle,
} from "lucide-react";

const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const SkeletonCard = () => (
  <div className="border-l border-slate-800 pl-6 py-6 space-y-4 animate-pulse">
    <div className="h-3 w-24 bg-slate-800" />
    <div className="h-6 w-3/4 bg-slate-800" />
    <div className="h-4 w-full bg-slate-800" />
    <div className="h-4 w-2/3 bg-slate-800" />
    <div className="flex gap-2 mt-4">
      <div className="h-6 w-14 bg-slate-800" />
      <div className="h-6 w-14 bg-slate-800" />
    </div>
  </div>
);

/**
 * GitHubAnalysisBanner — shown while GitHub repo analysis is running.
 * Appears between Resume Complete and Repos appearing.
 */
const GitHubAnalysisBanner = ({ status, hasRepoAnalysis }) => {
  if (!status || status.status === "idle" || status.status === "complete" || hasRepoAnalysis || status.hasRepoAnalysis) return null;

  const isFailed = status.status === "failed";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-4 px-4 py-3 border-l-2 mb-4 ${
          isFailed
            ? "border-red-500 bg-red-500/10 text-red-400"
            : "border-cyan-500 bg-cyan-500/10 text-cyan-400"
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
  const [selectedProjectForVerify, setSelectedProjectForVerify] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isLinkProjectsModalOpen, setIsLinkProjectsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { progress } = useSkillTree();

  const hasFetchedRef = useRef(false);

  // ── Initial data load ───────────────────────────────────────────────────────
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [profileRes, projectsRes] = await Promise.all([
          api.cachedGet("/api/users/profile"),
          api.cachedGet("/api/projects/myprojects"),
        ]);

        if (!isMounted) return;

        setProfileData(profileRes.data);
        setCertificates(profileRes.data.certificates || []);
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
  }, []);

  const workflowState = profileData?.workflowState || user?.workflowState;
  const isInvited =
    user?.origin === "recruiter_invited" ||
    profileData?.origin === "recruiter_invited" ||
    Boolean(user?.invitedByRecruiter);
  const resumeUrl =
    profileData?.resumeUrl ||
    user?.resumeUrl ||
    profileData?.resumeHistory?.[profileData?.resumeHistory?.length - 1]?.resumeUrl ||
    user?.resumeHistory?.[user?.resumeHistory?.length - 1]?.resumeUrl ||
    "";
  const resumeStatus =
    (profileData?.resumeStatus && profileData.resumeStatus !== "Not Submitted")
      ? profileData.resumeStatus
      : (user?.resumeStatus && user.resumeStatus !== "Not Submitted")
      ? user.resumeStatus
      : (resumeUrl || workflowState?.hasResume)
      ? "Analyzed"
      : "Not Submitted";
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
        }
      } catch (err) {
        console.error("Failed to check resume analysis status:", err);
      }
    };

    if (resumeStatus === "Pending Evaluation") {
      checkAnalysisStatus();
      intervalId = setInterval(checkAnalysisStatus, 4000);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [resumeStatus]);

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

        // Auto-trigger if idle and needs repository analysis
        if (data.status === "idle" && !data.hasRepoAnalysis) {
          api.post("/api/github/trigger").catch(console.error);
        }

        // If GitHub analysis has completed or hasRepoAnalysis is true, refresh projects list and workflowState
        if (data.hasRepoAnalysis || data.status === "complete" || data.status === "error") {
          if (intervalId) clearInterval(intervalId);
          const [projectsRes, profileRes] = await Promise.all([
            api.get("/api/projects/myprojects"),
            api.get("/api/users/profile"),
          ]);
          if (!isMounted) return;
          setProjects(projectsRes.data || []);
          setProfileData(profileRes.data);
        }
      } catch {
        // Silence — GitHub status is non-critical
      }
    };

    // Start polling immediately
    checkGitHubStatus();
    intervalId = setInterval(checkGitHubStatus, 4000);

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
    <>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12 pb-28 lg:pb-12">
        <Reveal>
          <div className="py-12 border-b border-slate-800/60">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="vp-label-accent">
                Welcome back,{" "}
                {user?.name?.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <h1
                className="font-black italic uppercase tracking-tighter leading-[0.85] text-slate-900 dark:text-slate-100"
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                }}
              >
                Candidate{" "}
                <span className="text-[var(--color-accent)] not-italic">
                  Dashboard.
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="vp-status-dot" />
              <span className="vp-label">
                System Status:{" "}
                {githubAnalysisState?.status === "running" && !workflowState?.hasRepoAnalysis
                  ? "Analyzing Repositories"
                  : workflowState?.hasResume
                  ? "Active"
                  : "Awaiting Resume"}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="py-12 border-b border-slate-800/60">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                {/* GitHub Analysis Banner */}
                <GitHubAnalysisBanner
                  status={githubAnalysisState}
                  hasRepoAnalysis={workflowState?.hasRepoAnalysis}
                />

                <ResumeStatusCard
                  resumeUrl={resumeUrl}
                  resumeStatus={resumeStatus}
                  analysisState={analysisState}
                  user={{
                    ...user,
                    ...profileData,
                    origin: isInvited ? "recruiter_invited" : (profileData?.origin || user?.origin),
                  }}
                  workflowState={workflowState}
                  onOpenUploadModal={isInvited ? null : () => setIsUploadModalOpen(true)}
                />
                <VerificationPipeline
                  workflowState={workflowState}
                  githubAnalysisState={workflowState?.hasRepoAnalysis ? null : githubAnalysisState}
                  onStepClick={(stepId) => {
                    if (stepId === "resume" || stepId === "analysis") {
                      if (isInvited) {
                        const effectiveUrl = resolveFileUrl(resumeUrl || "/uploads/candidate-resumes/verified_resume.pdf");
                        window.open(effectiveUrl, "_blank");
                      } else {
                        setIsUploadModalOpen(true);
                      }
                    } else if (stepId === "repo") {
                      setIsLinkProjectsModalOpen(true);
                    } else if (stepId === "certs") {
                      navigate("/certifications");
                    } else if (stepId === "assessment") {
                      if (workflowState?.hasExamPassed || workflowState?.isVerificationComplete) {
                        navigate("/skill-tree");
                      } else {
                        navigate("/exams");
                      }
                    } else if (stepId === "verified") {
                      navigate("/skill-tree");
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
          </div>
        </Reveal>

        <div className="py-12 border-b border-slate-800/60">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const targetPath =
                stat.id === "01"
                  ? "/project-archive"
                  : stat.id === "03"
                  ? "/certifications"
                  : stat.id === "04"
                  ? "/skill-tree"
                  : null;

              return (
                <div
                  key={i}
                  onClick={() => {
                    if (targetPath) navigate(targetPath);
                    else if (stat.id === "02") setIsUploadModalOpen(true);
                  }}
                  className="border-l border-slate-300 dark:border-slate-800 pl-6 group cursor-pointer transition-colors hover:border-cyan-500 dark:hover:border-cyan-400"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-2">
                      <stat.icon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      {stat.label}
                    </span>
                    <span className="text-cyan-700 dark:text-cyan-400 font-bold">Stat_{stat.id}</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                    {stat.val}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Reveal delay={0.4}>
          <div className="py-12 border-b border-slate-800/60">
            <SkillProgressPanel progress={progress} />
          </div>
        </Reveal>

        {certificates.length > 0 && (
          <Reveal delay={0.45}>
            <div className="py-12 border-b border-slate-800/60">
              <div className="flex items-center gap-3 mb-8">
                <Award className="w-5 h-5 text-[var(--color-accent)]" />
                <h3
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                  className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100"
                >
                  Verified_Credentials
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {certificates.map((cert, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -3 }}
                    className="border-l border-slate-800 pl-6 py-2 group relative transition-colors hover:border-cyan-400"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-mono uppercase text-slate-400">{cert.issuer}</span>
                      </div>
                      <span className="font-mono text-xs text-slate-500">
                        {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-lg font-black uppercase tracking-tight mb-2 group-hover:text-cyan-400 transition-colors">
                      {cert.title}
                    </h4>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {cert.techStack?.map((tech, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 border border-slate-800 text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs font-mono text-slate-500">
                      <span>ID: {cert.credentialId}</span>
                      <button className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
                        Verify <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        <div className="py-12">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Reveal delay={0.55}>
              <div className="text-center py-16 border-l border-slate-800 pl-6 relative">
                <Database className="w-10 h-10 mx-auto text-slate-700 mb-5" />
                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-500 mb-2">
                  {githubAnalysisState?.status === "running"
                    ? "Scanning_Repositories"
                    : "Empty_Archive"}
                </h3>
                <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto">
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
                    className={`px-6 py-2.5 font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                      workflowState?.isResumeAnalyzed 
                        ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm" 
                        : "border border-slate-800 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    {workflowState?.isResumeAnalyzed
                      ? "Initiate_First_Sync"
                      : "Awaiting_Resume_Analysis"}
                  </motion.button>
                )}
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <ProjectCard3D
                  project={project}
                  onOpenVerify={(p) => {
                    setSelectedProjectForVerify(p);
                    setIsVerifyModalOpen(true);
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
      </div>

      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(data) => {
          handleResumeUploadComplete(data);
          api.get("/api/users/profile").then(({ data }) => setProfileData(data)).catch(console.error);
        }}
      />

      <ProjectVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        project={selectedProjectForVerify}
        onVerified={(updated) => {
          setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
          setSelectedProjectForVerify(updated);
        }}
      />

      <ResumeProjectLinkModal
        isOpen={isLinkProjectsModalOpen}
        onClose={() => setIsLinkProjectsModalOpen(false)}
        onLinked={() => {
          // Re-fetch profile and projects to update workflow state
          api.get("/api/users/profile").then(({ data }) => setProfileData(data)).catch(console.error);
          api.get("/api/projects/myprojects").then(({ data }) => setProjects(data || [])).catch(console.error);
        }}
      />
    </>
  );
};

export default StudentDashboard;
