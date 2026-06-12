import { useRef, useCallback } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * useMagneticHover — Premium magnetic attraction for interactive elements.
 * Pulls the element toward the cursor when hovering within a configurable radius.
 *
 * @param {Object} opts
 * @param {number} opts.strength   – attraction strength (0-1), default 0.3
 * @param {number} opts.radius     – activation radius in px, default 0.4 (fraction of element size)
 * @param {number} opts.damping    – spring damping, default 20
 * @param {number} opts.stiffness  – spring stiffness, default 200
 *
 * @returns {{ ref, x, y, scale, onMouseMove, onMouseLeave }}
 *
 * Usage:
 *   const mag = useMagneticHover();
 *   <motion.button ref={mag.ref} style={{ x: mag.x, y: mag.y, scale: mag.scale }}
 *     onMouseMove={mag.onMouseMove} onMouseLeave={mag.onMouseLeave}>
 */
export const useMagneticHover = ({
  strength = 0.3,
  radius = 0.4,
  damping = 20,
  stiffness = 200,
} = {}) => {
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawScale = useMotionValue(1);

  const springConfig = { damping, stiffness, mass: 0.5 };
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);
  const scale = useSpring(rawScale, { damping: 25, stiffness: 300 });

  const onMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      rawX.set(distX * strength);
      rawY.set(distY * strength);
      rawScale.set(1.04);
    },
    [strength, rawX, rawY, rawScale]
  );

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    rawScale.set(1);
  }, [rawX, rawY, rawScale]);

  return { ref, x, y, scale, onMouseMove, onMouseLeave };
};

export default useMagneticHover;
