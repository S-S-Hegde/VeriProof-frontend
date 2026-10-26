import React from "react";
import { motion } from "framer-motion";

/**
 * TrustGauge3D
 * Section 4: Forensic Trust Score Live Gauge Visualizer
 * Accurately maps 0..100 score to a 240-degree sweeping dial with high-tech color bands:
 * - >= 75: Trusted (Cyan / Emerald)
 * - 50..74: Review (Amber)
 * - < 50: High Risk (Red)
 */
export default function TrustGauge3D({ score = 100, isDark = true }) {
  // Score clamped 0..100
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));

  // Gauge angle range: -120 deg to +120 deg (240 deg span)
  const needleAngle = -120 + (clampedScore / 100) * 240;

  // Determine active tier and color
  const statusTier =
    clampedScore >= 75
      ? { label: "TRUSTED_SIGNAL", color: "#00d4ff", textClass: "text-cyan-400" }
      : clampedScore >= 50
      ? { label: "MANUAL_REVIEW", color: "#f59e0b", textClass: "text-amber-400" }
      : { label: "HIGH_RISK_ANOMALY", color: "#ef4444", textClass: "text-rose-500" };

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-[4/3] mx-auto flex flex-col items-center justify-center p-4">
      {/* High-Tech Precision Gauge SVG */}
      <svg viewBox="0 0 300 220" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="75%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Tick Ring */}
        {Array.from({ length: 25 }).map((_, i) => {
          const angle = -120 + (i / 24) * 240;
          const rad = (angle * Math.PI) / 180;
          const x1 = 150 + Math.cos(rad) * 98;
          const y1 = 135 + Math.sin(rad) * 98;
          const x2 = 150 + Math.cos(rad) * (i % 6 === 0 ? 84 : 91);
          const y2 = 135 + Math.sin(rad) * (i % 6 === 0 ? 84 : 91);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isDark ? (i % 6 === 0 ? "#64748b" : "#334155") : (i % 6 === 0 ? "#94a3b8" : "#cbd5e1")}
              strokeWidth={i % 6 === 0 ? 2 : 1}
            />
          );
        })}

        {/* Background Track Arc */}
        <path
          d="M 50 135 A 100 100 0 1 1 250 135"
          fill="none"
          stroke={isDark ? "#1e293b" : "#e2e8f0"}
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Active Value Arc */}
        <path
          d="M 50 135 A 100 100 0 1 1 250 135"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="10"
          strokeDasharray="314"
          strokeDashoffset={314 - (clampedScore / 100) * 314}
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
          className="transition-all duration-300 ease-out"
        />

        {/* Needle */}
        <g transform={`translate(150, 135) rotate(${needleAngle})`} className="transition-transform duration-300 ease-out">
          <polygon points="-3,-10 0,-92 3,-10" fill={statusTier.color} filter="url(#gaugeGlow)" />
          <circle cx="0" cy="0" r="8" fill={isDark ? "#0f172a" : "#ffffff"} stroke={statusTier.color} strokeWidth="3" />
        </g>

        {/* Range Labels */}
        <text x="35" y="165" fill="#ef4444" fontSize="10" fontFamily="monospace" textAnchor="middle">0</text>
        <text x="95" y="60" fill="#f59e0b" fontSize="10" fontFamily="monospace" textAnchor="middle">50</text>
        <text x="205" y="60" fill="#00d4ff" fontSize="10" fontFamily="monospace" textAnchor="middle">75</text>
        <text x="265" y="165" fill="#10b981" fontSize="10" fontFamily="monospace" textAnchor="middle">100</text>
      </svg>

      {/* Digital Score Display */}
      <div className="text-center -mt-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-4xl sm:text-5xl font-mono font-black tracking-tight ${statusTier.textClass}`}>
            {clampedScore}
          </span>
          <span className="text-xs font-mono text-slate-500">/100</span>
        </div>

        <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-white/10 bg-white/5 font-mono text-[10px] tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusTier.color }} />
          <span className={statusTier.textClass}>{statusTier.label}</span>
        </div>
      </div>
    </div>
  );
}
