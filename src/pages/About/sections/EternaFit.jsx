import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export default function EternaFit({ onOpenJoinModal }) {
  const points = [
    "Always have a perpetual desire to understand how complex systems truly operate.",
    "Truly put your Heart, craft, and attention into everything you build.",
    "Genuinely apply and reliably balance determined focus with intuitive awareness.",
    "Hold yourself, your colleagues, and the work you create to an exceptional standard.",
    "Have deep appreciation for elegant developer tooling, compilers, and evidence-first design."
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="glass-eterna-card p-8 sm:p-14 overflow-hidden relative">
        {/* Subtle background gradient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-medium tracking-wide text-white/80">Our Culture Fit</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white leading-tight">
              Experience work <br />
              <span className="text-gradient-eterna">in a new way.</span>
            </h2>

            <p className="text-sm text-white/60 font-light leading-relaxed">
              We look for people who are driven by curiosity, intellectual rigor, and genuine empathy.
            </p>

            <div>
              <button
                onClick={onOpenJoinModal}
                className="btn-eterna-gradient inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-sm font-medium text-white shadow-xl"
              >
                <span>Explore open roles</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Checklist */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-medium text-white/90 mb-4">
              Sound like you?
            </h3>

            <div className="space-y-3">
              {points.map((pt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm text-white/75 font-light leading-relaxed">
                    {pt}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
