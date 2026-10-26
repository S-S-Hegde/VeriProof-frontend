import { useState, useEffect, useRef } from "react";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789_<>[]!#%&*+-";

export function useDecodeText(targetText, active = true, duration = 600) {
  const [displayText, setDisplayText] = useState(targetText);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!active || hasRunRef.current || !targetText) return;
    hasRunRef.current = true;

    const totalSteps = 16;
    const intervalTime = duration / totalSteps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const resolvedCount = Math.floor(progress * targetText.length);

      const nextText = targetText
        .split("")
        .map((char, index) => {
          if (char === " " || char === "[" || char === "]") return char;
          if (index < resolvedCount) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setDisplayText(nextText);

      if (step >= totalSteps) {
        setDisplayText(targetText);
        clearInterval(interval);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [targetText, active, duration]);

  return displayText;
}
