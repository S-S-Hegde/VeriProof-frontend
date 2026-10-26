import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, ShieldAlert, Cpu, Terminal } from "lucide-react";
import { ABOUT_COPY } from "../copy";
import { useDecodeText } from "../hooks/useDecodeText";

export default function S3_Purgatory({ isDark, scrollProgress = 0 }) {
  const copy = ABOUT_COPY.s3_purgatory;
  const decodedEyebrow = useDecodeText(copy.eyebrow, true);

  // Countdown timer simulation driven by scroll and tick
  const [secondsLeft, setSecondsLeft] = useState(600); // 10:00 default

  useEffect(() => {
    // Map scroll progress in S3 window (roughly 0.28 to 0.42)
    const normalized = Math.min(1, Math.max(0, (scrollProgress - 0.28) / 0.14));
    const calculatedSec = Math.max(0, Math.floor(600 * (1 - normalized)));
    setSecondsLeft(calculatedSec);
  }, [scrollProgress]);

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSeconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

  return (
    <section
      data-about-section="3"
      id="section-purgatory"
      className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-7xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Narrative */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-xs tracking-widest uppercase">
            <span>{decodedEyebrow}</span>
          </div>

          <h2
            className={`text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight mb-6 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {copy.headline}
          </h2>

          <p
            className={`text-base sm:text-lg font-light leading-relaxed mb-8 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {copy.copy}
          </p>

          {/* Telemetry Feature Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/80 border-slate-200"
              }`}
            >
              <Cpu className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="block font-mono text-xs font-bold text-cyan-400 uppercase">
                  ZERO_CONCEPTUAL_ITEMS
                </span>
                <span className="text-xs text-slate-500">
                  Phase 2 evaluates scenario debugging on candidate code.
                </span>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/80 border-slate-200"
              }`}
            >
              <Terminal className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="block font-mono text-xs font-bold text-amber-400 uppercase">
                  ADAPTIVE_TIMEOUT
                </span>
                <span className="text-xs text-slate-500">
                  Recruiter configurable holding state from 5 to 15 minutes.
                </span>
              </div>
            </div>
          </div>

          {/* Footnote Alert */}
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 font-mono text-xs ${
              isDark
                ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{copy.footnote}</span>
          </div>
        </div>

        {/* Right Column: High-Tech Purgatory Holding Telemetry Terminal */}
        <div className="lg:col-span-5">
          <div
            className={`p-8 rounded-2xl border backdrop-blur-md relative overflow-hidden shadow-2xl ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-white/95 border-slate-200"
            }`}
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 font-mono text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                HOLDING_STATE_ACTIVE
              </span>
              <span>CALIBRATED_DNA</span>
            </div>

            {/* Large Digital Mono Countdown */}
            <div className="text-center py-6">
              <span className="font-mono text-[11px] tracking-widest text-slate-500 uppercase block mb-1">
                SYNTHESIS_COUNTDOWN
              </span>
              <div className="font-mono text-6xl sm:text-7xl font-black tracking-tight text-amber-400">
                {formattedTime}
              </div>
            </div>

            {/* Analysis Engine Progress Line */}
            <div className="space-y-3 pt-4 border-t border-white/10 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>STAGE:</span>
                <span className="text-cyan-400 font-bold">{copy.engineStatus}</span>
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-amber-400"
                  style={{ width: `${Math.min(100, Math.max(15, (1 - secondsLeft / 600) * 100))}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                Parsing candidate repository ASTs &gt; injecting verified component boundaries &gt; generating scenario debug items.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
