import { motion } from "framer-motion";
import { useTheme, THEMES } from "../context/ThemeContext";

// Kinematics for a flawless single-direction sweep
const blockVariants = {
  initial: {
    top: 0,
    bottom: "auto",
    height: "100vh",
  },
  animate: {
    top: 0,
    bottom: "auto",
    height: "0vh",
    transition: {
      duration: 0.8,
      ease: [0.77, 0, 0.175, 1],
    }
  },
  exit: {
    top: "auto",
    bottom: 0,
    height: "100vh",
    transition: {
      duration: 0.8,
      ease: [0.77, 0, 0.175, 1],
    }
  }
};

const PageTransition = ({ children, className = "" }) => {
  const { theme } = useTheme();

  // Multi-color arrays for elite Awwwards sweeps
  const getThemeColors = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return ["#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6"];
      case THEMES.DARK:
      case THEMES.IMMERSIVE:
      case THEMES.STORYTELLER:
      default:
        return ["#172554", "#1e3a8a", "#1e40af", "#1d4ed8", "#2563eb"];
    }
  };

  const blockColors = getThemeColors();

  return (
    <div className={`relative w-full min-h-screen ${className}`}>
      
      {/* ── 5-BLOCK SINGLE DIRECTION SWEEP ── */}
      <div className="fixed inset-0 z-[200] pointer-events-none flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            variants={blockVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-1/5 shadow-2xl relative"
            style={{ 
              backgroundColor: blockColors[i],
              borderRight: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none"
            }}
            transition={{
              duration: 0.8,
              ease: [0.77, 0, 0.175, 1],
              delay: i * 0.05 // Stagger effect
            }}
          />
        ))}
      </div>

      {/* ── CONTENT MANIFESTATION ── */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default PageTransition;
