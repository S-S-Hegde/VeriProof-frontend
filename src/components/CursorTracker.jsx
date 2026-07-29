import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CursorTracker = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dotRef = useRef(null);
  const requestRef = useRef(null);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, {
    damping: 28,
    stiffness: 300,
    mass: 0.5,
  });
  const springY = useSpring(cursorY, {
    damping: 28,
    stiffness: 300,
    mass: 0.5,
  });

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    setIsVisible(true);

    const handleMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Throttle CSS variable updates to the next animation frame
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--vp-cursor-x",
          `${e.clientX}px`,
        );
        document.documentElement.style.setProperty(
          "--vp-cursor-y",
          `${e.clientY}px`,
        );
      });
    };

    const handleOver = (e) => {
      const target = e.target.closest(
        "a, button, [role='button'], input, textarea, select, [data-cursor='hover']",
      );
      setIsHovering(!!target);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerover", handleOver, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handleOver);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none mix-blend-difference"
        style={{ x: springX, y: springY }}
      >
        <motion.div
          className="rounded-full border border-white/30"
          animate={{
            width: isHovering ? 48 : 28,
            height: isHovering ? 48 : 28,
            x: isHovering ? -24 : -14,
            y: isHovering ? -24 : -14,
            opacity: isHovering ? 0.6 : 0.3,
          }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
        />
      </motion.div>
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ x: cursorX, y: cursorY }}
      >
        <motion.div
          className="rounded-full bg-white mix-blend-difference"
          animate={{
            width: isHovering ? 6 : 4,
            height: isHovering ? 6 : 4,
            x: isHovering ? -3 : -2,
            y: isHovering ? -3 : -2,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </motion.div>
    </>
  );
};

export default CursorTracker;
