import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { contactCopy } from "../copy";
import { useContactReducedMotion } from "../hooks/useReducedMotion";

/**
 * Perforated tear strip at the bottom of the evidence tag.
 * Contains a dynamic decorative barcode that changes based on input text hash,
 * and animates detaching (ripping) on successful form submission.
 */
export function TearStrip({ textForHash = "", isTorn = false }) {
  const prefersReduced = useContactReducedMotion();

  // Generate decorative barcode bars from a simple string hash
  const barcodeBars = useMemo(() => {
    let hash = 0;
    const str = textForHash || "VERIPROOF-INTAKE-EVIDENCE-LOG";
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    // Generate 32 bars with widths between 1px and 3px
    return Array.from({ length: 32 }, (_, i) => {
      const bit = ((seed >> (i % 30)) + i * 7) % 5;
      const width = bit === 0 ? 1 : bit === 1 ? 2 : bit === 2 ? 3 : 1.5;
      const isSpace = i % 4 === 0 && bit > 2;
      return { id: i, width, isSpace };
    });
  }, [textForHash]);

  return (
    <motion.div
      aria-hidden="true"
      className="relative w-full pt-4 mt-6 overflow-hidden select-none"
      animate={
        isTorn
          ? prefersReduced
            ? { opacity: 0 }
            : {
                y: [0, 30, 160],
                rotate: [0, 5, 16],
                opacity: [1, 0.8, 0],
                transition: { duration: 0.75, ease: "easeIn" },
              }
          : { y: 0, rotate: 0, opacity: 1 }
      }
    >
      {/* Perforated tear line with edge notches */}
      <div className="relative w-full flex items-center justify-between mb-3">
        {/* Left notch */}
        <div className="absolute -left-7 w-3.5 h-3.5 rounded-full bg-[#050816] dark:bg-[#050816] light:bg-[#f4f7fb]" />
        {/* Dashed perforation */}
        <div className="w-full border-b border-dashed border-[#0a0f24]/30" />
        {/* Right notch */}
        <div className="absolute -right-7 w-3.5 h-3.5 rounded-full bg-[#050816] dark:bg-[#050816] light:bg-[#f4f7fb]" />
      </div>

      {/* Tear strip content */}
      <div className="flex items-center justify-between gap-4 pt-1 px-1">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono tracking-widest text-[#0a0f24]/50 uppercase font-semibold">
            {contactCopy.tag.tearInstruction}
          </span>
          <span className="text-[8px] font-mono text-[#0a0f24]/30">
            SEC.204 // LAB TRANSMISSION DRAFT
          </span>
        </div>

        {/* Decorative barcode strip */}
        <div className="flex items-end h-6 gap-[1.5px] px-1 bg-white/40 border border-[#0a0f24]/10 rounded-[1px]">
          {barcodeBars.map((bar) => (
            <div
              key={bar.id}
              style={{
                width: `${bar.width}px`,
                opacity: bar.isSpace ? 0 : 0.85,
              }}
              className="h-full bg-[#0a0f24]"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default TearStrip;
