import React from "react";
import { motion } from "framer-motion";
import { MaskedLine, FadeInSubhead } from "../components/MaskedText";

// EternaCloud-accurate botanical leaf+bud motif with scroll path drawing
function BotanicalLeafBud() {
  return (
    <svg viewBox="0 0 80 140" fill="none" className="w-14 h-28 botanical-float mx-auto">
      {/* main stem (dynamic draw) */}
      <motion.line
        x1="40" y1="6" x2="40" y2="128"
        stroke="#4C1D95" strokeWidth="1.4" opacity="0.55"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.3, ease: "easeInOut" }}
      />
      {/* top bud */}
      <motion.circle
        cx="40" cy="10" r="5" fill="#F59E0B" filter="url(#vg1)"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />

      {/* left leaf pair branch */}
      <motion.line
        x1="40" y1="38" x2="22" y2="28" stroke="#5B21B6" strokeWidth="1" opacity="0.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      <motion.path
        d="M22 28 C 8 22, 6 36, 18 40 C 25 42, 28 36, 22 28 Z"
        fill="url(#lg1)" opacity="0.92"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.45 }}
        style={{ transformOrigin: "22px 28px" }}
      />
      <circle cx="22" cy="27" r="3" fill="#F59E0B" filter="url(#vg1)" />

      {/* right leaf pair branch */}
      <motion.line
        x1="40" y1="52" x2="58" y2="42" stroke="#5B21B6" strokeWidth="1" opacity="0.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
      <motion.path
        d="M58 42 C 72 36, 74 50, 62 54 C 55 56, 52 50, 58 42 Z"
        fill="url(#lg2)" opacity="0.92"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.55 }}
        style={{ transformOrigin: "58px 42px" }}
      />
      <circle cx="58" cy="41" r="2.5" fill="#A78BFA" filter="url(#vg1)" />

      {/* large center leaf pair */}
      <motion.path
        d="M40 65 C 18 55, 14 76, 32 84 C 38 86, 40 78, 40 68 Z"
        fill="url(#lg1)" opacity="0.88"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.65 }}
        style={{ transformOrigin: "40px 65px" }}
      />
      <motion.path
        d="M40 65 C 62 55, 66 76, 48 84 C 42 86, 40 78, 40 68 Z"
        fill="url(#lg2)" opacity="0.85"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.7 }}
        style={{ transformOrigin: "40px 65px" }}
      />

      {/* hanging bell flower */}
      <motion.path
        d="M34 100 Q 28 112, 40 120 Q 52 112, 46 100 Z"
        fill="url(#pf1)" opacity="0.95"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.85 }}
        style={{ transformOrigin: "40px 100px" }}
      />
      <motion.path
        d="M36 100 Q 30 108, 40 115 Q 50 108, 44 100 Z"
        fill="url(#pf2)" opacity="0.9"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.9 }}
        style={{ transformOrigin: "40px 100px" }}
      />
      <circle cx="40" cy="122" r="3.5" fill="#FCD34D" filter="url(#vg1)" className="star-node-pulse" />

      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4338CA" /><stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="lg2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3730A3" /><stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="pf1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="pf2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6D28D9" /><stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>
        <filter id="vg1" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
    </svg>
  );
}

export default function EternaVision() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7 }}
      >
        <BotanicalLeafBud />
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
          <MaskedLine delay={0.1}>One Vision</MaskedLine>
        </h2>
        <FadeInSubhead delay={0.25}>
          <p className="text-base sm:text-lg text-white/55 font-light max-w-lg mx-auto leading-relaxed">
            Freedom for every engineer and hiring team to build on verified truth.
          </p>
        </FadeInSubhead>
      </div>
    </section>
  );
}
