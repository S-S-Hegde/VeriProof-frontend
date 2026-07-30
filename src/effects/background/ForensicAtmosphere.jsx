import ForensicShaderBackground from "./ForensicShaderBackground";

/**
 * ForensicAtmosphere
 * CSS-driven atmospheric overlays — no pointer listeners here.
 * --vp-cursor-x / --vp-cursor-y are set by CursorTracker's rAF loop.
 */
const ForensicAtmosphere = () => (
  <>
    <ForensicShaderBackground />
    <div className="vp-grid-evolution fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />
    <div className="vp-scan-field fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />
  </>
);

export default ForensicAtmosphere;

