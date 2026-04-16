import React from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Github, ShieldCheck, ExternalLink, Plus } from "lucide-react";
import SaveProjectButton from "./SaveProjectButton";

const ProjectCard3D = ({ project, isSaved = false, onToggleSaved, saveBusy = false }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group flex flex-col h-full relative overflow-hidden transition-all duration-700 border border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-bg)]"
    >
      {/* Blueprint Grid Local Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-text)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-text)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <div className="p-8 flex-grow relative z-10" style={{ transform: "translateZ(40px)" }}>
        {/* Verification Badge (Surgical Style) */}
        {project.isVerified && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 border border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-mono tracking-widest uppercase bg-[var(--color-accent)]/5">
            <ShieldCheck className="w-3 h-3" /> VERIFIED_DATA
          </div>
        )}

        <div className="mb-8">
          <p className="text-sm font-mono tracking-[0.4em] uppercase opacity-30 mb-4">ARCHIVE_NODE // {project._id?.substring(0, 8)}</p>
          <Link to={`/project/${project._id}`}>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none group-hover:text-[var(--color-accent)] transition-colors">
              {project.title}
            </h3>
          </Link>
          <div className="mt-4 flex items-center gap-4">
              <div className="h-[1px] w-8 bg-[var(--color-accent)]" />
              <span className="text-sm font-mono opacity-20 uppercase tracking-widest">Protocol_Active</span>
          </div>
        </div>

        <p className="text-base font-medium leading-relaxed opacity-50 mb-10 uppercase tracking-tighter max-w-[90%]">
          {project.description?.substring(0, 150)}...
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {project.technologies?.slice(0, 4).map((tech, i) => (
            <span
              key={i}
              className="text-xs font-mono tracking-[0.2em] uppercase px-3 py-1 border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all duration-300"
            >
              {tech}
            </span>
          ))}
        </div>

        {onToggleSaved && (
          <div className="mt-6">
            <SaveProjectButton
              isSaved={isSaved}
              onToggle={onToggleSaved}
              busy={saveBusy}
            />
          </div>
        )}
      </div>

      <div 
        className="px-8 py-5 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-text)]/[0.02] group-hover:bg-[var(--color-accent)]/[0.05] transition-colors"
        style={{ transform: "translateZ(20px)" }}
      >
        <div className="flex space-x-6">
          <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-500">
            <Github className="w-4 h-4" />
          </a>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-500">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        
        <Link 
          to={`/project/${project._id}`}
          className="text-sm font-bold tracking-[0.3em] uppercase transition-all duration-500 text-[var(--color-text)] hover:text-[var(--color-accent)] flex items-center gap-2"
        >
          ACCESS_RECORDS <Plus className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
};

export default ProjectCard3D;
