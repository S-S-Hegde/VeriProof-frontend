import VerificationTelemetrySidebar from "./VerificationTelemetrySidebar";

const AuthShell = ({ children, role = "student", mode = "login", step = 1 }) => {
  return (
    <div className="min-h-[90vh] w-full flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden border border-slate-300 dark:border-white/10 shadow-2xl bg-[#F2FAFD]/92 dark:bg-[#070a14] grid grid-cols-1 lg:grid-cols-12 min-h-[680px] transition-colors duration-300">
        {/* Left Telemetry Column (5 Columns on Desktop) */}
        <div className="lg:col-span-5 hidden lg:block relative border-r border-slate-200 dark:border-white/5">
          <VerificationTelemetrySidebar role={role} mode={mode} step={step} />
        </div>

        {/* Right Terminal Deck Column (7 Columns on Desktop) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 relative bg-[#E5F4F9]/60 dark:bg-[#090d1b] overflow-y-auto transition-colors duration-300">
          {/* Subtle Ambient Background Light */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Mobile Telemetry Header */}
          <div className="w-full lg:hidden mb-6 pb-4 border-b border-slate-200 dark:border-white/10 text-center">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-blue-600 dark:text-cyan-400 font-bold">
              [ VERIPROOF_IDENTITY_ENGINE ]
            </span>
          </div>

          <div className="w-full relative z-10">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
