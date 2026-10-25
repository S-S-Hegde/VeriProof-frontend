import VerificationTelemetrySidebar from "./VerificationTelemetrySidebar";
import InteractiveAuthBackground from "../3d/InteractiveAuthBackground";

const AuthShell = ({ children, role = "student", mode = "login", step = 1 }) => {
  return (
    <div className="relative w-full min-h-[calc(100vh-4.5rem)] flex flex-col justify-center overflow-x-hidden">
      {/* 1. Full-Viewport Interactive Three.js Background (Green Boundary Zone) */}
      <InteractiveAuthBackground role={role} />

      {/* 2. Split-Screen Grid Structure - Seamless Borderless Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto my-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] gap-8 lg:gap-12 items-center">
          {/* Left Pane / Narrative (lg:col-span-5): High-contrast glassmorphic panel */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.7)] rounded-2xl p-6 sm:p-8 relative">
            <VerificationTelemetrySidebar role={role} mode={mode} step={step} />
          </div>

          {/* Right Pane / Authentication Form (lg:col-span-7): High-contrast glassmorphic panel */}
          <div className="lg:col-span-7 flex flex-col justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.7)] rounded-2xl p-6 sm:p-8 lg:p-10 relative w-full">
            {/* Mobile Telemetry Header */}
            <div className="w-full lg:hidden mb-6 pb-2 text-center">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400 font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
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
