/* ═══════════════════════════════════════════════════
   VeriProof — Forensic Visual Tokens v5.0
   Maps theme to shader uniform values
   ═══════════════════════════════════════════════════ */

// Helper: hex string to normalized RGB array [0-1]
const hex = (h) => {
  const v = parseInt(h.replace("#", ""), 16);
  return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255];
};

const TOKENS = {
  light: {
    opacity:  0.85,
    grid:     0.20,
    pulse:    0.30,
    bgA:      hex("#EAF7FC"),   // icy blue base
    bgB:      hex("#D9EEF5"),   // depth mist layer
    signal:   hex("#38BDF8"),   // cyan illumination
    accent:   hex("#059669"),   // VeriProof emerald signal
    particle: hex("#BAE6FD"),   // ice mist highlight
  },
  dark: {
    opacity:  0.95,
    grid:     0.45,
    pulse:    0.6,
    bgA:      hex("#0a0e1a"),   // --color-bg
    bgB:      hex("#060911"),   // --color-bg-sunken
    signal:   hex("#6b8aff"),   // --color-accent
    accent:   hex("#6b8aff"),
    particle: hex("#5a6478"),
  },
};

export const getForensicVisualTokens = (theme) => {
  return TOKENS[theme] || TOKENS.dark;
};
