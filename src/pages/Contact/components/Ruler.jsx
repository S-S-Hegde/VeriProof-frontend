import React from "react";
import { motion } from "framer-motion";
import { useContactReducedMotion } from "../hooks/useReducedMotion";

/**
 * Vertical ruler running down the left edge on desktop with tick marks
 * and a cyan marker that follows the currently focused field.
 * Becomes a top progress line on mobile. Purely decorative.
 */
export function Ruler({ activeField, progress = 0 }) {
  const prefersReduced = useContactReducedMotion();

  // Field position mappings along the ruler percentage (0 to 100)
  const fieldPositions = {
    name: 24,
    email: 36,
    topic: 50,
    companyAndRoles: 62,
    pageVisited: 62,
    message: 76,
  };

  const targetPercentage = activeField ? fieldPositions[activeField] ?? 20 : 10;

  // Generate 40 tick marks along the ruler
  const ticks = Array.from({ length: 41 }, (_, i) => ({
    id: i,
    isMajor: i % 5 === 0,
    isLabeled: i % 10 === 0,
    label: (i * 2.5).toFixed(0),
  }));

  return (
    <>
      {/* ─── DESKTOP VERTICAL RULER (hidden on mobile/tablet) ─── */}
      <aside
        aria-hidden="true"
        className="hidden lg:flex fixed left-4 xl:left-8 top-28 bottom-16 w-8 flex-col items-center justify-between pointer-events-none select-none z-20"
      >
        <div className="relative w-full h-full flex flex-col justify-between py-2 border-r border-[#0a0f24]/15 dark:border-white/10">
          {/* Ticks */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {ticks.map((t) => (
              <div
                key={t.id}
                className="relative flex items-center justify-end w-full"
              >
                {t.isLabeled && (
                  <span className="absolute -left-1 text-[9px] font-mono tracking-tighter text-[#0a0f24]/40 dark:text-slate-500 font-medium">
                    {t.label}
                  </span>
                )}
                <span
                  className={`block transition-colors duration-200 ${
                    t.isMajor
                      ? "w-3 h-[1.5px] bg-[#0a0f24]/30 dark:bg-white/20"
                      : "w-1.5 h-[1px] bg-[#0a0f24]/15 dark:bg-white/10"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Active Field Cyan Marker */}
          <motion.div
            className="absolute right-0 flex items-center -mr-[1px]"
            initial={false}
            animate={{
              top: `${targetPercentage}%`,
              opacity: activeField ? 1 : 0.25,
            }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 350, damping: 30 }
            }
          >
            {/* Ink indicator without any glow */}
            <div className="w-4 h-[2px] bg-[#00d4ff]" />
            <div className="w-1.5 h-1.5 -ml-1 rotate-45 bg-[#00d4ff]" />
          </motion.div>
        </div>
      </aside>

      {/* ─── MOBILE TOP PROGRESS LINE ─── */}
      <div
        aria-hidden="true"
        className="lg:hidden fixed top-0 left-0 right-0 h-1 z-50 bg-[#0a0f24]/10 dark:bg-white/5 pointer-events-none"
      >
        <motion.div
          className="h-full bg-[#00d4ff]"
          initial={false}
          animate={{
            width: `${Math.min(100, Math.max(10, progress * 100))}%`,
          }}
          transition={
            prefersReduced ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }
          }
        />
      </div>
    </>
  );
}

export default Ruler;
