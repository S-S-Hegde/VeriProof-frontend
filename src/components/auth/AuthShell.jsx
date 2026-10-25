import VerificationTelemetrySidebar from "./VerificationTelemetrySidebar";
import InteractiveAuthBackground from "../3d/InteractiveAuthBackground";

const AuthShell = ({ children, role = "student", mode = "login", step = 1 }) => {
  return (
    <div className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col justify-center overflow-x-hidden">
      {/* 1. Full-Viewport Interactive Three.js Background (Green Boundary Zone) */}
      <InteractiveAuthBackground role={role} />

      {/* 2. Split-Screen Grid Structure */}
      <div className="relative z-10 w-full max-w-7xl mx-auto my-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px] rounded-none overflow-hidden border border-slate-800/60 shadow-2xl backdrop-blur-xs">
          {/* Left Pane / Red Box Equivalent (lg:col-span-5): Narrative, Brand & Technical Lattice Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/40 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-slate-800/60 p-6 sm:p-8 lg:p-10 relative">
            <VerificationTelemetrySidebar role={role} mode={mode} step={step} />
          </div>

          {/* Right Pane / Grey Box Equivalent (lg:col-span-7): Clean, Borderless Interactive Form */}
          <div className="lg:col-span-7 flex flex-col justify-center bg-slate-950/40 backdrop-blur-sm p-6 sm:p-8 lg:p-12 relative w-full overflow-y-auto">
            {/* Mobile Telemetry Header */}
            <div className="w-full lg:hidden mb-6 pb-3 border-b border-slate-800 text-center">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">
                [ VERIPROOF_IDENTITY_ENGINE ]
              </span>
            </div>

            <div className="w-full relative z-10 max-w-lg mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
