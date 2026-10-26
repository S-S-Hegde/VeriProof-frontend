import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, ShieldCheck } from "lucide-react";
import { ABOUT_COPY } from "../copy";
import { useDecodeText } from "../hooks/useDecodeText";

export default function S0_Hero({ isDark, onExploreClick }) {
  const copy = ABOUT_COPY.s0_hero;
  const decodedEyebrow = useDecodeText(copy.eyebrow, true);

  return (
    <section
      data-about-section="0"
      id="section-hero"
      className="relative min-h-[92vh] flex flex-col justify-between pt-24 sm:pt-32 pb-12 px-6 sm:px-12 max-w-7xl mx-auto z-10"
    >
      <div className="my-auto max-w-4xl">
        {/* Eyebrow with decode animation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs tracking-widest uppercase shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>{decodedEyebrow}</span>
        </motion.div>

        {/* Line-by-line masked reveal headline */}
        <div className="overflow-hidden mb-3">
          <motion.h1
            initial={{ y: "115%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className={`text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.92] ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {copy.headlineLine1}
          </motion.h1>
        </div>

        <div className="overflow-hidden mb-8">
          <motion.h1
            initial={{ y: "115%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.92]"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-500 bg-clip-text text-transparent">
              {copy.headlineLine2}
            </span>
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className={`text-lg sm:text-xl lg:text-2xl font-light leading-relaxed max-w-2xl mb-10 ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          {copy.sub}
        </motion.p>

        {/* Call to action button pair */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-wrap items-center gap-4"
        >
          <Link
            to="/register"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{copy.primaryCta}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            onClick={onExploreClick}
            className={`inline-flex items-center gap-2 px-6 py-4 rounded-xl border font-mono font-semibold text-xs uppercase tracking-wider transition-all duration-300 ${
              isDark
                ? "border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 text-slate-200"
                : "border-slate-300 bg-white/80 hover:border-cyan-600 text-slate-800 shadow-sm"
            }`}
          >
            <span>{copy.secondaryCta}</span>
            <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </motion.div>
      </div>

      {/* Animated scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center gap-3 font-mono text-[11px] tracking-widest text-slate-500 uppercase pt-8"
      >
        <span>{copy.scrollCue}</span>
        <div className="w-12 h-[1px] bg-cyan-500/40 relative overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-4 h-full bg-cyan-400"
          />
        </div>
      </motion.div>
    </section>
  );
}
