import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  GitBranch, 
  ShieldCheck, 
  Zap, 
  Rocket, 
  Fingerprint, 
  Eye, 
  Cpu, 
  Database,
  ArrowRight,
  Terminal
} from "lucide-react";

// Immersive Section Wrapper
const ImmersiveSection = ({ children, className = "" }) => (
  <section className={`min-h-screen relative flex items-center justify-center px-6 overflow-hidden ${className}`}>
    {children}
  </section>
);

export default function Demo() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  });

  // Storytelling Transforms
  const heroOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.1], [1, 0.8]);
  const heroRotate = useTransform(smoothProgress, [0, 0.1], [0, -5]);

  const p1Opacity = useTransform(smoothProgress, [0.1, 0.2, 0.3, 0.4], [0, 1, 1, 0]);
  const p1X = useTransform(smoothProgress, [0.1, 0.2], [100, 0]);
  
  const p2Opacity = useTransform(smoothProgress, [0.4, 0.5, 0.6, 0.7], [0, 1, 1, 0]);
  const p2Scale = useTransform(smoothProgress, [0.4, 0.5], [0.8, 1]);

  const p3Opacity = useTransform(smoothProgress, [0.7, 0.85], [0, 1]);
  const p3Y = useTransform(smoothProgress, [0.7, 0.85], [50, 0]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full bg-[#050505] text-white selection:bg-[var(--color-accent)] selection:text-black h-[500vh]">

      {/* ── FIXED DECORATION ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1a1a1a_0%,transparent_70%)] opacity-30" />
        <motion.div 
            style={{ opacity: smoothProgress }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] border-[0.5px] border-white/5 rounded-full" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] contrast-150 brightness-100" />
      </div>

      {/* ── SCENE 1: THE VOID (HERO) ── */}
      <motion.div style={{ opacity: heroOpacity, scale: heroScale, rotateX: heroRotate }} className="sticky top-0 h-screen z-10 flex flex-col items-center justify-center text-center">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
        >
            <span className="text-[10px] font-mono tracking-[1em] uppercase opacity-40 mb-8 block">Project_Veriproof // Immersive_Teaser</span>
            <h1 className="text-[12vw] font-black tracking-tighter leading-none mb-4 italic mix-blend-difference">
                GHOST <br /> IN THE <br /> <span className="text-[var(--color-accent)]">CODE.</span>
            </h1>
            <div className="absolute -top-10 -left-10 w-32 h-32 border border-[var(--color-accent)]/20 rounded-full animate-ping" />
        </motion.div>
        
        <div className="mt-12 flex flex-col items-center gap-4 opacity-20">
            <div className="w-[1px] h-24 bg-gradient-to-b from-white to-transparent" />
            <span className="text-[9px] uppercase tracking-[0.5em] font-mono">Decryption_In_Progress</span>
        </div>
      </motion.div>

      {/* ── SCENE 2: THE FRAGMENTATION (PROBLEM) ── */}
      <motion.div style={{ opacity: p1Opacity, x: p1X }} className="sticky top-0 h-screen z-20 flex items-center justify-center px-12">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
                <div className="flex items-center gap-4 text-[var(--color-accent)]">
                    <ShieldCheck className="w-8 h-8" />
                    <span className="text-xs font-mono uppercase tracking-widest">Protocol_Identity_Mismatch</span>
                </div>
                <h2 className="text-6xl font-bold h1 leading-tight tracking-tighter">
                    THE TRUST <br /> <span className="opacity-30">PARADOX.</span>
                </h2>
                <p className="text-xl opacity-40 leading-relaxed font-light">
                    Hiring is broken. Recited keywords replace actual ability. Trust is assumed, not proven. 
                    Veriproof fragments the facade, exposing the underlying truth of every commit.
                </p>
            </div>
            <div className="relative group">
                <div className="aspect-square bg-white/5 border border-white/10 p-12 flex items-center justify-center overflow-hidden">
                    <Fingerprint className="w-48 h-48 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
                {/* Decorative bits */}
                <div className="absolute -top-4 -right-4 w-24 h-24 border-t border-r border-[var(--color-accent)]" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b border-l border-[var(--color-accent)]" />
            </div>
        </div>
      </motion.div>

      {/* ── SCENE 3: THE SYNTHESIS (SOLUTION) ── */}
      <motion.div style={{ opacity: p2Opacity, scale: p2Scale }} className="sticky top-0 h-screen z-30 flex items-center justify-center">
        <div className="text-center max-w-4xl space-y-12">
            <Cpu className="w-16 h-16 mx-auto text-[var(--color-accent)] animate-pulse" />
            <h2 className="text-7xl font-bold h1 tracking-tighter">CRYPTOGRAPHIC <br /> AUTHORITY.</h2>
            <p className="text-2xl opacity-50 font-light leading-relaxed">
                We don't just "read" resumes. We synthesize data across your entire digital history to create a 
                <span className="text-white border-b border-[var(--color-accent)] mx-2">Verified_Legacy</span>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12">
                {[
                    { label: "Audit_Engine", val: "99.9%" },
                    { label: "Plagiarism_Detection", val: "REALTIME" },
                    { label: "Verification_Nodes", val: "DISTRIBUTED" }
                ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                        <div className="text-3xl font-mono font-bold text-[var(--color-accent)]">{stat.val}</div>
                        <div className="text-[10px] uppercase tracking-[0.3em] opacity-40">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
      </motion.div>

      {/* ── SCENE 4: THE ACCESS (FINAL CTA) ── */}
      <motion.div style={{ opacity: p3Opacity, y: p3Y }} className="relative z-40 py-32 px-12 bg-black min-h-screen flex items-center justify-center">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
                <h2 className="text-8xl font-black h1 tracking-tighter uppercase leading-[0.8]">
                    READY TO <br /> <span className="opacity-20 italic">UNMASK?</span>
                </h2>
                <p className="text-lg opacity-40 leading-relaxed max-w-md font-mono">
                    The portal is open. Choose your entry point and establish your technical dominance.
                </p>
                <div className="flex flex-col sm:flex-row gap-8">
                    <Link to="/register"
                        className="px-12 py-5 bg-[var(--color-accent)] text-black font-bold tracking-[0.4em] uppercase text-[12px] hover:shadow-[0_0_50px_var(--color-accent)]/50 transition-all flex items-center justify-center gap-4 group"
                    >
                        Initialize_Access <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </Link>
                    <Link to="/"
                        className="px-12 py-5 border border-white/20 hover:border-[var(--color-accent)] text-[12px] font-bold tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-4 group"
                    >
                        Protocol_Summary <Terminal className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    </Link>
                </div>
            </div>
            
            <div className="hidden lg:block space-y-8 font-mono">
                {[
                    { id: "01", t: "IDENTITY_VALIDATION", s: "SECURE" },
                    { id: "02", t: "ARCHIVE_INTEGRITY", s: "VERIFIED" },
                    { id: "03", t: "NODE_SYNCHRONIZATION", s: "ACTIVE" },
                    { id: "04", t: "CRYPTOGRAPHIC_PROOF", s: "ENFORCED" }
                ].map(item => (
                    <div key={item.id} className="p-6 border border-white/5 flex items-center justify-between group hover:border-[var(--color-accent)]/40 transition-colors">
                        <div className="flex items-center gap-6">
                            <span className="text-[var(--color-accent)] opacity-40">{item.id}</span>
                            <span className="text-[11px] tracking-widest">{item.t}</span>
                        </div>
                        <div className="text-[9px] px-2 py-1 bg-white/5 text-[var(--color-accent)]">{item.s}</div>
                    </div>
                ))}
            </div>
        </div>
      </motion.div>

      {/* ── FOOTER BAR ── */}
      <footer className="relative z-50 p-12 border-t border-white/5 flex justify-between items-center text-[9px] font-mono uppercase tracking-[0.5em] opacity-30">
        <span>© 2026 VERIPROOF_SYSTEMS</span>
        <span>ENCRYPTED_UPLINK_ESTABLISHED</span>
      </footer>
    </div>
  );
}
