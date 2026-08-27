import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
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
      initial={{ y: "110%" }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
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

const ProcessStep = ({ num, icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay }}
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
        <h3 className="text-xl font-black uppercase tracking-tighter mb-3 group-hover:text-[var(--color-accent)] transition-colors duration-500">
          {title}
        </h3>
        <p className="text-xs opacity-40 leading-relaxed group-hover:opacity-60 transition-opacity duration-500">
          {desc}
        </p>
      </div>
      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-accent)] group-hover:w-full transition-all duration-700" />
    </div>
  </motion.div>
);

const FeatureRow = ({ icon: Icon, label, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="group flex items-start gap-5 py-6 border-b border-[var(--color-border)] last:border-0 hover:pl-2 transition-all duration-500"
  >
    <div className="w-10 h-10 border border-[var(--color-border)] flex items-center justify-center shrink-0 group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] transition-all duration-500">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <div className="text-sm font-bold uppercase tracking-widest mb-1 group-hover:text-[var(--color-accent)] transition-colors duration-500">
        {label}
      </div>
      <div className="text-xs opacity-40 leading-relaxed max-w-sm group-hover:opacity-60 transition-opacity duration-500">
        {desc}
      </div>
    </div>
  </motion.div>
);

const METRICS = [
  { value: "99.98%", label: "Accuracy", color: "text-[var(--color-accent)]" },
  { value: "1,204", label: "Active Nodes", color: "" },
  { value: "48ms", label: "Latency", color: "text-green-400" },
];

export default function Demo() {
  const compRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isShutterOpen, setIsShutterOpen] = useState(false);

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
    <div ref={compRef} className="overflow-hidden">
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

      <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden -mt-28 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent),transparent_60%)] opacity-[0.05]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-[var(--color-accent)] opacity-[0.06]"
              style={{ top: `${12 + i * 11}%`, left: 0, right: 0 }}
              initial={{ scaleX: 0, originX: i % 2 === 0 ? 0 : 1 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 1.5,
                delay: 0.8 + i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center relative z-10 max-w-4xl"
        >
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-3 px-5 py-2.5 border border-[var(--color-border)] backdrop-blur-md rounded-full">
              <Cpu className="w-3.5 h-3.5 text-[var(--color-accent)] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-70">
                Core_Verified_Archive
              </span>
            </div>
          </div>

          <TextReveal delay={0.4}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-6">
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
            transition={{ delay: 1.5 }}
            className="text-base md:text-lg opacity-50 max-w-xl mx-auto mb-12 leading-relaxed font-light"
          >
            Where cryptographic precision meets architectural storytelling. The
            global truth layer for professional identities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
          >
            <Magnetic>
              <Link
                to="/register"
                className="group relative inline-flex items-center gap-4 px-12 py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all duration-500 shadow-2xl overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 w-0 group-hover:w-full transition-all duration-500" />
                <span className="relative z-10">INITIALIZE_SEQUENCE</span>
                <ArrowDown className="w-4 h-4 relative z-10 group-hover:translate-y-1 transition-transform" />
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-12 flex flex-col items-center gap-3"
        >
          <span className="text-[9px] font-mono uppercase tracking-[0.4em] opacity-30">
            Explore
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 border border-[var(--color-border)] rounded-full flex justify-center pt-1.5"
          >
            <motion.div className="w-1 h-1.5 bg-[var(--color-accent)] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      <section className="relative py-32 lg:py-44 px-6 border-t border-[var(--color-border)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--color-accent),transparent_60%)] opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="mb-20 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-[var(--color-accent)] mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-[0.4em]">
                How_It_Works
              </span>
            </motion.div>
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
              title="Connect Identity"
              desc="Link your GitHub, GitLab, and other code repositories. Our system begins mapping your digital fingerprint across all connected nodes."
              delay={0}
            />
            <ProcessStep
              num="02"
              icon={Scan}
              title="Forensic Analysis"
              desc="Neural scanning verifies every commit, pull request, and code contribution. Cross-referencing billions of lines to ensure 100% authenticity."
              delay={0.15}
            />
            <ProcessStep
              num="03"
              icon={Shield}
              title="Issue Proof"
              desc="Receive a cryptographically signed VeriProof certificate — an immutable record of your verified skills that recruiters can trust."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      <section className="relative py-32 lg:py-44 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 text-[var(--color-accent)] mb-6"
              >
                <Database className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-[0.4em]">
                  Evidence_Protocol
                </span>
              </motion.div>
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
                label="Biometric Verification"
                desc="Hash-based identity validation across distributed nodes with zero-knowledge proofs."
                delay={0}
              />
              <FeatureRow
                icon={Globe}
                label="Global Sync"
                desc="Real-time synchronization with primary talent repositories across 47 jurisdictions."
                delay={0.1}
              />
              <FeatureRow
                icon={Layers}
                label="Neural Archive"
                desc="Permanent, immutable record of skill manifestations encoded in append-only ledgers."
                delay={0.2}
              />
              <FeatureRow
                icon={Eye}
                label="Transparency Layer"
                desc="Every verification decision is auditable. Full traceability from raw commit to final proof."
                delay={0.3}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="border border-[var(--color-border)] bg-black/5 dark:bg-white/5 backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-white/5 dark:bg-black/10">
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50">
                    Live_Network_Load
                  </span>
                  <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em]">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    OPERATIONAL
                  </span>
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
                        className={`text-xl md:text-2xl font-black italic tracking-tighter ${m.color}`}
                      >
                        {m.value}
                      </div>
                      <div className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-40 mt-1">
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
                className="mt-1 border border-[var(--color-border)] p-6 flex items-start gap-4 hover:bg-[var(--color-accent)]/5 transition-colors duration-500"
              >
                <CheckCircle2 className="w-5 h-5 text-[var(--color-accent)] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-1">
                    Verification Guarantee
                  </div>
                  <div className="text-[10px] opacity-40 leading-relaxed">
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
