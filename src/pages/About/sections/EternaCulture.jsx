import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sliders } from "lucide-react";
import { WordSlideUp, FadeInParagraph } from "../components/WordReveal";

// Botanical flower SVG icons matching EternaCloud accordion icons
function FlowerIcon1() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 shrink-0">
      <circle cx="24" cy="24" r="7" fill="#F59E0B" />
      <ellipse cx="24" cy="11" rx="5" ry="8" fill="#7C3AED" opacity="0.9" />
      <ellipse cx="24" cy="37" rx="5" ry="8" fill="#7C3AED" opacity="0.85" />
      <ellipse cx="11" cy="24" rx="8" ry="5" fill="#6D28D9" opacity="0.88" />
      <ellipse cx="37" cy="24" rx="8" ry="5" fill="#6D28D9" opacity="0.85" />
      <circle cx="24" cy="24" r="5.5" fill="#FCD34D" />
    </svg>
  );
}

function FlowerIcon2() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 shrink-0">
      <ellipse cx="24" cy="11" rx="4.5" ry="9" fill="#3730A3" opacity="0.9" />
      <ellipse cx="24" cy="37" rx="4.5" ry="9" fill="#3730A3" opacity="0.85" />
      <ellipse cx="11" cy="24" rx="9" ry="4.5" fill="#4338CA" opacity="0.88" />
      <ellipse cx="37" cy="24" rx="9" ry="4.5" fill="#4338CA" opacity="0.85" />
      <circle cx="24" cy="24" r="7" fill="#6D28D9" />
      <circle cx="24" cy="24" r="4" fill="#A78BFA" />
      <circle cx="24" cy="24" r="2" fill="#FCD34D" />
    </svg>
  );
}

function FlowerIcon3() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 shrink-0">
      <ellipse cx="24" cy="10" rx="5" ry="9" fill="#4C1D95" opacity="0.9" />
      <ellipse cx="24" cy="10" rx="5" ry="9" fill="#6D28D9" opacity="0.82" transform="rotate(60 24 24)" />
      <ellipse cx="24" cy="10" rx="5" ry="9" fill="#7C3AED" opacity="0.80" transform="rotate(120 24 24)" />
      <circle cx="24" cy="24" r="6" fill="#F59E0B" />
      <circle cx="24" cy="24" r="3" fill="#FCD34D" />
    </svg>
  );
}

function FlowerIcon4() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 shrink-0">
      <circle cx="24" cy="24" r="8" fill="#5B21B6" opacity="0.8" />
      <circle cx="24" cy="24" r="5" fill="#8B5CF6" opacity="0.9" />
      <circle cx="24" cy="24" r="3" fill="#FCD34D" />
    </svg>
  );
}

export default function EternaCulture() {
  const [openIndex, setOpenIndex] = useState(0);

  const items = [
    {
      icon: <FlowerIcon1 />,
      title: "No lookup answers",
      desc: "Every multiple-choice question passes three quality passes: similar option lengths, matched jargon, no absurd distractors, shuffled positions.",
    },
    {
      icon: <FlowerIcon2 />,
      title: "Signals, not a pass/fail flag",
      desc: "Tab switches, failed trap questions, overconfident wrong answers and guessing patterns each add to the score, in the browser only.",
    },
    {
      icon: <FlowerIcon3 />,
      title: "Privacy-light integrity",
      desc: "Integrity checks use in-browser event telemetry. No video, no screen recording.",
    },
    {
      icon: <FlowerIcon4 />,
      title: "Evidence you can inspect",
      desc: "Recruiters see where a number came from, not only the number.",
    },
  ];

  return (
    <section id="section-different" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-5 mb-14 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <span className="eterna-pill-badge">
            Why It Is Different
          </span>
        </motion.div>

        <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white leading-tight">
          <WordSlideUp text="Signals that transcend" delay={0.1} />
          <br />
          <span className="text-gradient-eterna">
            <WordSlideUp text="standard candidate testing." delay={0.25} />
          </span>
        </h2>

        <FadeInParagraph delay={0.35}>
          <p className="text-base sm:text-lg text-white/60 font-light">
            We replace guessing and generic quizzes with verifiable telemetry from candidate code and live reasoning.
          </p>
        </FadeInParagraph>
      </div>

      {/* Interactive Accordion */}
      <div className="space-y-3.5">
        {items.map((p, idx) => {
          const isOpen = openIndex === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: isOpen ? "rgba(25, 20, 52, 0.90)" : "rgba(20, 16, 42, 0.80)",
                border: isOpen ? "1px solid rgba(139, 92, 246, 0.35)" : "1px solid rgba(255,255,255,0.07)",
                boxShadow: isOpen ? "0 12px 30px -10px rgba(109, 40, 217, 0.25)" : "none",
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left focus:outline-none cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{
                      rotate: isOpen ? 60 : 0,
                      scale: isOpen ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="shrink-0"
                  >
                    {p.icon}
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-normal text-white group-hover:text-violet-200 transition-colors">
                    {p.title}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-white/50 group-hover:text-white" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-7 pt-1 border-t border-white/5 space-y-4 text-sm sm:text-base text-white/70 font-light leading-relaxed pl-20">
                      <p>{p.desc}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Empower quote with hanging flower */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.85 }}
        className="mt-28 text-center flex flex-col items-center gap-10"
      >
        <div className="botanical-float">
          <svg viewBox="0 0 60 90" fill="none" className="w-14 h-20 mx-auto">
            <line x1="30" y1="2" x2="30" y2="42" stroke="#4C1D95" strokeWidth="1.2" opacity="0.55" />
            <circle cx="30" cy="54" r="6" fill="#F59E0B" className="star-node-pulse" />
            <circle cx="30" cy="54" r="3.5" fill="#FCD34D" />
          </svg>
        </div>

        <div className="text-2xl sm:text-4xl md:text-5xl font-normal text-white leading-tight max-w-3xl mx-auto">
          <WordSlideUp
            text="At VeriProof, we believe in skill you can inspect, evidence you can audit, and hiring without blind trust."
            delay={0.1}
          />
        </div>
      </motion.div>
    </section>
  );
}
