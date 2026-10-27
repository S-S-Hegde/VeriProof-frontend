import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export default function EternaFit({ onOpenJoinModal }) {
  const points = [
    "Always have a perpetual desire to understand how complex systems truly operate.",
    "Truly put your Heart, craft, and attention into everything you build.",
    "Genuinely apply and reliably balance determined focus with intuitive awareness.",
    "Hold yourself, your colleagues, and the work you create to an exceptional standard.",
    "Have deep appreciation for elegant developer tooling, compilers, and evidence-first design.",
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div
        className="p-8 sm:p-14 overflow-hidden relative rounded-3xl"
        style={{
          background: "rgba(16, 13, 36, 0.82)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)" }} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex">
              <span className="eterna-pill-badge">
                <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                Our Culture Fit
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
              Experience work <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #60A5FA 0%, #A78BFA 48%, #F59E0B 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                in a new way.
              </span>
            </h2>

            <p className="text-sm text-white/55 font-light leading-relaxed">
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
            <h3 className="text-lg font-medium text-white/90 mb-4">Sound like you?</h3>
            <div className="space-y-3">
              {points.map((pt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl transition-colors"
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5"
                    style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA" }}>
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm text-white/75 font-light leading-relaxed">{pt}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
