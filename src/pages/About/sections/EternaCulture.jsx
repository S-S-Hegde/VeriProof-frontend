import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, HeartHandshake, Compass, Plus, Minus } from "lucide-react";

export default function EternaCulture() {
  const [openIndex, setOpenIndex] = useState(0);

  const pillars = [
    {
      icon: ShieldCheck,
      title: "We do what we say we’ll do",
      paragraphs: [
        "Our mission is not just about making it easy to audit code at scale. We are here to fundamentally transform the daily hiring experience of every engineer and technical leader. Together we’re revealing a world where merit, simplicity, and peace of mind become daily reality.",
        "We liberate and elevate everyone to give their best without micromanagement. Great engineering is defined by the impact you create, so we are remote-first and ownership-driven. Every voice matters, code speaks louder than titles, and truth is greater than opinion."
      ]
    },
    {
      icon: HeartHandshake,
      title: "We treasure our people",
      paragraphs: [
        "Clean, fresh minds who are not exhausted by bureaucracy build the future. We eliminate friction so our engineers and researchers can dive deep into compilers, machine learning, and UX design.",
        "Every full-time team member enjoys comprehensive health coverage, flexible time-off, and gratitude profit-sharing. We celebrate diverse perspectives and unite on the same wavelength across teams worldwide."
      ]
    },
    {
      icon: Compass,
      title: "Freedom is the way",
      paragraphs: [
        "Work is a meaningful part of Life. Our culture is crafted to balance technical excellence with personal fulfillment. We give you the autonomy and support to push boundaries on your terms.",
        "Any idea can thrive and nothing is impossible. We nurture understanding, celebrate creativity, and act with mutual respect. When engineers thrive, technology thrives."
      ]
    }
  ];

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="section-culture" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-xs font-medium tracking-wide text-white/80">Join Our Team</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white leading-tight">
          Our people are world-class, <br />
          <span className="text-gradient-eterna">our expansion is boundless!</span>
        </h2>

        <p className="text-base sm:text-lg text-white/60 font-light">
          We’re not corporate, just intentional. The best work happens with trust, balance, and freedom.
        </p>
      </div>

      {/* Interactive Accordion List (Exact EternaCloud Structure) */}
      <div className="space-y-4">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="rounded-3xl border border-white/10 bg-[#161226]/80 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/20"
            >
              {/* Accordion Trigger Header */}
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full p-6 sm:p-8 flex items-center justify-between gap-4 text-left focus:outline-none"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-white">
                    {p.title}
                  </h3>
                </div>

                {/* Circular Toggle Button */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  isOpen ? "border-purple-400 bg-purple-500/20 text-purple-300 rotate-90" : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                }`}>
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
              </button>

              {/* Accordion Expandable Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 sm:px-8 pb-8 pt-2 border-t border-white/5 space-y-4 text-sm sm:text-base text-white/70 font-light leading-relaxed pl-6 sm:pl-24">
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

      {/* Quote Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-16 text-center max-w-3xl mx-auto"
      >
        <p className="text-xl sm:text-2xl font-normal text-white/90 leading-relaxed">
          At VeriProof, we empower our colleagues to take ownership, do meaningful work, and live an extraordinary Life.
        </p>
      </motion.div>
    </section>
  );
}
