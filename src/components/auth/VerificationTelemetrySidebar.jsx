import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Database, CheckCircle2, Lock, GitBranch, Layers, Award, Terminal } from "lucide-react";

const VerificationTelemetrySidebar = ({ role = "student", mode = "login", step = 1 }) => {
  const isRecruiter = role === "recruiter";

  return (
    <div className="h-full w-full flex flex-col justify-between p-8 lg:p-12 relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200/80 to-slate-100 dark:from-[#070a14] dark:via-[#0b1021] dark:to-[#060912] text-slate-900 dark:text-white border-r border-slate-200 dark:border-white/5 transition-colors duration-300">
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
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center backdrop-blur-md">
            <Terminal className={`w-5 h-5 ${isRecruiter ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-cyan-400"}`} />
          </div>
          <div>
            <span className="text-xl font-black italic tracking-tighter uppercase font-sans block leading-none text-slate-900 dark:text-white">
              VERI<span className={isRecruiter ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-cyan-400"}>PROOF</span>
            </span>
            <span className="text-[10px] font-mono tracking-[0.25em] text-slate-500 dark:text-gray-400 uppercase block mt-1">
              Identity &amp; Skill Verification Engine
            </span>
          </div>
        </div>

        {/* Live Forensic Telemetry Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/[0.03] border border-slate-300 dark:border-white/10 backdrop-blur-md mb-8">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRecruiter ? "bg-emerald-500" : "bg-blue-500 dark:bg-cyan-400"}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isRecruiter ? "bg-emerald-600" : "bg-blue-600 dark:bg-cyan-500"}`} />
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-slate-700 dark:text-gray-300 font-semibold">
            [ SYSTEM_STATUS: VERIFICATION_NODE_ACTIVE ]
          </span>
        </div>

        {/* Dynamic Editorial Headline */}
        <motion.div
          key={role + mode + step}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 max-w-lg"
        >
          <h1 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter leading-[0.95] text-slate-900 dark:text-white">
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
          <p className="text-sm text-slate-600 dark:text-gray-400 font-sans leading-relaxed">
            {isRecruiter
              ? "Screen candidate credentials, ingest engineering repositories, and eliminate resume fraud with tamper-proof technical blueprints."
              : "Ingest your GitHub projects, validate your code claims through AI intelligence, and earn cryptographically verified credentials recruiters trust."}
          </p>
        </motion.div>
      </div>

      {/* Mid Section: Feature Nodes / Journey Cues */}
      <div className="relative z-10 my-8 space-y-4 max-w-md">
        <div className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-2 font-semibold">
          [ {isRecruiter ? "RECRUITER_VERIFICATION_NODES" : "CANDIDATE_EVIDENCE_PIPELINE"} ]
        </div>

        {isRecruiter ? (
          <>
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-gray-200">Domain-Verified Recruiter Authority</div>
                <div className="text-[11px] text-slate-600 dark:text-gray-400">Cryptographically linked company domain &amp; email verification.</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-gray-200">Automated Applicant Screening</div>
                <div className="text-[11px] text-slate-600 dark:text-gray-400">Ingest bulk resumes and match candidate claims to job role requirements.</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-gray-200">Tamper-Proof Verdict Reports</div>
                <div className="text-[11px] text-slate-600 dark:text-gray-400">Review full claims, repo commits, and exam performance in one verdict hub.</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 mt-0.5">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-gray-200">GitHub Repository Intelligence</div>
                <div className="text-[11px] text-slate-600 dark:text-gray-400">Parse commits, language distributions, and code evidence automatically.</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-gray-200">AI Skill Progression Tree</div>
                <div className="text-[11px] text-slate-600 dark:text-gray-400">Visualize foundational vs verified skills with confidence scores.</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-gray-200">Cryptographic Credential Seal</div>
                <div className="text-[11px] text-slate-600 dark:text-gray-400">Earn verifiable certificates backed by live exam performance.</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="relative z-10 pt-6 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-slate-600 dark:text-gray-400 font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-gray-500" />
          <span>FIREBASE_AUTH_SECURED</span>
        </div>
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-slate-500 dark:text-gray-500" />
          <span>SHA-256 ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
};

export default VerificationTelemetrySidebar;
