import React from "react";
import { motion } from "framer-motion";
import { useContactReducedMotion } from "../hooks/useReducedMotion";

/**
 * Heavy rubber-stamped "RECEIVED" seal in cyan ink.
 * Thuds down onto the tag upon successful submission with date/time and Ref ID.
 * Strictly ink aesthetic — never a glow.
 */
export function ReceivedStamp({ refId, submittedAt }) {
  const prefersReduced = useContactReducedMotion();

  return (
    <motion.div
      aria-label={`Submission received. Reference ${refId || "recorded"}.`}
      initial={
        prefersReduced
          ? { opacity: 0 }
          : { opacity: 0, scale: 1.8, rotate: -18 }
      }
      animate={{
        opacity: 0.95,
        scale: 1,
        rotate: -12,
      }}
      transition={
        prefersReduced
          ? { duration: 0.2 }
          : {
              type: "spring",
              stiffness: 420,
              damping: 18,
              mass: 1.2,
            }
      }
      className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-30"
    >
      <div className="relative border-4 border-dashed border-[#00d4ff] px-6 py-4 rounded-sm bg-[#00d4ff]/10 text-center backdrop-blur-[1px]">
        {/* Double border ink effect */}
        <div className="absolute inset-1 border border-[#00d4ff]/60 pointer-events-none" />

        <div className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-[#00a3c4] uppercase">
          RECEIVED
        </div>

        <div className="mt-1 flex flex-col items-center text-[10px] sm:text-xs font-mono font-semibold tracking-wider text-[#007b94]">
          {refId && <span>REF: {refId}</span>}
          {submittedAt && <span>{submittedAt}</span>}
          <span className="text-[9px] uppercase tracking-widest mt-0.5 opacity-80">
            VERIPROOF INTAKE PROTOCOL
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default ReceivedStamp;
