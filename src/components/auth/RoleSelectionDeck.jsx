import { motion } from "framer-motion";
import { UserCircle, ShieldCheck, ArrowRight, Target, CheckCircle2, GitBranch, Terminal } from "lucide-react";

const RoleSelectionDeck = ({ onSelectRole }) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-mono uppercase tracking-[0.2em] text-blue-600 dark:text-cyan-400 font-semibold">
          <Terminal className="w-3.5 h-3.5" />
          <span>SELECT_VERIFICATION_PATHWAY</span>
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
          Enter the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-cyan-400 dark:via-blue-500 dark:to-emerald-400">VeriProof</span> Ecosystem
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 max-w-lg mx-auto font-sans">
          Choose your protocol pathway to initialize your verified identity terminal.
        </p>
      </div>

      {/* Dual Pathway Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* CANDIDATE PATHWAY CARD */}
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelectRole("student")}
          className="relative p-8 rounded-3xl bg-white dark:bg-[#0d1326] border border-blue-200 dark:border-cyan-500/20 hover:border-blue-400 dark:hover:border-cyan-400/60 transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[380px] overflow-hidden shadow-xl dark:shadow-2xl"
        >
          {/* Subtle cyan glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 dark:bg-cyan-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/10 dark:group-hover:bg-cyan-500/20 transition-all duration-500 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-cyan-500/10 border border-blue-500/20 dark:border-cyan-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-300 border border-blue-500/20 dark:border-cyan-500/20 font-semibold">
                PATHWAY // 01
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
              Candidate Pathway
            </h2>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed mb-6 font-sans">
              Build your tamper-proof professional profile, ingest GitHub code evidence, pass technical assessments, and get verified credentials.
            </p>

            {/* Feature Pills */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-gray-300 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                <span>Ingest Resume &amp; Skills</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-gray-300 font-mono">
                <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                <span>Link GitHub Repository Intelligence</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-gray-300 font-mono">
                <UserCircle className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                <span>Pass Adaptive Technical Assessment</span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between border-t border-slate-200 dark:border-cyan-500/10">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-2 font-bold">
              Initialize Candidate OAuth <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </motion.div>

        {/* RECRUITER PATHWAY CARD */}
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelectRole("recruiter")}
          className="relative p-8 rounded-3xl bg-white dark:bg-[#0a1618] border border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-400/60 transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[380px] overflow-hidden shadow-xl dark:shadow-2xl"
        >
          {/* Subtle emerald glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/10 dark:group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-semibold">
                PATHWAY // 02
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
              Recruiter Pathway
            </h2>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed mb-6 font-sans">
              Verify company domain control, ingest candidate resumes, discover pre-verified technical talent, and eliminate resume fraud.
            </p>

            {/* Feature Pills */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-gray-300 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Verify Company Domain Authority</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-gray-300 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Bulk Resume Screening &amp; Matching</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-gray-300 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Verdict Hub &amp; Fraud Telemetry</span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between border-t border-slate-200 dark:border-emerald-500/10">
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
