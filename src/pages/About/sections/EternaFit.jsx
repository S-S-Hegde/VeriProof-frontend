import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { WordSlideUp, FadeInParagraph } from "../components/WordReveal";

export default function EternaFit({ onOpenJoinModal }) {
  const points = [
    "Have a relentless drive to understand how software systems function down to the AST.",
    "Truly put craftsmanship, security, and elegance into every repository you build.",
    "Believe that demonstrable code evidence is infinitely more valuable than polished resumes.",
    "Hold your code, your commits, and the systems you build to rigorous cryptographic standards.",
    "Appreciate zero-knowledge proofs, compiler pipelines, and honest technical peer audit.",
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div
        className="p-8 sm:p-14 overflow-hidden relative rounded-3xl"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 100%, #2a2245, #141026 85%)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Subtle ambient glow */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)" }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex"
            >
              <span className="eterna-pill-badge">
                <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                Our Fit
              </span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white leading-tight">
              <WordSlideUp text="Experience engineering evaluation" delay={0.1} />
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #60A5FA 0%, #A78BFA 48%, #F59E0B 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <WordSlideUp text="in a new way." delay={0.25} />
              </span>
            </h2>

            <FadeInParagraph delay={0.35}>
              <p className="text-sm text-white/60 font-light leading-relaxed">
                We look for engineers who are driven by curiosity, cryptographic rigor, and genuine craft.
              </p>
            </FadeInParagraph>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button
                onClick={onOpenJoinModal}
                className="btn-eterna-gradient inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-sm font-medium text-white shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <span>Verify your portfolio</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </div>

          {/* Right Column: Checklist */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-normal text-white/90 mb-4">Sound like you?</h3>
            <div className="space-y-3">
              {points.map((pt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.09, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl transition-all duration-300 hover:border-violet-500/30 hover:bg-white/04"
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5"
                    style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA" }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm text-white/75 font-light leading-relaxed">{pt}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
