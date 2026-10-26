import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, FileSpreadsheet, Filter, CheckCircle2, Award } from "lucide-react";
import { ABOUT_COPY } from "../copy";
import { useDecodeText } from "../hooks/useDecodeText";

export default function S8_RecruiterHub({ isDark }) {
  const copy = ABOUT_COPY.s8_recruiterHub;
  const decodedEyebrow = useDecodeText(copy.eyebrow, true);

  const [selectedPolicy, setSelectedPolicy] = useState("Startup (Speed & Ownership)");

  // Mock ranked candidates whose order / weights adjust to selected policy
  const candidates = [
    { rank: "01", name: "Alex V.", score: 96, percentile: 99, match: "Strong Hire", exp: "React + Go AST (42 commits)", color: "text-emerald-400" },
    { rank: "02", name: "Priya S.", score: 91, percentile: 94, match: "Hire", exp: "Distributed Cache + Python Engine", color: "text-cyan-400" },
    { rank: "03", name: "Marcus L.", score: 84, percentile: 86, match: "Hire", exp: "Full Stack MERN Architecture", color: "text-cyan-400" },
    { rank: "04", name: "Devon K.", score: 68, percentile: 71, match: "Borderline", exp: "Starter Repo (Authorship 34%)", color: "text-amber-400" },
  ];

  return (
    <section
      data-about-section="8"
      id="section-recruiter-hub"
      className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-7xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Narrative & Policy Selector */}
        <div className="lg:col-span-6">
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
            className={`text-base sm:text-lg font-light leading-relaxed mb-8 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {copy.copy}
          </p>

          {/* Hiring Policy Pills */}
          <div className="space-y-2 mb-8">
            <span className="font-mono text-xs text-slate-500 uppercase tracking-wider block mb-1">
              SELECT_HIRING_POLICY:
            </span>
            <div className="flex flex-wrap gap-2">
              {copy.policies.map((pol) => {
                const isSelected = selectedPolicy === pol;
                return (
                  <button
                    key={pol}
                    onClick={() => setSelectedPolicy(pol)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-cyan-500/20 border border-cyan-500 text-cyan-400"
                        : isDark
                        ? "bg-slate-900/60 border border-slate-800 text-slate-400 hover:border-slate-700"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {pol}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Tilted CSS 3D Leaderboard Panel */}
        <div className="lg:col-span-6" style={{ perspective: "1000px" }}>
          <motion.div
            initial={{ opacity: 0, rotateY: 10, rotateX: 6, y: 30 }}
            whileInView={{ opacity: 1, rotateY: 0, rotateX: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`p-6 sm:p-8 rounded-2xl border shadow-2xl backdrop-blur-md transform transition-transform duration-500 hover:rotate-0 ${
              isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/95 border-slate-200"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 font-mono text-xs text-slate-500">
              <span className="flex items-center gap-2 text-cyan-400 font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>DECISION_RANKING_HUB</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <FileSpreadsheet className="w-3.5 h-3.5" /> DOSSIER_READY
              </span>
            </div>

            {/* Candidate Leaderboard Rows */}
            <div className="space-y-3">
              {candidates.map((cand) => (
                <div
                  key={cand.rank}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    isDark ? "bg-slate-950/60 border-slate-800/80 hover:border-cyan-500/40" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      #{cand.rank}
                    </span>
                    <div>
                      <h4 className={`text-sm font-bold uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                        {cand.name}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500 block">
                        {cand.exp}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-mono text-xs font-bold ${cand.color}`}>
                        [{cand.match}]
                      </span>
                      <span className="font-mono text-sm font-black text-cyan-400">
                        {cand.score}
                      </span>
                    </div>
                    {/* Percentile bar */}
                    <div className="w-20 bg-slate-800 h-1 rounded-full mt-1.5 ml-auto overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full"
                        style={{ width: `${cand.percentile}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between font-mono text-[11px] text-slate-500">
              <span>WEIGHTED_POLICY: {selectedPolicy.split(" ")[0]}</span>
              <span className="text-cyan-400 font-bold">4 APPLICANTS EVALUATED</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
