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
    opacity:  0.88,
    grid:     0.22,
    pulse:    0.35,
    bgA:      hex("#EAF7FC"),   // icy blue base
    bgB:      hex("#D9EEF5"),   // depth mist layer
    signal:   hex("#00C4B4"),   // tiffany blue illumination
    accent:   hex("#059669"),   // light green signal
    particle: hex("#E09FA6"),   // rose gold mist highlight
  },
  dark: {
    opacity:  1.0,
    grid:     0.85,
    pulse:    0.95,
    bgA:      hex("#040711"),   // deep obsidian base
    bgB:      hex("#0a1228"),   // midnight cyber depth
    signal:   hex("#00f2fe"),   // electric neon cyan
    accent:   hex("#38bdf8"),   // bright cyber sky blue
    particle: hex("#818cf8"),   // luminous violet node
  },
};

export const getForensicVisualTokens = (theme) => {
  return TOKENS[theme] || TOKENS.dark;
};
