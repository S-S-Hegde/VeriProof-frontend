import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const InfiniteMarquee = ({ text, speed = 20, reverse = false }) => {
  const { isDarkMode } = useTheme();

  const marqueeVariants = {
    animate: {
      x: reverse ? [0, 1000] : [0, -1000],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: speed,
          ease: "linear",
        },
      },
    },
  };

  const content = (
    <div className="flex whitespace-nowrap py-4">
      {[...Array(10)].map((_, i) => (
        <span
          key={i}
          className={`text-6xl md:text-8xl font-black tracking-[0.2em] uppercase px-8 select-none transition-colors duration-700 ${
            isDarkMode 
              ? "font-serif italic text-amber-500/10 hover:text-amber-500/30" 
              : "font-sans text-slate-900/5 hover:text-blue-600/10"
          }`}
        >
          {text}
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden border-y border-current opacity-20 pointer-events-none my-12"
         style={{ borderColor: isDarkMode ? "rgba(245, 158, 11, 0.05)" : "rgba(37, 99, 235, 0.05)" }}>
      <motion.div
        className="flex"
        variants={marqueeVariants}
        animate="animate"
      >
        {content}
        {content}
      </motion.div>
    </div>
  );
};

export default InfiniteMarquee;
