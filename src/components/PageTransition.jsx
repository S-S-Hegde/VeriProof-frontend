import { motion, AnimatePresence } from "framer-motion";
import { useTheme, THEMES } from "../context/ThemeContext";

const PageTransition = ({ children, className = "" }) => {
  const { theme } = useTheme();

  // MERSI ARCHITECTURE INSPIRED: ARCHITECTURAL UNVEIL
  // A clean, vertical slide that reveals the content like a sophisticated "blind" or "shutter"
  
  // Choose overlay color based on theme
  const getOverlayColor = () => {
    switch (theme) {
      case THEMES.LIGHT: return "#FAF9F6"; // Greige (Mersi Light)
      case THEMES.IMMERSIVE: return "#05070a"; // Midnight (Sun Hung)
      default: return "#000000"; // Deep Black
    }
  };

  return (
    <div className={`relative w-full min-h-screen ${className}`}>
      
      {/* ── THE ARCHITECTURAL SHUTTER (UNVEIL) ── */}
      <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 0 }}
        transition={{ 
            duration: 1.2, 
            ease: [0.19, 1, 0.22, 1] // Quintic ease for that "weighty" premium feel
        }}
        style={{ 
            backgroundColor: getOverlayColor(),
            originY: 0,
            zIndex: 200
        }}
        className="fixed inset-0 pointer-events-none"
      />

      {/* ── EXIT SHUTTER (COVER) ── */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{ 
            duration: 0.8, 
            ease: [0.76, 0, 0.24, 1] 
        }}
        style={{ 
            backgroundColor: getOverlayColor(),
            originY: 1,
            zIndex: 200
        }}
        className="fixed inset-0 pointer-events-none"
      />

      {/* ── CONTENT FADE & SLIGHT SCALE ── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 1.02 }}
        transition={{ 
            duration: 1, 
            ease: [0.19, 1, 0.22, 1],
            delay: 0.2 // Wait for the shutter to start moving
        }}
      >
        {children}
      </motion.div>

      {/* ── CINEMATIC VIGNETTE (LIGHT THEME ONLY) ── */}
      {theme === THEMES.LIGHT && (
        <div className="fixed inset-0 pointer-events-none z-50 opacity-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.1)]" />
      )}
    </div>
  );
};

export default PageTransition;
