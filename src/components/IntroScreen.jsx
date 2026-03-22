import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const IntroScreen = ({ onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Cinematic slow intro
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 1200); // Allow fade out
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isAnimating ? 1 : 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ibex-bg overflow-hidden"
    >
      <div className="relative flex flex-col items-center">
        {/* Subtle glow behind logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ibex-gold/20 rounded-full blur-[100px]"
        />

        <motion.h1
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="text-4xl md:text-6xl text-gradient tracking-[0.4em] uppercase font-light relative z-10 font-sans"
        >
          VERIPROOF
        </motion.h1>

        {/* Revealing elegant line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.5, ease: "easeInOut" }}
          className="h-[1px] w-32 bg-gradient-premium opacity-50 mt-8"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1.2 }}
          className="mt-6 text-ibex-muted text-sm tracking-[0.3em] uppercase"
        >
          Acquire Excellence
        </motion.div>
      </div>
    </motion.div>
  );
};

export default IntroScreen;
