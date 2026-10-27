import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";
import { MaskedLine, FadeInSubhead } from "../components/MaskedText";

export default function EternaHero({ onScrollNext }) {
  const { scrollY } = useScroll();

  // Scroll parallax & scale matching EternaCloud's floating glowing ring
  const ringY = useTransform(scrollY, [0, 700], [0, 200]);
  const ringScale = useTransform(scrollY, [0, 700], [1, 1.16]);
  const ringOpacity = useTransform(scrollY, [0, 500, 800], [1, 0.75, 0.18]);
  const glowScale = useTransform(scrollY, [0, 700], [1, 1.25]);
  const exploreOpacity = useTransform(scrollY, [0, 150], [1, 0]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* ── Large Glowing Halo Ring with Scroll Parallax & Scale ── */}
      <motion.div
        style={{
          y: ringY,
          opacity: ringOpacity,
        }}
        className="absolute inset-0 pointer-events-none flex items-center justify-center z-0"
      >
        <motion.div
          className="absolute rounded-full"
          style={{
            scale: glowScale,
            width: "clamp(420px, 62vw, 820px)",
            height: "clamp(420px, 62vw, 820px)",
            background:
              "radial-gradient(circle, rgba(109,40,217,0.24) 0%, rgba(88,28,187,0.14) 42%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <motion.div
          className="eterna-halo-ring"
          style={{
            scale: ringScale,
            width: "clamp(360px, 50vw, 660px)",
            height: "clamp(360px, 50vw, 660px)",
          }}
        />
      </motion.div>

      {/* ── Hero Content with Editorial Masked Reveals ── */}
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center"
        >
          <span className="eterna-pill-badge">
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            Our Business is Truth, Auditability & Evidence
          </span>
        </motion.div>

        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.06]">
            <MaskedLine delay={0.15}>
              We are evidence architects
            </MaskedLine>
            <MaskedLine delay={0.28}>
              <span className="text-white/90">with hyperfocus.</span>
            </MaskedLine>
          </h1>

          <FadeInSubhead delay={0.45}>
            <p className="max-w-xl mx-auto text-base sm:text-lg text-white/55 font-light leading-relaxed">
              VeriProof replaces unverifiable resume claims with forensic evidence
              from candidate code, live problem-solving, and auditable trust scores.
            </p>
          </FadeInSubhead>
        </div>
      </div>

      {/* Explore indicator (fades out as user begins scrolling) */}
      <motion.button
        style={{ opacity: exploreOpacity }}
        onClick={onScrollNext}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-white/35 hover:text-white/70 transition-colors z-10 cursor-pointer"
        aria-label="Scroll to next section"
      >
        <span className="text-[10px] font-mono tracking-widest uppercase">Explore</span>
        <ArrowDown className="h-4 w-4 animate-bounce text-violet-400" />
      </motion.button>
    </section>
  );
}
