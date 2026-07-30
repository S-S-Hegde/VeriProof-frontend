import { useEffect } from "react";

const surfaceSelector = [
  ".glass-card",
  "main [class*='border'][class*=' p-']",
  "main [class*='border'][class*=' px-']",
  "main [class*='border'][class*=' py-']",
  "main [class*='border'][class*=' gap-']",
].join(",");

const excludedSelector = "button, a, input, textarea, select, svg, canvas, nav, header";

export const useInterfaceMotion = () => {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const hydrateSurfaces = () => {
      document.querySelectorAll(surfaceSelector).forEach((element) => {
        if (element.dataset.vpSurface || element.closest(excludedSelector)) return;
        element.dataset.vpSurface = "true";
        element.classList.add("vp-depth-surface", "vp-reveal");
      });
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("vp-reveal-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    const observeReveals = () => {
      document.querySelectorAll(".vp-reveal:not(.vp-reveal-bound)").forEach((element) => {
        element.classList.add("vp-reveal-bound");
        revealObserver.observe(element);
      });
    };

    const handlePointerMove = (event) => {
      const surface = event.target.closest?.(".vp-depth-surface");
      if (!surface) return;

      const rect = surface.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      surface.style.setProperty("--vp-local-x", `${x * 100}%`);
      surface.style.setProperty("--vp-local-y", `${y * 100}%`);
      surface.style.setProperty("--vp-tilt-x", `${(0.5 - y) * 3.5}deg`);
      surface.style.setProperty("--vp-tilt-y", `${(x - 0.5) * 3.5}deg`);
    };

    const handlePointerLeave = (event) => {
      const surface = event.target.closest?.(".vp-depth-surface");
      if (!surface) return;
      surface.style.setProperty("--vp-tilt-x", "0deg");
      surface.style.setProperty("--vp-tilt-y", "0deg");
    };

    // Debounce DOM mutations — querySelectorAll on every mutation is expensive
    let mutationTimer;
    const mutationObserver = new MutationObserver(() => {
      clearTimeout(mutationTimer);
      mutationTimer = setTimeout(() => {
        hydrateSurfaces();
        observeReveals();
      }, 150);
    });

    hydrateSurfaces();
    observeReveals();
    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave, true);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(mutationTimer);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave, true);
      mutationObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);
};
