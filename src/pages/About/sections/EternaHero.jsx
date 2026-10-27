import React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight } from "lucide-react";
import { WordSlideUp, FadeInParagraph } from "../components/WordReveal";

export default function EternaHero({ onScrollNext }) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Scroll parallax & scale matching EternaCloud's floating glowing ring
  const ringY = useTransform(scrollY, [0, 700], [0, shouldReduceMotion ? 0 : 200]);
  const ringScale = useTransform(scrollY, [0, 700], [1, shouldReduceMotion ? 1 : 1.16]);
  const ringOpacity = useTransform(scrollY, [0, 500, 800], [1, 0.75, 0.18]);
  const glowScale = useTransform(scrollY, [0, 700], [1, shouldReduceMotion ? 1 : 1.25]);
  const exploreOpacity = useTransform(scrollY, [0, 150], [1, 0]);

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-24 pb-16">
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

      {/* ── Hero Content (Slot A) ── */}
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center"
        >
          <span className="eterna-pill-badge">
            About VeriProof
          </span>
        </motion.div>

        <div className="space-y-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white leading-[1.08]">
            <WordSlideUp text="Hiring on evidence," delay={0.1} />
            <br />
            <span className="text-white/90">
              <WordSlideUp text="not on claims." delay={0.25} />
            </span>
          </h1>

          <FadeInParagraph delay={0.45}>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/60 font-light leading-relaxed">
              VeriProof checks what candidates say against the code they have written and how they solve problems live, then gives hiring teams a trust score they can audit.
            </p>
          </FadeInParagraph>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Link
            to="/register"
            className="btn-eterna-gradient inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium text-white shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <span>Start the audit</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={onScrollNext}
            className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-medium text-white hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer"
          >
            How it works
          </button>
        </motion.div>
      </div>

      {/* Explore indicator */}
      <motion.button
        style={{ opacity: exploreOpacity }}
        onClick={onScrollNext}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="absolute bottom-6 flex flex-col items-center gap-1.5 text-white/35 hover:text-white/70 transition-colors z-10 cursor-pointer"
        aria-label="Scroll to next section"
      >
        <span className="text-[11px] font-mono tracking-widest uppercase">Explore</span>
        <ArrowDown className="h-4 w-4 animate-bounce text-violet-400" />
      </motion.button>
    </section>
  );
}
