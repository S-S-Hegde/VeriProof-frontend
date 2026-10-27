import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";

export default function EternaHero({ onScrollNext }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Large Glowing Halo Ring matching EternaCloud */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          className="absolute rounded-full"
          style={{
            width: "clamp(420px, 62vw, 800px)",
            height: "clamp(420px, 62vw, 800px)",
            background:
              "radial-gradient(circle, rgba(109,40,217,0.20) 0%, rgba(88,28,187,0.12) 42%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="eterna-halo-ring"
          style={{
            width: "clamp(360px, 50vw, 660px)",
            height: "clamp(360px, 50vw, 660px)",
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center"
        >
          <span className="eterna-pill-badge">
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            Our Business is Truth, Auditability & Evidence
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.06]">
            We are evidence architects <br />
            <span className="text-white/90">with hyperfocus.</span>
          </h1>
          <p className="max-w-xl mx-auto text-base sm:text-lg text-white/55 font-light leading-relaxed">
            VeriProof replaces unverifiable resume claims with forensic evidence
            from candidate code, live problem-solving, and auditable trust scores.
          </p>
        </motion.div>
      </div>

      <motion.button
        onClick={onScrollNext}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-white/35 hover:text-white/70 transition-colors"
        aria-label="Scroll to next section"
      >
        <span className="text-[10px] font-mono tracking-widest uppercase">Explore</span>
        <ArrowDown className="h-4 w-4 animate-bounce text-violet-400" />
      </motion.button>
    </section>
  );
}
