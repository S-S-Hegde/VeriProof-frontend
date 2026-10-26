import React, { useId } from "react";
import { motion } from "framer-motion";
import { useContactReducedMotion } from "../hooks/useReducedMotion";

/**
 * Physical printed ruled field.
 * Label above in small caps, clean baseline, typed ink in JetBrains Mono.
 * When focused, draws a 2px cyan ink underline from left to right.
 * Validation errors appear as red-ink margin notes.
 */
export function RuledField({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  type = "text",
  isMultiline = false,
  rows = 4,
  error,
  isFocused = false,
  extraHeaderRight = null,
  disabled = false,
}) {
  const autoId = useId();
  const fieldId = id || autoId;
  const errorId = `${fieldId}-error`;
  const prefersReduced = useContactReducedMotion();

  return (
    <div className="relative flex flex-col w-full group">
      {/* Label and optional header right item (e.g. prefill 'Not you?') */}
      <div className="flex items-baseline justify-between mb-1">
        <label
          htmlFor={fieldId}
          className="text-[11px] uppercase tracking-widest font-mono text-[#0a0f24]/70 font-semibold select-none"
        >
          {label}
        </label>
        {extraHeaderRight}
      </div>

      {/* Ruled input container */}
      <div className="relative w-full">
        {isMultiline ? (
          <textarea
            id={fieldId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="w-full bg-transparent text-[#0a0f24] font-mono text-sm leading-relaxed placeholder:text-[#0a0f24]/30 focus:outline-none resize-none pt-1 pb-1 transition-colors duration-150"
          />
        ) : (
          <input
            id={fieldId}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="w-full bg-transparent text-[#0a0f24] font-mono text-sm leading-normal placeholder:text-[#0a0f24]/30 focus:outline-none pt-1 pb-1 transition-colors duration-150"
          />
        )}

        {/* Base ruled line (printed paper baseline) */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#0a0f24]/20 pointer-events-none"
        />

        {/* Cyan ink focus line (draws left to right) */}
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00d4ff] origin-left pointer-events-none"
          initial={false}
          animate={{
            scaleX: isFocused ? 1 : 0,
            opacity: isFocused ? 1 : 0,
          }}
          transition={
            prefersReduced
              ? { duration: 0 }
              : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
          }
        />
      </div>

      {/* Red ink validation error — margin note format */}
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="mt-1 flex items-center gap-1 text-[11px] font-mono text-[#b91c1c] font-medium tracking-tight"
        >
          <span aria-hidden="true">↳</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default RuledField;
