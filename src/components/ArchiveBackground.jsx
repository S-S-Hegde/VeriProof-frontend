import React from "react";

/**
 * ArchiveBackground
 * Ambient cryptographic scan field and evolution grid backdrop.
 * All interactive 3D WebGL centerpiece elements are dedicated to the Hero section.
 */
const ArchiveBackground = () => (
  <>
    <div className="vp-grid-evolution fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />
    <div className="vp-scan-field fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />
  </>
);

export default ArchiveBackground;
