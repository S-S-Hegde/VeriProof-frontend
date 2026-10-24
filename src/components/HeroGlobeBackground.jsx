import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeroInteractiveGlobe } from "./3d/InteractiveGlobeBackground";

export default function HeroGlobeBackground() {
  const [scanCount, setScanCount] = useState(14892);
  const [activeNodes, setActiveNodes] = useState(48);

  // Simulate real-time telemetry increase to make it look live
  useEffect(() => {
    const interval = setInterval(() => {
      setScanCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col justify-between">
      
      {/* 1. INTERACTIVE 3D GLOBE / SHADER BACKGROUND (Main Attraction) */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-auto flex items-center justify-center overflow-hidden">
        {/* Real Three.js / WebGL Globe component */}
        <div className="w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] lg:w-[850px] lg:h-[850px] relative flex items-center justify-center">
          <HeroInteractiveGlobe
            showCornerHUD={false}
            showDragHint={true}
            className="w-full h-full relative"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-600/30 to-transparent blur-3xl pointer-events-none -z-10" />
        </div>
      </div>

      {/* 2. REAL-TIME TELEMETRY HUD OVERLAY */}
      <div className="absolute top-6 right-6 z-20 hidden md:flex items-center gap-4 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-mono text-cyan-400 shadow-xl pointer-events-auto">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span>GLOBAL_NODES: {activeNodes} ACTIVE</span>
        <span className="text-slate-500">|</span>
        <span>RESUMES_VERIFIED: {scanCount.toLocaleString()}</span>
      </div>

      {/* 3. HERO CONTENT CONTAINER (Z-10 to sit above globe) */}
      <main className="relative z-10 flex-grow max-w-7xl mx-auto px-6 pt-24 pb-12 flex flex-col justify-center items-center text-center">
        <div className="inline-block px-3 py-1 mb-6 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono rounded tracking-wider">
          [ SYSTEM_STATUS: SECURE_PROTOCOL_ACTIVE ]
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent uppercase">
          THE EVIDENCE PROTOCOL
        </h1>
        
        <p className="max-w-2xl text-slate-400 text-base md:text-lg mb-10 leading-relaxed font-sans">
          Traditional candidate screening relies on unverified self-reported resumes and keyword stuffing. In a market flooded with exaggerated claims and AI-generated portfolios, VeriProof replaces blind trust with cryptographic proof.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded tracking-wide transition-all shadow-lg shadow-cyan-500/20 uppercase text-sm"
          >
            INITIALIZE_SEQUENCE
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded text-sm font-mono tracking-wider uppercase transition-colors"
          >
            Protocol Specs →
          </Link>
        </div>
      </main>

    </div>
  );
}
