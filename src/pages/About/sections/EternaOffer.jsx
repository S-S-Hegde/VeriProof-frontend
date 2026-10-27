import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function EternaOffer() {
  const cards = [
    {
      title: "Delivering seamless verification",
      desc: "Make it effortless. We transform complex candidate evaluation into verifiable, tamper-evident certainty.",
      svg: (
        <svg viewBox="0 0 400 200" fill="none" className="w-full h-36 opacity-80 group-hover:opacity-100 transition-opacity">
          <ellipse cx="200" cy="110" rx="150" ry="55" stroke="#AC24FF" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <ellipse cx="200" cy="110" rx="190" ry="85" stroke="#1B4DFE" strokeWidth="1.2" opacity="0.6" />
          <ellipse cx="200" cy="110" rx="90" ry="35" stroke="#FE881B" strokeWidth="1" opacity="0.5" />
          <circle cx="80" cy="100" r="5" fill="#FFFFFF" filter="drop-shadow(0 0 8px #AC24FF)" />
          <circle cx="290" cy="140" r="4" fill="#00D4FF" filter="drop-shadow(0 0 6px #00D4FF)" />
          <circle cx="200" cy="50" r="6" fill="#FFFFFF" filter="drop-shadow(0 0 10px #FFFFFF)" />
        </svg>
      )
    },
    {
      title: "Orchestrating forensic frameworks",
      desc: "Keep it rigorous. GitHub commit history, AST analysis, and AI question defenses that transcend typical limitations.",
      svg: (
        <svg viewBox="0 0 400 200" fill="none" className="w-full h-36 opacity-80 group-hover:opacity-100 transition-opacity">
          {[-60, -40, -20, 0, 20, 40, 60].map((deg, i) => (
            <line
              key={i}
              x1="200"
              y1="190"
              x2={200 + Math.sin((deg * Math.PI) / 180) * 170}
              y2={190 - Math.cos((deg * Math.PI) / 180) * 170}
              stroke="#AC24FF"
              strokeWidth="1.2"
              opacity={0.3 + i * 0.08}
            />
          ))}
          <circle cx="200" cy="25" r="5" fill="#FFFFFF" filter="drop-shadow(0 0 8px #FFFFFF)" />
          <circle cx="120" cy="70" r="4" fill="#FE881B" filter="drop-shadow(0 0 6px #FE881B)" />
          <circle cx="270" cy="65" r="4.5" fill="#00D4FF" filter="drop-shadow(0 0 7px #00D4FF)" />
        </svg>
      )
    },
    {
      title: "Compounding hiring gains",
      desc: "Do good for people. Objective evidence that eliminates bias and uncovers exceptional builders.",
      svg: (
        <svg viewBox="0 0 400 200" fill="none" className="w-full h-36 opacity-80 group-hover:opacity-100 transition-opacity">
          <path d="M40 50 C 140 50, 180 120, 360 120" stroke="#1B4DFE" strokeWidth="1.2" opacity="0.6" />
          <path d="M40 100 C 160 100, 220 120, 360 120" stroke="#AC24FF" strokeWidth="1.2" opacity="0.7" />
          <path d="M40 160 C 180 160, 240 120, 360 120" stroke="#FE881B" strokeWidth="1.2" opacity="0.6" />
          <circle cx="360" cy="120" r="7" fill="#FFFFFF" filter="drop-shadow(0 0 10px #AC24FF)" />
          <circle cx="90" cy="50" r="4" fill="#00D4FF" filter="drop-shadow(0 0 6px #00D4FF)" />
          <circle cx="280" cy="120" r="4" fill="#FFD600" filter="drop-shadow(0 0 6px #FFD600)" />
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
          <span className="text-xs font-medium tracking-wide text-white/80">we offer</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white">
          One Adaptive Service
        </h2>
      </div>

      {/* Cards: Text on Top, Vector Graphic on Bottom (Exact EternaCloud Layout) */}
      <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 sm:gap-8">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: idx * 0.15 }}
            className="group flex-1 rounded-3xl border border-white/10 bg-[#161226]/85 p-8 sm:p-10 flex flex-col justify-between overflow-hidden relative backdrop-blur-xl hover:border-purple-400/30 transition-all duration-300"
          >
            {/* Top Text Content */}
            <div className="space-y-3 relative z-10 mb-8">
              <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-white leading-snug">
                {card.title}
              </h3>
              <p className="text-sm text-white/60 font-light leading-relaxed">
                {card.desc}
              </p>
            </div>

            {/* Bottom Graphic Motif */}
            <div className="mt-auto -mx-4 -mb-4 flex items-center justify-center">
              {card.svg}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
