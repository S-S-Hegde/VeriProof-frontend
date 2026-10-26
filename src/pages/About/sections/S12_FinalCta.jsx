import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ABOUT_COPY } from "../copy";
import { useDecodeText } from "../hooks/useDecodeText";

export default function S12_FinalCta({ isDark }) {
  const copy = ABOUT_COPY.s12_finalCta;
  const decodedEyebrow = useDecodeText(copy.eyebrow, true);

  // Magnetic button displacement effect
  const buttonRef = useRef(null);
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.25;
    const distanceY = (e.clientY - centerY) * 0.25;
    setBtnOffset({ x: distanceX, y: distanceY });
  };

  const handleMouseLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
  };

  return (
    <section
      data-about-section="12"
      id="section-final-cta"
      className="relative py-32 sm:py-48 px-6 sm:px-12 max-w-5xl mx-auto text-center z-10"
    >
      <div className="flex flex-col items-center justify-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs tracking-widest uppercase shadow-sm"
        >
          <span>{decodedEyebrow}</span>
        </motion.div>

        {/* Giant Headline: VERIFY THE TRUTH. */}
        <div className="overflow-hidden mb-6">
          <motion.h2
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.92]"
          >
            VERIFY THE{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-500 bg-clip-text text-transparent">
              TRUTH.
            </span>
          </motion.h2>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`text-lg sm:text-2xl font-light leading-relaxed max-w-2xl mb-12 ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {copy.sub}
        </motion.p>

        {/* Magnetic Primary CTA Button */}
        <motion.div
          ref={buttonRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{ x: btnOffset.x, y: btnOffset.y }}
          transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
          className="inline-block"
        >
          <Link
            to="/register"
            className="group inline-flex items-center gap-3.5 px-10 py-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-black text-sm uppercase tracking-wider shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/50 transition-all duration-300 transform hover:scale-105"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{copy.ctaText}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
