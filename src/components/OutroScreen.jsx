import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Power, ShieldOff } from "lucide-react";

export default function OutroScreen({ onComplete }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // We removed animejs because it was crashing the component
    // We will handle the glitch natively with framer motion
    const timers = [
      setTimeout(() => setStage(1), 400),    // Terminal Status
      setTimeout(() => setStage(2), 1200),   // De-initialization
      setTimeout(() => setStage(3), 2200),   // Final Shutter
      setTimeout(() => onComplete?.(), 3200) // Call onComplete securely after shutters close
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ filter: "blur(0px)", skewX: 0 }}
      animate={{ 
        filter: ["blur(0px)", "blur(10px)", "blur(0px)"], 
        skewX: [0, -10, 10, 0] 
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="outro-container fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden select-none font-mono"
    >
      {/* 1. Imploding Grid FX */}
      <motion.div 
        initial={{ scale: 1.5, opacity: 0.2 }}
        animate={{ scale: 0, opacity: 0 }}
        transition={{ duration: 1.5, ease: "circIn" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(90deg, #2563EB 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* 2. Terminal Messages */}
      <AnimatePresence>
        {stage >= 1 && stage < 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="z-10 text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-4 text-blue-500 mb-8">
              <Power className="w-8 h-8 animate-pulse" />
              <div className="h-[2px] w-24 bg-blue-500/30" />
              <ShieldOff className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm tracking-[0.5em] text-white/40 uppercase">
                {">"} DE-INITIALIZING_TRUTH_PROTOCOL... [OK]
              </p>
              <p className="text-sm tracking-[0.5em] text-white/40 uppercase">
                {">"} CLEARING_NEURAL_CACHE_NODES... [OK]
              </p>
              {stage >= 2 && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-base tracking-[0.8em] text-blue-500 font-bold uppercase mt-12"
                >
                  STATUS: SESSION_TERMINATED
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. The King Size Shutters (Closing) */}
      <AnimatePresence>
        {stage >= 3 && (
          <div className="absolute inset-0 z-50 flex">
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
              style={{ originX: 0 }}
              className="w-1/2 h-full bg-white border-r border-blue-500/20"
            />
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
              style={{ originX: 1 }}
              className="w-1/2 h-full bg-white border-l border-blue-500/20"
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, times: [0, 0.5, 1] }}
              className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-blue-600 shadow-[0_0_30px_#2563EB]"
            />
          </div>
        )}
      </AnimatePresence>

      {/* Scanline FX */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_2px,white_4px)]" />
    </motion.div>
  );
}
