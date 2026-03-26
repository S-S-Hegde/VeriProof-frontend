import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Rocket, ArrowRight, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const fadeUp = {
  hidden:   { opacity: 0, y: 36 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.75, ease: "easeOut" } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.14 } } };

export default function Home() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  // ── If already logged in, skip home and go straight to dashboard
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  // Don't render anything while redirect is happening
  if (user) return null;

  return (
    <div className="w-full min-h-screen text-white relative z-10 font-sans -mt-28">

      {/* ── HERO ── */}
      <motion.section
        variants={stagger} initial="hidden" animate="visible"
        className="min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-8 pt-36 pb-20"
      >
        {/* Label pill */}
        <motion.div variants={fadeUp} className="inline-block mb-8 px-5 py-2 rounded-full border border-orange-500/40 bg-black/50 backdrop-blur shadow-[0_0_20px_rgba(255,69,0,0.35)]">
          <span className="text-xs tracking-[0.35em] uppercase font-bold text-orange-400">
            Skill Proof · Portfolio · Candidate Verification Platform
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-5xl sm:text-6xl md:text-7xl xl:text-[5.5rem] font-black tracking-tight leading-[1.06] mb-8 max-w-5xl drop-shadow-[0_0_40px_rgba(255,100,0,0.3)]"
        >
          Prove Your Skills.<br />
          <span className="text-orange-500">Stop Claiming Them.</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="max-w-2xl text-base sm:text-lg md:text-xl text-gray-300 font-light leading-relaxed mb-4">
          A web-based platform that enables students and professionals to display their technical skills using
          <span className="text-orange-400 font-medium"> verified project records</span> — rather than just traditional resumes.
        </motion.p>
        <motion.p variants={fadeUp} className="max-w-xl text-sm text-gray-500 leading-relaxed mb-12">
          Recruiters can view profiles through organized dashboards and assess candidates based on real project work instead of just interview performance.
        </motion.p>

        {/* CTAs — only Register, Demo, Login (no dashboard CTA since user is logged out) */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-5 justify-center flex-wrap">
          <Link to="/register"
            className="group relative overflow-hidden px-8 py-4 rounded-lg bg-orange-600 text-white font-bold tracking-widest uppercase text-sm shadow-[0_0_25px_rgba(255,69,0,0.55)] hover:shadow-[0_0_45px_rgba(255,69,0,0.85)] transition-all flex items-center gap-2 justify-center"
          >
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 pointer-events-none" />
            <Rocket className="w-4 h-4" /> Get Started Free
          </Link>
          <Link to="/demo"
            className="px-8 py-4 rounded-lg border-2 border-orange-500/35 hover:border-orange-500 bg-black/40 backdrop-blur text-gray-300 hover:text-white transition-all duration-300 font-bold tracking-widest uppercase text-sm flex items-center gap-2 justify-center"
          >
            See Platform Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login"
            className="px-8 py-4 rounded-lg border border-white/10 bg-black/30 backdrop-blur text-gray-400 hover:text-white transition-all duration-300 font-bold tracking-widest uppercase text-sm flex items-center gap-2 justify-center"
          >
            Login
          </Link>
        </motion.div>
      </motion.section>

      {/* ── CARDS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <motion.div
            initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="bg-black/60 backdrop-blur-xl border border-orange-500/20 hover:border-orange-500/45 rounded-2xl p-8 relative overflow-hidden group transition-colors"
          >
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-orange-500/8 blur-3xl group-hover:bg-orange-500/20 transition-all duration-700 pointer-events-none" />
            <Rocket className="w-8 h-8 text-orange-500 mb-5" />
            <h3 className="text-xl font-black mb-3 uppercase tracking-wide">For Students & Freshers</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Upload your project details, repository links, and documentation. Repository integration and activity tracking verify authenticity — giving you a competitive edge over candidates relying on self-reported skills.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
            className="bg-black/60 backdrop-blur-xl border border-red-500/20 hover:border-red-500/45 rounded-2xl p-8 relative overflow-hidden group transition-colors"
          >
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-red-500/8 blur-3xl group-hover:bg-red-500/20 transition-all duration-700 pointer-events-none" />
            <Users className="w-8 h-8 text-red-400 mb-5" />
            <h3 className="text-xl font-black mb-3 uppercase tracking-wide">For Recruiters & Employers</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Evaluate candidates based on real project work instead of interview performance. View structured profiles, verified skill signals, and alignment scores mapped to your job descriptions.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-8 bg-black/50 backdrop-blur border border-white/5 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-black uppercase tracking-widest">Platform Objectives</h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
            {[
              "Centralized platform to showcase verified technical projects",
              "Structured representation of candidate skills and project work",
              "Enable recruiters to evaluate candidates based on real project evidence",
              "Track skill growth and project history over time",
              "Reduce resume fraud and improve recruitment transparency",
            ].map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-orange-500 font-bold mt-0.5 flex-shrink-0">→</span>
                {obj}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>
    </div>
  );
}
