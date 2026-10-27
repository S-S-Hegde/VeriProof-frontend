import React from "react";
import { motion } from "framer-motion";
import { WordSlideUp } from "../components/WordReveal";

// Botanical leaf/flower SVG with scroll-triggered SVG path drawing
function BotanicalStem() {
  return (
    <svg viewBox="0 0 80 160" fill="none" className="w-16 h-32 botanical-float mx-auto">
      {/* Main vertical stem line */}
      <motion.line
        x1="40" y1="8" x2="40" y2="152"
        stroke="#4C1D95" strokeWidth="1.5" opacity="0.6"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />

      {/* Side twig left */}
      <motion.line
        x1="40" y1="38" x2="28" y2="30"
        stroke="#6D28D9" strokeWidth="1" opacity="0.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
      />
      <motion.circle
        cx="28" cy="28" r="3" fill="#F59E0B" filter="url(#dot-glow)" opacity="0.8"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />

      {/* Side twig right */}
      <motion.line
        x1="40" y1="45" x2="52" y2="38"
        stroke="#6D28D9" strokeWidth="1" opacity="0.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
      />
      <motion.circle
        cx="52" cy="36" r="2.5" fill="#A78BFA" filter="url(#dot-glow)" opacity="0.9"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.6 }}
      />

      {/* Left leaf */}
      <motion.path
        d="M40 55 C 20 45, 12 62, 30 70 C 38 72, 40 65, 40 60 Z"
        fill="url(#leaf-grad-l)" opacity="0.9"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.9 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "40px 60px" }}
      />

      {/* Right leaf */}
      <motion.path
        d="M40 80 C 60 70, 68 87, 50 95 C 42 97, 40 90, 40 85 Z"
        fill="url(#leaf-grad-r)" opacity="0.9"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.9 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "40px 85px" }}
      />

      {/* Top bud */}
      <motion.circle
        cx="40" cy="12" r="4" fill="#F59E0B" filter="url(#dot-glow)"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Bottom flower petals */}
      <motion.path
        d="M40 130 C 30 118, 22 128, 30 136 C 35 141, 40 138, 40 133 Z"
        fill="url(#petal-grad)" opacity="0.9"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.9 }}
        style={{ transformOrigin: "40px 135px" }}
      />
      <motion.path
        d="M40 130 C 50 118, 58 128, 50 136 C 45 141, 40 138, 40 133 Z"
        fill="url(#petal-grad)" opacity="0.9"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.95 }}
        style={{ transformOrigin: "40px 135px" }}
      />
      <circle cx="40" cy="135" r="5" fill="#F59E0B" filter="url(#dot-glow)" className="star-node-pulse" />

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
    <section className="relative py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
      {/* Botanical divider top with dynamic pathLength draw */}
      <div className="mb-12">
        <BotanicalStem />
      </div>

      <div className="space-y-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white leading-[1.3]">
          <WordSlideUp
            text="Resumes are marketing documents. Take-home tests can be solved by a chatbot."
            delay={0.1}
          />
          <br />
          <WordSlideUp
            text="Public repositories can be cloned in a minute. We built VeriProof so skill can be told apart from packaging."
            delay={0.28}
          />
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <button
            onClick={onOpenStory}
            className="btn-eterna-solid inline-flex items-center gap-2 rounded-full px-9 py-3.5 text-sm sm:text-base font-normal text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Read our story
          </button>
        </motion.div>
      </div>
    </section>
  );
}
