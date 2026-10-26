import React from "react";
import { motion } from "framer-motion";
import { Binary, ShieldCheck, Zap, Lock } from "lucide-react";
import { ABOUT_COPY } from "../copy";
import { useDecodeText } from "../hooks/useDecodeText";

export default function S10_Principles({ isDark }) {
  const copy = ABOUT_COPY.s10_principles;
  const decodedEyebrow = useDecodeText(copy.eyebrow, true);

  const icons = [Binary, Zap, ShieldCheck, Lock];

  return (
    <section
      data-about-section="10"
      id="section-principles"
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
          FOUNDATIONAL PRINCIPLES.
        </h2>
      </div>

      {/* 2x2 Clean Hover-Tilt Principle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {copy.cards.map((card, idx) => {
          const Icon = icons[idx] || ShieldCheck;

          return (
            <motion.div
              key={card.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              className={`p-8 sm:p-10 rounded-2xl border transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${
                isDark
                  ? "bg-slate-900/60 border-slate-800 hover:border-cyan-500/50 backdrop-blur-md"
                  : "bg-white/80 border-slate-200 hover:border-cyan-500 shadow-sm"
              }`}
            >
              {/* Top Cyan Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400/0 via-cyan-400/40 to-transparent group-hover:via-cyan-400 transition-all duration-300" />

              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {card.num} / PROTOCOL
                </span>
                <Icon className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>

              <h3
                className={`text-2xl font-bold uppercase tracking-tight mb-3 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {card.title}
              </h3>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {card.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
