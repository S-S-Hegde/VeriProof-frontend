import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { useTheme } from "../../context/ThemeContext";
import { useScrollProgress } from "./hooks/useScrollProgress";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useIsMobile } from "./hooks/useIsMobile";

// Individual Sections S0 through S12
import S0_Hero from "./sections/S0_Hero";
import S1_Problem from "./sections/S1_Problem";
import S2_Pipeline from "./sections/S2_Pipeline";
import S3_Purgatory from "./sections/S3_Purgatory";
import S4_TrustScore from "./sections/S4_TrustScore";
import S5_QuestionQuality from "./sections/S5_QuestionQuality";
import S6_Triangulation from "./sections/S6_Triangulation";
import S7_SkillTree from "./sections/S7_SkillTree";
import S8_RecruiterHub from "./sections/S8_RecruiterHub";
import S9_Numbers from "./sections/S9_Numbers";
import S10_Principles from "./sections/S10_Principles";
import S11_Team from "./sections/S11_Team";
import S12_FinalCta from "./sections/S12_FinalCta";

// Code-split 3D Scene Root
const SceneRoot = lazy(() => import("./three/SceneRoot"));

const SECTIONS_NAV = [
  { id: 0, label: "Hero", target: "#section-hero" },
  { id: 1, label: "The Problem", target: "#section-problem" },
  { id: 2, label: "Pipeline", target: "#section-pipeline" },
  { id: 3, label: "Purgatory", target: "#section-purgatory" },
  { id: 4, label: "Trust Score", target: "#section-trust-score" },
  { id: 5, label: "Question Quality", target: "#section-question-quality" },
  { id: 6, label: "Triangulation", target: "#section-triangulation" },
  { id: 7, label: "Skill Tree", target: "#section-skill-tree" },
  { id: 8, label: "Recruiter Hub", target: "#section-recruiter-hub" },
  { id: 9, label: "Results", target: "#section-numbers" },
  { id: 10, label: "Principles", target: "#section-principles" },
  { id: 11, label: "Architects", target: "#section-team" },
  { id: 12, label: "Verify", target: "#section-final-cta" },
];

export default function AboutPage() {
  const { isDarkMode } = useTheme();
  const isDark = isDarkMode !== undefined ? isDarkMode : true;

  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const { globalProgress, activeSection, sectionProgress } = useScrollProgress();

  const [hoveredOutcome, setHoveredOutcome] = useState(null);
  const [hoveredSkillNode, setHoveredSkillNode] = useState(null);

  // Desktop custom trailing cyan cursor state
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  const lenisRef = useRef(null);

  // Initialize Lenis smooth scroll (unless user prefers reduced motion)
  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  // Track desktop mouse for custom cyan cursor
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      // Check if hovering interactive element
      const target = e.target;
      const isInteractive = target.closest("a, button, input, [role='button'], .cursor-pointer");
      setIsHoveringInteractive(Boolean(isInteractive));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  // Smooth scroll handler for nav dots & buttons
  const scrollToTarget = (targetSelector) => {
    const el = document.querySelector(targetSelector);
    if (!el) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -60 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`relative min-h-screen transition-colors duration-500 overflow-x-hidden ${
        isDark ? "bg-[#050816] text-slate-100" : "bg-[#f4f7fb] text-slate-900"
      }`}
    >
      {/* ── Top Scroll Progress Bar ── */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none bg-slate-800/20">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-500 transition-all duration-75"
          style={{ width: `${Math.min(100, Math.max(0, globalProgress * 100))}%` }}
        />
      </div>

      {/* ── Desktop Right-Side Dot Navigator ── */}
      {!isMobile && (
        <aside
          aria-label="Section navigation"
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2.5 pointer-events-auto"
        >
          {SECTIONS_NAV.map((sec) => {
            const isActive = activeSection === sec.id;

            return (
              <button
                key={sec.id}
                onClick={() => scrollToTarget(sec.target)}
                className="group relative flex items-center justify-end p-1.5 focus:outline-none"
                title={sec.label}
              >
                {/* Tooltip on hover */}
                <span
                  className={`absolute right-7 px-2 py-0.5 rounded font-mono text-[10px] tracking-wider uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                    isDark ? "bg-slate-900 border border-slate-800 text-cyan-300" : "bg-white border border-slate-300 text-slate-800 shadow-sm"
                  }`}
                >
                  {sec.label}
                </span>

                {/* Dot Indicator */}
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-2.5 h-6 bg-cyan-400 shadow-lg shadow-cyan-400/50"
                      : "w-2 h-2 bg-slate-600 hover:bg-slate-400"
                  }`}
                />
              </button>
            );
          })}
        </aside>
      )}

      {/* ── Persistent Fixed R3F 3D Canvas Background ── */}
      <Suspense fallback={null}>
        <SceneRoot
          scrollProgress={globalProgress}
          activeSection={activeSection}
          sectionProgress={sectionProgress}
          isDark={isDark}
          isMobile={isMobile}
          reducedMotion={reducedMotion}
          hoveredOutcome={hoveredOutcome}
          onHoverSkillNode={setHoveredSkillNode}
        />
      </Suspense>

      {/* ── Main Section Sequence (S0 to S12) ── */}
      <main className="relative z-10 space-y-4">
        {/* S0: Hero */}
        <S0_Hero
          isDark={isDark}
          onExploreClick={() => scrollToTarget("#section-pipeline")}
        />

        {/* S1: The Problem */}
        <S1_Problem isDark={isDark} />

        {/* S2: How It Works Pipeline */}
        <S2_Pipeline
          isDark={isDark}
          isMobile={isMobile}
          scrollProgress={globalProgress}
        />

        {/* S3: Purgatory Protocol */}
        <S3_Purgatory
          isDark={isDark}
          scrollProgress={globalProgress}
        />

        {/* S4: Forensic Trust Score */}
        <S4_TrustScore isDark={isDark} />

        {/* S5: Question Quality Pipeline */}
        <S5_QuestionQuality isDark={isDark} />

        {/* S6: Triangulation Matrix */}
        <S6_Triangulation
          isDark={isDark}
          onHoverOutcome={setHoveredOutcome}
        />

        {/* S7: Dynamic Skill Tree */}
        <S7_SkillTree
          isDark={isDark}
          hoveredSkillNode={hoveredSkillNode}
        />

        {/* S8: Recruiter Decision Hub */}
        <S8_RecruiterHub isDark={isDark} />

        {/* S9: Measured Results */}
        <S9_Numbers isDark={isDark} />

        {/* S10: Core Principles */}
        <S10_Principles isDark={isDark} />

        {/* S11: Architects & Systems */}
        <S11_Team isDark={isDark} />

        {/* S12: Final Call To Action */}
        <S12_FinalCta isDark={isDark} />
      </main>

      {/* ── Desktop Custom Cyan Cursor Follower ── */}
      {!isMobile && !reducedMotion && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
          }}
        >
          {/* Outer Ring */}
          <div
            className={`rounded-full border border-cyan-400/60 transition-all duration-200 ${
              isHoveringInteractive
                ? "w-10 h-10 -ml-1 -mt-1 bg-cyan-400/10 scale-125"
                : "w-7 h-7"
            }`}
          />
          {/* Inner Dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </div>
      )}
    </div>
  );
}
