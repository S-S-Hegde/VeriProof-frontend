import React, { useState } from "react";
import { motion } from "framer-motion";
import { CircleDot } from "lucide-react";

export default function EternaValues() {
  const values = [
    {
      letter: "T",
      title: "Truth powers our presence",
      desc: "Code never lies. Real commits and authentic authorship replace resume speculation."
    },
    {
      letter: "R",
      title: "Rigor lights our path",
      desc: "AST inspection and tamper-evident telemetry ensure every technical verdict is defendable."
    },
    {
      letter: "U",
      title: "Unity reflects our purpose",
      desc: "Aligning candidates, hiring managers, and recruiters on a single, trusted source of truth."
    },
    {
      letter: "S",
      title: "Signal radiates our actions",
      desc: "Measuring deep engineering problem-solving rather than surveillance or trivia."
    }
  ];

  return (
    <section id="section-values" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
      {/* Header */}
      <div className="space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <CircleDot className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-xs font-medium tracking-wide text-white/80">Our Core Values</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-medium tracking-tight text-white">
          We are all One
        </h2>
      </div>

      {/* 4 Sleek Horizontal Letter Cards (T • R • U • S) */}
      <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-6">
        {values.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            className="group flex-1 rounded-3xl border border-white/10 bg-[#161226]/80 p-8 backdrop-blur-xl transition-all duration-300 hover:border-purple-400/50 hover:bg-[#1e1834] flex flex-col items-center text-center justify-between"
          >
            {/* Top Luminous Letter */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-purple-400/40 group-hover:scale-105 transition-all duration-300">
              <span className="text-5xl font-light tracking-tight text-gradient-eterna">
                {v.letter}
              </span>
            </div>

            {/* Bottom Statement */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-medium tracking-tight text-white">
                {v.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
                {v.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
