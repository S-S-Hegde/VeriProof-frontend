import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function EternaOffer() {
  const cards = [
    {
      title: "Delivering seamless verification",
      desc: "Make it effortless. We transform complex candidate evaluation into verifiable, tamper-evident certainty.",
      svg: (
        <svg viewBox="0 0 400 240" fill="none" className="w-full h-36 opacity-75 group-hover:opacity-100 transition-opacity">
          <ellipse cx="200" cy="120" rx="140" ry="60" stroke="#AC24FF" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <ellipse cx="200" cy="120" rx="180" ry="90" stroke="#1B4DFE" strokeWidth="1.2" opacity="0.6" />
          <ellipse cx="200" cy="120" rx="90" ry="40" stroke="#FE881B" strokeWidth="1" opacity="0.5" />
          <circle cx="90" cy="110" r="5" fill="#FFFFFF" filter="drop-shadow(0 0 8px #AC24FF)" />
          <circle cx="280" cy="150" r="4" fill="#00D4FF" filter="drop-shadow(0 0 6px #00D4FF)" />
          <circle cx="200" cy="60" r="6" fill="#FFFFFF" filter="drop-shadow(0 0 10px #FFFFFF)" />
        </svg>
      )
    },
    {
      title: "Orchestrating forensic frameworks",
      desc: "Keep it rigorous. GitHub commit history, AST analysis, and AI question defenses that transcend resume fluff.",
      svg: (
        <svg viewBox="0 0 400 240" fill="none" className="w-full h-36 opacity-75 group-hover:opacity-100 transition-opacity">
          {[-60, -40, -20, 0, 20, 40, 60].map((deg, i) => (
            <line
              key={i}
              x1="200"
              y1="230"
              x2={200 + Math.sin((deg * Math.PI) / 180) * 190}
              y2={230 - Math.cos((deg * Math.PI) / 180) * 190}
              stroke="#AC24FF"
              strokeWidth="1.2"
              opacity={0.3 + i * 0.08}
            />
          ))}
          <circle cx="200" cy="40" r="5" fill="#FFFFFF" filter="drop-shadow(0 0 8px #FFFFFF)" />
          <circle cx="120" cy="90" r="4" fill="#FE881B" filter="drop-shadow(0 0 6px #FE881B)" />
          <circle cx="270" cy="85" r="4.5" fill="#00D4FF" filter="drop-shadow(0 0 7px #00D4FF)" />
        </svg>
      )
    },
    {
      title: "Compounding hiring gains",
      desc: "Do right by people. Objective evidence that eliminates keyword bias and uncovers exceptional builders.",
      svg: (
        <svg viewBox="0 0 400 240" fill="none" className="w-full h-36 opacity-75 group-hover:opacity-100 transition-opacity">
          <path d="M40 70 C 140 70, 180 140, 360 140" stroke="#1B4DFE" strokeWidth="1.2" opacity="0.6" />
          <path d="M40 120 C 160 120, 220 140, 360 140" stroke="#AC24FF" strokeWidth="1.2" opacity="0.7" />
          <path d="M40 180 C 180 180, 240 140, 360 140" stroke="#FE881B" strokeWidth="1.2" opacity="0.6" />
          <circle cx="360" cy="140" r="7" fill="#FFFFFF" filter="drop-shadow(0 0 10px #AC24FF)" />
          <circle cx="100" cy="70" r="4" fill="#00D4FF" filter="drop-shadow(0 0 6px #00D4FF)" />
          <circle cx="280" cy="140" r="4" fill="#FFD600" filter="drop-shadow(0 0 6px #FFD600)" />
        </svg>
      )
    }
  ];

  return (
    <section id="section-offer" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Eyebrow & Headline */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-xs font-medium tracking-wide text-white/80">We Offer</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white">
          One Adaptive Platform
        </h2>
      </div>

      {/* Fluid Horizontal Cards Container */}
      <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 sm:gap-8">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: idx * 0.15 }}
            className="group flex-1 glass-eterna-card p-8 sm:p-10 flex flex-col justify-between overflow-hidden relative"
          >
            {/* Top Vector Graphics */}
            <div className="mb-6 -mx-4 flex items-center justify-center">
              {card.svg}
            </div>

            {/* Bottom Content */}
            <div className="space-y-3 relative z-10">
              <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-white leading-snug">
                {card.title}
              </h3>
              <p className="text-sm text-white/60 font-light leading-relaxed">
                {card.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
