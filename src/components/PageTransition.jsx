import { motion, useReducedMotion } from "framer-motion";

/**
 * "Curtain Reveal" page transition
 * ---------------------------------
 * Two panels (the "curtains") cover the page, then slide apart to reveal it —
 * a theater/film-reveal beat rather than a plain fade. A single gold flare
 * streaks across the seam right as the curtains finish opening. The content
 * underneath scales in from a soft blur, slightly delayed so it feels
 * revealed rather than just appearing.
 *
 * Structure:
 *  - stage (outer motion.div, AnimatePresence-controlled) — orchestrator only
 *  - curtainLeft / curtainRight — slide off-screen on enter, slide back on exit
 *  - flare — thin gold streak, fires once right as curtains finish
 *  - content — the actual page, scale + blur in
 *
 * Children inherit "initial" / "animate" / "exit" from the stage
 * automatically (no need to set those props on each child individually).
 */

const stageVariants = {
  initial: {},
  animate: {},
  exit: {},
};

const curtainBase = {
  position: "absolute",
  top: 0,
  bottom: 0,
  width: "51%",
  zIndex: 3,
  pointerEvents: "none",
  background: "linear-gradient(135deg, #3D1830 0%, #0B1220 100%)",
};

const curtainLeftVariants = {
  initial: { x: "0%" },
  animate: {
    x: "-100%",
    transition: { duration: 0.65, ease: [0.83, 0, 0.17, 1], delay: 0.05 },
  },
  exit: {
    x: "0%",
    transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] },
  },
};

const curtainRightVariants = {
  initial: { x: "0%" },
  animate: {
    x: "100%",
    transition: { duration: 0.65, ease: [0.83, 0, 0.17, 1], delay: 0.05 },
  },
  exit: {
    x: "0%",
    transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] },
  },
};

const flareVariants = {
  initial: { opacity: 0, scaleY: 0.3 },
  animate: {
    opacity: [0, 1, 0],
    scaleY: [0.3, 1, 0.6],
    transition: {
      duration: 0.5,
      times: [0, 0.4, 1],
      ease: "easeOut",
      delay: 0.55,
    },
  },
  exit: { opacity: 0 },
};

const contentVariants = {
  initial: { opacity: 0, scale: 1.05, filter: "blur(10px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    filter: "blur(6px)",
    transition: { duration: 0.25, ease: [0.6, 0, 1, 1] },
  },
};

const reducedContentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const PageTransition = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <motion.div
        variants={reducedContentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={stageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ position: "relative", isolation: "isolate", overflow: "hidden" }}
    >
      <motion.div variants={contentVariants}>{children}</motion.div>

      <motion.div
        variants={curtainLeftVariants}
        aria-hidden="true"
        style={{ ...curtainBase, left: 0 }}
      />
      <motion.div
        variants={curtainRightVariants}
        aria-hidden="true"
        style={{ ...curtainBase, right: 0 }}
      />

      <motion.div
        variants={flareVariants}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: "3px",
          zIndex: 4,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, transparent 0%, #C9A24B 25%, #E8927C 50%, #C9A24B 75%, transparent 100%)",
          boxShadow: "0 0 20px 2px rgba(201, 162, 75, 0.7)",
        }}
      />
    </motion.div>
  );
};

export default PageTransition;
