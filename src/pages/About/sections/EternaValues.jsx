import React from "react";
import { motion } from "framer-motion";
import { WordSlideUp, FadeInParagraph } from "../components/WordReveal";

export default function EternaValues() {
  const values = [
    {
      letter: "T",
      title: "Truth powers our protocol",
      desc: "Code never lies. Real cryptographic commits and authentic git authorship replace speculative claims.",
    },
    {
      letter: "R",
      title: "Rigor lights our audits",
      desc: "Abstract Syntax Tree inspection and bytecode telemetry ensure every technical verdict is defendable.",
    },
    {
      letter: "U",
      title: "Unity connects our mesh",
      desc: "Aligning developers, student engineers, and technical evaluators on a single zero-knowledge source of truth.",
    },
    {
      letter: "E",
      title: "Evidence radiates our actions",
      desc: "Measuring deep algorithmic problem-solving, architectural depth, and real proof of work.",
    },
  ];

  return (
    <section id="section-values" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
      <div className="space-y-4 mb-16">
        <h2 className="text-4xl sm:text-6xl font-normal tracking-tight text-white">
          <WordSlideUp text="We are all One" delay={0.1} />
        </h2>
        <FadeInParagraph delay={0.22}>
          <p className="text-base text-white/50 font-light max-w-lg mx-auto leading-relaxed">
            Four foundational principles that govern every verification pipeline and cryptographic metric we compute.
          </p>
        </FadeInParagraph>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-5">
        {values.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.7,
              delay: i * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -6 }}
            className="eterna-value-letter-card group flex-1 p-8 flex flex-col items-center text-center gap-5 cursor-default"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/08 bg-white/04 group-hover:border-violet-400/40 group-hover:bg-white/08 transition-all duration-300">
              <span
                className="text-5xl font-light select-none"
                style={{
                  background: "linear-gradient(90deg, #60A5FA 0%, #A78BFA 48%, #F59E0B 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {v.letter}
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-normal tracking-tight text-white group-hover:text-violet-200 transition-colors">
                {v.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/55 font-light leading-relaxed">
                {v.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
