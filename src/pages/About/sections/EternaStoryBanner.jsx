import React from "react";
import { motion } from "framer-motion";

// Botanical leaf/flower SVG matching EternaCloud's between-section motif
function BotanicalStem() {
  return (
    <svg viewBox="0 0 80 160" fill="none" className="w-16 h-32 botanical-float mx-auto">
      {/* Main stem */}
      <line x1="40" y1="8" x2="40" y2="152" stroke="#4C1D95" strokeWidth="1.5" opacity="0.6" />
      {/* Left leaf */}
      <path d="M40 55 C 20 45, 12 62, 30 70 C 38 72, 40 65, 40 60 Z"
        fill="url(#leaf-grad-l)" opacity="0.9" />
      {/* Right leaf */}
      <path d="M40 80 C 60 70, 68 87, 50 95 C 42 97, 40 90, 40 85 Z"
        fill="url(#leaf-grad-r)" opacity="0.9" />
      {/* Top buds */}
      <circle cx="40" cy="12" r="4" fill="#F59E0B" filter="url(#dot-glow)" />
      <line x1="40" y1="38" x2="28" y2="30" stroke="#6D28D9" strokeWidth="1" opacity="0.5" />
      <circle cx="28" cy="28" r="3" fill="#F59E0B" filter="url(#dot-glow)" opacity="0.8" />
      <line x1="40" y1="45" x2="52" y2="38" stroke="#6D28D9" strokeWidth="1" opacity="0.5" />
      <circle cx="52" cy="36" r="2.5" fill="#A78BFA" filter="url(#dot-glow)" opacity="0.9" />
      {/* Bottom flower */}
      <path d="M40 130 C 30 118, 22 128, 30 136 C 35 141, 40 138, 40 133 Z"
        fill="url(#petal-grad)" opacity="0.9" />
      <path d="M40 130 C 50 118, 58 128, 50 136 C 45 141, 40 138, 40 133 Z"
        fill="url(#petal-grad)" opacity="0.9" />
      <path d="M40 128 C 28 124, 24 134, 32 140 C 37 143, 40 140, 40 135 Z"
        fill="url(#petal-grad2)" opacity="0.85" />
      <path d="M40 128 C 52 124, 56 134, 48 140 C 43 143, 40 140, 40 135 Z"
        fill="url(#petal-grad2)" opacity="0.85" />
      <circle cx="40" cy="135" r="5" fill="#F59E0B" filter="url(#dot-glow)" />
      <defs>
        <linearGradient id="leaf-grad-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4C1D95" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="leaf-grad-r" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3730A3" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
        <linearGradient id="petal-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="petal-grad2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <filter id="dot-glow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
    </svg>
  );
}

export default function EternaStoryBanner({ onOpenStory }) {
  return (
    <section className="relative py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
      {/* Botanical divider top */}
      <div className="mb-12">
        <BotanicalStem />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.85 }}
        className="space-y-10"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.22]">
          We set out to create the ideal hiring scenario. The one that turns
          isolated moments of excellence into a seamless, repeatable experience.
        </h2>

        <div>
          <button
            onClick={onOpenStory}
            className="btn-eterna-solid inline-flex items-center gap-2 rounded-full px-9 py-3.5 text-sm sm:text-base font-medium text-white shadow-xl"
          >
            Read our story
          </button>
        </div>
      </motion.div>
    </section>
  );
}
