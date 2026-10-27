import React from "react";
import { motion } from "framer-motion";

export default function EternaValues() {
  const values = [
    {
      letter: "T",
      title: "Truth powers our presence",
      desc: "Code never lies. Real commits and authentic authorship replace resume speculation.",
    },
    {
      letter: "R",
      title: "Rigor lights our path",
      desc: "AST inspection and tamper-evident telemetry ensure every technical verdict is defendable.",
    },
    {
      letter: "U",
      title: "Unity reflects our purpose",
      desc: "Aligning candidates, hiring managers, and recruiters on a single, trusted source of truth.",
    },
    {
      letter: "S",
      title: "Signal radiates our actions",
      desc: "Measuring deep engineering problem-solving rather than surveillance or trivia.",
    },
  ];

  return (
    <section id="section-values" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
      <div className="space-y-4 mb-16">
        <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">
          We are all One
        </h2>
        <p className="text-base text-white/45 font-light max-w-lg mx-auto">
          Four principles that guide every line of code and every hiring decision we make.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-5">
        {values.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            className="eterna-value-letter-card group flex-1 p-8 flex flex-col items-center text-center gap-5"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/08 bg-white/04 group-hover:border-violet-400/35 transition-all duration-300">
              <span
                className="text-5xl font-light"
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
              <h3 className="text-lg sm:text-xl font-medium tracking-tight text-white">
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
