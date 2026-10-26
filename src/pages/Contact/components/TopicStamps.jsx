import React, { useRef } from "react";
import { motion } from "framer-motion";
import { contactCopy } from "../copy";
import { useContactReducedMotion } from "../hooks/useReducedMotion";

/**
 * Rubber-stamp topic selector.
 * Operates as a keyboard accessible radio group with arrow-key navigation.
 * Selected stamp stays inked in cyan (#00d4ff) with a physical press response.
 */
export function TopicStamps({
  selectedTopic,
  onSelectTopic,
  onFocus,
  onBlur,
  error,
}) {
  const topics = contactCopy.topics;
  const prefersReduced = useContactReducedMotion();
  const groupRef = useRef(null);

  const handleKeyDown = (e, index) => {
    let targetIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      targetIndex = (index + 1) % topics.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      targetIndex = (index - 1 + topics.length) % topics.length;
    }

    if (targetIndex !== -1) {
      const nextTopic = topics[targetIndex];
      onSelectTopic(nextTopic.id);
      // Focus target element
      const buttons = groupRef.current?.querySelectorAll('[role="radio"]');
      if (buttons && buttons[targetIndex]) {
        buttons[targetIndex].focus();
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* SVG Ink Filter Definition for tactile rubber stamp roughness */}
      <svg className="sr-only" aria-hidden="true">
        <filter id="stamp-ink-filter" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.08"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="0.8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div className="flex items-baseline justify-between">
        <span
          id="topic-group-label"
          className="text-[11px] uppercase tracking-widest font-mono text-[#0a0f24]/70 font-semibold select-none"
        >
          {contactCopy.tag.labels.topic}
        </span>
        <span className="text-[10px] font-mono text-[#0a0f24]/40 uppercase tracking-wider">
          Single select
        </span>
      </div>

      {/* Accessible Radiogroup */}
      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby="topic-group-label"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5"
      >
        {topics.map((t, idx) => {
          const isSelected = selectedTopic === t.id;
          return (
            <motion.button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : idx === 0 && !selectedTopic ? 0 : -1}
              onClick={() => onSelectTopic(t.id)}
              onFocus={() => onFocus?.("topic")}
              onBlur={onBlur}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              whileHover={
                prefersReduced
                  ? {}
                  : { scale: 1.01, rotate: idx % 2 === 0 ? 0.4 : -0.4 }
              }
              whileTap={
                prefersReduced
                  ? {}
                  : { scale: 0.97, rotate: idx % 2 === 0 ? -0.8 : 0.8 }
              }
              style={{
                filter: isSelected ? "url(#stamp-ink-filter)" : "none",
              }}
              className={`relative px-3 py-2 text-left rounded-sm font-mono text-xs transition-colors duration-150 border focus:outline-none focus:ring-1 focus:ring-[#00d4ff] ${
                isSelected
                  ? "border-[#00d4ff] bg-[#00d4ff]/10 text-[#006b80] dark:text-[#008ba3] font-bold shadow-none"
                  : "border-[#0a0f24]/20 bg-transparent text-[#0a0f24]/80 hover:border-[#0a0f24]/40 hover:bg-[#0a0f24]/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate tracking-tight leading-snug">
                  {t.label}
                </span>
                <span
                  className={`text-[9px] font-mono shrink-0 uppercase tracking-tighter ${
                    isSelected
                      ? "text-[#008ba3] font-bold"
                      : "text-[#0a0f24]/40"
                  }`}
                >
                  [{t.stampText.split("//")[1]?.trim() || "00"}]
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center gap-1 text-[11px] font-mono text-[#b91c1c] font-medium"
        >
          <span aria-hidden="true">↳</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default TopicStamps;
