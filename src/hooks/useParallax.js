import { useScroll, useTransform, useSpring } from "framer-motion";

/**
 * useParallax — Scroll-linked parallax offset.
 *
 * @param {Object}  opts
 * @param {Object}  opts.ref       – React ref to the container element
 * @param {number}  opts.speed     – parallax speed factor, default 0.15
 * @param {string}  opts.offset    – scroll offset config, default ["start end", "end start"]
 * @param {boolean} opts.smooth    – apply spring smoothing, default true
 *
 * @returns {{ y }} – Framer Motion value for translateY
 *
 * Usage:
 *   const containerRef = useRef(null);
 *   const { y } = useParallax({ ref: containerRef, speed: 0.2 });
 *   <div ref={containerRef}>
 *     <motion.div style={{ y }}>Parallax content</motion.div>
 *   </div>
 */
export const useParallax = ({
  ref,
  speed = 0.15,
  offset = ["start end", "end start"],
  smooth = true,
} = {}) => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);
  const smoothY = useSpring(rawY, { damping: 30, stiffness: 90 });

  return { y: smooth ? smoothY : rawY, progress: scrollYProgress };
};

export default useParallax;
