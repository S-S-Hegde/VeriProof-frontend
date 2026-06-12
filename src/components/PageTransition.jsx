import { motion } from "framer-motion";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
    filter: "blur(6px)",
    clipPath: "inset(2% 1% 2% 1% round 12px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    clipPath: "inset(0% 0% 0% 0% round 0px)",
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(3px)",
    clipPath: "inset(1% 0.5% 1% 0.5% round 8px)",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const PageTransition = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
);

export default PageTransition;
