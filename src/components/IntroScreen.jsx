import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const LETTER_DELAY = 0.045;

const LetterReveal = ({ text, startDelay = 0, className = "", stagger = LETTER_DELAY }) => (
  <span className={className}>
    {text.split("").map((ch, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: startDelay + i * stagger, duration: 0.25, ease: "easeOut" }}
        style={{ display: "inline-block", whiteSpace: ch === " " ? "pre" : "normal" }}
      >
        {ch}
      </motion.span>
    ))}
  </span>
);

const CutFlash = ({ trigger, onDone }) => (
  <AnimatePresence>
    {trigger && (
      <motion.div
        key="flash"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onAnimationComplete={onDone}
        className="fixed inset-0 z-[200] bg-white pointer-events-none"
      />
    )}
  </AnimatePresence>
);

// Import useRef
export default function IntroScreen({ onComplete }) {
  const [stage, setStage] = useState(0); 
  const [isUnfolding, setIsUnfolding] = useState(false);
  const hasCompleted = useRef(false);
  const timersRef = useRef([]);

  const handleSkip = () => {
    if (hasCompleted.current) return;
    timersRef.current.forEach(clearTimeout);
    setIsUnfolding(true);
    setTimeout(() => {
        hasCompleted.current = true;
        onComplete?.();
    }, 500); // Shorter unfold for skip
  };

  useEffect(() => {
    console.log("[VeriProof] Intro Sequence Initialized");
    timersRef.current = [
      setTimeout(() => { console.log("Stage 1: Narrative"); setStage(1); }, 500),    
      setTimeout(() => { console.log("Stage 2: Cut"); setStage(2); }, 3000),   
      setTimeout(() => { console.log("Stage 3: The Problem"); setStage(3); }, 3200),   
      setTimeout(() => { console.log("Stage 4: Cut"); setStage(4); }, 5500),   
      setTimeout(() => { console.log("Stage 5: Manifestation"); setStage(5); }, 5700),   
      setTimeout(() => { console.log("Stage 6: Unfold"); setStage(6); }, 9500),   
    ];
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== 6) return;
    setIsUnfolding(true);
    const t = setTimeout(() => {
      if (!hasCompleted.current) {
        console.log("[VeriProof] Intro Complete - Handing over to App");
        hasCompleted.current = true;
        onComplete?.();
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [stage, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[150] bg-black flex items-center justify-center overflow-hidden select-none"
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      
      {!isUnfolding && (
        <button 
          onClick={handleSkip}
          className="absolute items-center justify-center bottom-12 z-[200] px-6 py-2 border border-white/20 text-white/40 hover:text-white hover:border-white/60 transition-all font-mono uppercase tracking-widest text-xs"
        >
          Skip_Sequence
        </button>
      )}
      {/* 1. Global Background FX */}
      <div
        className="absolute inset-0 pointer-events-none z-[5] opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          animation: "grain 0.15s steps(1) infinite",
        }}
      />

      {/* 2. Technical Overlay Grid */}
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: stage >= 5 ? [0.04, 0.08, 0.04] : 0.04,
              scale: stage >= 5 ? [1, 1.05, 1] : 1
            }}
            transition={stage >= 5 ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
            className="absolute inset-0 pointer-events-none z-[4]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
        )}
      </AnimatePresence>

      <div
        className="absolute inset-0 pointer-events-none z-[6]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      <AnimatePresence mode="wait">
        {stage === 1 && (
          <motion.div
            key="line1"
            exit={{ opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.15 }}
            className="absolute text-center z-10 px-6"
          >
            <p className="text-white font-serif" style={{ fontSize: "clamp(1.1rem, 3.5vw, 2.2rem)", letterSpacing: "0.12em", lineHeight: 1.7 }}>
              <LetterReveal text="IN A WORLD WHERE RESUMES LIE…" startDelay={0.1} />
            </p>
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div
            key="line2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.15, filter: "blur(20px)" }}
            transition={{ duration: 0.2 }}
            className="absolute text-center z-10 px-6"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className="h-[2px] bg-blue-600 w-full mb-4 origin-left shadow-[0_0_15px_#2563EB]"
            />
            <p className="text-white font-black uppercase italic" style={{ fontSize: "clamp(1.6rem, 5vw, 3.5rem)", letterSpacing: "0.04em" }}>
              {["SKILLS", " ", "CAN", " ", "NO", " ", "LONGER", " ", "HIDE."].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, x: -30, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.05 * i, duration: 0.3, ease: "easeOut" }}
                  style={{ display: "inline-block" }}
                >
                  {word}
                </motion.span>
              ))}
            </p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
              className="h-[2px] bg-blue-600 w-full mt-4 origin-right shadow-[0_0_15px_#2563EB]"
            />
          </motion.div>
        )}

        {stage >= 5 && stage < 6 && (
          <motion.div
            key="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute text-center z-10 px-4 flex flex-col items-center"
          >
            {/* Stage 4: VeriProof Manifestation */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-gray-500 uppercase tracking-[0.5em] text-xs mb-12 font-mono"
            >
              Architectural_Validation_Sequence
            </motion.p>

            <div className="relative mb-8" style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.4, scale: 1.2 }}
                transition={{ 
                  delay: 0.1, 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
                className="absolute inset-0 blur-[80px] bg-blue-600/30 pointer-events-none"
              />
              
              <div className="flex items-baseline perspective-[1000px]">
                {"VERIPROOF".split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ 
                      opacity: 0, 
                      y: -200, 
                      rotateX: 45,
                      scale: 1.5,
                      filter: "blur(15px)"
                    }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      rotateX: 0,
                      scale: 1,
                      filter: "blur(0px)"
                    }}
                    transition={{ 
                      delay: 0.4 + i * 0.08, 
                      duration: 0.8, 
                      ease: [0.22, 1, 0.36, 1], // Architectural Slam
                      type: "spring",
                      damping: 15,
                      stiffness: 100
                    }}
                    style={{
                      display: "inline-block",
                      color: i % 2 === 0 ? "#ffffff" : "#2563EB",
                      textShadow: i % 2 !== 0 ? "0 0 40px rgba(37,99,235,0.6)" : "none",
                      fontStyle: "italic",
                      position: "relative"
                    }}
                  >
                    {ch}
                    {/* Architectural Underline for each block */}
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1.2 + i * 0.05, duration: 0.4 }}
                      className="absolute -bottom-2 left-0 right-0 h-[4px] bg-current opacity-20"
                    />
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="flex gap-12 items-center">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                className="h-[1px] w-32 bg-gradient-to-r from-transparent to-blue-500/50"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 2.0 }}
                className="text-gray-400 uppercase tracking-[0.6em] text-sm font-mono whitespace-nowrap"
              >
                TRUST_WITHOUT_FAITH
              </motion.p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                className="h-[1px] w-32 bg-gradient-to-l from-transparent to-blue-500/50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CutFlash trigger={stage === 2} onDone={() => {}} />
      <CutFlash trigger={stage === 4} onDone={() => {}} />

      {/* Stage 5: King Size Unfolding Transition */}
      <AnimatePresence>
        {isUnfolding && (
          <div className="fixed inset-0 z-[300] pointer-events-none flex flex-wrap">
            {/* Top Shutter */}
            <motion.div
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0 }}
              transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }}
              className="absolute top-0 left-0 right-0 h-1/2 bg-white origin-top border-b border-blue-500/30"
            />
            {/* Bottom Shutter */}
            <motion.div
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0 }}
              transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }}
              className="absolute bottom-0 left-0 right-0 h-1/2 bg-white origin-bottom border-t border-blue-500/30"
            />
            {/* Lateral Expansion Lines */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-1/2 left-0 right-0 h-[1px] bg-blue-600 shadow-[0_0_20px_#2563EB] z-[301]"
            />
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          20% { transform: translate(3%, 2%); }
          30% { transform: translate(-1%, 4%); }
          40% { transform: translate(4%, -1%); }
          50% { transform: translate(-3%, 3%); }
          60% { transform: translate(2%, -4%); }
          70% { transform: translate(-4%, 1%); }
          80% { transform: translate(1%, 3%); }
          90% { transform: translate(3%, -2%); }
        }
      `}</style>
    </motion.div>
  );
}
