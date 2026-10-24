import VerificationTelemetrySidebar from "./VerificationTelemetrySidebar";

const AuthShell = ({ children, role = "student", mode = "login", step = 1 }) => {
  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-8 lg:py-12 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Telemetry Column (5 Columns on Desktop) — Borderless canvas typography */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-between border-r border-slate-200/80 dark:border-gray-800/80 pr-10 lg:pr-12">
          <VerificationTelemetrySidebar role={role} mode={mode} step={step} />
        </div>

        {/* Right Terminal Deck Column (7 Columns on Desktop) — Direct background canvas */}
        <div className="lg:col-span-7 flex flex-col justify-center relative w-full overflow-y-auto">
          {/* Mobile Telemetry Header */}
          <div className="w-full lg:hidden mb-6 pb-3 border-b border-slate-200 dark:border-gray-800 text-center">
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
