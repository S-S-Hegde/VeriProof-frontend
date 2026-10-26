import React from "react";
import { motion } from "framer-motion";
import { Terminal, Cpu, Users, Code, Server, Database, Boxes, Sparkles } from "lucide-react";
import { ABOUT_COPY } from "../copy";
import { useDecodeText } from "../hooks/useDecodeText";

export default function S11_Team({ isDark }) {
  const copy = ABOUT_COPY.s11_team;
  const decodedEyebrow = useDecodeText(copy.eyebrow, true);

  return (
    <section
      data-about-section="11"
      id="section-team"
      className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-7xl mx-auto z-10"
    >
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs tracking-widest uppercase">
          <span>{decodedEyebrow}</span>
        </div>

        <h2
          className={`text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          THE ENGINEERING CORE.
        </h2>
      </div>

      {/* Primary Architects & Core System Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
        {copy.coreMembers.map((member, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className={`p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
              isDark
                ? "bg-slate-900/60 border-slate-800 hover:border-cyan-500/50 backdrop-blur-md"
                : "bg-white/80 border-slate-200 hover:border-cyan-500 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono font-black text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all duration-300">
                {member.initials}
              </div>
              <div>
                <h3 className={`text-xl font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  {member.name}
                </h3>
                <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                  {member.role}
                </span>
              </div>
            </div>

            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {member.bio}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Student Engineering Team Credits */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border mb-12 backdrop-blur-md ${
          isDark ? "bg-slate-950/60 border-slate-800" : "bg-white/90 border-slate-200"
        }`}
      >
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-white/10 font-mono text-xs text-slate-400">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-cyan-400">
            STUDENT_ENGINEERING_CONTRIBUTORS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {copy.studentTeam.map((student, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                isDark ? "bg-slate-900/50 border-slate-800/80" : "bg-slate-50 border-slate-200"
              }`}
            >
              <h4 className={`text-sm font-bold uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                {student.name}
              </h4>
              <p className="text-[11px] font-mono text-cyan-400 mt-1">
                {student.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Strip */}
      <div className="space-y-3">
        <span className="font-mono text-xs text-slate-500 uppercase tracking-wider block">
          ENGINEERING_INFRASTRUCTURE:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {copy.techStack.map((tech) => (
            <div
              key={tech.name}
              className={`p-3.5 rounded-xl border text-center transition-colors ${
                isDark ? "bg-slate-900/50 border-slate-800 hover:border-cyan-500/40" : "bg-white border-slate-200 hover:border-cyan-500"
              }`}
            >
              <span className={`block font-mono text-xs font-bold uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                {tech.name}
              </span>
              <span className="text-[10px] font-mono text-slate-500 block truncate">
                {tech.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
