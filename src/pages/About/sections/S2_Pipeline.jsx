import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Clock, FileCode2, GitMerge, BrainCircuit, Award } from "lucide-react";
import { ABOUT_COPY } from "../copy";
import { useDecodeText } from "../hooks/useDecodeText";

export default function S2_Pipeline({ isDark, isMobile, scrollProgress = 0 }) {
  const copy = ABOUT_COPY.s2_pipeline;
  const decodedEyebrow = useDecodeText(copy.eyebrow, true);

  const [activeStationIndex, setActiveStationIndex] = useState(0);

  const icons = [GitBranch, Clock, FileCode2, GitMerge, BrainCircuit, Award];

  // Map scroll progress in S2 to active station (0 to 5)
  useEffect(() => {
    // If inside S2 window
    const stationIdx = Math.min(
      5,
      Math.max(0, Math.floor(((scrollProgress - 0.16) / 0.28) * 6))
    );
    setActiveStationIndex(stationIdx);
  }, [scrollProgress]);

  const activeStation = copy.stations[activeStationIndex] || copy.stations[0];
  const ActiveIcon = icons[activeStationIndex] || GitBranch;

  return (
    <section
      data-about-section="2"
      id="section-pipeline"
      className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-7xl mx-auto z-10"
    >
      {/* Section Header */}
      <div className="max-w-3xl mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs tracking-widest uppercase">
          <span>{decodedEyebrow}</span>
        </div>

        <h2
          className={`text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight mb-4 ${
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
          {copy.sub}
        </p>
      </div>

      {/* Desktop Sticky Rail Interface */}
      {!isMobile ? (
        <div className="grid grid-cols-12 gap-8 items-start min-h-[520px]">
          {/* Vertical Mono Progress Rail (01 to 06) */}
          <div className="col-span-4 flex flex-col gap-3">
            {copy.stations.map((station, index) => {
              const isActive = index === activeStationIndex;
              const Icon = icons[index];

              return (
                <button
                  key={station.num}
                  onClick={() => setActiveStationIndex(index)}
                  className={`text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                    isActive
                      ? isDark
                        ? "bg-slate-900/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10"
                        : "bg-white border-cyan-500 shadow-md shadow-cyan-500/10"
                      : isDark
                      ? "bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-500"
                      : "bg-white/40 border-slate-200 hover:border-slate-300 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isActive ? "text-cyan-400" : "text-slate-600"
                      }`}
                    >
                      {station.num}
                    </span>
                    <span
                      className={`text-sm font-bold tracking-tight uppercase ${
                        isActive
                          ? isDark
                            ? "text-white"
                            : "text-slate-900"
                          : "text-slate-400 group-hover:text-slate-300"
                      }`}
                    >
                      {station.title}
                    </span>
                  </div>

                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-cyan-400" : "text-slate-600 group-hover:text-slate-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Active Station Detail Spotlight */}
          <div className="col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStation.num}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={`p-8 sm:p-12 rounded-2xl border backdrop-blur-md relative overflow-hidden ${
                  isDark
                    ? "bg-slate-900/80 border-slate-800 shadow-2xl"
                    : "bg-white/90 border-slate-200 shadow-xl"
                }`}
              >
                {/* Station Tag & Icon */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <ActiveIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider block">
                        CHECKPOINT_{activeStation.num}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {activeStation.detail}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-3xl font-black text-slate-700 select-none">
                    {activeStation.num}
                  </span>
                </div>

                <h3
                  className={`text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {activeStation.title}
                </h3>

                <p
                  className={`text-base sm:text-lg leading-relaxed mb-8 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {activeStation.copy}
                </p>

                {/* Forensic Station Telemetry Footer */}
                <div
                  className={`pt-6 border-t font-mono text-xs flex flex-wrap items-center justify-between gap-4 ${
                    isDark
                      ? "border-slate-800 text-slate-400"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    VERIFICATION_PROTOCOL: ENFORCED
                  </span>
                  <span className="text-cyan-400 font-bold">
                    STEP {activeStationIndex + 1} OF 6
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* Mobile Stacked Step List */
        <div className="space-y-4">
          {copy.stations.map((st, idx) => {
            const Icon = icons[idx] || GitBranch;

            return (
              <div
                key={st.num}
                className={`p-6 rounded-xl border ${
                  isDark
                    ? "bg-slate-900/70 border-slate-800"
                    : "bg-white/90 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      [{st.num}]
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 uppercase">
                    FORENSIC_STAGE
                  </span>
                </div>

                <h3
                  className={`text-lg font-bold uppercase tracking-tight mb-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {st.title}
                </h3>

                <p
                  className={`text-xs leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {st.copy}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
