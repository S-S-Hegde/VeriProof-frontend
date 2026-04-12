import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  ArrowRight, 
  Terminal, 
  Fingerprint, 
  Layers,
  ChevronRight,
  Plus
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import InfiniteMarquee from "../components/InfiniteMarquee";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
  },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  });

  // Scene Transitions
  const heroOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.1], [1, 0.95]);
  const contentY = useTransform(smoothProgress, [0, 1], ["0%", "-20%"]);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
    window.scrollTo(0, 0);
  }, [user, navigate]);

  if (user) return null;

  return (
    <div ref={containerRef} className="relative w-full bg-[var(--color-bg)] text-[var(--color-text)] h-[500vh] selection:bg-[var(--color-accent)] selection:text-white">
      
      {/* ── ARCHITECTURAL GRID OVERLAY (LOCAL) ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[1px] h-full bg-[var(--color-border)] opacity-20" />
          <div className="absolute top-0 left-2/4 w-[1px] h-full bg-[var(--color-border)] opacity-20" />
          <div className="absolute top-0 left-3/4 w-[1px] h-full bg-[var(--color-border)] opacity-20" />
      </div>

      {/* ── PROGRESS STATUS ── */}
      <div className="fixed top-1/2 left-6 -translate-y-1/2 z-[100] hidden xl:flex flex-col gap-8">
          {[0, 1, 2, 3].map((i) => (
            <motion.div 
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[var(--color-text)]"
                style={{ 
                    opacity: useTransform(scrollYProgress, [i * 0.25, (i + 1) * 0.25], [0.2, 1]),
                    scale: useTransform(scrollYProgress, [i * 0.25, (i + 1) * 0.25], [1, 1.5])
                }}
            />
          ))}
      </div>

      {/* ── SCENE 1: THE BLUEPRINT (HERO) ── */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="sticky top-0 h-screen flex flex-col justify-center px-6 md:px-24 overflow-hidden border-b border-[var(--color-border)]"
      >
        <motion.div 
          variants={stagger} initial="hidden" animate="visible"
          className="relative z-10 w-full grid grid-cols-1 md:grid-cols-4 gap-12"
        >
          {/* Main Title Block */}
          <div className="md:col-span-3">
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8">
                <span className="w-12 h-[1px] bg-[var(--color-accent)]" />
                <span className="text-[10px] tracking-[0.5em] uppercase font-mono text-[var(--color-accent)] font-bold">Protocol_v4.0.0</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-7xl md:text-[12rem] font-black tracking-tighter leading-[0.8] mb-12 italic uppercase"
            >
              TRUST <br />
              <span className="ml-0 md:ml-24 text-[var(--color-accent)] not-italic">WITHOUT</span> <br />
              FAITH.
            </motion.h1>

            <motion.div variants={fadeUp} className="flex flex-col md:flex-row gap-12 items-end">
                <p className="max-w-md text-sm opacity-60 font-medium leading-relaxed uppercase tracking-wider">
                    A forensic architectural system designed to verify digital contributions with surgical precision.
                </p>
                <Link to="/register" className="group flex items-center gap-4 text-sm font-bold tracking-[0.3em] uppercase border-b-2 border-[var(--color-text)] pb-2 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all">
                    Initialize Setup <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
            </motion.div>
          </div>

          {/* Sidebar Info */}
          <div className="hidden md:flex flex-col justify-end border-l border-[var(--color-border)] pl-12 pb-12">
              <div className="space-y-8">
                  <div>
                      <span className="text-[9px] uppercase tracking-widest block mb-2 opacity-40">Core_Metric</span>
                      <span className="text-4xl font-mono font-bold italic">99.8%</span>
                      <span className="text-[10px] uppercase tracking-tighter block opacity-60">Accuracy_Rating</span>
                  </div>
                  <div>
                      <span className="text-[9px] uppercase tracking-widest block mb-2 opacity-40">System_Load</span>
                      <div className="w-full h-1 bg-[var(--color-border)]">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            transition={{ duration: 2, delay: 1 }}
                            className="h-full bg-[var(--color-accent)]" 
                          />
                      </div>
                  </div>
              </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ── SCENE 2: ASYMMETRIC GRID (FEATURES) ── */}
      <motion.section
        style={{ y: contentY }}
        className="relative z-20 py-64 px-6 md:px-24"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-t border-l border-[var(--color-border)]">
          
          {/* Feature 01: Large Box */}
          <div className="md:col-span-8 p-12 md:p-24 border-r border-b border-[var(--color-border)] group hover:bg-[var(--color-accent)]/[0.02] transition-colors">
              <div className="flex justify-between items-start mb-24">
                  <span className="text-6xl font-black italic opacity-10 group-hover:opacity-100 group-hover:text-[var(--color-accent)] transition-all">01</span>
                  <Fingerprint className="w-12 h-12 text-[var(--color-accent)]" />
              </div>
              <h3 className="text-5xl font-black uppercase tracking-tighter mb-8 italic">Forensic Identity</h3>
              <p className="text-xl max-w-xl opacity-60 leading-relaxed font-medium">
                  We don't just look at names. We analyze commit patterns, code fingerprints, and cryptographic signatures to ensure you are who you say you are.
              </p>
          </div>

          {/* Feature 02: Vertical Box */}
          <div className="md:col-span-4 p-12 border-r border-b border-[var(--color-border)] flex flex-col justify-between">
              <div>
                <Layers className="w-8 h-8 mb-8 opacity-40" />
                <h3 className="text-2xl font-bold uppercase tracking-widest mb-4">Deep Stack Audit</h3>
                <p className="text-sm opacity-50 leading-relaxed uppercase tracking-tighter">
                    Cross-referencing multiple repositories to build a unified talent profile.
                </p>
              </div>
              <div className="mt-12 pt-12 border-t border-[var(--color-border)] italic font-mono text-xs">
                  [Status: Operational]
              </div>
          </div>

          {/* Feature 03: Full Width Banner */}
          <div className="md:col-span-12 p-12 md:p-32 border-r border-b border-[var(--color-border)] relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                    <h3 className="text-6xl md:text-9xl font-black italic uppercase leading-[0.8] tracking-tighter">
                        CODE <br /> NEVER <br /> <span className="text-[var(--color-accent)] not-italic">LIES.</span>
                    </h3>
                    <div className="space-y-12">
                        <div className="flex gap-8 items-start">
                            <Plus className="w-6 h-6 text-[var(--color-accent)] shrink-0" />
                            <p className="text-lg opacity-60">Our algorithm detects AI-generated versus human-authored code with surgical precision.</p>
                        </div>
                        <div className="flex gap-8 items-start">
                            <Plus className="w-6 h-6 text-[var(--color-accent)] shrink-0" />
                            <p className="text-lg opacity-60">Verified contributions are archived in a tamper-proof cryptographic ledger.</p>
                        </div>
                    </div>
                </div>
                {/* Decorative background text */}
                <div className="absolute top-0 right-0 text-[20rem] font-black italic opacity-[0.02] pointer-events-none translate-x-1/4">
                    TRUTH
                </div>
          </div>

          {/* Feature 04: Small Grid Box */}
          <div className="md:col-span-6 p-12 border-r border-b border-[var(--color-border)] group cursor-crosshair">
              <div className="h-full flex flex-col justify-between">
                  <div className="flex items-center gap-4 mb-12">
                      <Terminal className="w-6 h-6 opacity-30" />
                      <span className="text-xs font-mono uppercase tracking-[0.4em] opacity-30">Archive_Command</span>
                  </div>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4 group-hover:text-[var(--color-accent)] transition-colors">Neural Plagiarism Check</h3>
                  <div className="w-full h-px bg-[var(--color-border)] my-8" />
                  <p className="text-sm opacity-50 uppercase tracking-tighter leading-relaxed">
                      Scanning billions of lines of open-source code to ensure 100% originality.
                  </p>
              </div>
          </div>

          {/* Feature 05: Small Grid Box */}
          <div className="md:col-span-6 p-12 border-r border-b border-[var(--color-border)] group">
              <div className="h-full flex flex-col justify-between">
                  <div className="flex items-center gap-4 mb-12">
                      <ShieldCheck className="w-6 h-6 opacity-30" />
                      <span className="text-xs font-mono uppercase tracking-[0.4em] opacity-30">Validation_Node</span>
                  </div>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4 group-hover:text-[var(--color-accent)] transition-colors">Proof of Contribution</h3>
                  <div className="w-full h-px bg-[var(--color-border)] my-8" />
                  <p className="text-sm opacity-50 uppercase tracking-tighter leading-relaxed">
                      Converting raw commits into meaningful professional signals.
                  </p>
              </div>
          </div>
        </div>

        {/* ── FINAL ARCHITECTURAL CTA ── */}
        <div className="mt-64 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7">
                <h2 className="text-7xl md:text-[10rem] font-black italic uppercase leading-none tracking-tighter mb-12">
                    START <br /> THE <br /> <span className="text-[var(--color-accent)] not-italic">AUDIT.</span>
                </h2>
            </div>
            <div className="md:col-span-5 flex flex-col gap-6">
                <p className="text-xl font-medium opacity-60 mb-8 border-l-4 border-[var(--color-accent)] pl-8">
                    Stop building resumes. <br /> Start building a legacy that can be proven.
                </p>
                <div className="flex flex-col gap-4">
                    <Link to="/register" className="w-full py-6 bg-[var(--color-text)] text-[var(--color-bg)] text-center text-sm font-bold tracking-[0.5em] uppercase hover:bg-[var(--color-accent)] transition-colors">
                        Access Control
                    </Link>
                    <Link to="/login" className="w-full py-6 border border-[var(--color-border)] text-center text-sm font-bold tracking-[0.5em] uppercase hover:border-[var(--color-text)] transition-colors flex items-center justify-center gap-4">
                        Re-Authenticate <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
      </motion.section>

      {/* ── FOOTER MARQUEE ── */}
      <div className="py-24 border-t border-[var(--color-border)] bg-[var(--color-text)] text-[var(--color-bg)]">
        <InfiniteMarquee text="SYSTEM_VERIFIED // ZERO_TRUST_ARCHITECTURE // FORENSIC_VALIDATION // " speed={15} />
      </div>

      {/* ── SYSTEM STATUS BAR ── */}
      <div className="fixed bottom-0 left-0 w-full h-12 bg-[var(--color-bg)] border-t border-[var(--color-border)] z-[100] px-6 flex items-center justify-between text-[9px] font-mono uppercase tracking-widest opacity-60">
          <div className="flex items-center gap-6">
              <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> Global_Sync: OK</span>
              <span className="hidden md:inline">Protocol: v4.0.0</span>
          </div>
          <div className="flex items-center gap-6">
              <span>LATENCY: 14MS</span>
              <span className="hidden md:inline">ENCRYPTION: AES-256</span>
              <span>©2026 VERIPROOF_LABS</span>
          </div>
      </div>
    </div>
  );
}
