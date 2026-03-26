/**
 * PageTransition — cinematic page-change effect
 *
 * The transition works in two stages:
 *   EXIT:  current page burns/slides right + saturates → fades to black
 *   ENTER: new page slides in from left + unsaturates → arrives
 *
 * Combined with AnimatePresence mode="wait" in App.jsx this gives a
 * smooth BURN → ARRIVE effect between every route change.
 */
import { motion } from "framer-motion";

// Duration shared between exit + enter so they don't overlap
const DUR = 0.42;

const variants = {
  initial: {
    opacity:   0,
    x:         "-4vw",
    scale:     0.97,
    filter:    "brightness(2.5) saturate(4) blur(6px)",
  },
  animate: {
    opacity:   1,
    x:         0,
    scale:     1,
    filter:    "brightness(1) saturate(1) blur(0px)",
    transition: {
      duration: DUR,
      ease:     [0.25, 0.46, 0.45, 0.94],   // custom cubic-bezier: fast-out-slow-in
    },
  },
  exit: {
    opacity:   0,
    x:         "4vw",
    scale:     1.03,
    filter:    "brightness(3) saturate(6) blur(12px) hue-rotate(-20deg)",
    transition: {
      duration: DUR * 0.8,
      ease:     [0.55, 0, 1, 0.45],          // fast-in, snappy exit
    },
  },
};

const PageTransition = ({ children, className = "" }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    style={{ willChange: "transform, opacity, filter" }}
    className={`relative ${className}`}
  >
    {children}
  </motion.div>
);

export default PageTransition;
