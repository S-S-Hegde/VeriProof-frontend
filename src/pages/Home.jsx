import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Shield,
  Fingerprint,
  Scan,
  GitBranch,
  Layers,
  Zap,
  ChevronDown,
  Terminal,
  Activity,
  Lock,
  ExternalLink,
  Star
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Reusable Magnetic Button ─── */
const MagneticButton = ({ children, className, ...props }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} style={{ x: springX, y: springY }} className="inline-block">
      <div className={className} {...props}>{children}</div>
    </motion.div>
  );
};

/* ─── Animated Counter ─── */
const AnimatedCounter = ({ value, suffix = "", duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        const start = performance.now();
        const numVal = parseFloat(value);
        const animate = (now) => {
          const progress = Math.min((now - start) / (duration * 1000), 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          setCount(Math.round(eased * numVal));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, duration, hasAnimated]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─── Floating Particles ─── */
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-[var(--color-accent)]"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.3 + 0.1,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.1, 0.4, 0.1],
        }}
        transition={{
          duration: Math.random() * 4 + 3,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

/* ─── Text Reveal Component ─── */
const TextReveal = ({ children, delay = 0 }) => (
  <div className="overflow-hidden">
    <motion.div
      initial={{ y: "110%" }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  </div>
);

const FEATURES = [
  { icon: Fingerprint, title: "Forensic Identity", desc: "Commit patterns, code fingerprints, and cryptographic signatures ensure you are who you claim to be.", num: "01" },
  { icon: Layers, title: "Deep Stack Audit", desc: "Cross-referencing multiple repositories to build a unified talent profile that cannot be faked.", num: "02" },
  { icon: Scan, title: "Neural Plagiarism", desc: "Scanning billions of lines of open-source code to ensure 100% originality of evidence.", num: "03" },
  { icon: GitBranch, title: "Proof of Concept", desc: "Converting raw commits into meaningful professional signals that recruiters can actually trust.", num: "04" },
];

const STATS = [
  { value: "99", suffix: "%", label: "Accuracy Rating" },
  { value: "1200", suffix: "+", label: "Active Nodes" },
  { value: "48", suffix: "ms", label: "Avg Response" },
  { value: "0", suffix: "", label: "False Positives" },
];

const MARQUEE_ITEMS = ["Trust Without Faith", "Code Never Lies", "Forensic Identity", "Proof of Concept", "Neural Archive", "Verified Signal", "Zero Knowledge"];

export default function Home() {
  const compRef = useRef(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -80]);

  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Horizontal scroll for features
      const track = document.getElementById("h-scroll-track-new");
      if (track) {
        const totalWidth = track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: -totalWidth,
          ease: "none",
          scrollTrigger: {
            trigger: "#h-scroll-section-new",
            start: "top top",
            end: "+=3000",
            scrub: 1.5,
            pin: true,
            anticipatePin: 1,
          },
        });
      }
    }, compRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={compRef} className="overflow-hidden">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden -mt-28 px-6"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent),transparent_70%)] opacity-[0.04]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,var(--color-accent),transparent_50%)] opacity-[0.06]" />
        <FloatingParticles />

        {/* Decorative Lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent opacity-30" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent opacity-20" />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3 px-5 py-2.5 border border-[var(--color-border)] backdrop-blur-md mb-10 rounded-full"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-70">System_Online // Protocol_v4.2</span>
        </motion.div>

        {/* Title */}
        <div className="text-center max-w-5xl relative z-10">
          <TextReveal>
            <h1 className="text-[clamp(3rem,10vw,8rem)] font-black italic uppercase tracking-tighter leading-[0.85] mb-2">
              <span className="inline-block" style={{ WebkitTextStroke: "2px var(--color-text)", WebkitTextFillColor: "transparent" }}>VERI</span>
              <span className="text-[var(--color-accent)]">PROOF</span>
            </h1>
          </TextReveal>
          <TextReveal delay={0.15}>
            <h2 className="text-[clamp(2rem,6vw,5rem)] font-black uppercase tracking-tighter leading-[0.85] opacity-40">
              FORENSIC IDENTITY
            </h2>
          </TextReveal>
        </div>

        {/* Lead Copy */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-center max-w-xl text-base md:text-lg opacity-60 mt-10 leading-relaxed font-light"
        >
          Stop building resumes. Build a <strong className="font-bold opacity-100">legacy that can be proven.</strong> A forensic architectural
          system designed to verify digital contributions with surgical precision.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-12"
        >
          <Link to="/register">
            <MagneticButton className="group relative px-10 py-4 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.25em] uppercase text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all duration-500 flex items-center gap-3 overflow-hidden shadow-xl">
              <span className="absolute inset-0 bg-white/10 w-0 group-hover:w-full transition-all duration-500" />
              <span className="relative z-10">Initialize Setup</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
          </Link>
          <a href="#protocols">
            <MagneticButton className="group px-10 py-4 border border-[var(--color-border)] font-bold tracking-[0.25em] uppercase text-sm hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all duration-500 flex items-center gap-3 backdrop-blur-sm">
              <span>View Protocols</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </MagneticButton>
          </a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[9px] font-mono uppercase tracking-[0.4em] opacity-30">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 border border-[var(--color-border)] rounded-full flex justify-center pt-1.5"
          >
            <motion.div className="w-1 h-1.5 bg-[var(--color-accent)] rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ═══════════════════ INFINITE MARQUEE ═══════════════════ */}
      <div className="relative py-8 border-y border-[var(--color-border)] overflow-hidden">
        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite]">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="mx-8 text-xl md:text-2xl font-black italic uppercase tracking-tighter opacity-10 shrink-0">
              {item}
              <span className="text-[var(--color-accent)] mx-4 not-italic">•</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* ═══════════════════ PROTOCOLS / FEATURES ═══════════════════ */}
      <section id="protocols" className="relative py-32 lg:py-48 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,var(--color-accent),transparent_60%)] opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 text-[var(--color-accent)] mb-6"
              >
                <Terminal className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Protocol_Architecture</span>
              </motion.div>
              <TextReveal>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.85]">
                  How We<br /><span className="text-[var(--color-accent)] not-italic">Verify.</span>
                </h2>
              </TextReveal>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-md text-sm opacity-50 leading-relaxed lg:text-right"
            >
              Four interconnected verification protocols work in concert to construct an immutable proof layer around your professional identity.
            </motion.p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative border border-[var(--color-border)] p-10 lg:p-14 overflow-hidden cursor-default transition-all duration-500 hover:bg-[var(--color-accent)]/5"
              >
                {/* Hover Glow */}
                <div className={`absolute inset-0 bg-[var(--color-accent)] opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700`} />
                
                {/* Background Number */}
                <span className="absolute right-6 top-4 text-[120px] font-black italic opacity-[0.03] leading-none tracking-tighter pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-700">
                  {f.num}
                </span>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] transition-all duration-500">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">{f.num} //</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 group-hover:text-[var(--color-accent)] transition-colors duration-500">
                    {f.title}
                  </h3>
                  <p className="text-sm opacity-50 leading-relaxed max-w-sm group-hover:opacity-70 transition-opacity duration-500">
                    {f.desc}
                  </p>
                </div>

                {/* Bottom Line */}
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-accent)] group-hover:w-full transition-all duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="relative border-y border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
          {/* Left */}
          <div className="p-12 lg:p-20 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[var(--color-border)]">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 text-[var(--color-accent)] mb-6">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-[0.4em]">System_Metrics</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
                Built for<br />Surgical<br /><span className="text-[var(--color-accent)] not-italic">Precision.</span>
              </h2>
              <p className="text-sm opacity-50 leading-relaxed max-w-md">
                Every number in your profile is cryptographically anchored to real commits, real code, real proof. No interpretation, no inflation — just verified signal.
              </p>
            </motion.div>
          </div>

          {/* Right - Stats Grid */}
          <div className="grid grid-cols-2">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-10 lg:p-14 border-b border-r border-[var(--color-border)] last:border-r-0 [&:nth-child(2)]:border-r-0 [&:nth-child(n+3)]:border-b-0 group hover:bg-[var(--color-accent)]/5 transition-colors duration-500"
              >
                <div className="text-4xl md:text-5xl font-black italic tracking-tighter mb-3 group-hover:text-[var(--color-accent)] transition-colors duration-500">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TRUST BANNER ═══════════════════ */}
      <section className="relative py-32 lg:py-44 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-accent),transparent_50%)] opacity-[0.04] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[var(--color-accent)] text-[var(--color-accent)]" />
                ))}
              </div>
            </div>
            <blockquote className="text-3xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter leading-[0.9] mb-10">
              "The future of<br />hiring is not a<br />
              <span className="text-[var(--color-accent)] not-italic">resume.</span>"
            </blockquote>
            <p className="text-xs font-mono uppercase tracking-[0.4em] opacity-30">
              — VeriProof Manifesto, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="relative py-32 lg:py-44 px-6 border-t border-[var(--color-border)]">
        <div className="absolute inset-0 bg-[var(--color-text)] opacity-[0.02]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-accent),transparent_60%)] opacity-[0.05]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <TextReveal>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
                START<br />THE<br />
                <span className="text-[var(--color-accent)] not-italic">AUDIT.</span>
              </h2>
            </TextReveal>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-5 mt-14"
          >
            <Link to="/register">
              <MagneticButton className="group relative px-12 py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all duration-500 flex items-center gap-4 shadow-2xl overflow-hidden">
                <span className="absolute inset-0 bg-white/10 w-0 group-hover:w-full transition-all duration-500" />
                <Lock className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Access Control</span>
              </MagneticButton>
            </Link>
            <Link to="/login">
              <MagneticButton className="group px-12 py-5 border border-[var(--color-border)] font-bold tracking-[0.3em] uppercase text-sm hover:border-[var(--color-accent)] transition-all duration-500 flex items-center gap-4 backdrop-blur-sm">
                <span>Re-Authenticate</span>
                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              </MagneticButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-[var(--color-border)] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xl font-black italic uppercase tracking-tighter">
            VeriProof<span className="text-[var(--color-accent)] not-italic">.</span>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-30">
            © 2026 VeriProof Labs // System Verified
          </p>
        </div>
      </footer>
    </div>
  );
}
