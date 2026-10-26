import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ShieldCheck, Cpu, GitBranch, Sparkles } from "lucide-react";

const SLIDES = [
  {
    icon: ShieldCheck,
    top: "Authentic evidence has an eternal lifespan. It is the fundamental particle of integrity; its precision is auditable and it generates all trust.",
    titleHighlight: "Veri",
    titleRest: "Proof",
    bottom: "Our solution is objective and evidence-first by design. The trust we forge is permanent, our AST curations are exact, and we generate enduring confidence for all."
  },
  {
    icon: GitBranch,
    top: "Dazzling graphs of verified commits form seamless cryptographic connections, adapt dynamically, and provide transparency across repositories.",
    titleHighlight: "Veri",
    titleRest: "Proof",
    bottom: "Our engine cross-checks claims against code, inherently flags contradictions, detects scaffolding, and establishes harmony between candidates and hiring teams."
  },
  {
    icon: Cpu,
    top: "One universal guiding force of forensic truth and deep evaluation orchestrates the modern hiring framework.",
    titleHighlight: "VeriProof",
    titleRest: " Systems",
    bottom: "We are the dedicated partner who orchestrates deep repository forensics and delivers simplicity, transforming candidate assessment for good."
  },
  {
    icon: Sparkles,
    top: "The universal law of cause and effect governs all achievement. Verified telemetry unifies our framework and guides our decisions.",
    titleHighlight: "Our Circle of",
    titleRest: " Truth",
    bottom: "When every claim is backed by real code and live debugging, bias dissolves. Together we elevate technical talent based on genuine merit."
  }
];

export default function WhyNameModal({ isOpen, onClose }) {
  const [index, setIndex] = useState(0);

  if (!isOpen) return null;

  const current = SLIDES[index];
  const Icon = current.icon;

  const handleNext = () => setIndex((prev) => (prev + 1) % SLIDES.length);
  const handlePrev = () => setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

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
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#151124]/95 p-6 sm:p-10 text-white shadow-2xl backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                [ THE_FOUNDATION ]
              </span>
              <h3 className="text-xl font-medium tracking-tight mt-1">
                Why the name <span className="text-gradient-eterna">VeriProof?</span>
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Slide Content */}
          <div className="my-8 min-h-[220px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center sm:text-left"
              >
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-medium tracking-tight">
                    <span className="text-white/40">{current.titleHighlight}</span>
                    <span className="text-gradient-eterna">{current.titleRest}</span>
                  </h4>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-white/70">
                  {current.top}
                </p>

                <div className="h-px w-full bg-white/10" />

                <p className="text-sm sm:text-base leading-relaxed text-white/80 font-light">
                  {current.bottom}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/40">
            <span>
              {index + 1} of {SLIDES.length}
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
