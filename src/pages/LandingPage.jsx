import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import TerminalBadge from "../components/TerminalBadge";
import { HeroInteractiveGlobe } from "../components/3d/InteractiveGlobeBackground";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Shield,
  Fingerprint,
  Scan,
  Globe,
  Layers,
  Eye,
  CheckCircle2,
  ArrowDown,
  Cpu,
  Sparkles,
  Database,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const Magnetic = ({ children, className }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const TextReveal = ({ children, delay = 0 }) => (
  <div className="overflow-hidden">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  </div>
);

const LiveChart = () => {
  const pathRef = useRef(null);
  const areaRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    let animationId;

    const renderFrame = () => {
      const time = Date.now() * 0.001;
      const pts = Array.from({ length: 21 }).map((_, i) => ({
        x: i * 25,
        y: 100 + Math.sin(i * 0.5 + time) * 40,
      }));

      const pathD = `M${pts.map((p) => `${p.x},${p.y}`).join(" L")}`;
      const areaD = `${pathD} L500,200 L0,200 Z`;

      if (pathRef.current) pathRef.current.setAttribute("d", pathD);
      if (areaRef.current) areaRef.current.setAttribute("d", areaD);
      if (circleRef.current) {
        circleRef.current.setAttribute("cx", pts[20].x);
        circleRef.current.setAttribute("cy", pts[20].y);
      }

      animationId = requestAnimationFrame(renderFrame);
    };

    renderFrame();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <svg
      viewBox="0 0 500 200"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="chartGradDemo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[50, 100, 150].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="500"
          y2={y}
          stroke="currentColor"
          className="opacity-5"
          strokeWidth="1"
        />
      ))}
      <path ref={areaRef} fill="url(#chartGradDemo)" />
      <path
        ref={pathRef}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
      />
      <circle ref={circleRef} r="4" fill="var(--color-accent)" />
    </svg>
  );
};

const ProcessStep = ({ num, icon: Icon, title, desc, index = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="hidden lg:block absolute -top-8 left-1/2 w-px h-8 bg-gradient-to-b from-transparent to-[var(--color-border)]" />
      <div className="border border-[var(--color-border)] p-8 lg:p-10 hover:bg-[var(--color-accent)]/5 transition-all duration-700 relative overflow-hidden">
        <span className="absolute right-4 bottom-2 text-[80px] font-black italic opacity-[0.03] leading-none pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-700">
          {num}
        </span>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] transition-all duration-500">
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-30">
              {num} //
            </span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter mb-3 group-hover:text-[var(--color-accent)] transition-colors duration-500 text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-500">
            {desc}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-accent)] group-hover:w-full transition-all duration-700" />
      </div>
    </motion.div>
  );
};

const FeatureRow = ({ icon: Icon, label, desc, index = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="group flex items-start gap-5 py-6 border-b border-[var(--color-border)] last:border-0 hover:pl-2 transition-all duration-500"
    >
      <div className="w-10 h-10 border border-[var(--color-border)] flex items-center justify-center shrink-0 group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] transition-all duration-500">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-sm font-bold uppercase tracking-widest mb-1 group-hover:text-[var(--color-accent)] transition-colors duration-500 text-slate-900 dark:text-white">
          {label}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-500 font-sans">
          {desc}
        </div>
      </div>
    </motion.div>
  );
};

const METRICS = [
  { value: "99.98%", label: "Accuracy", color: "text-[var(--color-accent)]" },
  { value: "1,204", label: "Active Nodes", color: "" },
  { value: "48ms", label: "Latency", color: "text-green-400" },
];

