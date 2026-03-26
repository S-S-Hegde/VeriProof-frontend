import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { GitBranch, ShieldCheck, BarChart3, Search, FileText, Users, Zap, Rocket } from "lucide-react";

/* ─── Sticky parking card ─────────────────────────────────── */
const StickyCard = ({ index, accentColor, children }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const scale   = useTransform(scrollYProgress, [0, 0.4, 0.9, 1], [0.90, 1, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0, 1, 1, 0.55]);
  const y       = useTransform(scrollYProgress, [0, 0.3], [70, 0]);

  const border  = accentColor === "orange"
    ? "border-orange-500/20 hover:border-orange-500/55"
    : "border-red-500/20 hover:border-red-500/55";
  const glow    = accentColor === "orange"
    ? "bg-orange-600/8 group-hover:bg-orange-600/22"
    : "bg-red-600/8 group-hover:bg-red-600/22";

  return (
    <div
      ref={ref}
      className="sticky"
      style={{ top: `${88 + index * 14}px`, zIndex: 10 + index }}
    >
      <motion.div
        style={{ scale, opacity, y }}
        className={`bg-black/72 backdrop-blur-2xl border ${border} rounded-2xl p-8 md:p-10 relative overflow-hidden group transition-colors duration-300 shadow-[0_10px_50px_rgba(0,0,0,0.65)]`}
      >
        <div className={`absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${glow}`} />
        {children}
        {/* Watermark step */}
        <div className="absolute bottom-3 right-5 text-[72px] font-black text-white/[0.025] leading-none select-none pointer-events-none">
          {String(index + 1).padStart(2, "0")}
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Content ─────────────────────────────────────────────── */
const fresherCards = [
  {
    icon: GitBranch,
    title: "Verified Project Showcase",
    tag: "Authenticity",
    desc: "Upload your project details, repository links, and documentation in an organized manner. Repository integration and activity tracking help verify authenticity — letting your actual work speak for itself rather than self-reported claims.",
  },
  {
    icon: ShieldCheck,
    title: "Skill Proof Over Self-Report",
    tag: "Anti-Fraud",
    desc: "The platform reduces resume fraud by backing every claimed skill with traceable project evidence. Recruiters can see exactly what you built, when you built it, and how active your contributions were.",
  },
  {
    icon: BarChart3,
    title: "Track Skill Growth Over Time",
    tag: "Growth Tracking",
    desc: "Monitor your technical progress with structured dashboards showing your project history and skill evolution. A clear, factual view of how your capabilities have developed — not a snapshot but a timeline.",
  },
];

const recruiterCards = [
  {
    icon: Search,
    title: "Real Project Evidence, Not Keywords",
    tag: "Smarter Screening",
    desc: "Evaluate candidates based on structured technical profiles instead of formatted text. Recruiters can assess candidates based on real project work instead of just interview performance or buzzword-filled resumes.",
  },
  {
    icon: FileText,
    title: "NLP Resume Parsing & Alignment Score",
    tag: "AI-Powered",
    desc: "Upload a job description and candidate resumes. Our parsing engine extracts skills and experience, compares them against the role's requirements, and produces an alignment score. Candidates below 75% are automatically flagged for examination.",
  },
  {
    icon: Users,
    title: "Structured Candidate Dashboards",
    tag: "Organized Views",
    desc: "View all candidate profiles through organized dashboards — with verification status, alignment scores, and exam outcomes clearly displayed. Eliminate guesswork from your shortlisting process.",
  },
];

const methodology = [
  { step: "01", title: "Upload & Parse", desc: "Candidates upload project details and repository links. Recruiters upload job descriptions. The NLP engine extracts structured skill signals from both sides." },
  { step: "02", title: "Verify & Score",  desc: "Authenticity checks run against repository activity. An alignment score is calculated matching candidate skills against the recruiter's requirements (0–100%)." },
  { step: "03", title: "Examine & Certify", desc: "Candidates below the alignment threshold are automatically queued for an adaptive MCQ and coding exam with a timed execution window." },
  { step: "04", title: "Assess with Confidence", desc: "Recruiters view a ranked dashboard of candidates with verified project records, alignment scores, and exam results — removing guesswork from hiring." },
];

/* ════════════════════════════════════════════════════════════ */
export default function Demo() {
  return (
    <div className="w-full min-h-screen text-white relative z-10 font-sans -mt-28 pb-40">

      {/* ── DEMO HERO ── */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 sm:px-8 pt-40 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-block mb-6 px-5 py-2 rounded-full border border-orange-500/40 bg-black/50 backdrop-blur shadow-[0_0_20px_rgba(255,69,0,0.35)]"
        >
          <span className="text-xs tracking-[0.35em] uppercase font-bold text-orange-400">Platform Demo</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.07] mb-7 max-w-4xl drop-shadow-[0_0_40px_rgba(255,100,0,0.3)]"
        >
          Why This Platform Exists.<br />
          <span className="text-orange-500">And Why It Matters to You.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl text-base sm:text-lg text-gray-400 font-light leading-relaxed mb-10"
        >
          In many hiring processes, recruiters rely on self-reported information, which makes it hard to assess
          true technical skills and project validity. This platform was built to solve exactly that problem —
          for both sides of the hiring table.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 text-xs uppercase tracking-widest"
        >
          Scroll down to explore ↓
        </motion.p>
      </section>

      {/* ── STICKY CARDS: FRESHERS ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <span className="text-orange-500 uppercase tracking-widest text-xs font-bold">For Students & Freshers</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-white">
            Why Freshers Need This Platform
          </h2>
          <p className="mt-4 text-gray-400 text-sm max-w-lg mx-auto">
            The problem is simple: recruiters cannot assess true technical skills from a formatted document alone.
            Here is how this platform changes that for you.
          </p>
        </motion.div>

        <div className="flex flex-col gap-5" style={{ paddingBottom: "28vh" }}>
          {fresherCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <StickyCard key={i} index={i} accentColor="orange">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-white">{card.title}</h3>
                      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-orange-500/15 text-orange-400 font-bold">
                        {card.tag}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </StickyCard>
            );
          })}
        </div>
      </section>

      {/* ── STICKY CARDS: RECRUITERS ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <span className="text-red-400 uppercase tracking-widest text-xs font-bold">For Recruiters & Employers</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-white">
            Why Recruiters Need This Platform
          </h2>
          <p className="mt-4 text-gray-400 text-sm max-w-lg mx-auto">
            Hiring decisions made on self-reported information risk bringing in the wrong people.
            This platform gives you factual, structured evidence to base decisions on.
          </p>
        </motion.div>

        <div className="flex flex-col gap-5" style={{ paddingBottom: "28vh" }}>
          {recruiterCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <StickyCard key={i} index={i} accentColor="red">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <Icon className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-white">{card.title}</h3>
                      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-bold">
                        {card.tag}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </StickyCard>
            );
          })}
        </div>
      </section>

      {/* ── METHODOLOGY / PIPELINE ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <span className="text-orange-500 uppercase tracking-widest text-xs font-bold">Methodology</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-white">How the Verification Pipeline Works</h2>
          <p className="mt-3 text-gray-500 text-sm">MERN Stack · NLP Resume Parsing · Adaptive Examination · MongoDB</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {methodology.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="bg-black/50 backdrop-blur border border-white/5 rounded-2xl p-7 flex gap-5 items-start"
            >
              <div className="text-5xl font-black text-orange-500/18 leading-none select-none flex-shrink-0">{m.step}</div>
              <div>
                <h3 className="font-bold text-base text-white mb-1.5">{m.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-2xl mx-auto px-4 text-center py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Zap className="w-10 h-10 text-orange-500 mx-auto mb-5 drop-shadow-[0_0_12px_rgba(255,69,0,0.7)]" />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Reduce Resume Fraud.<br />Improve Recruitment Transparency.
          </h2>
          <p className="text-gray-500 mb-8 text-sm">
            A clear way to monitor technical growth over time and provide structured representation of candidate skills and project work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-orange-600 text-white font-black tracking-widest uppercase text-sm shadow-[0_0_25px_rgba(255,69,0,0.55)] hover:bg-orange-500 transition-all duration-300"
            >
              <Rocket className="w-4 h-4" /> Create Account
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-all text-sm font-bold tracking-widest uppercase"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
