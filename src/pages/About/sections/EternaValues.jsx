import React from "react";
import { motion } from "framer-motion";
import { WordSlideUp, FadeInParagraph } from "../components/WordReveal";

export default function EternaValues() {
  const principles = [
    {
      num: "01",
      title: "Evidence over assertion.",
      desc: "Real code, authentic commit histories, and demonstrable reasoning over claims on a paper resume.",
    },
    {
      num: "02",
      title: "Merit over marketing.",
      desc: "True technical skill stands on what is built, not on polished buzzwords or portfolio templates.",
    },
    {
      num: "03",
      title: "Signal over noise.",
      desc: "Deep algorithmic problem-solving and architectural trade-offs rather than trivia memorisation.",
    },
    {
      num: "04",
      title: "Integrity without surveillance.",
      desc: "In-browser telemetry and code analysis without invasive video feeds or screen capture.",
    },
  ];

  return (
    <section id="section-values" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
      <div className="space-y-4 mb-16">
        <span className="eterna-pill-badge">
          Core Principles
        </span>
        <h2 className="text-4xl sm:text-6xl font-normal tracking-tight text-white">
          <WordSlideUp text="Four Principles We Live By" delay={0.1} />
        </h2>
        <FadeInParagraph delay={0.22}>
          <p className="text-base text-white/50 font-light max-w-lg mx-auto leading-relaxed">
            Principles that guide every repository analysis, adaptive question, and trust verdict we compute.
          </p>
        </FadeInParagraph>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-5">
        {principles.map((p, i) => (
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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/08 bg-white/04 group-hover:border-violet-400/40 group-hover:bg-white/08 transition-all duration-300">
              <span className="text-xl font-mono text-violet-300 font-bold">
                {p.num}
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-normal tracking-tight text-white group-hover:text-violet-200 transition-colors">
                {p.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/55 font-light leading-relaxed">
                {p.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
