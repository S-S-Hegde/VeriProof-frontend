import React from "react";
import { motion } from "framer-motion";

export default function EternaVision() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-6 flex flex-col items-center"
      >
        {/* Artistic Vertical Filament SVG Motif */}
        <div className="w-16 h-28 relative flex items-center justify-center">
          <svg viewBox="0 0 60 120" fill="none" className="w-full h-full">
            <path
              d="M30 10 C 25 35, 35 60, 30 85 C 26 100, 30 115, 30 115"
              stroke="url(#filament-grad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Organic Petal shapes */}
            <path d="M30 40 C 45 35, 48 50, 30 55 Z" fill="#1B4DFE" opacity="0.8" />
            <path d="M30 65 C 15 60, 12 75, 30 80 Z" fill="#AC24FF" opacity="0.8" />
            <circle cx="30" cy="15" r="4" fill="#FFD600" filter="drop-shadow(0 0 6px #FFD600)" />
            <circle cx="30" cy="115" r="5" fill="#FE881B" filter="drop-shadow(0 0 8px #FE881B)" />
            <defs>
              <linearGradient id="filament-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD600" />
                <stop offset="50%" stopColor="#AC24FF" />
                <stop offset="100%" stopColor="#1B4DFE" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-white">
          One Vision
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-white/60 font-light max-w-xl">
          Freedom for every engineer and hiring team to build on verified truth.
        </p>
      </motion.div>
    </section>
  );
}
