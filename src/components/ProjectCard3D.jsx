import React from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const ProjectCard3D = ({ project }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Subtle 3D rotation based on mouse position
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

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
      className="glass-card flex flex-col transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:border-ibex-gold/40 duration-300 relative group"
    >
      <div 
        className="absolute inset-0 bg-gradient-to-br from-ibex-gold/5 border to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
        style={{ transform: "translateZ(20px)" }} 
      />

      <div className="px-6 py-8 flex-grow" style={{ transform: "translateZ(30px)" }}>
        <Link
          to={`/project/${project._id}`}
          className="block hover:opacity-80 transition-opacity"
        >
          <h3 className="text-2xl font-serif text-vp-teal mb-4 group-hover:text-ibex-gold transition-colors duration-300">
            {project.title}
          </h3>
        </Link>
        <div className="mt-2 text-sm text-ibex-muted font-light leading-relaxed line-clamp-3">
          <p>{project.description}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {project.technologies.slice(0, 3).map((tech, i) => (
            <span
              key={i}
              className="inline-flex items-center px-3 py-1 text-xs tracking-widest uppercase text-ibex-gold border border-ibex-gold/30 bg-ibex-gold/5 backdrop-blur-sm"
              style={{ transform: "translateZ(40px)" }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
      <div 
        className="bg-vp-teal/5 px-6 py-5 flex flex-col space-y-4 text-sm border-t border-vp-teal/10 rounded-b-2xl"
        style={{ transform: "translateZ(20px)" }}
      >
        <div className="flex justify-between items-center">
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="text-vp-teal hover:text-ibex-rose uppercase tracking-widest text-xs transition-colors font-medium border-b border-vp-teal pb-0.5"
          >
            Source Code
          </a>
          <span
            className={`inline-flex items-center px-3 py-1 text-xs tracking-widest uppercase border ${project.isVerified ? "border-vp-champagne text-vp-champagne bg-vp-champagne/10 shadow-[0_0_15px_rgba(221,183,113,0.3)]" : "border-ibex-muted/30 text-ibex-muted bg-ibex-muted/5"} transition-all duration-300`}
          >
            {project.isVerified ? "Verified" : "Pending"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard3D;