export default function Demo() {
  const compRef = useRef(null);
  const heroSectionRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isShutterOpen, setIsShutterOpen] = useState(false);
  const [scanCount, setScanCount] = useState(14892);
  const [activeNodes] = useState(48);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Smooth Scroll Fade & Blur for hero text block
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(heroScroll, [0, 0.75], [1, 0]);
  const heroBlur = useTransform(heroScroll, [0, 0.75], ["blur(0px)", "blur(8px)"]);
  const heroY = useTransform(heroScroll, [0, 0.75], [0, -30]);

  useEffect(() => {
    if (user) {
      if (user.role === "recruiter") {
        navigate("/bulk-screening", { replace: true });
      } else {
        navigate("/student-dashboard", { replace: true });
      }
      return;
    }

    const timer = setTimeout(() => setIsShutterOpen(true), 200);
    const ctx = gsap.context(() => {
      gsap.from(".demo-cta-title", {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: { trigger: "#demo-cta-new", start: "top 80%" },
      });
    }, compRef);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [user, navigate]);

  return (
    <div ref={compRef} className="overflow-x-hidden w-full">
      <AnimatePresence>
        {!isShutterOpen && (
          <>
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: "-100%" }}
              transition={{
                duration: 1.2,
                ease: [0.76, 0, 0.24, 1],
                delay: 0.2,
              }}
              className="fixed inset-y-0 left-0 w-1/2 bg-[var(--color-text)] z-[60] flex items-center justify-end pr-4"
              onAnimationComplete={() => setIsShutterOpen(true)}
            >
              <span className="text-[var(--color-bg)] text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
                VERI
              </span>
            </motion.div>
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.2,
                ease: [0.76, 0, 0.24, 1],
                delay: 0.2,
              }}
              className="fixed inset-y-0 right-0 w-1/2 bg-[var(--color-text)] z-[60] flex items-center justify-start pl-4"
            >
              <span className="text-[var(--color-accent)] text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
                PROOF
              </span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Hero Section (Split Layout) ── */}
      <section
        ref={heroSectionRef}
        className="relative min-h-[90vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden py-12 md:py-16 px-4 sm:px-6 lg:px-8"
      >
        {/* Real-Time Telemetry HUD Overlay */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 hidden md:flex items-center gap-3 bg-slate-900/85 dark:bg-slate-900/85 border border-slate-800 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-mono text-cyan-400 shadow-xl pointer-events-auto">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-semibold">[GLOBAL_NODES: {activeNodes} ACTIVE]</span>
          <span className="text-slate-600">|</span>
          <span className="font-bold text-slate-100">RESUMES_VERIFIED: {scanCount.toLocaleString()}</span>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent),transparent_60%)] opacity-[0.05] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left: Text Column (w-full md:w-1/2) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={shouldReduceMotion ? undefined : { opacity: heroOpacity, filter: heroBlur, y: heroY }}
            className="w-full md:w-1/2 flex flex-col items-start text-left z-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <TerminalBadge text="SYSTEM_STATUS: SECURE_PROTOCOL_ACTIVE" icon={Cpu} pulse />
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Zero_Knowledge
              </span>
            </div>

            <TextReveal delay={0.2}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.88] mb-6 text-slate-900 dark:text-white">
                The{" "}
                <span
                  style={{
                    WebkitTextStroke: "2px var(--color-text)",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Evidence
                </span>
                <br />
                <span className="text-[var(--color-accent)] not-italic">
                  Protocol.
                </span>
              </h1>
            </TextReveal>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-xl mb-8 leading-relaxed font-sans"
            >
              Traditional ATS screening relies on unverified self-reported resumes and keyword stuffing. In a market flooded with exaggerated claims, AI-generated portfolios, and skill fraud, hiring teams are flying blind. VeriProof replaces blind trust with cryptographic proof—analyzing git commit history, dependency graphs, and code architectures to verify what engineers actually built.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Magnetic>
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-4 px-8 sm:px-10 py-4 sm:py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.25em] uppercase text-xs sm:text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all duration-500 shadow-2xl overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 w-0 group-hover:w-full transition-all duration-500" />
                  <span className="relative z-10">INITIALIZE_SEQUENCE</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Magnetic>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-4 text-xs font-mono uppercase tracking-[0.2em] text-slate-700 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-colors"
              >
                Protocol Specs →
              </Link>
            </motion.div>

            {/* Quick trust metrics row */}
            <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t border-[var(--color-border)] w-full max-w-lg">
              <div>
                <div className="text-xl sm:text-2xl font-black font-mono text-[var(--color-accent)]">99.98%</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400">Forensic Accuracy</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">48 Nodes</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400">Global Mesh</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">&lt; 50ms</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-gray-400">ZK Proof Hash</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Globe Column (w-full md:w-1/2 scaling massively) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="w-full md:w-1/2 flex items-center justify-center relative -mt-6 md:mt-0 overflow-visible"
          >
            <HeroInteractiveGlobe
              className="relative w-full aspect-square max-w-[460px] md:max-w-[560px] lg:max-w-[680px] mx-auto flex items-center justify-center select-none scale-100 md:scale-110 lg:scale-125"
              showCornerHUD={false}
              showDragHint={true}
            />
          </motion.div>
        </div>
      </section>

      {/* ── The Problem & Solution: Why The Market Needs VeriProof ── */}
      <section className="relative py-24 lg:py-32 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-3xl">
            <div className="mb-6">
              <TerminalBadge text="Market_Friction // Threat_Matrix" icon={AlertTriangle} />
            </div>
            <TextReveal>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.88] text-slate-900 dark:text-white">
                Why The Market Needs
                <br />
                <span className="text-[var(--color-accent)] not-italic">
                  VeriProof.
                </span>
              </h2>
            </TextReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: The Resume Inflation Crisis */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
              whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group border border-[var(--color-border)] p-8 hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-500 relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 border border-[var(--color-border)] flex items-center justify-center group-hover:border-red-500 group-hover:text-red-500 transition-colors duration-500">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-500 font-bold">
                  [ PROBLEM // 01 ]
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-red-500 transition-colors duration-500 text-slate-900 dark:text-white">
                The Resume Inflation Crisis
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Over 70% of engineering applicants embellish technical proficiencies or submit AI-generated code samples that they cannot explain, wasting hundreds of engineering hours in dead-end interviews.
              </p>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-red-500 group-hover:w-full transition-all duration-700" />
            </motion.div>

            {/* Card 2: Cryptographic Verification Over Trust */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
              whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="group border border-[var(--color-border)] p-8 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all duration-500 relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] transition-colors duration-500">
                  <ShieldCheck className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--color-accent)] font-bold">
                  [ SOLUTION // 02 ]
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-[var(--color-accent)] transition-colors duration-500 text-slate-900 dark:text-white">
                Cryptographic Verification Over Trust
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Instead of trusting static PDF resumes, VeriProof cryptographically binds code provenance directly to candidate profiles, ensuring 100% authenticity before a recruiter ever clicks schedule.
              </p>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-accent)] group-hover:w-full transition-all duration-700" />
            </motion.div>

            {/* Card 3: Zero-Knowledge Auditing */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
              whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="group border border-[var(--color-border)] p-8 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-500 relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 border border-[var(--color-border)] flex items-center justify-center group-hover:border-emerald-500 group-hover:text-emerald-500 transition-colors duration-500">
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-500 font-bold">
                  [ ZERO_KNOWLEDGE // 03 ]
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-emerald-500 transition-colors duration-500 text-slate-900 dark:text-white">
                Zero-Knowledge Proof Ledger
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Recruiters and hiring managers independently verify engineering authenticity and commit provenance without exposing candidates' private proprietary codebases or company intellectual property.
              </p>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-500 group-hover:w-full transition-all duration-700" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works (The 3-Step Protocol) ── */}
      <section className="relative py-32 lg:py-44 px-6 border-t border-[var(--color-border)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--color-accent),transparent_60%)] opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="mb-20 max-w-3xl">
            <div className="mb-6">
              <TerminalBadge text="How_It_Works" icon={Sparkles} />
            </div>
            <TextReveal>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.85]">
                Three Steps To
                <br />
                <span className="text-[var(--color-accent)] not-italic">
                  Verified Truth.
                </span>
              </h2>
            </TextReveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
            <ProcessStep
              num="01"
              icon={Fingerprint}
              title="CONNECT IDENTITY"
              desc="Securely link developer GitHub handles and candidate portfolios via cryptographic handshakes, mapping authentic commit provenance to a verified profile."
              index={0}
            />
            <ProcessStep
              num="02"
              icon={Scan}
              title="FORENSIC CODE ANALYSIS"
              desc="Our engine parses deep repository metadata, author signatures, and structural complexity metrics rather than relying on easily manipulated resume keywords."
              index={1}
            />
            <ProcessStep
              num="03"
              icon={Shield}
              title="ISSUE IMMUTABLE PROOF"
              desc="Generates a tamper-proof, verifiable candidate credential and audit ledger that technical recruiters and engineering managers can trust instantly."
              index={2}
            />
          </div>
        </div>
      </section>

      <section className="relative py-32 lg:py-44 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <div className="mb-6">
                <TerminalBadge text="Evidence_Protocol" icon={Database} />
              </div>
              <TextReveal>
                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-[0.85] mb-10">
                  The Evidence
                  <br />
                  <span className="text-[var(--color-accent)] not-italic">
                    Architecture.
                  </span>
                </h2>
              </TextReveal>

              <FeatureRow
                icon={Fingerprint}
                label="Authorship & Provenance Verification"
                desc="Deep Git tree analysis verifies raw commit signatures, contributor timelines, and repository ownership to expose cloned or purchased code."
                index={0}
              />
              <FeatureRow
                icon={Globe}
                label="Global Repositories Sync"
                desc="Real-time multi-platform synchronization across GitHub, GitLab, and developer ledgers across distributed verification nodes."
                index={1}
              />
              <FeatureRow
                icon={Layers}
                label="Neural Architectural Scanning"
                desc="Evaluates code complexity, architectural cohesion, and dependency patterns to benchmark authentic engineering ability against industry standards."
                index={2}
              />
              <FeatureRow
                icon={Eye}
                label="Independent Auditability Layer"
                desc="Every verification decision is cryptographically signed and immutable. Full traceability from raw commit hashes to final candidate proof."
                index={3}
              />
            </div>

            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
              whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="border border-[var(--color-border)] bg-transparent overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                  <TerminalBadge
                    text="Live_Network_Load"
                    pulse={false}
                    className="text-[10px]"
                  />
                  <TerminalBadge
                    text="OPERATIONAL"
                    pulse
                    className="text-[10px] text-green-500 border-green-500/30 bg-green-500/5 shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                  />
                </div>
                <div className="h-48 md:h-56 px-4 py-2 relative">
                  <LiveChart />
                </div>
                <div className="grid grid-cols-3 border-t border-[var(--color-border)]">
                  {METRICS.map((m, i) => (
                    <div
                      key={i}
                      className={`p-5 text-center ${i < 2 ? "border-r border-[var(--color-border)]" : ""}`}
                    >
                      <div
                        className={`text-xl md:text-2xl font-black italic tracking-tighter ${m.color || "text-slate-900 dark:text-white"}`}
                      >
                        {m.value}
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 mt-1 font-semibold">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-2 border border-[var(--color-border)] p-6 flex items-start gap-4 hover:border-slate-400 dark:hover:border-cyan-400/50 transition-colors duration-500"
              >
                <CheckCircle2 className="w-5 h-5 text-[var(--color-accent)] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-900 dark:text-white">
                    Verification Guarantee
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    Every proof generated by VeriProof is cryptographically
                    signed and can be independently verified by any third party
                    without requiring access to our systems.
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="demo-cta-new"
        className="relative py-32 lg:py-44 px-6 border-t border-[var(--color-border)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-accent),transparent_60%)] opacity-[0.05]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <TextReveal>
            <h2 className="demo-cta-title text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
              Start_The
              <br />
              <span className="text-[var(--color-accent)] not-italic">
                Audit.
              </span>
            </h2>
          </TextReveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-5 mt-14"
          >
            <Link to="/register">
              <Magnetic>
                <div className="group relative px-12 py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all duration-500 flex items-center gap-4 shadow-2xl overflow-hidden">
                  <span className="absolute inset-0 bg-white/10 w-0 group-hover:w-full transition-all duration-500" />
                  <span className="relative z-10">MANIFEST_NOW</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </div>
              </Magnetic>
            </Link>
            <a href="#protocols">
              <Magnetic>
                <div className="group px-12 py-5 border border-[var(--color-border)] font-bold tracking-[0.3em] uppercase text-sm hover:border-[var(--color-accent)] transition-all duration-500 flex items-center gap-4 backdrop-blur-sm">
                  VIEW_PROTOCOLS
                </div>
              </Magnetic>
            </a>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="text-2xl font-black italic uppercase tracking-tighter mb-3">
              VeriProof
              <span className="text-[var(--color-accent)] not-italic">.</span>
            </div>
            <p className="text-xs opacity-40 leading-relaxed max-w-xs">
              A high-fidelity truth layer for professional identities. Powered
              by Veri-Protocol v4.2.
            </p>
          </div>
          <div>
            <h5 className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-30 mb-4">
              Section_01
            </h5>
            <ul className="space-y-2">
              {["Terminal", "Evidence", "Verification", "Security"].map(
                (item) => (
                  <li
                    key={item}
                    className="text-xs opacity-50 hover:opacity-100 hover:text-[var(--color-accent)] transition-all cursor-pointer"
                  >
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-30 mb-4">
              Section_02
            </h5>
            <ul className="space-y-2">
              {["Neural", "Protocol", "Archive", "Access"].map((item) => (
                <li
                  key={item}
                  className="text-xs opacity-50 hover:opacity-100 hover:text-[var(--color-accent)] transition-all cursor-pointer"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[var(--color-border)] text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-30">
            © 2026 VeriProof Labs // System Verified
          </p>
        </div>
      </footer>
    </div>
  );
}
