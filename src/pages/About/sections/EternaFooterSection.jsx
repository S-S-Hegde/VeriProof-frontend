import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UserCheck, Shield, Sparkles } from "lucide-react";

export default function EternaFooterSection({
  onOpenWisdom,
  onOpenWhyName,
  onOpenCauseEffect,
  onOpenJoinTeam
}) {
  return (
    <footer className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* ── Botanical Illuminated Foliage SVGs (Left and Right) ── */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex justify-between items-end opacity-40 sm:opacity-75">
        {/* Left Foliage Vector */}
        <div className="w-[280px] sm:w-[420px] md:w-[480px] botanical-sway-left -ml-16 sm:-ml-8 mb-4">
          <svg viewBox="0 0 400 600" fill="none" className="w-full h-auto">
            {/* Stems */}
            <path d="M50 600 C 60 400, 120 300, 160 150" stroke="#AC24FF" strokeWidth="2.5" opacity="0.4" />
            <path d="M120 600 C 130 450, 200 350, 260 220" stroke="#1B4DFE" strokeWidth="2.5" opacity="0.5" />
            <path d="M20 600 C 30 500, 80 400, 90 280" stroke="#FE881B" strokeWidth="2" opacity="0.4" />

            {/* Glowing Floral Petals Left */}
            <path d="M160 150 C 140 100, 110 110, 130 160 Z" fill="url(#petal-grad-1)" opacity="0.85" />
            <path d="M160 150 C 180 90, 220 110, 185 160 Z" fill="url(#petal-grad-2)" opacity="0.85" />
            <path d="M160 150 C 150 70, 175 60, 175 140 Z" fill="url(#petal-grad-1)" opacity="0.9" />
            <circle cx="165" cy="140" r="16" fill="#FFD600" filter="drop-shadow(0 0 14px #FFD600)" />

            {/* Small leaves */}
            <path d="M100 350 C 70 330, 60 360, 95 375 Z" fill="#1B4DFE" opacity="0.75" />
            <path d="M140 280 C 170 260, 190 290, 145 305 Z" fill="#AC24FF" opacity="0.75" />
            <path d="M180 420 C 150 400, 130 430, 170 445 Z" fill="#1B4DFE" opacity="0.6" />
            <circle cx="100" cy="300" r="10" fill="#FFD600" opacity="0.8" />
            <circle cx="240" cy="380" r="12" fill="#FE881B" opacity="0.75" />
          </svg>
        </div>

        {/* Right Foliage Vector */}
        <div className="w-[280px] sm:w-[420px] md:w-[480px] botanical-sway-right -mr-16 sm:-mr-8 mb-4">
          <svg viewBox="0 0 400 600" fill="none" className="w-full h-auto">
            {/* Stems */}
            <path d="M350 600 C 340 400, 280 300, 240 150" stroke="#AC24FF" strokeWidth="2.5" opacity="0.4" />
            <path d="M280 600 C 270 450, 200 350, 140 220" stroke="#1B4DFE" strokeWidth="2.5" opacity="0.5" />
            <path d="M380 600 C 370 500, 320 400, 310 280" stroke="#FE881B" strokeWidth="2" opacity="0.4" />

            {/* Glowing Floral Petals Right */}
            <path d="M240 150 C 260 100, 290 110, 270 160 Z" fill="url(#petal-grad-1)" opacity="0.85" />
            <path d="M240 150 C 220 90, 180 110, 215 160 Z" fill="url(#petal-grad-2)" opacity="0.85" />
            <path d="M240 150 C 250 70, 225 60, 225 140 Z" fill="url(#petal-grad-1)" opacity="0.9" />
            <circle cx="235" cy="140" r="16" fill="#FFD600" filter="drop-shadow(0 0 14px #FFD600)" />

            {/* Small leaves */}
            <path d="M300 350 C 330 330, 340 360, 305 375 Z" fill="#1B4DFE" opacity="0.75" />
            <path d="M260 280 C 230 260, 210 290, 255 305 Z" fill="#AC24FF" opacity="0.75" />
            <circle cx="300" cy="300" r="10" fill="#FFD600" opacity="0.8" />
            <circle cx="160" cy="380" r="12" fill="#FE881B" opacity="0.75" />
          </svg>
        </div>

        {/* Shared SVG Gradients */}
        <svg className="hidden">
          <defs>
            <linearGradient id="petal-grad-1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1B4DFE" />
              <stop offset="50%" stopColor="#AC24FF" />
              <stop offset="100%" stopColor="#FE881B" />
            </linearGradient>
            <linearGradient id="petal-grad-2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#AC24FF" />
              <stop offset="60%" stopColor="#FFD600" />
              <stop offset="100%" stopColor="#FE881B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Main Center Content ── */}
      <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
        {/* Top Buttons Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full border border-purple-500/50 bg-gradient-to-tr from-cyan-400 via-purple-500 to-amber-400 p-[2px]">
              <div className="h-full w-full rounded-full bg-[#13101c]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-mono">
              VERIPROOF
            </span>
          </div>

          <Link
            to="/contact"
            className="btn-eterna-gradient rounded-xl px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg"
          >
            Contact
          </Link>

          <button
            onClick={onOpenJoinTeam}
            className="rounded-xl border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
          >
            Join our team
          </button>
        </div>

        {/* Central Bold Statement */}
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-gradient-eterna">
            Nothing is impossible
          </h2>
        </div>

        {/* 3 Interactive Modal Trigger Squares */}
        <div className="flex items-center justify-center gap-5 sm:gap-6">
          {/* Einstein Icon: Wisdom we live by */}
          <button
            onClick={onOpenWisdom}
            className="group flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border border-white/10 bg-[#1e1834]/80 backdrop-blur-xl transition-all duration-300 hover:border-purple-400/50 hover:scale-105 hover:shadow-xl hover:shadow-purple-600/30"
            title="Wisdom we live by"
          >
            <div className="text-center">
              <span className="text-2xl sm:text-3xl block filter drop-shadow group-hover:scale-110 transition-transform">
                🧠
              </span>
              <span className="text-[10px] block font-mono text-white/50 group-hover:text-white transition-colors mt-0.5">
                Wisdom
              </span>
            </div>
          </button>

          {/* VeriProof Ring Icon: Why the name */}
          <button
            onClick={onOpenWhyName}
            className="group flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border border-white/10 bg-[#1e1834]/80 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/50 hover:scale-105 hover:shadow-xl hover:shadow-cyan-600/30"
            title="Why the name VeriProof?"
          >
            <div className="text-center">
              <div className="h-6 w-6 sm:h-7 sm:w-7 mx-auto rounded-full border-2 border-cyan-400 border-t-purple-500 border-r-amber-400 group-hover:rotate-180 transition-transform duration-700" />
              <span className="text-[10px] block font-mono text-white/50 group-hover:text-white transition-colors mt-1">
                Name
              </span>
            </div>
          </button>

          {/* Butterfly Icon: Cause and effects */}
          <button
            onClick={onOpenCauseEffect}
            className="group flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border border-white/10 bg-[#1e1834]/80 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/50 hover:scale-105 hover:shadow-xl hover:shadow-amber-600/30"
            title="Every cause has effects"
          >
            <div className="text-center">
              <span className="text-2xl sm:text-3xl block filter drop-shadow group-hover:scale-110 transition-transform">
                🦋
              </span>
              <span className="text-[10px] block font-mono text-white/50 group-hover:text-white transition-colors mt-0.5">
                Cause
              </span>
            </div>
          </button>
        </div>

        {/* Bottom Epilogue Quote & Legal Line */}
        <div className="border-t border-white/10 pt-10 space-y-4">
          <p className="text-xs sm:text-sm text-white/60 font-light">
            When every claim is proven and clear, absolute trust must appear.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/40">
            <span>© VeriProof Systems 2026</span>
            <span>•</span>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-white transition-colors">Support & Inquiries</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
