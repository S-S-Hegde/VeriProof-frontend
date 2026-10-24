import React from "react";
import InteractiveGlobeBackground, { GlobeTelemetryHUD } from "./3d/InteractiveGlobeBackground";

/**
 * ArchiveBackground
 * Immersive WebGL 3D interactive globe with cryptographic node arcs
 * and real-time live telemetry HUD ticker overlay.
 */
const ArchiveBackground = () => (
  <>
    <InteractiveGlobeBackground />
    <div className="vp-grid-evolution fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />
    <div className="vp-scan-field fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />
    <GlobeTelemetryHUD />
  </>
);

export default ArchiveBackground;
