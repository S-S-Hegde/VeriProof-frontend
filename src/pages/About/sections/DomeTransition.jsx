import React from "react";
import { motion } from "framer-motion";

export default function DomeTransition() {
  return (
    <div className="relative w-full overflow-hidden pointer-events-none -mb-1 z-10" style={{ height: "clamp(160px, 22vh, 280px)" }}>
      {/* Background radial lobes matching reference dome */}
      <div className="absolute inset-0">
        {/* Left violet lobe */}
        <div
          className="absolute left-0 bottom-0 w-[45vw] h-[90%] opacity-70"
          style={{
            background: "radial-gradient(ellipse 70% 85% at 0% 100%, rgba(124, 58, 237, 0.45) 0%, rgba(91, 33, 182, 0.2) 50%, transparent 80%)",
            filter: "blur(40px)",
          }}
        />

        {/* Right violet lobe */}
        <div
          className="absolute right-0 bottom-0 w-[45vw] h-[90%] opacity-70"
          style={{
            background: "radial-gradient(ellipse 70% 85% at 100% 100%, rgba(109, 40, 217, 0.45) 0%, rgba(76, 29, 149, 0.2) 50%, transparent 80%)",
            filter: "blur(40px)",
          }}
        />

        {/* Center-bottom blue glow */}
        <div
          className="absolute left-[20vw] right-[20vw] bottom-0 h-[80%] opacity-65"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(37, 99, 235, 0.35) 0%, rgba(30, 64, 175, 0.15) 50%, transparent 80%)",
            filter: "blur(50px)",
          }}
        />

        {/* Dome upward curve mask transitioning into #fafafa */}
        <svg
          viewBox="0 0 1440 220"
          fill="none"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-[180px] text-[#fafafa]"
        >
          <path
            d="M 0 220 L 0 110 C 360 30, 1080 30, 1440 110 L 1440 220 Z"
            fill="#fafafa"
          />
        </svg>
      </div>
    </div>
  );
}
