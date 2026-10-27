import React, { useState } from "react";
import { motion } from "framer-motion";

/**
 * Card 1 Art: Concentric contour lines like orbits with a bright dot
 * traveling along one line and a soft light at the top.
 */
function VerifyCodeArt({ mouseOffset, isHovered }) {
  return (
    <div
      className="w-full h-48 flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out"
      style={{
        transform: `translate3d(${mouseOffset.x * 8}px, ${mouseOffset.y * 8}px, 0)`,
      }}
    >
      <svg viewBox="0 0 340 200" fill="none" className="w-full h-full max-w-[300px]" aria-label="Verify the code orbit art">
        <defs>
          <radialGradient id="topSoftLight" cx="50%" cy="10%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>

        {/* Soft light at the top */}
        <ellipse cx="170" cy="20" rx="90" ry="24" fill="url(#topSoftLight)" />

        {/* Concentric contour orbit lines */}
        {[30, 52, 74, 96].map((ry, i) => (
          <motion.ellipse
            key={i}
            cx="170"
            cy="110"
            rx={ry * 1.7}
            ry={ry}
            stroke="#8b5cf6"
            strokeWidth="1.2"
            strokeOpacity={0.22 + i * 0.08}
            animate={{
              scale: isHovered ? [1, 1.04, 1] : 1,
              rotate: isHovered ? [0, i % 2 === 0 ? 3 : -3, 0] : 0,
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          />
        ))}

        {/* Traveling bright dot along orbit */}
        <motion.circle
          r="4.5"
          fill="#ffffff"
          filter="url(#softGlow)"
          animate={{
            cx: [170 - 74 * 1.7, 170, 170 + 74 * 1.7, 170, 170 - 74 * 1.7],
            cy: [110, 110 - 74, 110, 110 + 74, 110],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.circle
          r="2.5"
          fill="#fcd34d"
          animate={{
            cx: [170 - 74 * 1.7, 170, 170 + 74 * 1.7, 170, 170 - 74 * 1.7],
            cy: [110, 110 - 74, 110, 110 + 74, 110],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </svg>
    </div>
  );
}

/**
 * Card 2 Art: Straight lines fanning out from a convergence point,
 * two soft orbs, a dot at the point.
 */
function TestBuiltArt({ mouseOffset, isHovered }) {
  const angles = [-65, -45, -25, -10, 10, 25, 45, 65];

  return (
    <div
      className="w-full h-48 flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out"
      style={{
        transform: `translate3d(${mouseOffset.x * 9}px, ${mouseOffset.y * 9}px, 0)`,
      }}
    >
      <svg viewBox="0 0 340 200" fill="none" className="w-full h-full max-w-[300px]" aria-label="Test what they built convergence art">
        <defs>
          <filter id="orbBlur" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" />
          </filter>
        </defs>

        {/* Two soft orbs drifting */}
        <motion.circle
          cx="95"
          cy="60"
          r="32"
          fill="#3b82f6"
          opacity="0.32"
          filter="url(#orbBlur)"
          animate={{
            cx: isHovered ? [95, 110, 95] : [95, 88, 95],
            cy: isHovered ? [60, 48, 60] : [60, 68, 60],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="245"
          cy="75"
          r="35"
          fill="#a855f7"
          opacity="0.30"
          filter="url(#orbBlur)"
          animate={{
            cx: isHovered ? [245, 230, 245] : [245, 252, 245],
            cy: isHovered ? [75, 88, 75] : [75, 65, 75],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Fanning straight lines from convergence point (170, 165) */}
        {angles.map((ang, i) => {
          const rad = (ang * Math.PI) / 180;
          const length = 135;
          const x2 = 170 + Math.sin(rad) * length;
          const y2 = 165 - Math.cos(rad) * length;

          return (
            <motion.line
              key={i}
              x1="170"
              y1="165"
              x2={x2}
              y2={y2}
              stroke="#818cf8"
              strokeWidth="1.2"
              strokeOpacity={0.25 + i * 0.05}
              animate={{
                rotate: isHovered ? (i % 2 === 0 ? 3 : -3) : 0,
              }}
              style={{ transformOrigin: "170px 165px" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          );
        })}

        {/* Convergence point dot */}
        <circle cx="170" cy="165" r="5" fill="#ffffff" />
        <circle cx="170" cy="165" r="9" stroke="#60a5fa" strokeWidth="1.5" opacity="0.6" />
      </svg>
    </div>
  );
}

/**
 * Card 3 Art: Flowing parallel curves that settle into calm,
 * with dots moving along them.
 */
function ScoreTrustArt({ mouseOffset, isHovered }) {
  return (
    <div
      className="w-full h-48 flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out"
      style={{
        transform: `translate3d(${mouseOffset.x * 8}px, ${mouseOffset.y * 8}px, 0)`,
      }}
    >
      <svg viewBox="0 0 340 200" fill="none" className="w-full h-full max-w-[300px]" aria-label="Score the trust wave art">
        {/* Parallel wavy curves settling into calm */}
        {[0, 18, 36, 54].map((offsetY, i) => (
          <motion.path
            key={i}
            d={
              isHovered
                ? `M 20 ${65 + offsetY} Q 100 ${55 + offsetY}, 170 ${65 + offsetY} T 320 ${65 + offsetY}`
                : `M 20 ${60 + offsetY} Q 100 ${45 + offsetY}, 170 ${75 + offsetY} T 320 ${65 + offsetY}`
            }
            stroke="#a78bfa"
            strokeWidth="1.3"
            strokeOpacity={0.24 + i * 0.08}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
        ))}

        {/* Moving dots along calm horizontal streams */}
        <motion.circle
          r="4"
          fill="#38bdf8"
          animate={{
            cx: [30, 170, 310],
            cy: [75, 82, 80],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          r="3"
          fill="#f59e0b"
          animate={{
            cx: [290, 150, 40],
            cy: [95, 100, 92],
          }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          r="4"
          fill="#ffffff"
          animate={{
            cx: [40, 180, 300],
            cy: [115, 118, 112],
          }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

export default function OneEvidencePipeline() {
  const cards = [
    {
      id: "verify",
      title: "Verify the code",
      desc: "Every repository is traced to its commits: who wrote them, how much, and whether the history was pushed in minutes.",
      renderArt: (offset, hovered) => <VerifyCodeArt mouseOffset={offset} isHovered={hovered} />,
    },
    {
      id: "test",
      title: "Test what they built",
      desc: "A two-phase adaptive exam. The second round is generated from the candidate's own code.",
      renderArt: (offset, hovered) => <TestBuiltArt mouseOffset={offset} isHovered={hovered} />,
    },
    {
      id: "score",
      title: "Score the trust",
      desc: "Evidence and behaviour combine into one 0 to 100 trust score, with the reasons shown.",
      renderArt: (offset, hovered) => <ScoreTrustArt mouseOffset={offset} isHovered={hovered} />,
    },
  ];

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Eyebrow & Heading */}
      <div className="text-center space-y-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <span className="eterna-pill-badge">What we do</span>
        </motion.div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white">
          One Evidence Pipeline
        </h2>
      </div>

      {/* 3 Equal Cards with Line Art Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {cards.map((card, idx) => (
          <PipelineCard key={card.id} card={card} index={idx} />
        ))}
      </div>
    </section>
  );
}

function PipelineCard({ card, index }) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.14, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="eterna-pipeline-card flex flex-col justify-between p-7 sm:p-8 cursor-default group"
    >
      {/* Top Line Art Panel */}
      <div className="rounded-2xl bg-black/20 border border-white/5 p-2 mb-6">
        {card.renderArt(mouseOffset, isHovered)}
      </div>

      {/* Bottom Text Content */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xl sm:text-2xl font-normal tracking-tight text-white group-hover:text-violet-200 transition-colors">
          {card.title}
        </h3>
        <p className="text-sm text-white/65 font-light leading-relaxed">
          {card.desc}
        </p>
      </div>
    </motion.div>
  );
}
