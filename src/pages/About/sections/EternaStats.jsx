import React from "react";
import { motion } from "framer-motion";
import { WordSlideUp, FadeInParagraph } from "../components/WordReveal";

export default function EternaStats() {
  const stats = [
    {
      value: "18 to 22",
      label: "questions vs 30 in a fixed test",
    },
    {
      value: "about 33%",
      label: "less assessment fatigue",
    },
    {
      value: "10",
      label: "functional test cases passed",
    },
    {
      value: "4",
      label: "independent signals in the trust score",
    },
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      <div className="space-y-4 mb-16">
        <span className="eterna-pill-badge">
          Measured Results
        </span>
        <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white leading-tight">
          <WordSlideUp text="Calibrated testing efficiency." delay={0.1} />
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="eterna-value-letter-card p-6 flex flex-col justify-center items-center text-center space-y-2"
          >
            <div className="text-3xl sm:text-4xl font-normal text-white">
              {s.value}
            </div>
            <p className="text-xs sm:text-sm text-white/60 font-light">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-10">
        <p className="text-xs text-white/45 font-light italic max-w-xl mx-auto">
          Figures come from 100 simulated trials across four candidate cohorts. They are not a claim about live customer outcomes.
        </p>
      </div>
    </section>
  );
}
