import React from "react";
import { motion } from "framer-motion";
import { GitFork, Bot, AlertTriangle, Quote } from "lucide-react";
import { ABOUT_COPY } from "../copy";
import { useDecodeText } from "../hooks/useDecodeText";

export default function S1_Problem({ isDark }) {
  const copy = ABOUT_COPY.s1_problem;
  const decodedEyebrow = useDecodeText(copy.eyebrow, true);

  const icons = [GitFork, Bot, AlertTriangle];

  return (
    <section
      data-about-section="1"
      id="section-problem"
      className="relative py-24 sm:py-32 px-6 sm:px-12 max-w-7xl mx-auto z-10"
    >
      {/* Section Header */}
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 font-mono text-xs tracking-widest uppercase">
          <span>{decodedEyebrow}</span>
        </div>

        <h2
          className={`text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight mb-6 ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {copy.headline}
        </h2>

        <p
          className={`text-base sm:text-lg font-light leading-relaxed ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {copy.lead}
        </p>
      </div>

      {/* Staggered Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
        {copy.cards.map((card, i) => {
          const IconComponent = icons[i] || AlertTriangle;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${
                isDark
                  ? "bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 backdrop-blur-md"
                  : "bg-white/80 border-slate-200 hover:border-cyan-500 shadow-sm"
              }`}
            >
              {/* Subtle top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500/40 via-amber-500/40 to-transparent group-hover:from-cyan-400 group-hover:to-indigo-500 transition-colors" />

              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] tracking-wider uppercase text-slate-500">
                  {card.tag}
                </span>
              </div>

              <h3
                className={`text-xl font-bold uppercase tracking-tight mb-3 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {card.title}
              </h3>

              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {card.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Pull Quote */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className={`p-6 sm:p-8 rounded-2xl border border-l-4 border-l-cyan-400 ${
          isDark
            ? "border-slate-800 bg-cyan-950/20"
            : "border-slate-200 bg-cyan-50/50"
        }`}
      >
        <div className="flex items-start gap-4">
          <Quote className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1 opacity-60" />
          <div>
            <blockquote
              className={`text-lg sm:text-2xl font-mono italic leading-snug ${
                isDark ? "text-cyan-200" : "text-slate-800"
              }`}
            >
              "{copy.pullQuote}"
            </blockquote>
            <p className="mt-2 text-xs font-mono tracking-widest text-slate-500 uppercase">
              [ VERIPROOF_CORE_CREED ]
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
