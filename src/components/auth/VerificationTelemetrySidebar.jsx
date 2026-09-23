import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Database, CheckCircle2, Lock, GitBranch, Layers, Award, Terminal } from "lucide-react";
import CryptographicCore3D from "../3d/CryptographicCore3D";

const VerificationTelemetrySidebar = ({ role = "student", mode = "login", step = 1 }) => {
  const isRecruiter = role === "recruiter";

  return (
    <div className="h-full w-full flex flex-col justify-between p-5 lg:p-6 relative overflow-hidden bg-slate-100/60 dark:bg-[#070a14]/50 backdrop-blur-2xl text-slate-900 dark:text-white border-r border-slate-200/80 dark:border-white/5 transition-colors duration-300">
      {/* Dynamic Background Glows */}
      <div
        className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
          isRecruiter ? "bg-emerald-500/10 dark:bg-emerald-500/15" : "bg-blue-500/10 dark:bg-blue-500/15"
        }`}
      />
      <div
        className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
          isRecruiter ? "bg-teal-500/10" : "bg-cyan-500/10"
        }`}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header / Brand Telemetry */}
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center backdrop-blur-md">
            <Terminal className={`w-4 h-4 ${isRecruiter ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-cyan-400"}`} />
          </div>
          <div>
            <span className="text-lg font-black italic tracking-tighter uppercase font-sans block leading-none text-slate-900 dark:text-white">
              VERI<span className={isRecruiter ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-cyan-400"}>PROOF</span>
            </span>
            <span className="text-[9px] font-mono tracking-[0.2em] text-slate-500 dark:text-gray-400 uppercase block mt-0.5">
              Identity &amp; Skill Verification Engine
            </span>
          </div>
        </div>

        {/* Live Forensic Telemetry Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/[0.03] border border-slate-300 dark:border-white/10 backdrop-blur-md mb-3">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRecruiter ? "bg-emerald-500" : "bg-blue-500 dark:bg-cyan-400"}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isRecruiter ? "bg-emerald-600" : "bg-blue-600 dark:bg-cyan-500"}`} />
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-700 dark:text-gray-300 font-semibold">
            [ SYSTEM_STATUS: VERIFICATION_NODE_ACTIVE ]
          </span>
        </div>

        {/* Dynamic Editorial Headline */}
        <motion.div
          key={role + mode + step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-1.5 max-w-lg"
        >
          <h1 className="text-xl lg:text-2xl font-black italic uppercase tracking-tighter leading-tight text-slate-900 dark:text-white">
            {isRecruiter ? (
              <>
                Hire With <span className="text-emerald-600 dark:text-emerald-400 not-italic">Cryptographic</span> Certainty.
              </>
            ) : (
              <>
                Prove Your Skills <span className="text-blue-600 dark:text-cyan-400 not-italic">Beyond</span> Words.
              </>
            )}
          </h1>
          <p className="text-xs text-slate-600 dark:text-gray-400 font-sans leading-relaxed">
            {isRecruiter
              ? "Screen candidate credentials and eliminate resume fraud with tamper-proof technical blueprints."
              : "Ingest your GitHub projects and earn cryptographically verified credentials recruiters trust."}
          </p>
        </motion.div>
      </div>

      {/* Interactive 3D Cryptographic Lattice */}
      <div className="relative z-10 my-2">
        <CryptographicCore3D role={role} />
      </div>

      {/* Mid Section: Feature Nodes / Journey Cues */}
      <div className="relative z-10 my-2 space-y-2 max-w-md">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-1 font-semibold">
          [ {isRecruiter ? "RECRUITER_VERIFICATION_NODES" : "CANDIDATE_EVIDENCE_PIPELINE"} ]
        </div>

        {isRecruiter ? (
          <>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 dark:text-gray-200">Domain-Verified Authority</div>
                <div className="text-[10px] text-slate-600 dark:text-gray-400">Linked company domain &amp; email verification.</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 dark:text-gray-200">Automated Applicant Screening</div>
                <div className="text-[10px] text-slate-600 dark:text-gray-400">Match candidate claims to job requirements.</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <div className="p-1.5 rounded-md bg-blue-500/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 mt-0.5">
                <GitBranch className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 dark:text-gray-200">GitHub Intelligence</div>
                <div className="text-[10px] text-slate-600 dark:text-gray-400">Parse commits, distributions, and code evidence.</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <div className="p-1.5 rounded-md bg-blue-500/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 mt-0.5">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 dark:text-gray-200">AI Skill Progression Tree</div>
                <div className="text-[10px] text-slate-600 dark:text-gray-400">Visualize skills with confidence scores.</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="relative z-10 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-slate-600 dark:text-gray-400 font-mono text-[10px]">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-slate-500 dark:text-gray-500" />
          <span>FIREBASE_AUTH_SECURED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Database className="w-3 h-3 text-slate-500 dark:text-gray-500" />
          <span>SHA-256 ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
};

export default VerificationTelemetrySidebar;
