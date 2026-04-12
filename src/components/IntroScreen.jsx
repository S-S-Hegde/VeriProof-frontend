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

export default function IntroScreen({ onComplete }) {
  const [stage, setStage] = useState(0); 
  const [exitFlash, setExitFlash] = useState(false);
  const hasCompleted = useRef(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 300),    
      setTimeout(() => setStage(2), 1500),   
      setTimeout(() => setStage(3), 1700),   
      setTimeout(() => setStage(4), 2800),   
      setTimeout(() => setStage(5), 3000),   
      setTimeout(() => setStage(6), 4500),   
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== 6) return;
    setExitFlash(true);
    const t = setTimeout(() => {
      if (!hasCompleted.current) {
        hasCompleted.current = true;
        onComplete?.();
      }
    }, 900);
    return () => clearTimeout(t);
  }, [stage, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[150] bg-black flex items-center justify-center overflow-hidden select-none"
      animate={{ opacity: stage === 6 ? 0 : 1 }}
      transition={{ duration: 0.9, ease: "easeIn" }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-[5] opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          animation: "grain 0.15s steps(1) infinite",
        }}
      />

      <AnimatePresence>
        {stage >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.04 }}
            className="absolute inset-0 pointer-events-none z-[4]"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 4px)",
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
            transition={{ duration: 0.3 }}
            className="absolute text-center z-10 px-4 flex flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-gray-500 uppercase tracking-[0.5em] text-xs mb-8 font-mono"
            >
              System Initialization
            </motion.p>

            <div className="relative mb-4" style={{ fontSize: "clamp(3rem, 10vw, 8rem)", fontWeight: 900, letterSpacing: "0.06em" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 1.2 }}
                className="absolute inset-0 blur-[60px] bg-blue-600/40 pointer-events-none"
              />
              {"VERIPROOF".split("").map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 60, rotateX: -90, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: "inline-block",
                    color: i % 2 === 0 ? "#ffffff" : "#2563EB",
                    textShadow: "0 0 30px rgba(37,99,235,0.8)",
                    transformOrigin: "bottom",
                    perspective: "400px",
                    fontStyle: "italic"
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
              className="h-[1px] w-64 bg-gradient-to-r from-transparent via-blue-500 to-transparent my-5"
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="text-gray-400 uppercase tracking-[0.4em] text-[10px] font-mono"
            >
              <LetterReveal text="Forensic · Portfolio · Verification" startDelay={1.5} stagger={0.03} />
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <CutFlash trigger={stage === 2} onDone={() => {}} />
      <CutFlash trigger={stage === 4} onDone={() => {}} />

      <AnimatePresence>
        {exitFlash && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, ease: [0.85, 0, 0.15, 1] }}
            className="fixed inset-0 z-[300] bg-white pointer-events-none origin-top"
          />
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
