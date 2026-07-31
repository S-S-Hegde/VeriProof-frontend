import { useEffect } from "react";

export const useInterfaceMotion = () => {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("vp-reveal-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
    );

    const observeReveals = () => {
      document.querySelectorAll(".vp-reveal:not(.vp-reveal-bound)").forEach((element) => {
        element.classList.add("vp-reveal-bound");
        revealObserver.observe(element);
      });
    };

    observeReveals();

    return () => {
      revealObserver.disconnect();
    };
  }, []);
};
