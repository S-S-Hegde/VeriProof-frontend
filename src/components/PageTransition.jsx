import { motion, useReducedMotion } from "framer-motion";

/**
 * ═══════════════════════════════════════════════════════════════
 * VERIPROOF — HIGH-PERFORMANCE CINEMATIC PAGE TRANSITION
 * ═══════════════════════════════════════════════════════════════
 * 100% GPU Composited with zero heavy filters or layout shifts.
 * Smoothly interpolates opacity and vertical elevation without
 * blocking Lenis scroll physics or user inputs.
 */

const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.996,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1], // Fluid Apple/Vercel standard curve
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.998,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export default function PageTransition({ children }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? reducedVariants : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        width: "100%",
        minHeight: "100%",
        willChange: "transform, opacity",
        transform: "translate3d(0, 0, 0)",
        backfaceVisibility: "hidden",
      }}
      className="page-transition-wrapper flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
}
