import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { useTheme } from "../../context/ThemeContext";

// Styling & Keyframes (includes official MazzardH fonts)
import "./eterna.css";

// Page Sections
import EternaHero from "./sections/EternaHero";
import EternaOffer from "./sections/EternaOffer";
import EternaStoryBanner from "./sections/EternaStoryBanner";
import EternaVision from "./sections/EternaVision";
import EternaValues from "./sections/EternaValues";
import EternaCulture from "./sections/EternaCulture";
import EternaFit from "./sections/EternaFit";
import EternaStats from "./sections/EternaStats";
import EternaFooterSection from "./sections/EternaFooterSection";

// Interactive Modals
import WisdomModal from "./modals/WisdomModal";
import WhyNameModal from "./modals/WhyNameModal";
import CauseEffectModal from "./modals/CauseEffectModal";
import StoryModal from "./modals/StoryModal";
import JoinTeamModal from "./modals/JoinTeamModal";

export default function AboutPage() {
  const { isDarkMode } = useTheme();
  const isDark = isDarkMode !== undefined ? isDarkMode : true;

  // Modal active states
  const [isWisdomOpen, setIsWisdomOpen] = useState(false);
  const [isWhyNameOpen, setIsWhyNameOpen] = useState(false);
  const [isCauseEffectOpen, setIsCauseEffectOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isJoinTeamOpen, setIsJoinTeamOpen] = useState(false);

  const lenisRef = useRef(null);

  // Initialize Lenis with exact EternaCloud configuration (disabled if prefers-reduced-motion)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.7,
      gestureOrientation: "vertical",
      normalizeWheel: false,
      smoothTouch: false,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const reqId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(reqId);
      lenis.destroy();
    };
  }, []);

  const scrollToOffer = () => {
    const el = document.getElementById("section-offer");
    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -40, duration: 1.2 });
    }
  };

  return (
    <div className="eterna-page min-h-screen relative overflow-x-clip bg-[#13101c] text-white">
      {/* ── Vivid EternaCloud-Accurate Ambient Blobs ── */}
      <div className="eterna-blob-purple" />
      <div className="eterna-blob-amber" />
      <div className="eterna-blob-purple-bottom" />
      <div className="eterna-blob-blue-right" />

      {/* ── Page Section Sequence ── */}
      <main className="relative z-10">
        {/* Hero Section */}
        <EternaHero onScrollNext={scrollToOffer} />

        {/* Offer: One Adaptive Service / Platform with 3 curved vector glass cards */}
        <EternaOffer />

        {/* Story Banner Statement & CTA */}
        <EternaStoryBanner onOpenStory={() => setIsStoryOpen(true)} />

        {/* One Vision with Vertical Filament Art */}
        <EternaVision />

        {/* Core Values: Four Principles We Live By */}
        <EternaValues />

        {/* Culture & Expansion Pillars */}
        <EternaCulture />

        {/* For Both Sides: Candidates & Recruiters */}
        <EternaFit onOpenJoinModal={() => setIsJoinTeamOpen(true)} />

        {/* Measured Results / Stats */}
        <EternaStats />

        {/* Bottom Botanical Footer & Modal Triggers */}
        <EternaFooterSection
          onOpenWisdom={() => setIsWisdomOpen(true)}
          onOpenWhyName={() => setIsWhyNameOpen(true)}
          onOpenCauseEffect={() => setIsCauseEffectOpen(true)}
          onOpenJoinTeam={() => setIsJoinTeamOpen(true)}
        />
      </main>

      {/* ── Interactive Popups & Slide-Over Modals ── */}
      <WisdomModal
        isOpen={isWisdomOpen}
        onClose={() => setIsWisdomOpen(false)}
      />

      <WhyNameModal
        isOpen={isWhyNameOpen}
        onClose={() => setIsWhyNameOpen(false)}
      />

      <CauseEffectModal
        isOpen={isCauseEffectOpen}
        onClose={() => setIsCauseEffectOpen(false)}
      />

      <StoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
      />

      <JoinTeamModal
        isOpen={isJoinTeamOpen}
        onClose={() => setIsJoinTeamOpen(false)}
      />
    </div>
  );
}
