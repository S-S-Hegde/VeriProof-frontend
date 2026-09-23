import VerificationTelemetrySidebar from "./VerificationTelemetrySidebar";

const AuthShell = ({ children, role = "student", mode = "login", step = 1 }) => {
  return (
    <div className="w-full max-w-6xl mx-auto flex items-center justify-center py-1 sm:py-2">
      <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-300/80 dark:border-cyan-500/20 shadow-[0_16px_48px_rgba(0,0,0,0.45)] bg-white/75 dark:bg-[#070a14]/65 backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12 max-h-[calc(100vh-6.5rem)] transition-colors duration-300">
        {/* Left Telemetry Column (5 Columns on Desktop) */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-between relative border-r border-slate-200/80 dark:border-white/5 overflow-y-auto">
          <VerificationTelemetrySidebar role={role} mode={mode} step={step} />
        </div>

        {/* Right Terminal Deck Column (7 Columns on Desktop) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-3 sm:p-5 lg:p-6 relative bg-slate-50/40 dark:bg-[#090d1b]/40 backdrop-blur-xl overflow-y-auto transition-colors duration-300">
          {/* Subtle Ambient Background Light */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Mobile Telemetry Header */}
          <div className="w-full lg:hidden mb-3 pb-2 border-b border-slate-200 dark:border-white/10 text-center">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-blue-600 dark:text-cyan-400 font-bold">
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
