import { useEffect } from "react";
import ForensicShaderBackground from "./ForensicShaderBackground";

const ForensicAtmosphere = () => {
  useEffect(() => {
    const root = document.documentElement;

    const handlePointerMove = (event) => {
      root.style.setProperty("--vp-cursor-x", `${event.clientX}px`);
      root.style.setProperty("--vp-cursor-y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <>
      <ForensicShaderBackground />
      <div className="vp-grid-evolution fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />
      <div className="vp-scan-field fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />
    </>
  );
};

export default ForensicAtmosphere;
