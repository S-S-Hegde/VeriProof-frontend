import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, ShieldCheck, RefreshCw } from "lucide-react";
import { ABOUT_COPY } from "../copy";
import { useDecodeText } from "../hooks/useDecodeText";

export default function S5_QuestionQuality({ isDark }) {
  const copy = ABOUT_COPY.s5_questionQuality;
  const decodedEyebrow = useDecodeText(copy.eyebrow, true);

  const [isGated, setIsGated] = useState(false);

  // Auto toggle between raw tell state and gated parity state
  useEffect(() => {
    const timer = setInterval(() => {
      setIsGated((prev) => !prev);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      data-about-section="5"
      id="section-question-quality"
      className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-7xl mx-auto z-10"
    >
      {/* Header */}
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs tracking-widest uppercase">
          <span>{decodedEyebrow}</span>
        </div>

        <h2
          className={`text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight mb-4 ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {copy.headline}
        </h2>

        <p
          className={`text-base sm:text-lg font-light leading-relaxed ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {copy.copy}
        </p>
      </div>

      {/* 3 Horizontal Pipeline Passes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {copy.passes.map((pass) => (
          <div
            key={pass.step}
            className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
              isDark
                ? "bg-slate-900/60 border-slate-800"
                : "bg-white/80 border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold text-cyan-400">
                PASS_{pass.step}
              </span>
              <ShieldCheck className="w-4 h-4 text-slate-500" />
            </div>

            <h3
              className={`text-lg font-bold uppercase tracking-tight mb-2 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {pass.title}
            </h3>

            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {pass.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Interactive Quality Gate Comparison Visualizer */}
      <div
        className={`p-6 sm:p-10 rounded-2xl border backdrop-blur-md relative overflow-hidden ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/90 border-slate-200 shadow-xl"
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 font-mono text-xs">
          <span className="text-cyan-400 font-bold flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isGated ? "rotate-180" : ""} transition-transform duration-500`} />
            <span>STATE: {isGated ? "GATE_ENFORCED (PARITY 100%)" : "RAW_AI_OUTPUT (UNBALANCED TELLS)"}</span>
          </span>
          <button
            onClick={() => setIsGated(!isGated)}
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors uppercase underline"
          >
            Toggle State
          </button>
        </div>

        {/* 4 Option Bars Morphing Animation */}
        <div className="space-y-4">
          {[
            {
              id: "A",
              rawText: "Restart the server and clear memory.",
              gatedText: "Evict stalled worker subprocesses, rebind socket listener, and drain TCP buffer queues.",
              rawWidth: "45%",
              gatedWidth: "92%",
            },
            {
              id: "B",
              rawText: "It might possibly be an issue related to memory allocation.",
              gatedText: "Isolate memory heap leak in worker pool, profile garbage collector spikes, and log dumps.",
              rawWidth: "60%",
              gatedWidth: "90%",
            },
            {
              id: "C", // The tellingly long correct answer in naive LLM questions
              rawText: "Profile node event loop lag, check heap allocation telemetry, drain incoming sockets, and gracefully restart worker pool with zero downtime.",
              gatedText: "Profile event loop lag thresholds, decouple persistent sockets, and cycle cluster workers.",
              rawWidth: "98%",
              gatedWidth: "94%",
              isCorrect: true,
            },
            {
              id: "D",
              rawText: "Delete the database.",
              gatedText: "Throttle database connection pools, retry idempotent transactions, and drop stale locks.",
              rawWidth: "28%",
              gatedWidth: "91%",
            },
          ].map((opt) => (
            <div key={opt.id} className="space-y-1">
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                <span>OPTION [{opt.id}]</span>
                <span className={opt.isCorrect && isGated ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {isGated ? "15% LENGTH PARITY" : "TELL DETECTED"}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all duration-700 ${
                  isGated
                    ? opt.isCorrect
                      ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                      : "bg-cyan-950/20 border-cyan-500/30 text-slate-300"
                    : opt.isCorrect
                    ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                    : "bg-white/5 border-white/10 text-slate-400"
                }`}
              >
                <motion.div
                  layout
                  className="font-mono text-xs sm:text-sm truncate"
                  style={{ width: isGated ? opt.gatedWidth : opt.rawWidth }}
                >
                  {isGated ? opt.gatedText : opt.rawText}
                </motion.div>

                {isGated ? (
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
