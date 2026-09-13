import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, PlayCircle, ShieldCheck } from "lucide-react";

export default function ExamPurgatoryView({ candidateDNA, onStartPart2, isStartingPart2 }) {
  // Purgatory Timer: 10 minutes maximum break
  const [timeLeft, setTimeLeft] = useState(600); 

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 w-full">
      <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40 mb-6 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            Calibration Complete
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg">
            Part 1 of your assessment is complete. The adaptive engine has analyzed your Skill DNA. Part 2 will dynamically adjust based on your performance.
          </p>

          {/* Timer Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 w-full max-w-sm mb-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2 text-slate-400 font-semibold uppercase text-xs tracking-wider">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /> Mandatory Break</span>
              <span>Ends In</span>
            </div>
            <div className={`font-mono text-5xl font-black tracking-wider text-center ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </div>
            {timeLeft < 60 && (
              <p className="text-xs text-rose-400 text-center mt-3 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Auto-terminating soon
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-8 text-left">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-slate-300 mb-1">Part 2: Adaptive Scenarios</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                You will face scenario-based and debugging questions strictly aligned with your proven skill level. 
              </p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-slate-300 mb-1">Proctoring Active</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Navigating away from this window during the break is recorded as a violation strike.
              </p>
            </div>
          </div>

          <button
            onClick={onStartPart2}
            disabled={isStartingPart2}
            className="group relative flex items-center justify-center gap-3 w-full max-w-xs px-8 py-4 bg-white text-slate-900 rounded-xl font-bold tracking-wide hover:bg-indigo-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isStartingPart2 ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></div>
                Generating Part 2...
              </span>
            ) : (
              <>
                Start Part 2 <PlayCircle className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
