import { motion, useReducedMotion } from "framer-motion";
import { UserCircle, ShieldCheck, ArrowRight, Target, CheckCircle2, GitBranch, Terminal } from "lucide-react";
import TerminalBadge from "../TerminalBadge";

const RoleSelectionDeck = ({ onSelectRole }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <TerminalBadge
          text="SELECT_VERIFICATION_PATHWAY"
          icon={Terminal}
          pulse
        />
        <h1
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-slate-100"
        >
          Enter the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-cyan-400 dark:via-blue-500 dark:to-emerald-400">VeriProof</span> Ecosystem
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto font-sans">
          Choose your protocol pathway to initialize your verified identity terminal.
        </p>
      </div>

      {/* Dual Pathway Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* CANDIDATE PATHWAY CARD */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
          whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelectRole("student")}
          className="relative p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/80 dark:hover:border-cyan-400 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.7)] transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[360px]"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-lg border border-slate-300 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-cyan-400 group-hover:border-blue-600 dark:group-hover:border-cyan-400 transition-colors">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-400 font-semibold">
                PATHWAY // 01
              </span>
            </div>

            <h2
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
              className="text-2xl font-black italic uppercase tracking-tight text-slate-900 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors"
            >
              Candidate Pathway
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-sans">
              Build your tamper-proof professional profile, ingest GitHub code evidence, pass technical assessments, and get verified credentials.
            </p>

            {/* Feature Pills */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                <span>Ingest Resume &amp; Skills</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-mono">
                <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                <span>Link GitHub Repository Intelligence</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-mono">
                <UserCircle className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                <span>Pass Adaptive Technical Assessment</span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-2 font-bold">
              Initialize Candidate OAuth <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </motion.div>

        {/* RECRUITER PATHWAY CARD */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
          whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelectRole("recruiter")}
          className="relative p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-600 dark:hover:border-emerald-400 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.7)] transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[360px]"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-lg border border-slate-300 dark:border-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:border-emerald-600 dark:group-hover:border-emerald-400 transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
                PATHWAY // 02
              </span>
            </div>

            <h2
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
              className="text-2xl font-black italic uppercase tracking-tight text-slate-900 dark:text-slate-100 mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors"
            >
              Recruiter Pathway
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-sans">
              Verify company domain control, ingest candidate resumes, discover pre-verified technical talent, and eliminate resume fraud.
            </p>

            {/* Feature Pills */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Verify Company Domain Authority</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Bulk Resume Screening &amp; Matching</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Verdict Hub &amp; Fraud Telemetry</span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-2 font-bold">
              Initialize Recruiter OAuth <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelectionDeck;
