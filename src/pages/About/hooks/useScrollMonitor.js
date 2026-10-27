import { useEffect } from "react";

/**
 * Dev-only scroll jump monitor:
 * Tracks scrollY frame-by-frame and flags any single-frame jump > 160px
 * not triggered by wheel, touch, or keyboard events.
 * Logs stacks of all programmatic scroll calls.
 */
export function useScrollMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    window.__scrollMonitorJumps = [];
    window.__scrollCallStack = [];

    let lastScrollY = window.scrollY;
    let lastUserInteractionTime = 0;
    let animId = null;

    const onUserInteraction = () => {
      lastUserInteractionTime = performance.now();
    };

    window.addEventListener("wheel", onUserInteraction, { passive: true });
    window.addEventListener("touchstart", onUserInteraction, { passive: true });
    window.addEventListener("touchmove", onUserInteraction, { passive: true });
    window.addEventListener("keydown", onUserInteraction, { passive: true });

    // Patch window.scrollTo
    const originalScrollTo = window.scrollTo;
    window.scrollTo = function (...args) {
      window.__scrollCallStack.push({
        method: "window.scrollTo",
        args,
        time: performance.now(),
        stack: new Error().stack,
      });
      return originalScrollTo.apply(this, args);
    };

    // Patch window.scrollBy
    const originalScrollBy = window.scrollBy;
    window.scrollBy = function (...args) {
      window.__scrollCallStack.push({
        method: "window.scrollBy",
        args,
        time: performance.now(),
        stack: new Error().stack,
      });
      return originalScrollBy.apply(this, args);
    };

    // Patch scrollIntoView
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (...args) {
      window.__scrollCallStack.push({
        method: "Element.scrollIntoView",
        element: this,
        time: performance.now(),
        stack: new Error().stack,
      });
      return originalScrollIntoView.apply(this, args);
    };

    // Monitor frame-by-frame
    const checkScrollFrame = () => {
      const currentScrollY = window.scrollY;
      const delta = Math.abs(currentScrollY - lastScrollY);
      const timeSinceUser = performance.now() - lastUserInteractionTime;

      // Flag jump > 160px not caused by user event within 150ms
      if (delta > 160 && timeSinceUser > 150) {
        const jumpEvent = {
          from: lastScrollY,
          to: currentScrollY,
          delta,
          timeSinceUser,
          recentCalls: window.__scrollCallStack.slice(-5),
          timestamp: performance.now(),
        };
        window.__scrollMonitorJumps.push(jumpEvent);
        console.warn("[SCROLL_JUMP_MONITOR] Unexplained scroll jump detected:", jumpEvent);
      }

      lastScrollY = currentScrollY;
      animId = requestAnimationFrame(checkScrollFrame);
    };

    animId = requestAnimationFrame(checkScrollFrame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("wheel", onUserInteraction);
      window.removeEventListener("touchstart", onUserInteraction);
      window.removeEventListener("touchmove", onUserInteraction);
      window.removeEventListener("keydown", onUserInteraction);
      window.scrollTo = originalScrollTo;
      window.scrollBy = originalScrollBy;
      Element.prototype.scrollIntoView = originalScrollIntoView;
    };
  }, []);
}
