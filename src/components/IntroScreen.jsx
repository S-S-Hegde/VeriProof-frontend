/**
 * VeriProof — Cinematic Intro Screen (Nolan Edition)
 *
 * Design philosophy:
 *  • Every animation touches ONLY opacity / transform (GPU-composited, zero jank).
 *  • No blur() in animation keyframes — blur is set once as a static CSS value
 *    where needed, never transitioned.
 *  • Canvas starfield runs in its own rAF loop, isolated from React's render cycle.
 *  • A declarative ACTS array drives the timeline — no magic numbers scattered
 *    through useEffect chains.
 *  • All setTimeout IDs are collected in a ref and cleared on unmount / skip.
 *  • The skip button shows a live circular-progress timer so the user always
 *    knows how long is left.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Easing curves ────────────────────────────────────────────────────────────
const EXPO_OUT  = [0.16, 1, 0.3, 1];
const CIRC_OUT  = [0, 0.55, 0.45, 1];
const HARD_CUT  = [0.76, 0, 0.24, 1];

// ─── Timeline (each act holds for `ms` before cutting to the next) ───────────
const ACTS = [
  { id: "blackout",   ms: 900  },   // 0  — pure black with audio cue feel
  { id: "act1",       ms: 2400 },   // 1  — "In a world where credentials lie"
  { id: "cut1",       ms: 550  },   // 2  — hard cut flash
  { id: "act2",       ms: 2200 },   // 3  — "Thousands of unverified claims"
  { id: "cut2",       ms: 550  },   // 4  — hard cut flash
  { id: "act3",       ms: 2400 },   // 5  — "One system. Absolute truth."
  { id: "cut3",       ms: 550  },   // 6  — hard cut flash
  { id: "title",      ms: 3000 },   // 7  — VERIPROOF title card
  { id: "exit",       ms: 1200 },   // 8  — fade to app
];

const TOTAL_MS = ACTS.reduce((s, a) => s + a.ms, 0);

// ─── Canvas Starfield ─────────────────────────────────────────────────────────
function useStarfield(canvasRef, count = 180) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      speed: Math.random() * 0.00008 + 0.00002,
      opacity: Math.random() * 0.7 + 0.1,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.015 + 0.005,
    }));

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let frame = 0;
    function draw() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.twinklePhase += s.twinkleSpeed;
        const twinkle = 0.5 + 0.5 * Math.sin(s.twinklePhase);
        const alpha = s.opacity * (0.4 + 0.6 * twinkle);
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${alpha})`;
        ctx.fill();
        // slow vertical drift
        s.y -= s.speed;
        if (s.y < 0) { s.y = 1; s.x = Math.random(); }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [canvasRef, count]);
}

// ─── Letterbox Bars ───────────────────────────────────────────────────────────
const Letterbox = ({ visible }) => (
  <>
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-0 z-[50] bg-black"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: visible ? 1 : 0 }}
      transition={{ duration: 0.7, ease: EXPO_OUT }}
      style={{ transformOrigin: "top", height: "9vh" }}
    />
    <motion.div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[50] bg-black"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: visible ? 1 : 0 }}
      transition={{ duration: 0.7, ease: EXPO_OUT }}
      style={{ transformOrigin: "bottom", height: "9vh" }}
    />
  </>
);

// ─── Corner Brackets (film frame) ─────────────────────────────────────────────
const CornerBrackets = ({ visible }) => {
  const cls = "pointer-events-none absolute z-[55] w-10 h-10 border-white/20";
  return (
    <AnimatePresence>
      {visible && (
        <>
          {[
            { top: "10vh", left: 20,   borderTop: 1, borderLeft: 1 },
            { top: "10vh", right: 20,  borderTop: 1, borderRight: 1 },
            { bottom: "10vh", left: 20,  borderBottom: 1, borderLeft: 1 },
            { bottom: "10vh", right: 20, borderBottom: 1, borderRight: 1 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              className={cls}
              style={{
                ...pos,
                borderStyle: "solid",
                borderWidth: 0,
                borderTopWidth:    pos.borderTop    ? 1 : 0,
                borderLeftWidth:   pos.borderLeft   ? 1 : 0,
                borderRightWidth:  pos.borderRight  ? 1 : 0,
                borderBottomWidth: pos.borderBottom ? 1 : 0,
              }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EXPO_OUT }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Hard-Cut Flash (white frame cut between acts) ────────────────────────────
const HardCut = ({ active }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        className="pointer-events-none fixed inset-0 z-[200] bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.6, 0] }}
        transition={{ duration: 0.45, times: [0, 0.15, 0.5, 1], ease: "linear" }}
      />
    )}
  </AnimatePresence>
);

// ─── Film grain overlay (CSS-only, no animation cost) ────────────────────────
const Grain = () => (
  <div
    className="pointer-events-none absolute inset-0 z-[10] opacity-[0.035] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
      backgroundSize: "256px",
    }}
  />
);

// ─── Scan line (horizontal rolling line — GPU only) ───────────────────────────
const ScanLine = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="pointer-events-none absolute inset-x-0 z-[20] h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(100,160,255,0.6), transparent)",
          boxShadow: "0 0 12px 2px rgba(100,160,255,0.3)",
          top: 0,
        }}
        initial={{ y: "10vh", opacity: 0 }}
        animate={{ y: "90vh", opacity: [0, 1, 1, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.4, ease: "linear", times: [0, 0.08, 0.92, 1] }}
      />
    )}
  </AnimatePresence>
);

// ─── Vignette ────────────────────────────────────────────────────────────────
const Vignette = () => (
  <div
    className="pointer-events-none absolute inset-0 z-[15]"
    style={{
      background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.92) 100%)",
    }}
  />
);

// ─── Text line with per-character reveal ─────────────────────────────────────
const CharReveal = ({ text, delay = 0, className = "", charClass = "", tag = "span" }) => {
  const Tag = tag;
  return (
    <Tag className={className} style={{ display: "inline-block" }}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + i * 0.035,
            duration: 0.38,
            ease: EXPO_OUT,
          }}
          className={charClass}
        >
          {ch}
        </motion.span>
      ))}
    </Tag>
  );
};

// ─── Word-by-word reveal ──────────────────────────────────────────────────────
const WordReveal = ({ words, delay = 0, className = "", stagger = 0.12 }) => (
  <span className={className}>
    {words.map((w, i) => (
      <motion.span
        key={i}
        style={{ display: "inline-block", whiteSpace: "pre" }}
        initial={{ opacity: 0, y: 22, rotateX: -40 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: delay + i * stagger, duration: 0.52, ease: EXPO_OUT }}
      >
        {w}
      </motion.span>
    ))}
  </span>
);

// ─── Horizon line (cinematic divider) ─────────────────────────────────────────
const HorizonLine = ({ delay = 0 }) => (
  <motion.div
    className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent my-6"
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{ scaleX: 1, opacity: 1 }}
    transition={{ delay, duration: 0.8, ease: CIRC_OUT }}
    style={{ transformOrigin: "center" }}
  />
);

// ─── Skip Button with circular progress ────────────────────────────────────────
const SkipButton = ({ onSkip, totalMs, elapsedMs }) => {
  const progress = Math.min(elapsedMs / totalMs, 1);
  const r = 14;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - progress);

  return (
    <motion.button
      onClick={onSkip}
      className="absolute bottom-10 right-8 z-[260] flex items-center gap-2.5 group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5, ease: EXPO_OUT }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
    >
      {/* Circular progress ring */}
      <svg width="36" height="36" className="rotate-[-90deg] shrink-0">
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />
        <motion.circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke="rgba(100,160,255,0.8)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          style={{ transition: "stroke-dashoffset 0.25s linear" }}
        />
      </svg>
      <span
        className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35 group-hover:text-white/80 transition-colors duration-300"
      >
        Skip
      </span>
    </motion.button>
  );
};

