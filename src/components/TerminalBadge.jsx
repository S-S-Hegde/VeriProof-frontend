import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * TerminalBadge
 * Cryptographic Decrypt & Glowing Border Pulse Telemetry Badge
 */
export const TerminalBadge = ({
  text,
  icon: Icon,
  className = "",
  pulse = true,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayText, setDisplayText] = useState(text);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!text) {
      setDisplayText("");
      return;
    }
    if (shouldReduceMotion) {
      setDisplayText(text);
      return;
    }
    if (!inView) return;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#$";
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        (text || "")
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (letter === " " || letter === "[" || letter === "]") return letter;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= (text?.length || 0)) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, 25);

    return () => clearInterval(interval);
  }, [inView, text, shouldReduceMotion]);

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 dark:border-cyan-400/30 bg-cyan-500/5 dark:bg-cyan-500/10 text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400 font-semibold shadow-[0_0_12px_rgba(34,211,238,0.12)] ${
        pulse ? "animate-pulse" : ""
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 text-cyan-500 dark:text-cyan-400" />}
      <span>{displayText}</span>
    </motion.div>
  );
};

export default TerminalBadge;
