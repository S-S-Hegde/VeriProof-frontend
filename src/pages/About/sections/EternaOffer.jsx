import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { WordSlideUp } from "../components/WordReveal";

export default function EternaOffer() {
  const cards = [
    {
      title: "Delivering cryptographic certainty",
      desc: "Make it indisputable. We transform unverified commit histories and messy repositories into verifiable, tamper-evident certainty.",
      svg: (
        <svg viewBox="0 0 400 260" fill="none" className="w-full h-44">
          {/* concentric orbit rings matching EternaCloud card 1 */}
          <motion.ellipse
            cx="200" cy="160" rx="160" ry="60"
            stroke="#8B5CF6" strokeWidth="1" opacity="0.35"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="200" cy="160" rx="200" ry="90"
            stroke="#6D28D9" strokeWidth="1.2" opacity="0.25"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: "easeInOut", delay: 0.1 }}
          />
          <motion.ellipse
            cx="200" cy="160" rx="100" ry="38"
            stroke="#A78BFA" strokeWidth="1" strokeDasharray="4 4" opacity="0.30"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
          />
          {/* glowing star dots with pulse */}
          <circle cx="80" cy="120" r="5" fill="#FFFFFF" filter="url(#glow1)" className="star-node-pulse" />
          <circle cx="290" cy="185" r="4" fill="#C4B5FD" filter="url(#glow1)" className="star-node-pulse" style={{ animationDelay: "1s" }} />
          <circle cx="200" cy="70" r="7" fill="#FFFFFF" filter="url(#glow1)" className="star-node-pulse" style={{ animationDelay: "0.5s" }} />
          <circle cx="340" cy="120" r="3.5" fill="#A78BFA" filter="url(#glow1)" className="star-node-pulse" style={{ animationDelay: "1.5s" }} />
          <defs>
            <filter id="glow1" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        </svg>
      ),
    },
    {
      title: "Orchestrating forensic AST analysis",
      desc: "Keep it rigorous. Abstract Syntax Tree parsing, dependency graph auditing, and git authorship verification that expose authentic code craft.",
      svg: (
        <svg viewBox="0 0 400 260" fill="none" className="w-full h-44">
          {/* radial fan lines with staggered draw */}
          {[-70, -50, -30, -10, 10, 30, 50, 70].map((deg, i) => (
            <motion.line
              key={i}
              x1="200" y1="280"
              x2={200 + Math.sin((deg * Math.PI) / 180) * 200}
              y2={280 - Math.cos((deg * Math.PI) / 180) * 200}
              stroke="#8B5CF6"
              strokeWidth="1.2"
              opacity={0.18 + i * 0.06}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.08, ease: "easeOut" }}
            />
          ))}
          <circle cx="200" cy="30" r="5" fill="#FFFFFF" filter="url(#glow2)" className="star-node-pulse" />
          <circle cx="115" cy="80" r="4" fill="#F59E0B" filter="url(#glow2)" className="star-node-pulse" style={{ animationDelay: "0.8s" }} />
          <circle cx="280" cy="75" r="5" fill="#C4B5FD" filter="url(#glow2)" className="star-node-pulse" style={{ animationDelay: "1.2s" }} />
          <circle cx="200" cy="130" r="3.5" fill="#A78BFA" filter="url(#glow2)" className="star-node-pulse" style={{ animationDelay: "1.6s" }} />
          <defs>
            <filter id="glow2" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        </svg>
      ),
    },
    {
      title: "Compounding developer merit",
      desc: "Empower real builders. Objective engineering metrics that eliminate resume fraud and uncover genuine technical excellence.",
      svg: (
        <svg viewBox="0 0 400 260" fill="none" className="w-full h-44">
          <motion.path
            d="M30 60 C 140 60, 190 160, 370 160"
            stroke="#6D28D9" strokeWidth="1.3" opacity="0.55"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.3, ease: "easeInOut" }}
          />
          <motion.path
            d="M30 110 C 160 110, 220 160, 370 160"
            stroke="#8B5CF6" strokeWidth="1.3" opacity="0.65"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: "easeInOut", delay: 0.1 }}
          />
          <motion.path
            d="M30 180 C 180 180, 250 160, 370 160"
            stroke="#F59E0B" strokeWidth="1.3" opacity="0.55"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          />
          <circle cx="370" cy="160" r="8" fill="#FFFFFF" filter="url(#glow3)" className="star-node-pulse" />
          <circle cx="80" cy="60" r="4" fill="#C4B5FD" filter="url(#glow3)" className="star-node-pulse" style={{ animationDelay: "0.7s" }} />
          <circle cx="270" cy="160" r="4" fill="#FCD34D" filter="url(#glow3)" className="star-node-pulse" style={{ animationDelay: "1.4s" }} />
          <defs>
            <filter id="glow3" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        </svg>
      ),
    },
  ];

  return (
    <section id="section-offer" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Eyebrow + Headline with Word-by-Word Snappy Reveal */}
      <div className="text-center space-y-5 mb-16">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <span className="eterna-pill-badge">
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            We Offer
          </span>
        </motion.div>
        
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white">
          <WordSlideUp text="One Verifiable Protocol" delay={0.1} />
        </h2>
      </div>

      {/* Cards with Staggered Entrance & Interactive Hover */}
      <div className="flex flex-col md:flex-row items-stretch justify-center gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.8,
              delay: idx * 0.14,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -8 }}
            className="eterna-offer-card group flex-1 flex flex-col cursor-pointer"
          >
            {/* Text top */}
            <div className="p-8 sm:p-10 space-y-3.5">
              <h3 className="text-xl sm:text-2xl font-normal tracking-tight text-white leading-snug group-hover:text-violet-200 transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-white/60 font-light leading-relaxed">
                {card.desc}
              </p>
            </div>
            {/* SVG bottom */}
            <div className="mt-auto px-4 pb-4">
              {card.svg}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
