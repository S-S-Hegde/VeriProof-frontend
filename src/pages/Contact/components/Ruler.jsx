import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useContactReducedMotion } from "../hooks/useReducedMotion";

const IDLE_Y = 72; // Resting spot near the top of the ruler

/**
 * Maps a focused DOM element to a readable mono label for the ruler readout.
 */
function getFieldLabel(el) {
  if (!el) return "Idle";
  const id = el.id || "";
  if (id === "contact-sender-name") return "FROM";
  if (id === "contact-sender-email") return "REPLY TO";
  if (id === "contact-company-roles") return "ROLES";
  if (id === "contact-page-visited") return "PAGE";
  if (id === "contact-message-details") return "DETAILS";
  if (el.getAttribute("role") === "radio" || el.closest('[role="radiogroup"]')) return "RE:";
  if (el.type === "checkbox") return "ENV";
  if (el.type === "submit" || el.closest('button[type="submit"]')) return "SEND";

  // Check parent label text if available
  const groupLabel = el.closest(".group")?.querySelector("label")?.textContent?.trim();
  if (groupLabel) {
    if (groupLabel.toLowerCase().includes("from")) return "FROM";
    if (groupLabel.toLowerCase().includes("reply")) return "REPLY TO";
    if (groupLabel.toLowerCase().includes("details")) return "DETAILS";
    return groupLabel.slice(0, 8).toUpperCase();
  }

  return "FIELD";
}

/**
 * Finds the exact line/boundary element to measure for the focused element.
 * For RuledField instances, returns the [data-ruled-line] baseline.
 * For buttons, stamps and other elements, returns the element itself.
 */
function getTargetLineElement(el) {
  if (!el) return null;
  // Look for the specific ruled line element inside the field container
  const ruledLine =
    el.closest(".relative")?.querySelector('[data-ruled-line="true"]') ||
    el.closest(".group")?.querySelector('[data-ruled-line="true"]');
  if (ruledLine) return ruledLine;
  return el;
}

