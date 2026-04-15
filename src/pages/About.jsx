import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Zap, Users, GitBranch, ArrowRight, Star, Target, Cpu } from "lucide-react";

const TextReveal = ({ children, delay = 0 }) => (
  <div className="overflow-hidden">
    <motion.div
      initial={{ y: "110%" }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  </div>
);

const VALUES = [
  { icon: Shield, title: "Trust by Default", desc: "Every claim on VeriProof is backed by cryptographic proof. We don't take your word for it — we verify it." },
  { icon: Zap, title: "Zero Friction", desc: "Verification should be instant. Our neural scanning pipeline processes thousands of commits in under 48ms." },
  { icon: Users, title: "Candidate First", desc: "Built for the developer who has done the work but can't prove it on a traditional resume." },
  { icon: Target, title: "Precision Over Recall", desc: "We'd rather surface 10 verified signals than 100 unverified claims. Quality beats quantity, every time." },
];

const TEAM = [
  { initials: "SR", name: "Sridhar R.", role: "Founder & Architect", note: "Full-stack developer passionate about building trust infrastructure for the next generation of hiring." },
  { initials: "VP", name: "VeriProof AI", role: "Forensic Engine", note: "Neural model trained on 200M+ public commits to identify authentic code authorship with surgical precision." },
];

export default function About() {
  return (
    <div className="min-h-screen pt-20">
      
      {/* Hero */}
      <section className="relative py-24 lg:py-36 px-6 border-b border-[var(--color-border)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-accent),transparent_60%)] opacity-[0.04] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-[var(--color-accent)] mb-6"
          >
            <Cpu className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-[0.4em]">About_VeriProof</span>
          </motion.div>
          <TextReveal>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black italic uppercase tracking-tighter leading-[0.85]">
              The Truth<br /><span className="text-[var(--color-accent)] not-italic">Layer.</span>
            </h1>
          </TextReveal>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mt-8 text-base opacity-50 leading-relaxed"
          >
            VeriProof was built on a simple premise: the best developers in the world deserve to be seen — 
            not just on paper, but through their actual code. We are building the cryptographic truth layer 
            that makes professional identity verifiable, portable, and impossible to fake.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 lg:py-32 px-6 border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-[var(--color-accent)] mb-6"
            >
              <Star className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Our_Mission</span>
            </motion.div>
            <TextReveal>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-[0.85] mb-6">
                Why We<br /><span className="text-[var(--color-accent)] not-italic">Exist.</span>
              </h2>
            </TextReveal>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center space-y-6"
          >
            <p className="text-sm opacity-60 leading-relaxed">
              Hiring is broken. Resumes are documents of intention, not proof of ability. 
              AI-generated portfolios have made the problem worse — candidates claim skills 
              they don't have, and recruiters can't tell the difference.
            </p>
            <p className="text-sm opacity-60 leading-relaxed">
              VeriProof changes this by anchoring every claim to real, cryptographically 
              verifiable evidence — actual commits, actual pull requests, actual code that 
              has been reviewed and merged into production systems.
            </p>
            <p className="text-sm font-bold opacity-80 leading-relaxed border-l-2 border-[var(--color-accent)] pl-4">
              "If you can prove it, we can verify it. If you can verify it, you can trust it."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-32 px-6 border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-[var(--color-accent)] mb-6"
            >
              <GitBranch className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Core_Protocols</span>
            </motion.div>
            <TextReveal>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.85]">
                What We<br /><span className="text-[var(--color-accent)] not-italic">Stand For.</span>
              </h2>
            </TextReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {VALUES.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group border border-[var(--color-border)] p-10 hover:bg-[var(--color-accent)]/5 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-accent)] group-hover:w-full transition-all duration-700" />
                <div className="w-12 h-12 border border-[var(--color-border)] flex items-center justify-center mb-6 group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] transition-all duration-500">
                  <v.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-3 group-hover:text-[var(--color-accent)] transition-colors duration-500">
                  {v.title}
                </h3>
                <p className="text-sm opacity-50 leading-relaxed group-hover:opacity-70 transition-opacity duration-500">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 lg:py-32 px-6 border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <TextReveal>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.85]">
                The<br /><span className="text-[var(--color-accent)] not-italic">Team.</span>
              </h2>
            </TextReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {TEAM.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group border border-[var(--color-border)] p-10 hover:bg-[var(--color-accent)]/5 transition-all duration-500"
              >
                <div className="w-16 h-16 border border-[var(--color-border)] flex items-center justify-center mb-6 text-xl font-black group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] transition-all duration-500">
                  {member.initials}
                </div>
                <div className="text-xl font-black uppercase tracking-tighter mb-1">{member.name}</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">{member.role}</div>
                <p className="text-sm opacity-50 leading-relaxed">{member.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32 px-6 text-center">
        <div className="absolute inset-x-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-accent),transparent_60%)] opacity-[0.04] h-64 pointer-events-none" />
        <TextReveal>
          <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.85] mb-10">
            Ready To<br /><span className="text-[var(--color-accent)] not-italic">Verify?</span>
          </h2>
        </TextReveal>
        <Link
          to="/register"
          className="group inline-flex items-center gap-4 px-12 py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all duration-500 shadow-xl"
        >
          <span>Start Now</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
