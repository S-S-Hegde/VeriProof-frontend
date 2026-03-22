import { motion } from "framer-motion";

const animations = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    filter: "brightness(3) contrast(2) sepia(1) saturate(5) hue-rotate(-30deg) blur(10px)"
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    filter: "brightness(1) contrast(1) sepia(0) saturate(1) hue-rotate(0deg) blur(0px)" 
  },
  exit: { 
    opacity: 0, 
    scale: 1.05,
    filter: "brightness(3) contrast(2) sepia(1) saturate(5) hue-rotate(-30deg) blur(10px)"
  },
  transition: { 
    duration: 0.8, 
    ease: "easeInOut" 
  },
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
