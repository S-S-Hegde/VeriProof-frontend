import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { useTheme } from "../../context/ThemeContext";

// Styling & Keyframes
import "./eterna.css";

// Page Sections
import EternaHero from "./sections/EternaHero";
import EternaOffer from "./sections/EternaOffer";
import EternaStoryBanner from "./sections/EternaStoryBanner";
import EternaVision from "./sections/EternaVision";
import EternaValues from "./sections/EternaValues";
import EternaCulture from "./sections/EternaCulture";
import EternaFit from "./sections/EternaFit";
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

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.8,
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
      lenisRef.current.scrollTo(el, { offset: -40, duration: 1.4 });
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 font-sans ${
      isDark ? "bg-[#08080E] text-white" : "bg-[#f5f6fa] text-slate-900"
    }`}>
      {/* ── Vivid EternaCloud-Accurate Ambient Blobs ── */}
      <div className="eterna-blob-purple" />
      <div className="eterna-blob-amber" />
      <div className="eterna-blob-purple-bottom" />
      <div className="eterna-blob-blue-right" />

      {/* ── Page Section Sequence ── */}
      <main className="relative z-10">
        {/* Hero Section */}
        <EternaHero onScrollNext={scrollToOffer} />

        {/* Offer: One Adaptive Platform with 3 curved vector glass cards */}
        <EternaOffer />

        {/* Story Banner Statement & CTA */}
        <EternaStoryBanner onOpenStory={() => setIsStoryOpen(true)} />

        {/* One Vision with Vertical Filament Art */}
        <EternaVision />

        {/* Core Values: We are all One (T • R • U • S) */}
        <EternaValues />

        {/* Culture & Expansion Pillars */}
        <EternaCulture />

        {/* Sound Like You? Fit & Checklist */}
        <EternaFit onOpenJoinModal={() => setIsJoinTeamOpen(true)} />

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
