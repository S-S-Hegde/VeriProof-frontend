import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView } from "framer-motion";
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
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════
   MICRO COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ─── Magnetic Button ─── */
const MagneticButton = ({ children, className, ...props }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      <div className={className} {...props}>{children}</div>
    </motion.div>
  );
};

/* ─── Animated Counter ─── */
const AnimatedCounter = ({ value, suffix = "", duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const numVal = parseFloat(value);
    const animate = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * numVal));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─── Text Reveal (mask clip) ─── */
const TextReveal = ({ children, delay = 0, className = "" }) => (
  <div className={`overflow-hidden ${className}`}>
    <motion.div
      initial={{ y: "110%", rotateX: 12 }}
      whileInView={{ y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: "bottom" }}
    >
      {children}
    </motion.div>
  </div>
);

/* ─── Word Stagger ─── */
const WordStagger = ({ text, delay = 0, className = "" }) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delay + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

/* ─── Floating Particles ─── */
const FloatingParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.25 + 0.05,
      duration: Math.random() * 5 + 4,
      delay: Math.random() * 3,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full bg-[var(--color-accent)]"
          style={{ left: p.left, top: p.top, opacity: p.opacity }}
          animate={{ y: [0, -25, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

/* ─── Section Reveal Wrapper ─── */
const SectionReveal = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════ */
export default function Home() {
  const compRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);

  // Hero parallax
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.94]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -100]);

  // Stats section parallax
  const { scrollYProgress: statsProgress } = useScroll({ target: statsRef, offset: ["start end", "end start"] });
  const statsY = useTransform(statsProgress, [0, 1], [60, -60]);

  const [hoveredFeature, setHoveredFeature] = useState(null);

  // GSAP ScrollTrigger for protocol cards stagger + pinning
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Protocol cards entrance
      gsap.utils.toArray(".protocol-card").forEach((card, i) => {
        gsap.fromTo(card,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            delay: i * 0.1,
          }
        );
      });

      // Trust banner text parallax
      const trustHeading = document.querySelector(".trust-heading");
      if (trustHeading) {
        gsap.to(trustHeading, {
          yPercent: -15,
          ease: "none",
          scrollTrigger: {
            trigger: trustHeading,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // CTA section scale entrance
      const ctaSection = document.querySelector(".cta-section");
      if (ctaSection) {
        gsap.fromTo(ctaSection,
          { scale: 0.92, opacity: 0 },
          {
            scale: 1, opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ctaSection,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, compRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={compRef} className="overflow-hidden -mt-24">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-6"
      >
        {/* Background radials */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent),transparent_70%)] opacity-[0.04]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,var(--color-accent),transparent_50%)] opacity-[0.06]" />
        <FloatingParticles />

        {/* Decorative lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent opacity-30" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent opacity-20" />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3 px-5 py-2.5 border border-[var(--color-border)] backdrop-blur-md mb-10 rounded-full"
        >
          <span className="vp-status-dot" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--color-muted)]">System_Online // Protocol_v5.0</span>
        </motion.div>

        {/* Title — Kinetic Typography */}
        <div className="text-center max-w-5xl relative z-10">
          <TextReveal>
            <h1 className="font-black italic uppercase tracking-tighter leading-[0.85] mb-2"
                style={{ fontSize: "clamp(3.5rem, 11vw, 9rem)" }}>
              <span className="inline-block opacity-40">
                VERI
              </span>
              <span className="text-[var(--color-accent)]">PROOF</span>
            </h1>
          </TextReveal>
          <TextReveal delay={0.12}>
            <h2
              className="font-black uppercase tracking-tighter leading-[0.85] opacity-50"
              style={{ fontSize: "clamp(1.8rem, 5vw, 4.5rem)" }}
            >
              <WordStagger text="FORENSIC IDENTITY PROTOCOL" delay={0.3} />
            </h2>
          </TextReveal>
        </div>

        {/* Lead Copy */}
        <motion.p
          initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.7 }}
          className="text-center max-w-xl text-base md:text-lg text-[var(--color-muted)] mt-10 leading-relaxed"
        >
          Stop building resumes. Build a <strong className="font-bold text-[var(--color-text)]">legacy that can be proven.</strong> A forensic system designed to verify digital contributions with surgical precision.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-12"
        >
          <Link to="/register">
            <MagneticButton className="vp-btn vp-btn-accent text-sm py-4 px-10 gap-3 group shadow-[0_0_32px_var(--vp-glow)] vp-light-sweep">
              <span className="relative z-10">Initialize_Setup</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
          </Link>
          <a href="#protocols">
            <MagneticButton className="vp-btn vp-btn-secondary text-sm py-4 px-10 gap-3 group">
              <span>View_Protocols</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </MagneticButton>
          </a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="vp-label" style={{ fontSize: "8px" }}>Scroll_to_Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 border border-[var(--color-border)] rounded-full flex justify-center pt-1.5"
          >
            <motion.div className="w-1 h-1.5 bg-[var(--color-accent)] rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ═══════════════════ MARQUEE ═══════════════════ */}
      <div className="relative py-6 border-y border-[var(--color-border)] overflow-hidden">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 30s linear infinite" }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="mx-6 text-xl md:text-3xl font-black italic uppercase tracking-tighter opacity-[0.06] hover:opacity-20 transition-opacity duration-500 shrink-0 cursor-default">
              {item}
              <span className="text-[var(--color-accent)] mx-4 not-italic">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════ PROTOCOLS ═══════════════════ */}
      <section id="protocols" className="relative py-24 lg:py-40 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,var(--color-accent),transparent_60%)] opacity-[0.03] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 lg:mb-24 gap-8">
            <div className="max-w-2xl">
              <SectionReveal>
                <div className="flex items-center gap-3 text-[var(--color-accent)] mb-6">
                  <Terminal className="w-4 h-4" />
                  <span className="vp-label-accent">Protocol_Architecture</span>
                </div>
              </SectionReveal>
              <TextReveal>
                <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)" }} className="font-black italic uppercase tracking-tighter leading-[0.85]">
                  How We<br /><span className="text-[var(--color-accent)] not-italic">Verify.</span>
                </h2>
              </TextReveal>
            </div>
            <SectionReveal delay={0.2}>
              <p className="max-w-md text-sm text-[var(--color-muted)] leading-relaxed lg:text-right">
                Four interconnected verification protocols work in concert to construct an immutable proof layer around your professional identity.
              </p>
            </SectionReveal>
          </div>

          {/* Bento Protocol Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--color-border)] rounded-[var(--radius-2xl)] overflow-hidden">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="protocol-card group relative bg-[var(--color-bg)] p-8 lg:p-12 overflow-hidden cursor-default transition-all duration-500 vp-light-sweep"
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Spotlight hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                     style={{ background: "radial-gradient(400px circle at var(--vp-cursor-x, 50%) var(--vp-cursor-y, 50%), var(--color-accent-subtle), transparent 60%)" }} />

                {/* Background Number */}
                <span className="absolute right-4 top-2 font-black italic opacity-[0.025] leading-none tracking-tighter pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700"
                      style={{ fontSize: "clamp(80px, 10vw, 140px)" }}>
                  {f.num}
                </span>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-11 h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] group-hover:bg-[var(--color-accent-subtle)] transition-all duration-500">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <span className="vp-label">{f.num} //</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-3 group-hover:text-[var(--color-accent)] transition-colors duration-500">
                    {f.title}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-sm group-hover:text-[var(--color-text-secondary)] transition-colors duration-500">
                    {f.desc}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-accent)] group-hover:w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section ref={statsRef} className="relative border-y border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2">
          {/* Left — Text */}
          <div className="p-10 lg:p-16 xl:p-20 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[var(--color-border)]">
            <SectionReveal>
              <div className="flex items-center gap-3 text-[var(--color-accent)] mb-6">
                <Activity className="w-4 h-4" />
                <span className="vp-label-accent">System_Metrics</span>
              </div>
            </SectionReveal>
            <TextReveal>
              <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)" }} className="font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
                Built for<br />Surgical<br /><span className="text-[var(--color-accent)] not-italic">Precision.</span>
              </h2>
            </TextReveal>
            <SectionReveal delay={0.3}>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-md">
                Every number in your profile is cryptographically anchored to real commits, real code, real proof. No interpretation, no inflation — just verified signal.
              </p>
            </SectionReveal>
          </div>

          {/* Right — Stats Grid with parallax */}
          <motion.div className="grid grid-cols-2" style={{ y: statsY }}>
            {STATS.map((stat, i) => (
              <SectionReveal key={i} delay={i * 0.1}>
                <div className={`p-8 lg:p-12 border-b border-r border-[var(--color-border)] group hover:bg-[var(--color-accent-subtle)] transition-colors duration-500 ${
                  i === 1 || i === 3 ? "border-r-0" : ""
                } ${i >= 2 ? "border-b-0" : ""}`}>
                  <div className="text-4xl md:text-5xl font-black italic tracking-tighter mb-3 group-hover:text-[var(--color-accent)] transition-colors duration-500">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="vp-label">{stat.label}</div>
                </div>
              </SectionReveal>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ TRUST BANNER ═══════════════════ */}
      <section className="relative py-28 lg:py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-accent),transparent_50%)] opacity-[0.04] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center">
          <SectionReveal>
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-[var(--color-accent)] opacity-40" />
                <Shield className="w-6 h-6 text-[var(--color-accent)] opacity-60" />
                <div className="h-px w-12 bg-[var(--color-accent)] opacity-40" />
              </div>
            </div>
          </SectionReveal>
          <div className="trust-heading">
            <TextReveal>
              <blockquote style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }} className="font-black italic uppercase tracking-tighter leading-[0.9] mb-10">
                "The future of<br />hiring is not a<br />
                <span className="text-[var(--color-accent)] not-italic">resume.</span>"
              </blockquote>
            </TextReveal>
          </div>
          <SectionReveal delay={0.3}>
            <p className="vp-label">— VeriProof Manifesto, 2026</p>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="cta-section relative py-28 lg:py-40 px-6 border-t border-[var(--color-border)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-accent),transparent_60%)] opacity-[0.05] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <TextReveal>
            <h2 style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }} className="font-black italic uppercase tracking-tighter leading-[0.85]">
              START<br />THE<br />
              <span className="text-[var(--color-accent)] not-italic">AUDIT.</span>
            </h2>
          </TextReveal>

          <SectionReveal delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-5 mt-14">
              <Link to="/register">
                <MagneticButton className="vp-btn vp-btn-accent text-sm py-5 px-12 gap-4 group shadow-[0_0_40px_var(--vp-glow)] vp-light-sweep">
                  <Lock className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Access_Control</span>
                </MagneticButton>
              </Link>
              <Link to="/login">
                <MagneticButton className="vp-btn vp-btn-secondary text-sm py-5 px-12 gap-4 group">
                  <span>Re-Authenticate</span>
                  <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                </MagneticButton>
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
