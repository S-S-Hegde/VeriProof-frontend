import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import ProjectCard3D from "../components/ProjectCard3D";
import SkillProgressPanel from "../components/SkillProgressPanel";
import { useSkillTree } from "../context/SkillTreeContext";
import { motion } from "framer-motion";
import {
  Plus, Database, Shield, Award, Activity, CheckCircle,
  ExternalLink, GitBranch, Terminal,
} from "lucide-react";

/* ─── Section Reveal ─── */
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

/* ─── Skeleton Loader ─── */
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

const StudentDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeStatus, setResumeStatus] = useState(user?.resumeStatus || "Not Submitted");
  const navigate = useNavigate();
  const { progress } = useSkillTree();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const profileRes = await axios.get("/api/users/profile", config);
        if (profileRes.data.resumeUrl) {
          setResumeStatus(profileRes.data.resumeStatus || "Pending Evaluation");
        }
        setCertificates(profileRes.data.certificates || []);
        const { data } = await axios.get("/api/projects/myprojects", config);
        setProjects(data);
        setLoading(false);
      } catch {
        console.error("Failed to fetch data");
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const stats = [
    { label: "Authenticated_Nodes", val: projects.length, icon: Database, id: "01" },
    { label: "Verification_Level", val: resumeStatus.toUpperCase(), icon: Shield, id: "02" },
    { label: "Talent_Signal", val: "ALPHA", icon: Activity, id: "03" },
    { label: "Global_Integrity", val: "99.2%", icon: Award, id: "04" },
  ];

  return (
    <PageTransition>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 lg:py-12 pb-28 lg:pb-12">

        {/* ═══ HEADER ═══ */}
        <Reveal>
          <div className="mb-12 lg:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="vp-label-accent">
                Terminal_Authorized // {user.name?.replace(" ", "_").toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <h1
                className="font-black italic uppercase tracking-tighter leading-[0.85]"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
              >
                Candidate <span className="text-[var(--color-accent)] not-italic">Terminal.</span>
              </h1>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/skill-tree")}
                  className="vp-btn vp-btn-secondary text-[10px] py-3 px-6 gap-2"
                >
                  <GitBranch className="w-3.5 h-3.5" /> Skill_Tree
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/add-project")}
                  className="vp-btn vp-btn-accent text-[10px] py-3 px-6 gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload_Evidence
                </motion.button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="vp-status-dot" />
              <span className="vp-label">System_Status: Syncing_Global_Nodes</span>
            </div>
          </div>
        </Reveal>

        {/* ═══ STATS BENTO ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12 lg:mb-16">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={0.1 + i * 0.08}>
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
                <p className="text-2xl font-black italic uppercase tracking-tight">{stat.val}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* ═══ SKILL PROGRESS ═══ */}
        <Reveal delay={0.3}>
          <div className="mb-12 lg:mb-16">
            <SkillProgressPanel progress={progress} />
          </div>
        </Reveal>

        {/* ═══ CREDENTIALS ═══ */}
        {certificates.length > 0 && (
          <Reveal delay={0.35}>
            <div className="mb-12 lg:mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Award className="w-5 h-5 text-[var(--color-accent)]" />
                <h3 className="text-xl font-black uppercase tracking-tight">Verified_Credentials</h3>
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
                      <span className="vp-label">Issue: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                    </div>

                    <h4 className="text-lg font-black uppercase tracking-tight mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                      {cert.title}
                    </h4>
                    <p className="vp-label mb-5">{cert.issuer}</p>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {cert.techStack?.map((tech, i) => (
                        <span key={i} className="vp-tag">{tech}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-[var(--color-border)]">
                      <span className="vp-label" style={{ fontSize: "8px" }}>ID: {cert.credentialId}</span>
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

        {/* ═══ PROJECTS ═══ */}
        <Reveal delay={0.4}>
          <div className="flex items-center gap-3 mb-8">
            <Database className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="text-xl font-black uppercase tracking-tight">Evidence_Archive</h3>
          </div>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <Reveal delay={0.45}>
            <div className="text-center py-20 vp-surface-1 relative overflow-hidden">
              <div className="relative z-10">
                <Database className="w-12 h-12 mx-auto text-[var(--color-muted)] opacity-20 mb-6" />
                <h3 className="text-2xl font-black italic uppercase tracking-tighter opacity-30 mb-3">
                  Empty_Archive
                </h3>
                <p className="text-sm text-[var(--color-muted)] mb-8">
                  No evidence has been synchronized with this node.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/add-project")}
                  className="vp-btn vp-btn-primary text-[11px] py-3 px-8"
                >
                  Initiate_First_Sync
                </motion.button>
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
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProjectCard3D project={project} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default StudentDashboard;
