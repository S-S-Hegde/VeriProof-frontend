import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, HelpCircle, CheckCircle2, AlertOctagon } from "lucide-react";
import { ABOUT_COPY } from "../copy";
import { useDecodeText } from "../hooks/useDecodeText";
import TrustGauge3D from "../three/TrustGauge3D";

export default function S4_TrustScore({ isDark }) {
  const copy = ABOUT_COPY.s4_trustScore;
  const decodedEyebrow = useDecodeText(copy.eyebrow, true);

  // Interactive slider states
  const [tabs, setTabs] = useState(1);
  const [traps, setTraps] = useState(0);
  const [overconf, setOverconf] = useState(1);
  const [guessFlag, setGuessFlag] = useState(false);

  // Exact formula: 100 - (2.5 * min(tabs, 10) + 18 * traps + 5 * overconf + 10 * guess), clamped 0..100
  const tabPenalty = 2.5 * Math.min(tabs, 10);
  const trapPenalty = 18 * traps;
  const confPenalty = 5 * overconf;
  const guessPenalty = guessFlag ? 10 : 0;

  const totalDeduction = tabPenalty + trapPenalty + confPenalty + guessPenalty;
  const computedScore = Math.max(0, Math.min(100, Math.round(100 - totalDeduction)));

  return (
    <section
      data-about-section="4"
      id="section-trust-score"
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

      {/* Interactive Simulator Grid */}
      <div
        className={`p-6 sm:p-10 rounded-2xl border backdrop-blur-md shadow-2xl ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/90 border-slate-200"
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Controls Column (Sliders & Toggles) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>FORENSIC_TELEMETRY_SIMULATOR</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                LIVE_WEIGHT_CALIBRATION
              </span>
            </div>

            {/* Signal 1: Tab switches */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={isDark ? "text-slate-200" : "text-slate-800"}>
                  Tab switches (2.5 pts each, cap 10):
                </span>
                <span className="font-bold text-cyan-400">{tabs} switches (-{tabPenalty.toFixed(1)} pts)</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={tabs}
                onChange={(e) => setTabs(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Signal 2: Trap questions failed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={isDark ? "text-slate-200" : "text-slate-800"}>
                  Deceptive trap questions failed (18 pts each):
                </span>
                <span className="font-bold text-rose-400">{traps} failed (-{trapPenalty} pts)</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={traps}
                onChange={(e) => setTraps(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Signal 3: Overconfident wrong answers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={isDark ? "text-slate-200" : "text-slate-800"}>
                  Overconfident wrong answers (5 pts each):
                </span>
                <span className="font-bold text-amber-400">{overconf} wrong (-{confPenalty} pts)</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={overconf}
                onChange={(e) => setOverconf(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Signal 4: Guess detection flag */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className={`block font-mono text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Guess-detection flag (median speed &lt; 3s)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  -10 points deduction when answers are clicked unnaturally fast
                </span>
              </div>

              <button
                type="button"
                onClick={() => setGuessFlag(!guessFlag)}
                className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors ${
                  guessFlag
                    ? "bg-rose-500/20 border border-rose-500 text-rose-400"
                    : "bg-white/5 border border-white/10 text-slate-400"
                }`}
              >
                {guessFlag ? "FLAGGED (-10)" : "NORMAL (0)"}
              </button>
            </div>

            {/* Formula display */}
            <div
              className={`p-3 rounded-lg font-mono text-[11px] border ${
                isDark ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              FORMULA: <span className="text-cyan-400 font-bold">{copy.formulaText}</span>
            </div>
          </div>

          {/* Visual Gauge Column */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <TrustGauge3D score={computedScore} isDark={isDark} />

            <p className="text-[11px] font-mono text-slate-500 text-center max-w-xs mt-2">
              {copy.caption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