export function Ruler({ tagContainerId = "intake-tag-container" }) {
  const prefersReduced = useContactReducedMotion();
  const rulerRef = useRef(null);
  const focusedElementRef = useRef(null);
  const rafIdRef = useRef(null);
  const straightenRafRef = useRef(null);

  const [isFocused, setIsFocused] = useState(false);
  const [fieldLabel, setFieldLabel] = useState("Idle");
  const [offScreenState, setOffScreenState] = useState("none"); // 'none' | 'up' | 'down'
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 900
  );

  // Motion value for marker target Y (avoids re-rendering React on keystrokes/scroll)
  const markerTargetY = useMotionValue(IDLE_Y);

  // Spring physics: stiffness ~260, damping ~30
  const springY = useSpring(markerTargetY, {
    stiffness: 260,
    damping: 30,
  });

  // When prefersReduced is true, bypass spring for instantaneous position updates
  const animatedY = prefersReduced ? markerTargetY : springY;

  /**
   * Core measurement function: reads viewport coordinates of the field line
   * and clamps to ruler visible range. Batched via rAF.
   */
  const measure = useCallback(
    (immediate = false) => {
      const doMeasure = () => {
        const fieldEl = focusedElementRef.current;
        const rulerEl = rulerRef.current;

        if (!fieldEl || !rulerEl) {
          markerTargetY.set(IDLE_Y);
          setOffScreenState("none");
          return;
        }

        const lineEl = getTargetLineElement(fieldEl);
        if (!lineEl) return;

        const lineRect = lineEl.getBoundingClientRect();
        const rulerRect = rulerEl.getBoundingClientRect();

        // Screen height of the vertical centre of the currently focused field's ruled line
        const lineCenterY = lineRect.top + lineRect.height / 2;
        // Viewport coordinate relative to the ruler container (fixed position, no scroll offset)
        const computedY = lineCenterY - rulerRect.top;

        const currentVh = window.visualViewport
          ? window.visualViewport.height
          : window.innerHeight;
        const minY = 20;
        const maxY = currentVh - 20;

        let clampedY = computedY;
        let newOffScreen = "none";

        if (computedY < minY) {
          clampedY = minY;
          newOffScreen = "up";
        } else if (computedY > maxY) {
          clampedY = maxY;
          newOffScreen = "down";
        }

        markerTargetY.set(clampedY);
        setOffScreenState((prev) => (prev !== newOffScreen ? newOffScreen : prev));
      };

      if (immediate) {
        doMeasure();
      } else {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(doMeasure);
      }
    },
    [markerTargetY]
  );

  /**
   * Continuously re-measures during the ~300ms tag straightening animation
   * so the marker stays glued to the field line as it un-rotates.
   */
  const startStraightenTracking = useCallback(() => {
    if (prefersReduced) return;
    const startTime = performance.now();
    const DURATION_MS = 380;

    const tick = (now) => {
      measure(true);
      if (now - startTime < DURATION_MS && focusedElementRef.current) {
        straightenRafRef.current = requestAnimationFrame(tick);
      }
    };

    if (straightenRafRef.current) cancelAnimationFrame(straightenRafRef.current);
    straightenRafRef.current = requestAnimationFrame(tick);
  }, [prefersReduced, measure]);

  // Set up event delegation on the IntakeTag container
  useEffect(() => {
    const container = document.getElementById(tagContainerId);
    if (!container) return;

    // Single focusin listener (delegated)
    const handleFocusIn = (e) => {
      const target = e.target;
      if (!target) return;
      focusedElementRef.current = target;
      setIsFocused(true);
      setFieldLabel(getFieldLabel(target));

      measure(true);
      startStraightenTracking();
    };

    // Single focusout listener (delegated)
    const handleFocusOut = (e) => {
      const related = e.relatedTarget;
      // If focus moved outside the tag container, ease back to idle
      if (!related || !container.contains(related)) {
        focusedElementRef.current = null;
        setIsFocused(false);
        setFieldLabel("Idle");
        setOffScreenState("none");
        markerTargetY.set(IDLE_Y);
      }
    };

    container.addEventListener("focusin", handleFocusIn);
    container.addEventListener("focusout", handleFocusOut);

    // Straighten animation completion event
    const handleStraightenComplete = () => {
      measure(true);
    };
    window.addEventListener("intake-tag-animation-complete", handleStraightenComplete);

    // Passive scroll and resize listeners
    const handleWindowResize = () => {
      setViewportHeight(window.innerHeight);
      measure();
    };
    const handleWindowScroll = () => {
      measure();
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    window.addEventListener("resize", handleWindowResize, { passive: true });

    // Mobile visualViewport listeners (handles virtual keyboard open/close and panning)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleWindowResize, { passive: true });
      window.visualViewport.addEventListener("scroll", handleWindowScroll, { passive: true });
    }

    // ResizeObserver on the tag (covers topic-specific fields expanding/collapsing)
    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        measure();
      });
      resizeObserver.observe(container);
    }

    return () => {
      container.removeEventListener("focusin", handleFocusIn);
      container.removeEventListener("focusout", handleFocusOut);
      window.removeEventListener("intake-tag-animation-complete", handleStraightenComplete);
      window.removeEventListener("scroll", handleWindowScroll);
      window.removeEventListener("resize", handleWindowResize);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleWindowResize);
        window.visualViewport.removeEventListener("scroll", handleWindowScroll);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (straightenRafRef.current) {
        cancelAnimationFrame(straightenRafRef.current);
      }
    };
  }, [tagContainerId, measure, startStraightenTracking, markerTargetY]);

  // Generate ticks for the entire viewport height
  // Minor tick every 8px, longer tick every 40px, tiny mono numerals every 80px
  const ticks = useMemo(() => {
    const count = Math.ceil(viewportHeight / 8) + 1;
    const arr = [];
    for (let i = 0; i < count; i++) {
      const y = i * 8;
      arr.push({
        y,
        isMajor: y % 40 === 0,
        isNumbered: y % 80 === 0,
      });
    }
    return arr;
  }, [viewportHeight]);

  return (
    <aside
      ref={rulerRef}
      aria-hidden="true"
      className="fixed left-0 top-0 bottom-0 w-[14px] lg:w-[28px] pointer-events-none select-none z-30"
    >
      <div className="relative w-full h-full border-r border-[#0a0f24]/20 dark:border-white/10 overflow-hidden">
        {/* ─── TICK MARKS & NUMERALS ─── */}
        {ticks.map((t) => (
          <div
            key={t.y}
            style={{ top: `${t.y}px` }}
            className="absolute right-0 flex items-center justify-end w-full"
          >
            {/* Tiny mono numerals every 80px (desktop only) */}
            {t.isNumbered && (
              <span className="hidden lg:block absolute left-1 text-[8px] font-mono leading-none tracking-tighter text-[#0a0f24]/35 dark:text-[#e9eef5]/35">
                {t.y}
              </span>
            )}
            {/* Tick line */}
            <div
              className={`transition-colors ${
                t.isMajor
                  ? "w-2 lg:w-3 h-[1px] bg-[#0a0f24]/30 dark:bg-[#e9eef5]/30"
                  : "w-1 lg:w-1.5 h-[1px] bg-[#0a0f24]/20 dark:bg-[#e9eef5]/20"
              }`}
            />
          </div>
        ))}

        {/* ─── CYAN INK MARKER & READOUT ─── */}
        <motion.div
          style={{ y: animatedY }}
          animate={{
            opacity: isFocused ? 1 : 0.4,
          }}
          transition={
            prefersReduced ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }
          }
          className="absolute right-0 -mr-[1px] flex items-center pointer-events-none -translate-y-1/2"
        >
          {/* Off-screen up arrow pin */}
          {offScreenState === "up" ? (
            <div className="flex items-center text-[#00758a] dark:text-[#00d4ff]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <polygon points="5,1 1,8 9,8" />
              </svg>
            </div>
          ) : offScreenState === "down" ? (
            /* Off-screen down arrow pin */
            <div className="flex items-center text-[#00758a] dark:text-[#00d4ff]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <polygon points="5,9 1,2 9,2" />
              </svg>
            </div>
          ) : (
            /* Standard marker: short horizontal tick with small triangular pointer */
            <div className="flex items-center text-[#00758a] dark:text-[#00d4ff]">
              {/* Short horizontal tick */}
              <div className="w-2.5 lg:w-3.5 h-[2px] bg-[#00758a] dark:bg-[#00d4ff]" />
              {/* Triangular pointer pointing towards the form */}
              <svg
                width="6"
                height="8"
                viewBox="0 0 6 8"
                fill="currentColor"
                className="shrink-0 -ml-[1px]"
              >
                <polygon points="0,0 6,4 0,8" />
              </svg>
            </div>
          )}

          {/* Tiny mono readout beside marker (desktop only) */}
          <div className="hidden lg:flex items-center ml-2 pointer-events-none select-none">
            <span className="px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase tracking-wider bg-[#00758a]/10 dark:bg-[#00d4ff]/10 text-[#00758a] dark:text-[#00d4ff] border border-[#00758a]/30 dark:border-[#00d4ff]/30 shadow-sm whitespace-nowrap">
              {fieldLabel}
            </span>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}

export default Ruler;
