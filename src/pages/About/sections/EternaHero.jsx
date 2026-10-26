import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";

export default function EternaHero({ onScrollNext }) {
  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-12 pb-24">
      {/* ── Background Cosmic Luminous Halo ── */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
        {/* Soft diffuse ambient glow */}
        <div className="absolute w-[500px] h-[500px] sm:w-[750px] sm:h-[750px] rounded-full cosmic-halo-ring" />

        {/* Crisp circular iridescent perimeter ring */}
        <div className="w-[320px] h-[320px] sm:w-[540px] sm:h-[540px] rounded-full border border-purple-500/30 cosmic-halo-border relative opacity-85">
          <div className="absolute inset-0 rounded-full border border-cyan-400/20 blur-[1px]" />
        </div>
      </div>

      {/* ── Foreground Hero Content ── */}
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Pill Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg"
        >
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-medium tracking-wide text-gradient-eterna">
            Our Business is Truth, Auditability & Evidence
          </span>
        </motion.div>

        {/* Hero Headline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.08]">
            We are evidence architects <br />
            <span className="text-white/95">with hyperfocus.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/60 font-light leading-relaxed pt-2">
            VeriProof replaces unverifiable resume claims with forensic evidence from candidate code, live problem-solving, and auditable trust scores.
          </p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={onScrollNext}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-white/40 hover:text-white transition-colors"
        aria-label="Scroll to next section"
      >
        <span className="text-[11px] font-mono tracking-widest uppercase">Explore</span>
        <ArrowDown className="h-4 w-4 animate-bounce text-cyan-400" />
      </motion.button>
    </section>
  );
}
