import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Botanical flower SVG icons matching EternaCloud accordion icons
function FlowerIcon1() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 shrink-0">
      <circle cx="24" cy="24" r="7" fill="#F59E0B" />
      <ellipse cx="24" cy="11" rx="5" ry="8" fill="#7C3AED" opacity="0.9" />
      <ellipse cx="24" cy="37" rx="5" ry="8" fill="#7C3AED" opacity="0.85" />
      <ellipse cx="11" cy="24" rx="8" ry="5" fill="#6D28D9" opacity="0.88" />
      <ellipse cx="37" cy="24" rx="8" ry="5" fill="#6D28D9" opacity="0.85" />
      <ellipse cx="14.6" cy="14.6" rx="5.5" ry="7.5" fill="#5B21B6" opacity="0.8"
        transform="rotate(-45 14.6 14.6)" />
      <ellipse cx="33.4" cy="33.4" rx="5.5" ry="7.5" fill="#5B21B6" opacity="0.78"
        transform="rotate(-45 33.4 33.4)" />
      <ellipse cx="33.4" cy="14.6" rx="5.5" ry="7.5" fill="#4C1D95" opacity="0.8"
        transform="rotate(45 33.4 14.6)" />
      <ellipse cx="14.6" cy="33.4" rx="5.5" ry="7.5" fill="#4C1D95" opacity="0.78"
        transform="rotate(45 14.6 33.4)" />
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
      <ellipse cx="24" cy="10" rx="5" ry="9" fill="#4C1D95" opacity="0.9" transform="rotate(0 24 24)" />
      <ellipse cx="24" cy="10" rx="5" ry="9" fill="#5B21B6" opacity="0.85" transform="rotate(60 24 24)" />
      <ellipse cx="24" cy="10" rx="5" ry="9" fill="#6D28D9" opacity="0.82" transform="rotate(120 24 24)" />
      <ellipse cx="24" cy="10" rx="5" ry="9" fill="#7C3AED" opacity="0.80" transform="rotate(180 24 24)" />
      <ellipse cx="24" cy="10" rx="5" ry="9" fill="#8B5CF6" opacity="0.78" transform="rotate(240 24 24)" />
      <ellipse cx="24" cy="10" rx="5" ry="9" fill="#A78BFA" opacity="0.75" transform="rotate(300 24 24)" />
      <circle cx="24" cy="24" r="6" fill="#F59E0B" />
      <circle cx="24" cy="24" r="3" fill="#FCD34D" />
    </svg>
  );
}

export default function EternaCulture() {
  const [openIndex, setOpenIndex] = useState(-1);

  const pillars = [
    {
      icon: <FlowerIcon1 />,
      title: "We do what we say we'll do",
      paragraphs: [
        "Our mission is not just about making it easy to audit code at scale. We are here to fundamentally transform the daily hiring experience of every engineer and technical leader. Together we're revealing a world where merit, simplicity, and peace of mind become daily reality.",
        "We liberate and elevate everyone to give their best without micromanagement. Great engineering is defined by the impact you create, so we are remote-first and ownership-driven. Every voice matters, code speaks louder than titles, and truth is greater than opinion.",
      ],
    },
    {
      icon: <FlowerIcon2 />,
      title: "We treasure our people",
      paragraphs: [
        "Clean, fresh minds who are not exhausted by bureaucracy build the future. We eliminate friction so our engineers and researchers can dive deep into compilers, machine learning, and UX design.",
        "Every full-time team member enjoys comprehensive health coverage, flexible time-off, and gratitude profit-sharing. We celebrate diverse perspectives and unite on the same wavelength across teams worldwide.",
      ],
    },
    {
      icon: <FlowerIcon3 />,
      title: "Freedom is the way",
      paragraphs: [
        "Work is a meaningful part of Life. Our culture is crafted to balance technical excellence with personal fulfillment. We give you the autonomy and support to push boundaries on your terms.",
        "Any idea can thrive and nothing is impossible. We nurture understanding, celebrate creativity, and act with mutual respect. When engineers thrive, technology thrives.",
      ],
    },
  ];

  return (
    <section id="section-culture" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-5 mb-14 max-w-3xl mx-auto">
        <div className="flex justify-center">
          <span className="eterna-pill-badge">
            <FlowerIcon1 />
            Join Our Team
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
          Our people are world-class, <br />
          <span className="text-gradient-eterna">our expansion is boundless!</span>
        </h2>

        <p className="text-base sm:text-lg text-white/55 font-light">
          We&apos;re not corporate, just intentional. The best work happens with trust, balance and freedom.
        </p>
      </div>

      {/* Interactive Accordion */}
      <div className="space-y-3">
        {pillars.map((p, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl overflow-hidden transition-all duration-300"
              style={{ background: "rgba(20, 16, 42, 0.80)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  {p.icon}
                  <h3 className="text-lg sm:text-xl font-medium text-white">
                    {p.title}
                  </h3>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-white/50 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-7 pt-1 border-t border-white/5 space-y-4 text-sm sm:text-base text-white/65 font-light leading-relaxed pl-20">
                      {p.paragraphs.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
        {/* Hanging flower botanical */}
        <div className="botanical-float">
          <svg viewBox="0 0 60 90" fill="none" className="w-14 h-20 mx-auto">
            <line x1="30" y1="2" x2="30" y2="42" stroke="#4C1D95" strokeWidth="1.2" opacity="0.55" />
            <line x1="30" y1="20" x2="18" y2="14" stroke="#5B21B6" strokeWidth="1" opacity="0.5" />
            <circle cx="18" cy="12" r="3" fill="#F59E0B" filter="url(#hf1)" />
            <line x1="30" y1="28" x2="42" y2="22" stroke="#5B21B6" strokeWidth="1" opacity="0.5" />
            <circle cx="42" cy="20" r="2.5" fill="#A78BFA" filter="url(#hf1)" />
            <ellipse cx="30" cy="54" rx="7" ry="10" fill="url(#hpf1)" opacity="0.92" />
            <ellipse cx="30" cy="54" rx="7" ry="10" fill="url(#hpf2)" opacity="0.88"
              transform="rotate(60 30 54)" />
            <ellipse cx="30" cy="54" rx="7" ry="10" fill="url(#hpf1)" opacity="0.85"
              transform="rotate(120 30 54)" />
            <ellipse cx="30" cy="54" rx="7" ry="10" fill="url(#hpf2)" opacity="0.82"
              transform="rotate(180 30 54)" />
            <ellipse cx="30" cy="54" rx="7" ry="10" fill="url(#hpf1)" opacity="0.80"
              transform="rotate(240 30 54)" />
            <ellipse cx="30" cy="54" rx="7" ry="10" fill="url(#hpf2)" opacity="0.78"
              transform="rotate(300 30 54)" />
            <circle cx="30" cy="54" r="6" fill="#F59E0B" />
            <circle cx="30" cy="54" r="3.5" fill="#FCD34D" />
            <defs>
              <linearGradient id="hpf1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="hpf2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6D28D9" /><stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
              <filter id="hf1" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
          </svg>
        </div>

        <p className="text-2xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight max-w-3xl mx-auto">
          At VeriProof, we empower our colleagues to take ownership, do meaningful work and live an extraordinary Life.
        </p>
      </motion.div>
    </section>
  );
}
