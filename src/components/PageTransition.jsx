import { motion } from "framer-motion";

const animations = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
};

const PageTransition = ({ children, className = "" }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animations}
      transition={animations.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
