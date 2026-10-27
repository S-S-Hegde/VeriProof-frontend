import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useTheme } from "../../context/ThemeContext";

// Styling & Design Tokens
import "./eterna.css";

// Dev-Only Scroll Jump Monitor
import { useScrollMonitor } from "./hooks/useScrollMonitor";

// Section Sequence (Section 7 Order)
import GlobeHero from "./sections/GlobeHero";
import OneEvidencePipeline from "./sections/OneEvidencePipeline";
import StatementPlant from "./sections/StatementPlant";
import DomeTransition from "./sections/DomeTransition";
import ProofPrinciples from "./sections/ProofPrinciples";
import EternaStats from "./sections/EternaStats";
import JobSeekerSection from "./sections/JobSeekerSection";

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const { isDarkMode } = useTheme();

  // Activate dev-only scroll jump monitor
  useScrollMonitor();

  // ScrollTrigger layout stability & refresh handling
  useEffect(() => {
    // Prevent layout shift after fonts load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    const onLoad = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="eterna-page min-h-screen relative overflow-x-clip bg-[#0c0a14] text-white">
      {/* ── Faint Film Grain Overlay (Opacity ~0.045) ── */}
      <div className="eterna-film-grain" />

      {/* ── Main Section Sequence (Section 7) ── */}
      <main className="relative z-10 w-full overflow-x-clip">
        {/* 1. Hero: Pinned Globe with Dynamic Rotating Arcs & 4 Scrubbed Text Sets */}
        <GlobeHero />

        {/* 2. What We Do: One Evidence Pipeline (3 Equal Cards with Interactive Line Art) */}
        <OneEvidencePipeline />

        {/* 3. Statement with Scrubbed Word Fill & Botanical Plant (No button) */}
        <StatementPlant />

        {/* 4. Dome Gradient Transition into Light Section */}
        <DomeTransition />

        {/* 5. Our Principles: Everything Starts with PROOF (Light Section, 5 Expandable Tiles) */}
        <ProofPrinciples />

        {/* 6. Measured Results: Calibrated Testing Efficiency & Simulated Trials Footnote */}
        <EternaStats />

        {/* 7. For Job Seekers: Accordions & Large Candidate Verification Card */}
        <JobSeekerSection />
      </main>
    </div>
  );
}
