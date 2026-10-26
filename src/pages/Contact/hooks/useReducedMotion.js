import { useEffect, useState } from "react";
import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/**
 * Custom hook to safely detect prefers-reduced-motion
 */
export function useContactReducedMotion() {
  const framerReduced = useFramerReducedMotion();
  const [prefersReduced, setPrefersReduced] = useState(Boolean(framerReduced));

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);

    const listener = (event) => setPrefersReduced(event.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return framerReduced || prefersReduced;
}

export default useContactReducedMotion;
