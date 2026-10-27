import React from "react";
import { motion } from "framer-motion";

/**
 * WordSlideUp:
 * Splits a sentence into individual words with an overflow-hidden mask.
 * Accurately replicates EternaCloud's signature GSAP SplitType:
 * tl.from(words, { opacity: 0, yPercent: 100, duration: 0.6, ease: "back.out(2)", stagger: 0.04 })
 */
export function WordSlideUp({
  text,
  className = "",
  as = "span",
  delay = 0,
  stagger = 0.04,
}) {
  const Component = as;
  const words = text.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: "115%",
    },
    visible: {
      opacity: 1,
      y: "0%",
      transition: {
        duration: 0.62,
        ease: [0.34, 1.45, 0.64, 1], // back.out(2) signature bounce curve
      },
    },
  };

  return (
    <Component className={`inline-block ${className}`}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
        className="inline-flex flex-wrap gap-x-[0.26em] gap-y-[0.08em]"
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden py-[2px] leading-tight">
            <motion.span variants={wordVariants} className="inline-block">
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
}

/**
 * FadeInParagraph:
 * Smooth opacity fade for body paragraphs
 */
export function FadeInParagraph({ children, delay = 0.25, className = "" }) {
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
