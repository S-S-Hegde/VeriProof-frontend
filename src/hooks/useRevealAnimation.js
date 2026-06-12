import { useEffect, useRef, useCallback } from "react";

/**
 * useRevealAnimation — IntersectionObserver-based scroll reveal.
 * Adds `vp-reveal-visible` class when element enters viewport.
 *
 * @param {Object} opts
 * @param {string}  opts.rootMargin  – IO rootMargin, default "-60px"
 * @param {number}  opts.threshold   – IO threshold, default 0.15
 * @param {boolean} opts.once        – only trigger once, default true
 * @param {number}  opts.stagger     – stagger delay per child (ms), default 80
 *
 * @returns {{ ref }}
 *
 * Usage:
 *   const reveal = useRevealAnimation();
 *   <div ref={reveal.ref} className="vp-reveal"> ... </div>
 *
 * For staggered children, add `vp-reveal` to each child:
 *   <div ref={reveal.ref}>
 *     <div className="vp-reveal">Child 1</div>
 *     <div className="vp-reveal">Child 2</div>
 *   </div>
 */
export const useRevealAnimation = ({
  rootMargin = "-60px",
  threshold = 0.15,
  once = true,
  stagger = 80,
} = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // If the ref element itself has vp-reveal, reveal it
          if (el.classList.contains("vp-reveal")) {
            el.classList.add("vp-reveal-visible");
          }

          // Reveal children with stagger
          const children = el.querySelectorAll(".vp-reveal");
          children.forEach((child, i) => {
            setTimeout(() => {
              child.classList.add("vp-reveal-visible");
            }, i * stagger);
          });

          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove("vp-reveal-visible");
          const children = el.querySelectorAll(".vp-reveal");
          children.forEach((child) => child.classList.remove("vp-reveal-visible"));
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once, stagger]);

  return { ref };
};

export default useRevealAnimation;
