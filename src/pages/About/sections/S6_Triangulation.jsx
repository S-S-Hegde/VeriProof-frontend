import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, AlertTriangle, ShieldAlert } from "lucide-react";
import { ABOUT_COPY } from "../copy";
import { useDecodeText } from "../hooks/useDecodeText";

export default function S6_Triangulation({ isDark, onHoverOutcome }) {
  const copy = ABOUT_COPY.s6_triangulation;
  const decodedEyebrow = useDecodeText(copy.eyebrow, true);

  const icons = [CheckCircle2, Sparkles, AlertTriangle, ShieldAlert];

  return (
    <section
      data-about-section="6"
      id="section-triangulation"
      className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-7xl mx-auto z-10"
    >
      {/* Header */}
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs tracking-widest uppercase">
          <span>{decodedEyebrow}</span>
        </div>

        <h2
          className={`text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight mb-4 ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {copy.headline}
        </h2>

        <p
          className={`text-base sm:text-lg font-light leading-relaxed mb-8 ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {copy.copy}
        </p>

        {/* 3 Source Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {copy.sources.map((src, i) => (
            <div
              key={i}
              className={`px-3.5 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2 ${
                isDark ? "bg-slate-900/70 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-bold">{src.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Outcome Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {copy.outcomes.map((outcome, idx) => {
          const Icon = icons[idx] || CheckCircle2;

          return (
            <motion.div
              key={outcome.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              onMouseEnter={() => onHoverOutcome && onHoverOutcome(outcome.id)}
              onMouseLeave={() => onHoverOutcome && onHoverOutcome(null)}
              className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden group cursor-pointer hover:-translate-y-1.5 ${
                isDark
                  ? "bg-slate-900/60 border-slate-800 hover:border-cyan-500/50 backdrop-blur-md"
                  : "bg-white/80 border-slate-200 hover:border-cyan-500 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 ${outcome.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`font-mono text-[10px] tracking-wider uppercase font-bold ${outcome.color}`}>
                  [{outcome.badge}]
                </span>
              </div>

              <h3
                className={`text-xl font-bold uppercase tracking-tight mb-3 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {outcome.title}
              </h3>

              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {outcome.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
