import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Database, CheckCircle2, Lock, GitBranch, Layers, Award, Terminal } from "lucide-react";
import CryptographicCore3D from "../3d/CryptographicCore3D";
import TerminalBadge from "../TerminalBadge";

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
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center backdrop-blur-md">
            <Terminal className={`w-4 h-4 ${isRecruiter ? "text-emerald-600 dark:text-emerald-400" : "text-cyan-600 dark:text-cyan-400"}`} />
          </div>
          <div>
            <span className="text-lg font-black italic tracking-tighter uppercase font-sans block leading-none text-slate-900 dark:text-white">
              VERI<span className={isRecruiter ? "text-emerald-600 dark:text-emerald-400" : "text-cyan-600 dark:text-cyan-400"}>PROOF</span>
            </span>
            <span className="text-[9px] font-mono tracking-[0.2em] text-slate-600 dark:text-slate-400 uppercase block mt-0.5">
              Identity &amp; Skill Verification Engine
            </span>
          </div>
        </div>

        {/* Live Forensic Telemetry Badge - Luxury Champagne Gold Accent */}
        <TerminalBadge
          text="[ SYSTEM_STATUS: VERIFICATION_NODE_ACTIVE ]"
          pulse
          className="mb-4 text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
        />

        {/* Dynamic Editorial Headline */}
        <motion.div
          key={role + mode + step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2 max-w-lg"
        >
          <h1 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter leading-tight text-slate-900 dark:text-white">
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
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
            {isRecruiter
              ? "Screen candidate credentials and eliminate resume fraud with tamper-proof technical blueprints."
              : "Ingest your GitHub projects and earn cryptographically verified credentials recruiters trust."}
          </p>
        </motion.div>
      </div>

      {/* Interactive 3D Cryptographic Lattice Preview */}
      <div className="relative z-10 my-4 border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/40 rounded-none p-2 hidden sm:block">
        <CryptographicCore3D role={role} />
      </div>

      {/* Mid Section: Feature Nodes / Journey Cues */}
      <div className="relative z-10 my-2 space-y-2.5 max-w-md">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1 font-semibold">
          [ {isRecruiter ? "RECRUITER_VERIFICATION_NODES" : "CANDIDATE_EVIDENCE_PIPELINE"} ]
        </div>

        {isRecruiter ? (
          <>
            <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shadow-xs dark:shadow-none">
              <div className="p-1.5 rounded-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 dark:text-slate-200">Domain-Verified Authority</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">Linked company domain &amp; email verification.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shadow-xs dark:shadow-none">
              <div className="p-1.5 rounded-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 dark:text-slate-200">Automated Applicant Screening</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">Match candidate claims to job requirements.</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shadow-xs dark:shadow-none">
              <div className="p-1.5 rounded-none bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0">
                <GitBranch className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 dark:text-slate-200">GitHub Intelligence</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">Parse commits, distributions, and code evidence.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shadow-xs dark:shadow-none">
              <div className="p-1.5 rounded-none bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 dark:text-slate-200">AI Skill Progression Tree</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">Visualize skills with confidence scores.</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Metrics - Luxury Security Accents */}
      <div className="relative z-10 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-slate-600 dark:text-slate-400 font-mono text-[10px]">
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
