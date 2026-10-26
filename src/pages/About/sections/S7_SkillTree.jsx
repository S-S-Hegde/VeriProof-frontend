import React from "react";
import { motion } from "framer-motion";
import { Layers, Sparkles, Award } from "lucide-react";
import { ABOUT_COPY } from "../copy";
import { useDecodeText } from "../hooks/useDecodeText";

export default function S7_SkillTree({ isDark, hoveredSkillNode }) {
  const copy = ABOUT_COPY.s7_skillTree;
  const decodedEyebrow = useDecodeText(copy.eyebrow, true);

  return (
    <section
      data-about-section="7"
      id="section-skill-tree"
      className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-7xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Narrative & Tiers */}
        <div className="lg:col-span-7">
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

          {/* 3 Tier Pills */}
          <div className="space-y-3 mb-8">
            {copy.tiers.map((tier, idx) => (
              <div
                key={tier.name}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/80 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    TIER_0{idx + 1}
                  </span>
                  <span className={`text-sm font-bold uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                    {tier.name}
                  </span>
                </div>
                <span className="text-xs text-slate-500 max-w-xs text-right">
                  {tier.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Node Inspector Panel */}
        <div className="lg:col-span-5">
          <div
            className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-md shadow-2xl relative overflow-hidden ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-white/95 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-6 font-mono text-xs text-slate-500">
              <span className="flex items-center gap-2 text-cyan-400 font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>DYNAMIC_DAG_INSPECTOR</span>
              </span>
              <span>25_ACTIVE_NODES</span>
            </div>

            {hoveredSkillNode ? (
              <motion.div
                key={hoveredSkillNode.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div>
                  <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-widest block mb-1">
                    VERIFIED_COMPETENCY_NODE
                  </span>
                  <h4 className={`text-2xl font-bold uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                    {hoveredSkillNode.name}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-2">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-slate-500 block text-[10px]">EVIDENCE_ORIGIN</span>
                    <span className="text-cyan-400 font-bold">{hoveredSkillNode.type} Verification</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-slate-500 block text-[10px]">TIER_LEVEL</span>
                    <span className="text-indigo-400 font-bold">{hoveredSkillNode.tier}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Unlocked by verified repository AST contribution</span>
                </div>
              </motion.div>
            ) : (
              <div className="py-8 text-center space-y-3 font-mono text-xs text-slate-500">
                <Sparkles className="w-8 h-8 text-cyan-400/60 mx-auto animate-pulse" />
                <p>Drag or hover over the 3D orbitable Skill Tree nodes to inspect verified evidence origins.</p>
                <span className="inline-block px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] uppercase">
                  AUTO_ROTATION: ACTIVE
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
