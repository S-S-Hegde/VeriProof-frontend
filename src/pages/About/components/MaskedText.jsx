import React from "react";
import { motion } from "framer-motion";

/**
 * MaskedLine: Renders a single line of text wrapped in an overflow-hidden mask
 * that slides up smoothly from below (EternaCloud / GSAP SplitText effect).
 */
export function MaskedLine({ children, delay = 0, className = "" }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        initial={{ y: "110%", opacity: 0 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
        transition={{
          duration: 0.9,
          delay,
          ease: [0.16, 1, 0.3, 1], // Quintic out for buttery editorial reveal
        }}
        className="block"
      >
        {children}
      </motion.span>
    </span>
  );
}

/**
 * MaskedHeading: Splits an array of line strings/elements and animates each in sequence
 */
export function MaskedHeading({
  lines = [],
  as = "h2",
  className = "",
  delayStart = 0,
  stagger = 0.12,
}) {
  const Component = as;
  return (
    <Component className={className}>
      {lines.map((line, idx) => (
        <span key={idx} className="block overflow-hidden">
          <motion.span
            initial={{ y: "110%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
            transition={{
              duration: 0.95,
              delay: delayStart + idx * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="block"
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}

/**
 * FadeInSubhead: Smooth opacity + slight translate for paragraphs following a masked title
 */
export function FadeInSubhead({ children, delay = 0.25, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6% 0px -6% 0px" }}
      transition={{
        duration: 0.85,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