// ─── Data counter (animated number) ──────────────────────────────────────────
const DataCounter = ({ from, to, duration = 1.4, delay = 0, suffix = "", className = "" }) => {
  const [val, setVal] = useState(from);
  const raf = useRef();
  const start = useRef();

  useEffect(() => {
    const timeout = setTimeout(() => {
      start.current = performance.now();
      const step = (now) => {
        const t = Math.min((now - start.current) / (duration * 1000), 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(from + (to - from) * eased));
        if (t < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }, delay * 1000);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf.current); };
  }, [from, to, duration, delay]);

  return (
    <span className={className}>
      {val.toLocaleString()}{suffix}
    </span>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function IntroScreen({ onComplete }) {
  const [actIndex, setActIndex] = useState(0);
  const [elapsed, setElapsed]   = useState(0);
  const [exiting, setExiting]   = useState(false);
  const timers   = useRef([]);
  const mounted  = useRef(true);
  const done     = useRef(false);
  const canvasRef = useRef(null);
  const startTime = useRef(Date.now());

  useStarfield(canvasRef);

  // ── Tick elapsed for the skip-button progress ring ──────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (!mounted.current) return;
      setElapsed(Date.now() - startTime.current);
    }, 100);
    return () => clearInterval(id);
  }, []);

  // ── Build the timeline ────────────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true;
    let t = 0;
    ACTS.forEach((act, idx) => {
      const id = setTimeout(() => {
        if (!mounted.current) return;
        setActIndex(idx);
      }, t);
      timers.current.push(id);
      t += act.ms;
    });

    // Exit
    const exitId = setTimeout(() => {
      if (!mounted.current || done.current) return;
      triggerExit();
    }, t);
    timers.current.push(exitId);

    return () => {
      mounted.current = false;
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerExit = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setExiting(true);
    setTimeout(() => {
      if (mounted.current) onComplete?.();
    }, 1100);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    timers.current.forEach(clearTimeout);
    triggerExit();
  }, [triggerExit]);

  const act = ACTS[actIndex]?.id ?? "blackout";
  const isCut = act === "cut1" || act === "cut2" || act === "cut3";
  const showLetterbox = actIndex >= 1 && !exiting;
  const showBrackets  = actIndex >= 1 && actIndex < 8 && !exiting;
  const showScan      = actIndex >= 1 && actIndex < 7 && !exiting;

  return (
    <motion.div
      className="fixed inset-0 z-[150] bg-black overflow-hidden select-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 1.0, ease: HARD_CUT }}
    >
      {/* ── Starfield Canvas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
        style={{ zIndex: 1 }}
      />

      {/* ── Static overlays ── */}
      <Grain />
      <Vignette />
      <ScanLine visible={showScan} />

      {/* ── Cinematic frame ── */}
      <Letterbox visible={showLetterbox} />
      <CornerBrackets visible={showBrackets} />

      {/* ── Hard-cut flashes between acts ── */}
      <HardCut active={isCut} />

      {/* ── HUD chrome: top bar ── */}
      <AnimatePresence>
        {actIndex >= 1 && !exiting && (
          <motion.div
            className="absolute top-[10vh] inset-x-0 z-[60] flex items-center justify-between px-8 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-blue-500/50">
              VeriProof // Cinematic_Boot
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/20">
              {String(actIndex).padStart(2, "0")} / {String(ACTS.length - 1).padStart(2, "0")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          ACT 1 — "In a world where credentials lie…"
          ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {act === "act1" && (
          <motion.div
            key="act1"
            className="absolute inset-0 flex items-center justify-center z-[30]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EXPO_OUT }}
          >
            <div className="text-center px-8 max-w-3xl">
              {/* Overline */}
              <motion.p
                className="font-mono text-[10px] uppercase tracking-[0.6em] text-blue-500/70 mb-8"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                2026 · Global Talent Crisis
              </motion.p>

              {/* Main headline */}
              <p
                className="font-serif text-white leading-[1.25]"
                style={{ fontSize: "clamp(1.6rem, 5vw, 3.5rem)", letterSpacing: "0.04em" }}
              >
                <WordReveal
                  words={["In", " a", " world", " where", " credentials", " lie…"]}
                  delay={0.3}
                  stagger={0.13}
                />
              </p>

              <HorizonLine delay={1.3} />

              <motion.p
                className="font-mono text-white/40 uppercase tracking-[0.3em]"
                style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
              >
                Who can you trust?
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          ACT 2 — "Thousands of unverified claims"
          ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {act === "act2" && (
          <motion.div
            key="act2"
            className="absolute inset-0 flex items-center justify-center z-[30]"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.55, ease: EXPO_OUT }}
          >
            <div className="text-center px-8 max-w-4xl w-full">
              {/* Animated counters */}
              <div className="flex justify-center gap-12 md:gap-20 mb-10">
                {[
                  { val: 2400000, label: "Resumes filed annually" },
                  { val: 78,      label: "% contain exaggerations", suffix: "%" },
                  { val: 0,       label: "Verification systems at scale", suffix: "" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.18, duration: 0.5, ease: EXPO_OUT }}
                  >
                    <span
                      className="font-serif text-white font-black tabular-nums"
                      style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}
                    >
                      <DataCounter
                        from={0}
                        to={item.val}
                        delay={0.4 + i * 0.18}
                        duration={1.2}
                        suffix={item.suffix ?? ""}
                      />
                      {item.val === 0 && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.6, duration: 0.4 }}
                          className="text-red-400"
                        >
                          None.
                        </motion.span>
                      )}
                    </span>
                    <span
                      className="font-mono uppercase text-white/30 tracking-[0.25em]"
                      style={{ fontSize: "clamp(0.55rem, 1vw, 0.7rem)" }}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              <HorizonLine delay={0.9} />

              <p
                className="font-serif text-white/90 font-black uppercase italic"
                style={{ fontSize: "clamp(1.2rem, 3.5vw, 2.4rem)", letterSpacing: "0.01em" }}
              >
                <WordReveal
                  words={["Thousands", " of", " unverified", " claims."]}
                  delay={1.0}
                  stagger={0.11}
                />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          ACT 3 — "One system. Absolute truth."
          ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {act === "act3" && (
          <motion.div
            key="act3"
            className="absolute inset-0 flex items-center justify-center z-[30]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EXPO_OUT }}
          >
            <div className="text-center px-8 max-w-4xl w-full">
              {/* Verdict pair */}
              <div className="flex items-center justify-center gap-8 md:gap-16 mb-10">
                {/* Flagged */}
                <motion.div
                  className="flex flex-col items-center gap-3"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.55, ease: EXPO_OUT }}
                >
                  <motion.div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-red-500/30 bg-red-500/8 flex items-center justify-center"
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    {/* X icon — pure SVG, no lucide runtime cost */}
                    <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                  </motion.div>
                  <span className="font-mono uppercase text-red-400/80 tracking-[0.3em] text-[10px]">
                    Claim Falsified
                  </span>
                </motion.div>

                {/* VS */}
                <motion.span
                  className="font-serif text-white/15 text-xl md:text-2xl italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  vs
                </motion.span>

                {/* Verified */}
                <motion.div
                  className="flex flex-col items-center gap-3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.55, ease: EXPO_OUT }}
                >
                  <motion.div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-emerald-500/30 bg-emerald-500/8 flex items-center justify-center"
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.85, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  </motion.div>
                  <span className="font-mono uppercase text-emerald-400/80 tracking-[0.3em] text-[10px]">
                    Claim Verified
                  </span>
                </motion.div>
              </div>

              <HorizonLine delay={1.1} />

              <p
                className="font-serif text-white/90 font-black uppercase"
                style={{ fontSize: "clamp(1.3rem, 4vw, 2.8rem)", letterSpacing: "0.02em" }}
              >
                <WordReveal
                  words={["One", " system.", " Absolute", " truth."]}
                  delay={1.2}
                  stagger={0.13}
                />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          TITLE CARD — V E R I P R O O F
          ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {act === "title" && (
          <motion.div
            key="title"
            className="absolute inset-0 flex items-center justify-center z-[30]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EXPO_OUT }}
          >
            <div className="text-center px-4 flex flex-col items-center">

              {/* Shield icon — glows in */}
              <motion.div
                className="w-14 h-14 rounded-full border border-blue-500/40 bg-blue-500/10 flex items-center justify-center mb-8"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ boxShadow: "0 0 40px rgba(59,130,246,0.25)" }}
              >
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </motion.div>

              {/* Sub-eyebrow */}
              <motion.p
                className="font-mono text-[10px] uppercase tracking-[0.65em] text-blue-400/60 mb-10"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Forensic Credential Intelligence
              </motion.p>

              {/* VERIPROOF wordmark — each letter drops in */}
              <div
                className="relative mb-6"
                style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)", fontWeight: 900, letterSpacing: "-0.025em" }}
              >
                {/* Glow bloom behind letters */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59,130,246,0.18) 0%, transparent 70%)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 1.2 }}
                />

                {/* Characters */}
                <div className="relative flex items-baseline justify-center">
                  {"VERIPROOF".split("").map((ch, i) => {
                    const isBlue = i % 2 !== 0;
                    return (
                      <motion.span
                        key={i}
                        style={{
                          display: "inline-block",
                          color: isBlue ? "#3b82f6" : "#ffffff",
                          textShadow: isBlue ? "0 0 40px rgba(59,130,246,0.5)" : "0 0 20px rgba(255,255,255,0.15)",
                          fontStyle: "italic",
                        }}
                        initial={{ opacity: 0, y: -40, rotateX: -60 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{
                          delay: 0.45 + i * 0.055,
                          duration: 0.5,
                          ease: EXPO_OUT,
                        }}
                      >
                        {ch}
                      </motion.span>
                    );
                  })}

                  {/* Light-sheen sweep across wordmark */}
                  <motion.div
                    className="absolute top-0 left-0 h-full w-1/4 pointer-events-none"
                    style={{
                      background: "linear-gradient(75deg, transparent, rgba(255,255,255,0.3), transparent)",
                    }}
                    initial={{ x: "-50%", opacity: 0 }}
                    animate={{ x: "500%", opacity: [0, 1, 0] }}
                    transition={{ delay: 1.2, duration: 0.9, ease: "easeInOut" }}
                  />
                </div>

                {/* Underline rule */}
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-[1.5px] origin-left"
                  style={{ background: "linear-gradient(90deg, #3b82f6, #60a5fa, transparent)" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.3, duration: 0.7, ease: CIRC_OUT }}
                />
              </div>

              {/* Tagline */}
              <motion.p
                className="font-mono uppercase text-white/35 tracking-[0.4em]"
                style={{ fontSize: "clamp(0.6rem, 1.1vw, 0.8rem)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.6 }}
              >
                Screen Everyone · Catch the Fraud · Prove the Honest
              </motion.p>

              {/* Bottom CTA pulse */}
              <motion.div
                className="mt-12 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.6, 1] }}
                transition={{ delay: 2.1, duration: 0.8, times: [0, 0.3, 0.6, 1] }}
              >
                <motion.span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-white/25">
                  Initializing…
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Skip Button ─────────────────────────────────────────────────────── */}
      {!exiting && (
        <SkipButton
          onSkip={handleSkip}
          totalMs={TOTAL_MS}
          elapsedMs={elapsed}
        />
      )}

      {/* ── Exit curtain: two panels close to black from top+bottom ─────────── */}
      <AnimatePresence>
        {exiting && (
          <>
            <motion.div
              className="fixed inset-x-0 top-0 z-[300] bg-black origin-top"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.9, ease: HARD_CUT }}
              style={{ height: "55%" }}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[300] bg-black origin-bottom"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.9, ease: HARD_CUT }}
              style={{ height: "55%" }}
            />
            {/* Accent line at seam */}
            <motion.div
              className="fixed inset-x-0 z-[301] h-[1px]"
              style={{
                top: "50%",
                background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
                boxShadow: "0 0 20px 4px rgba(59,130,246,0.5)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
