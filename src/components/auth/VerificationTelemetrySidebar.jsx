import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Database, Lock, GitBranch, Layers, Terminal } from "lucide-react";

const VerificationTelemetrySidebar = ({ role = "student", mode = "login", step = 1 }) => {
  const isRecruiter = role === "recruiter";

  return (
    <div className="h-full w-full flex flex-col justify-between py-2 relative text-slate-900 dark:text-white transition-colors duration-300">
      {/* Dynamic Background Glows */}
      <div
        className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
          isRecruiter ? "bg-emerald-500/10 dark:bg-emerald-500/15" : "bg-cyan-500/10 dark:bg-cyan-500/15"
        }`}
      />
      <div
        className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
          isRecruiter ? "bg-teal-500/10" : "bg-blue-500/10"
        }`}
      />

      {/* Header / Brand Telemetry */}
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 flex items-center justify-center">
            <Terminal className={`w-5 h-5 ${isRecruiter ? "text-emerald-600 dark:text-emerald-400" : "text-cyan-600 dark:text-cyan-400"}`} />
          </div>
          <div>
            <span className="text-xl font-black italic tracking-tighter uppercase font-sans block leading-none text-slate-900 dark:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              VERI<span className={isRecruiter ? "text-emerald-600 dark:text-emerald-400" : "text-cyan-600 dark:text-cyan-400"}>PROOF</span>
            </span>
            <span className="text-[9px] font-mono tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase block mt-1">
              Identity &amp; Skill Verification Engine
            </span>
          </div>
        </div>

        {/* Live Forensic Telemetry - Clean Borderless Tag */}
        <div className="flex items-center gap-2 mb-6 text-[11px] font-mono tracking-widest text-amber-600 dark:text-amber-400 font-semibold drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span>SYSTEM_STATUS: VERIFICATION_NODE_ACTIVE</span>
        </div>

        {/* Dynamic Editorial Headline with Cinematic Drop-Shadow */}
        <motion.div
          key={role + mode + step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3 max-w-lg mb-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-[0.95] text-slate-900 dark:text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            {isRecruiter ? (
              <>
                Hire With <span className="text-emerald-600 dark:text-emerald-400 not-italic">Cryptographic</span> Certainty.
              </>
            ) : (
              <>
                Prove Your Skills <span className="text-cyan-600 dark:text-cyan-400 not-italic">Beyond</span> Words.
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
            {isRecruiter
              ? "Screen candidate credentials and eliminate resume fraud with tamper-proof technical blueprints."
              : "Ingest your GitHub projects and earn cryptographically verified credentials recruiters trust."}
          </p>
        </motion.div>
      </div>

      {/* Mid Section: Feature Nodes / Journey Cues (Clean, Borderless Rows) */}
      <div className="relative z-10 my-4 space-y-3 max-w-md">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
          [ {isRecruiter ? "RECRUITER_VERIFICATION_NODES" : "CANDIDATE_EVIDENCE_PIPELINE"} ]
        </div>

        {isRecruiter ? (
          <>
            <div className="flex items-start gap-3 py-2 bg-transparent">
              <div className="p-1 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Domain-Verified Authority</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">Linked company domain &amp; email verification.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2 bg-transparent">
              <div className="p-1 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Automated Applicant Screening</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">Match candidate claims to job requirements.</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3 py-2 bg-transparent">
              <div className="p-1 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">GitHub Intelligence</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">Parse commits, distributions, and code evidence.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2 bg-transparent">
              <div className="p-1 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">AI Skill Progression Tree</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">Visualize skills with confidence scores.</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="relative z-10 pt-6 border-t border-slate-200/30 dark:border-slate-800/40 flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono text-[10px]">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>FIREBASE_AUTH_SECURED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Database className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>SHA-256 ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
};

export default VerificationTelemetrySidebar;
