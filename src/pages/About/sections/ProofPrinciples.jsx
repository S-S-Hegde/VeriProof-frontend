import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TILES = [
  {
    letter: "P",
    title: "Provenance powers our checks",
    desc: "Every repository is traced to its commits: who wrote them, how much, and when.",
  },
  {
    letter: "R",
    title: "Rigor shapes our exams",
    desc: "Two-phase adaptive testing, with round two built from the candidate's own code.",
  },
  {
    letter: "O",
    title: "Originality guards the record",
    desc: "Bulk imports, forks and starter templates are flagged, not rewarded.",
  },
  {
    letter: "O",
    title: "Openness explains every score",
    desc: "The trust score shows the signals behind it, so recruiters can question it.",
  },
  {
    letter: "F",
    title: "Fairness favours builders",
    desc: "Strong work surfaces whatever the resume looks like, and questions are screened for giveaway patterns.",
  },
];

export default function ProofPrinciples() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hasPlayedHint, setHasPlayedHint] = useState(false);
  const sectionRef = useRef(null);
  const isReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // On first view: run one quick left-to-right expand wave as a visual hint
  useEffect(() => {
    if (isReduced || hasPlayedHint) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasPlayedHint) {
          setHasPlayedHint(true);
          // Wave through tiles 0 -> 1 -> 2 -> 3 -> 4 -> 0
          let step = 0;
          const interval = setInterval(() => {
            step++;
            if (step < TILES.length) {
              setActiveIdx(step);
            } else {
              clearInterval(interval);
              setActiveIdx(0);
            }
          }, 320);
        }
      },
      { threshold: 0.35 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasPlayedHint, isReduced]);

  // Keyboard navigation (Arrow Left / Right / Up / Down)
  const handleKeyDown = (e, index) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((index + 1) % TILES.length);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((index - 1 + TILES.length) % TILES.length);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="eterna-light-section relative w-full pt-16 pb-24 px-4 sm:px-6 lg:px-8 text-[#1b1050]"
      style={{ overflowAnchor: "none" }}
    >
      <div className="max-w-6xl mx-auto space-y-14">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-violet-100 text-violet-900 border border-violet-200 shadow-sm">
              Our principles
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#1b1050]">
            Everything starts with{" "}
            <span className="text-gradient-blue-violet font-semibold">PROOF</span>
          </h2>
        </div>

        {/* ── Desktop Row of 5 Tiles (Hidden on Mobile) ── */}
        <div className="hidden md:flex gap-4 items-stretch h-[180px] w-full" role="region" aria-label="PROOF principles">
          {TILES.map((tile, i) => {
            const isActive = activeIdx === i;

            return (
              <button
                key={i}
                type="button"
                role="button"
                aria-expanded={isActive}
                aria-label={`${tile.letter} - ${tile.title}`}
                onMouseEnter={() => setActiveIdx(i)}
                onFocus={() => setActiveIdx(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="proof-tile-card relative flex flex-col justify-center items-center text-left p-6 sm:p-8 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 select-none"
                style={{
                  flexGrow: isActive ? 4.2 : 1,
                  flexBasis: 0,
                  minWidth: "106px",
                  transition: isReduced ? "none" : "flex-grow 450ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
              >
                {/* Large Gradient Letter (Visible when inactive, fades out when expanded) */}
                <span
                  className={`text-5xl sm:text-6xl font-black text-gradient-blue-violet transition-all duration-300 ${
                    isActive ? "opacity-0 scale-75 pointer-events-none absolute" : "opacity-90 scale-100"
                  }`}
                  aria-hidden="true"
                >
                  {tile.letter}
                </span>

                {/* Expanded Title + Description (Visible when active) */}
                <div
                  className={`w-full flex flex-col justify-center space-y-2.5 transition-all duration-300 ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none absolute"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-100 text-violet-700 font-bold text-sm shrink-0">
                      {tile.letter}
                    </span>
                    <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#1b1050] text-gradient-blue-violet">
                      {tile.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-[#1b1050]/75 font-light leading-relaxed pl-11">
                    {tile.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Mobile Vertical Accordion (< 768px) ── */}
        <div className="flex md:hidden flex-col gap-3 w-full">
          {TILES.map((tile, i) => {
            const isActive = activeIdx === i;

            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isActive}
                  onClick={() => setActiveIdx(isActive ? -1 : i)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold text-base shrink-0">
                      {tile.letter}
                    </span>
                    <span className="text-base font-medium text-[#1b1050]">
                      {tile.title}
                    </span>
                  </div>
                  <span className="text-violet-600 font-bold text-lg">
                    {isActive ? "−" : "+"}
                  </span>
                </button>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-sm text-[#1b1050]/75 font-light leading-relaxed pl-16">
                        <p>{tile.desc}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
