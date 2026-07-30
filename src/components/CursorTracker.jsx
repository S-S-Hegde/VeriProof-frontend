/**
 * CursorTracker — GPU-only, zero Framer Motion overhead
 *
 * Performance approach:
 *  - The outer "ring" follows via CSS custom properties + CSS transform (no JS spring)
 *  - The inner "dot" is absolute to the ring — no separate spring
 *  - A single requestAnimationFrame loop drives both the DOM mutation and CSS vars
 *  - No motion.div animate prop (no Framer JS-driven style recalculation per frame)
 *  - Hover state triggers a single CSS class toggle, transition handled entirely in CSS
 */
import { useEffect, useRef } from "react";

const CursorTracker = () => {
  const ringRef = useRef(null);
  const dotRef  = useRef(null);
  const posRef  = useRef({ x: -200, y: -200 });
  const rafRef  = useRef(null);

  useEffect(() => {
    // No custom cursor on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const ring = ringRef.current;
    const dot  = dotRef.current;
    if (!ring || !dot) return;

    // Show cursors
    ring.style.opacity = "1";
    dot.style.opacity  = "1";

    // Single pointermove handler — writes to ref only (no setState, no re-render)
    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };

      // CSS variables for the shader background — batched in the same rAF
      // (ForensicShaderBackground reads pointerRef directly, so we skip the CSS var update there)
      document.documentElement.style.setProperty("--vp-cursor-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--vp-cursor-y", `${e.clientY}px`);
    };

    // rAF loop: move both elements to current position
    const tick = () => {
      const { x, y } = posRef.current;
      // translate(-50%,-50%) so the element's center tracks the pointer
      const transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      ring.style.transform = transform;
      dot.style.transform  = transform;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Hover detection — only a class swap, transition is in CSS
    const onOver = (e) => {
      const isInteractive = e.target.closest(
        "a, button, [role='button'], input, textarea, select, label, [data-cursor='hover']"
      );
      ring.classList.toggle("cursor-hover", !!isInteractive);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
    };
  }, []);

  return (
    <>
      {/* Ring — size, border-radius, and transition all in CSS */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.28)",
          pointerEvents: "none",
          zIndex: 9998,
          opacity: 0,
          mixBlendMode: "difference",
          willChange: "transform",
          transition: "width 200ms cubic-bezier(0.16,1,0.3,1), height 200ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease",
        }}
        className="vp-cursor-ring"
      />
      {/* Dot — smaller, faster */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "white",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0,
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      />
    </>
  );
};

export default CursorTracker;
