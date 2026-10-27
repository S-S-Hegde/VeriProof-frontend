import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Feather, Globe } from "lucide-react";

const PHILOSOPHY_SLIDES = [
  {
    heading: "VeriProof is architected with purpose, keeping our focus on the right things for the right reasons.",
    paragraphs: [
      "Vanity metrics and hyper-inflated claims are not our driver; authentic capability is. We design systems that reward real craft and real problem-solving.",
      "Our cause is genuine Empowerment, given through constructive evidence to every candidate and hiring team we touch. Confidence cannot exist without transparency.",
      "By following deep Engineering Intuition, we've designed and built our platform on One Vision: Truth in code, Clarity in assessment, Freedom in hiring. Every architectural choice is made with respect for the builder's journey."
    ]
  },
  {
    heading: "We live in the Now. We focus on clarity, consistency, and auditable proof for people.",
    paragraphs: [
      "Fairness for candidates and Certainty for technical leaders are the natural results of honest measurement.",
      "Everything is Effort, Knowledge, and Execution. The passion and intelligence people give into their code is more valuable than any formatted PDF will ever be. We are a people-first engineering platform, compounding the real value that software creators provide.",
      "In the interconnected fabric of technology, authentic skill speaks for itself. We direct our energy toward dismantling resume gatekeeping and elevating genuine developers into the roles they deserve."
    ]
  }
];

export default function CauseEffectModal({ isOpen, onClose }) {
  const [index, setIndex] = useState(0);

  if (!isOpen) return null;

  const current = PHILOSOPHY_SLIDES[index];

  const handleNext = () => setIndex((prev) => (prev + 1) % PHILOSOPHY_SLIDES.length);
  const handlePrev = () => setIndex((prev) => (prev - 1 + PHILOSOPHY_SLIDES.length) % PHILOSOPHY_SLIDES.length);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#141022]/95 p-6 sm:p-10 text-white shadow-2xl backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <span className="text-xs uppercase tracking-widest text-orange-400 font-medium">
                The Philosophy
              </span>
              <h3 className="text-xl font-medium tracking-tight mt-1">
                Every cause <span className="text-gradient-eterna">has effects</span>
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="my-8 min-h-[260px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h4 className="text-lg sm:text-xl font-medium leading-snug text-white/95">
                  {current.heading}
                </h4>

                <div className="space-y-3 pt-2 text-sm sm:text-base leading-relaxed text-white/70 font-light">
                  {current.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/40">
            <span>
              {index + 1} of {PHILOSOPHY_SLIDES.length}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/15"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/15"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
