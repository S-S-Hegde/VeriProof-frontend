import React from "react";
import { useTheme } from "../context/ThemeContext";

const InfiniteMarquee = ({ text, speed = 20, reverse = false }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className="relative w-full overflow-hidden border-y border-current opacity-20 pointer-events-none my-12"
      style={{
        borderColor: isDarkMode
          ? "rgba(245, 158, 11, 0.05)"
          : "rgba(37, 99, 235, 0.05)",
      }}
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(${reverse ? "-50%" : "0%"}); }
          100% { transform: translateX(${reverse ? "0%" : "-50%"}); }
        }
        .animate-marquee-css {
          display: flex;
          width: fit-content;
          animation: marquee ${speed}s linear infinite;
        }
      `}</style>

      <div className="animate-marquee-css">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className={`text-6xl md:text-8xl font-black tracking-[0.2em] uppercase px-8 select-none transition-colors duration-700 whitespace-nowrap ${
              isDarkMode
                ? "font-serif italic text-amber-500/10"
                : "font-sans text-slate-900/5"
            }`}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default InfiniteMarquee;
