import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, GitCommit, Binary, Terminal } from "lucide-react";
import CryptographicNodeMesh from "../components/CryptographicNodeMesh";

const TextReveal = ({ children, delay = 0 }) => (
  <div className="overflow-hidden">
    <motion.div
      initial={{ y: "110%" }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  </div>
);

const PRINCIPLES = [
  {
    num: "01",
    title: "Trust Through Math",
    desc: "We replace subjective screening and keyword matching with the cryptographic validation of authentic repository provenance.",
    icon: Binary,
  },
  {
    num: "02",
    title: "Zero-Friction Audits",
    desc: "Seamless OAuth ingestion means candidates prove their worth in seconds, eliminating redundant take-home tests.",
    icon: Zap,
  },
  {
    num: "03",
    title: "Merit Over Marketing",
    desc: "Code doesn't lie. We elevate authentic builders and weed out bad actors regardless of their resume optimization skills.",
    icon: GitCommit,
  },
  {
    num: "04",
    title: "Signal Over Noise",
    desc: "We filter out the fluff, giving engineering managers high-confidence telemetry on architectural choices and commit patterns.",
    icon: ShieldCheck,
  },
];

const TEAM = [
  {
    initials: "SR",
    name: "Sridhar R.",
    role: "Founder & Architect",
    note: "Full-stack engineer passionate about building zero-knowledge trust infrastructure for the next generation of engineering hiring.",
  },
  {
    initials: "VP",
    name: "VeriProof Neural Engine",
    role: "Forensic Core",
    note: "Autonomous verification pipeline parsing commit trees, AST architectures, and dependency graphs with cryptographic certainty.",
  },
];

export default function About() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* 1. INTERACTIVE CRYPTOGRAPHIC NODE MESH BACKGROUND */}
      <CryptographicNodeMesh />

      {/* 2. FOREGROUND CONTENT WRAPPER */}
      <div className="relative z-10 pt-24">
        {/* HERO SECTION */}
        <section className="relative py-20 lg:py-32 px-6 border-b border-slate-800/60 backdrop-blur-[2px]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs rounded tracking-widest uppercase"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>[ ABOUT_VERIPROOF ]</span>
            </motion.div>

            <TextReveal>
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight uppercase leading-[0.9] text-white">
                THE END OF <br />
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                  RESUME INFLATION.
                </span>
              </h1>
            </TextReveal>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-3xl mt-8 text-lg sm:text-xl text-slate-400 leading-relaxed font-sans font-light"
            >
              VeriProof was built on a singular premise: the best engineers deserve to be evaluated by their actual codebase contributions, not their formatting skills. We are building the cryptographic truth layer for professional technical identity.
            </motion.p>
          </div>
        </section>

        {/* MISSION SECTION */}
        <section className="py-20 lg:py-28 px-6 border-b border-slate-800/60 backdrop-blur-[2px]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs rounded tracking-widest uppercase"
              >
                <span>[ CORE_MISSION ]</span>
              </motion.div>
              <TextReveal>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight text-white">
                  WHY WE <br />
                  <span className="text-cyan-400">EXIST.</span>
                </h2>
              </TextReveal>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7 space-y-6 text-slate-300 text-base sm:text-lg leading-relaxed font-sans"
            >
              <p>
                Technical hiring has a truth problem. Traditional resumes are marketing documents—easily embellished and increasingly generated by AI. We built VeriProof to bridge the gap between claimed skills and actual execution. By parsing commit provenance, dependency architecture, and raw code intelligence, we transform developer history into immutable, verifiable proof.
              </p>
              
              <div className="border-l-2 border-cyan-400 pl-6 py-2 my-6 bg-cyan-500/5">
                <blockquote className="text-slate-100 font-mono text-sm sm:text-base italic leading-snug">
                  "If you can prove it, we can verify it. If you can verify it, you can trust it."
                </blockquote>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CORE PRINCIPLES (2x2 Borderless Grid) */}
        <section className="py-20 lg:py-32 px-6 border-b border-slate-800/60 backdrop-blur-[2px]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs rounded tracking-widest uppercase">
                <span>[ PROTOCOL_FOUNDATIONS ]</span>
              </div>
              <TextReveal>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight text-white">
                  CORE <span className="text-cyan-400">PRINCIPLES.</span>
                </h2>
              </TextReveal>
            </div>

            {/* 2x2 Clean, Borderless Floating Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
              {PRINCIPLES.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group border-l-2 border-slate-800 hover:border-cyan-400 pl-6 py-2 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs tracking-wider text-cyan-400/80 font-bold">
                      {item.num} / PROTOCOL
                    </span>
                    <item.icon className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TEAM SECTION (BORDERLESS DESIGN) */}
        <section className="py-20 lg:py-28 px-6 border-b border-slate-800/60 backdrop-blur-[2px]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs rounded tracking-widest uppercase">
                <span>[ ARCHITECTS_&_SYSTEMS ]</span>
              </div>
              <TextReveal>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight text-white">
                  THE <span className="text-cyan-400">ENGINEERING CORE.</span>
                </h2>
              </TextReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {TEAM.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="group border-l-2 border-slate-800 hover:border-cyan-400 pl-6 py-2 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all duration-300">
                      {member.initials}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {member.name}
                      </div>
                      <div className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                        {member.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {member.note}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. FINAL CTA SECTION (CLEAN FLEX COLUMN - NO CLIPPING) */}
        <section className="relative px-6">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center gap-6 py-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-block px-3 py-1 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono rounded tracking-wider uppercase">
                [ VERIFICATION_PORTAL ]
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase">
                VERIFY THE{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                  TRUTH.
                </span>
              </h2>
              <p className="max-w-xl mx-auto text-slate-400 text-base sm:text-lg">
                Stop trusting embellished resumes. Anchor candidate engineering credentials to cryptographic codebase proof today.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/register"
                className="group inline-flex items-center gap-3 px-8 sm:px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wider text-sm rounded shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-400/40 uppercase"
              >
                <span>START THE AUDIT -&gt;</span>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
