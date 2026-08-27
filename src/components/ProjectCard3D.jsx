import React from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Github, ShieldCheck, ExternalLink, Plus, CheckCircle, AlertTriangle, Cpu } from "lucide-react";
import SaveProjectButton from "./SaveProjectButton";

const ProjectCard3D = ({ project, isSaved = false, onToggleSaved, saveBusy = false, onOpenVerify }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { damping: 25, stiffness: 250 });
  const mouseYSpring = useSpring(y, { damping: 25, stiffness: 250 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX / rect.width - 0.5 - rect.left / rect.width);
    y.set(e.clientY / rect.height - 0.5 - rect.top / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isVerified = project.isVerified || project.verificationStatus === "Verified";
  const isDiscrepancy = project.verificationStatus === "Discrepancy";

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group flex flex-col h-full relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 bg-[var(--color-bg)] transition-all duration-500 vp-light-sweep"
    >
      {/* Spotlight hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[var(--radius-xl)]"
        style={{
          background: "radial-gradient(500px circle at var(--vp-cursor-x, 50%) var(--vp-cursor-y, 50%), var(--color-accent-subtle), transparent 50%)",
        }}
      />

      <div className="p-7 flex-grow relative z-10" style={{ transform: "translateZ(30px)" }}>
        {/* Verification Status Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          {isVerified ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]">
                {project.matchScore ? `${project.matchScore}% Verified` : "Verified"}
              </span>
            </div>
          ) : isDiscrepancy ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border border-amber-500/40 text-amber-400 bg-amber-500/10">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]">Review Needed</span>
            </div>
          ) : (
            onOpenVerify && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVerify(project);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border border-cyan-500/40 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors cursor-pointer"
              >
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span className="text-[9px] font-bold uppercase tracking-[0.12em]">Verify Demo</span>
              </button>
            )
          )}
        </div>

        <div className="mb-6">
          <p className="vp-label mb-3">
            {project.sourceType === "resume_auto" ? "Resume_Extracted // " : "Archive_Node // "}
            {project._id?.substring(0, 8)}
          </p>
          <Link to={`/project/${project._id}`}>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight group-hover:text-[var(--color-accent)] transition-colors duration-300">
              {project.title}
            </h3>
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-6 bg-[var(--color-accent)]" />
            <span className="vp-label" style={{ fontSize: "8px" }}>
              {isVerified ? "Dual-Source Verified" : "Protocol_Active"}
            </span>
          </div>
        </div>

        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-8 line-clamp-3">
          {project.description?.substring(0, 150)}...
        </p>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.technologies?.slice(0, 4).map((tech, i) => (
            <span key={i} className="vp-tag">
              {tech}
            </span>
          ))}
        </div>

        {onToggleSaved && (
          <div className="mt-5">
            <SaveProjectButton
              isSaved={isSaved}
              onToggle={onToggleSaved}
              busy={saveBusy}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-7 py-4 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-sunken)]/50 group-hover:bg-[var(--color-accent-subtle)] transition-colors rounded-b-[var(--radius-xl)]"
        style={{ transform: "translateZ(15px)" }}
      >
        <div className="flex gap-4">
          {project.repositoryUrl && (
            <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors" title="GitHub Repository">
              <Github className="w-4 h-4" />
            </a>
          )}
          {(project.liveDemoUrl || project.liveUrl) && (
            <a href={project.liveDemoUrl || project.liveUrl} target="_blank" rel="noreferrer" className="text-[var(--color-muted)] hover:text-cyan-400 transition-colors" title="Live Deployed Demo">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onOpenVerify && (
            <button
              onClick={() => onOpenVerify(project)}
              className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {isVerified ? "Audit Report" : "Verify Live"}
            </button>
          )}
          <Link
            to={`/project/${project._id}`}
            className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            Access <Plus className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard3D;
