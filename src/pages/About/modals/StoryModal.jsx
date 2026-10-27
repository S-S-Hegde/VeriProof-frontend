import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, CheckCircle2 } from "lucide-react";

export default function StoryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto no-scrollbar rounded-3xl border border-white/10 bg-[#141022]/98 p-6 sm:p-12 text-white shadow-2xl backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-medium">
                The Origin Story
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight mt-1">
                Designed for engineers, <span className="text-gradient-eterna">built on truth.</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Story Body */}
          <div className="my-8 space-y-5 text-sm sm:text-base leading-relaxed text-white/75 font-light">
            <p className="text-lg font-normal text-white">
              We set out to create the ideal technical hiring scenario: the one that turns isolated moments of resume marketing into verifiable, repeatable proof.
            </p>

            <p>
              We've all encountered great engineers and trustworthy technical leaders—those who do exactly what they claim, write code that stands the test of production, and eliminate the need for guessing or endless rounds of trivia questions. But in today's tech hiring landscape, resumes have become promotional flyers, take-home projects are solved by LLMs, and public repositories can be cloned in seconds.
            </p>

            <p>
              Simplicity and honesty in hiring are easy to preach, but difficult to engineer. To achieve authentic clarity, we had to uncover root causes of false positives, bloated candidate pipelines, and bias that had quietly become the industry standard.
            </p>

            <p>
              Drawing on years of software engineering, compiler AST parsing, distributed systems, and real-world delivery across modern stacks, we examined the fundamental patterns of how real developers work. We realized that true capability leaves a natural forensic trail: Git commit velocity, repository structure, syntactic contribution depth, and live problem-solving telemetry.
            </p>

            <div className="my-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h4 className="text-base font-medium text-white mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                The VeriProof Core Principle
              </h4>
              <p className="text-sm text-white/80">
                "If you can prove it, we can verify it. If you can verify it, you can trust it. Integrity checks use in-browser event telemetry. No video, no screen recording."
              </p>
            </div>

            <p>
              We created VeriProof to restore confidence and peace of mind across technical recruiting. By cross-checking resume claims directly against real Git repositories with AST parsing, running adaptive two-phase evaluations generated from candidate repositories, and calculating an auditable Forensic Trust Score, we elevate real builders and save hiring teams hundreds of wasted hours.
            </p>

            <p>
              Great talent isn't found through automated keyword filters or robotic video surveillance. It is revealed when genuine craft is given the platform to speak for itself.
            </p>

            <p className="pt-2 text-white font-medium">
              Welcome to VeriProof Systems.
            </p>
          </div>

          {/* Footer Close */}
          <div className="border-t border-white/10 pt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl px-6 py-2.5 text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Close Story
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
