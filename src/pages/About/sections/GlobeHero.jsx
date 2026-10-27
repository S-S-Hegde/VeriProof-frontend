import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TEXT_SETS = [
  {
    id: 1,
    headlineLead: "Resumes claim. ",
    keyPhrase: "Code proves.",
    sub: "VeriProof checks what candidates say against what they have built and how they solve problems live.",
  },
  {
    id: 2,
    headlineLead: "",
    keyPhrase: "Every commit has an author.",
    sub: "We match commits to the candidate, require meaningful authorship, and flag bulk imports, forks and starter templates.",
  },
  {
    id: 3,
    headlineLead: "Then we test ",
    keyPhrase: "what they just proved.",
    sub: "A two-phase adaptive exam, with a second round built from the candidate's own code.",
  },
  {
    id: 4,
    headlineLead: "Every score ",
    keyPhrase: "shows its reasons.",
    sub: "One trust score from 0 to 100, with the signals behind it open to the recruiter.",
  },
];

export default function GlobeHero() {
  const containerRef = useRef(null);
  const globeWrapperRef = useRef(null);
  const globeCircleRef = useRef(null);
  const textStageRef = useRef(null);
  const setRefs = useRef([]);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const container = containerRef.current;
    const globeWrapper = globeWrapperRef.current;
    const textStage = textStageRef.current;
    if (!container || !globeWrapper || !textStage) return;

    // Dev-only assertion: Assert that all 4 corners of every text block lie within 0.9 * R
    if (process.env.NODE_ENV !== "production") {
      const checkTextFit = () => {
        if (!globeCircleRef.current) return;
        const circleRect = globeCircleRef.current.getBoundingClientRect();
        const radius = circleRect.width / 2;
        const maxRadius = 0.9 * radius;

        setRefs.current.forEach((el, index) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const halfW = rect.width / 2;
          const halfH = rect.height / 2;
          const cornerDist = Math.hypot(halfW, halfH);

          if (cornerDist > maxRadius) {
            console.warn(
              `[TEXT_FIT_ASSERTION] Set ${index + 1} corner distance (${cornerDist.toFixed(
                1
              )}px) exceeds 0.9 * R (${maxRadius.toFixed(1)}px)`
            );
          } else {
            console.log(
              `[TEXT_FIT_ASSERTION_PASSED] Set ${index + 1} (${cornerDist.toFixed(
                1
              )}px <= ${maxRadius.toFixed(1)}px)`
            );
          }
        });
      };
      // Run assertion on mount & resize
      const timer = setTimeout(checkTextFit, 300);
      window.addEventListener("resize", checkTextFit);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", checkTextFit);
      };
    }
  }, []);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const container = containerRef.current;
    const globeWrapper = globeWrapperRef.current;
    if (!container || !globeWrapper) return;

    const getScrollDistance = () => {
      const isMob = window.innerWidth < 768;
      return Math.round(window.innerHeight * (isMob ? 2.5 : 3.4));
    };

    const ctx = gsap.context(() => {
      // Main Scrubbed Timeline with dynamic pixel scroll distance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.35,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });

      // Initially show Set 1, hide others
      setRefs.current.forEach((el, i) => {
        if (!el) return;
        if (i === 0) {
          gsap.set(el, { opacity: 1, y: 0, filter: "blur(0px)", visibility: "visible" });
          const words = el.querySelectorAll(".word-scrub");
          const keyPhrase = el.querySelector(".keyphrase-scrub");
          const sub = el.querySelector(".sub-scrub");
          gsap.set(words, { color: "#ffffff" });
          if (keyPhrase) gsap.set(keyPhrase, { opacity: 1, filter: "drop-shadow(0 0 16px rgba(167,139,250,0.5))" });
          if (sub) gsap.set(sub, { opacity: 0.85, y: 0 });
        } else {
          gsap.set(el, { opacity: 0, y: 16, filter: "blur(6px)", visibility: "hidden" });
        }
      });

      // Unroll the 4 text sets across the timeline with smooth pacing
      setRefs.current.forEach((el, idx) => {
        if (!el) return;
        const words = el.querySelectorAll(".word-scrub");
        const keyPhrase = el.querySelector(".keyphrase-scrub");
        const sub = el.querySelector(".sub-scrub");

        if (idx === 0) {
          // Set 1 words fill
          tl.to(
            words,
            {
              color: "#ffffff",
              stagger: 0.04,
              duration: 0.35,
              ease: "power1.inOut",
            },
            0.05
          );

          if (keyPhrase) {
            tl.to(
              keyPhrase,
              {
                opacity: 1,
                filter: "drop-shadow(0 0 16px rgba(167,139,250,0.5))",
                duration: 0.3,
              },
              0.15
            );
          }

          if (sub) {
            tl.to(sub, { opacity: 0.85, y: 0, duration: 0.3 }, 0.2);
          }

          // Set 1 exit
          tl.to(
            el,
            {
              opacity: 0,
              y: -16,
              filter: "blur(6px)",
              duration: 0.22,
              onComplete: () => {
                gsap.set(el, { visibility: "hidden" });
              },
              onReverseComplete: () => {
                gsap.set(el, { visibility: "visible" });
              },
            },
            0.62
          );
        } else {
          // Sets 2, 3, 4
          const enterTime = idx * 0.88;
          const wordFillTime = enterTime + 0.12;
          const exitTime = enterTime + 0.68;

          // Enter set
          tl.set(el, { visibility: "visible" }, enterTime);
          tl.fromTo(
            el,
            { opacity: 0, y: 16, filter: "blur(6px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.22 },
            enterTime
          );

          // Words fill
          tl.to(
            words,
            {
              color: "#ffffff",
              stagger: 0.035,
              duration: 0.28,
              ease: "power1.inOut",
            },
            wordFillTime
          );

          if (keyPhrase) {
            tl.to(
              keyPhrase,
              {
                opacity: 1,
                filter: "drop-shadow(0 0 16px rgba(167,139,250,0.5))",
                duration: 0.25,
              },
              wordFillTime + 0.08
            );
          }

          if (sub) {
            tl.to(sub, { opacity: 0.85, y: 0, duration: 0.25 }, wordFillTime + 0.12);
          }

          // If not the last set, exit
          if (idx < setRefs.current.length - 1) {
            tl.to(
              el,
              {
                opacity: 0,
                y: -16,
                filter: "blur(6px)",
                duration: 0.2,
                onComplete: () => {
                  gsap.set(el, { visibility: "hidden" });
                },
                onReverseComplete: () => {
                  gsap.set(el, { visibility: "visible" });
                },
              },
              exitTime
            );
          }
        }
      });

      // Smooth unpinning cushion: gentle easing at the end of Set 4 before releasing into Section 2
      const endTimeline = (setRefs.current.length - 1) * 0.88 + 0.55;
      tl.to(
        globeWrapper,
        {
          opacity: 0.85,
          duration: 0.3,
          ease: "power1.out",
        },
        endTimeline
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[100vh] min-h-[580px] flex items-center justify-center overflow-x-clip bg-[#080711]"
      style={{ overflowAnchor: "none" }}
    >
      {/* ── Layer 1: Left Deep Royal Blue Atmospheric Haze (Image 2 Reference Match) ── */}
      <div className="eterna-haze-blue-left" aria-hidden="true" />

      {/* ── Layer 2: Enormous Sweeping Violet-to-Amber Corona on the Right (Image 2 Reference Match) ── */}
      <div className="eterna-corona-right" aria-hidden="true" />

      {/* ── Layer 3: Left Eclipse Crescent Volumetric Atmosphere Bloom (Image 2 Reference Match) ── */}
      <div className="eterna-eclipse-aura-left" aria-hidden="true" />

      {/* ── Fixed Globe Container (Pinned in center) ── */}
      <div
        ref={globeWrapperRef}
        className="relative z-10 flex items-center justify-center pointer-events-none"
        style={{ willChange: "transform, opacity" }}
      >
        <div ref={globeCircleRef} className="eterna-globe-container relative flex items-center justify-center">
          {/* Velvety Obsidian Core Interior */}
          <div className="eterna-globe-interior" />

          {/* SVG Lighting & Luminous Eclipse Crescent (Image 2 Reference Match) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            viewBox="0 0 500 500"
            aria-hidden="true"
          >
            <defs>
              {/* Diffuse Wide Glow Filter for Eclipse Crescent */}
              <filter id="crescentWideGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="16" result="blur1" />
                <feGaussianBlur stdDeviation="7" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Core Sharp Glow Filter */}
              <filter id="crescentCoreGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Left Crescent Color Gradient: Fades seamlessly to 0% at both ends with pure white peak at 10:30 */}
              <linearGradient id="crescentGrad" x1="75%" y1="0%" x2="15%" y2="95%">
                <stop offset="0%" stopColor="#c026d3" stopOpacity="0" />
                <stop offset="12%" stopColor="#c026d3" stopOpacity="0.4" />
                <stop offset="28%" stopColor="#e879f9" stopOpacity="0.88" />
                <stop offset="46%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="62%" stopColor="#e879f9" stopOpacity="0.88" />
                <stop offset="80%" stopColor="#c026d3" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
              </linearGradient>

              {/* White-Hot Spine Gradient: Fades softly to 0% at ends */}
              <linearGradient id="spineGrad" x1="70%" y1="0%" x2="10%" y2="80%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="25%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="75%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              {/* Subtle Full Rim Silhouette Gradient */}
              <linearGradient id="silhouetteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(217, 70, 239, 0.35)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.10)" />
                <stop offset="100%" stopColor="rgba(234, 179, 8, 0.20)" />
              </linearGradient>
            </defs>

            {/* 1. Subtle 1px base circle outline defining the orb geometry */}
            <circle
              cx="250"
              cy="250"
              r="248"
              fill="none"
              stroke="url(#silhouetteGrad)"
              strokeWidth="1"
            />

            {/* 2. Layered Volumetric Eclipse Crescent on the Left (fades seamlessly without blunt caps) */}
            {/* Outer Volumetric Bloom Stroke (Width: 32px) */}
            <path
              d="M 293 6 A 248 248 0 0 0 60 409"
              fill="none"
              stroke="url(#crescentGrad)"
              strokeWidth="32"
              strokeLinecap="butt"
              filter="url(#crescentWideGlow)"
              opacity="0.82"
            />

            {/* Mid Radiant Glow Stroke (Width: 14px) */}
            <path
              d="M 293 6 A 248 248 0 0 0 60 409"
              fill="none"
              stroke="url(#crescentGrad)"
              strokeWidth="14"
              strokeLinecap="butt"
              filter="url(#crescentCoreGlow)"
              opacity="0.95"
            />

            {/* Inner Core Crisp Neon Limb (Width: 4.5px) */}
            <path
              d="M 293 6 A 248 248 0 0 0 60 409"
              fill="none"
              stroke="url(#crescentGrad)"
              strokeWidth="4.5"
              strokeLinecap="butt"
              opacity="1"
            />

            {/* Luminous White-Hot Spine at peak focal point (~10:30 o'clock) */}
            <path
              d="M 165 17 A 248 248 0 0 0 25 145"
              fill="none"
              stroke="url(#spineGrad)"
              strokeWidth="2.4"
              strokeLinecap="butt"
              filter="url(#crescentCoreGlow)"
              opacity="0.96"
            />
          </svg>

          {/* Layer 4: Text Stage inside the Circle (Responsive fitting within circle bounds) */}
          <div
            ref={textStageRef}
            className="relative z-30 w-[82%] max-w-[270px] sm:w-[78%] sm:max-w-[480px] px-2 sm:px-4 text-center pointer-events-auto select-none"
            style={{
              maxHeight: "80%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Tagline above headline */}
            <div className="mb-2 sm:mb-4">
              <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-gradient-eterna">
                Provenance, Rigor & Fairness
              </span>
            </div>

            {/* Stage for the 4 Text Sets */}
            <div className="relative w-full min-h-[140px] sm:min-h-[200px] flex items-center justify-center">
              {TEXT_SETS.map((set, idx) => (
                <div
                  key={set.id}
                  ref={(el) => (setRefs.current[idx] = el)}
                  className={`absolute inset-0 flex flex-col items-center justify-center space-y-2 sm:space-y-3.5 ${
                    idx === 0 ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ willChange: "transform, opacity, filter" }}
                >
                  {/* Accessible Screen Reader Text */}
                  <span className="sr-only">
                    {set.headlineLead} {set.keyPhrase}. {set.sub}
                  </span>

                  {/* Headline with word-by-word scrub fill */}
                  <h1
                    className="text-lg sm:text-3xl md:text-[2.4rem] font-medium tracking-tight leading-[1.15] text-center"
                    aria-hidden="true"
                  >
                    {set.headlineLead &&
                      set.headlineLead.split(" ").map((w, wi) => (
                        <span
                          key={wi}
                          className="word-scrub inline-block mr-1 sm:mr-1.5 transition-colors"
                          style={{ color: idx === 0 ? "#ffffff" : "rgba(255, 255, 255, 0.45)" }}
                        >
                          {w}
                        </span>
                      ))}

                    {set.keyPhrase && (
                      <span
                        className={`keyphrase-scrub text-gradient-blue-violet font-semibold transition-opacity ${
                          idx === 0 ? "opacity-100" : "opacity-60"
                        }`}
                      >
                        {set.keyPhrase}
                      </span>
                    )}
                  </h1>

                  {/* Subline with smooth fade-up */}
                  <p
                    className={`sub-scrub text-[11px] sm:text-xs md:text-sm text-white/80 font-light leading-relaxed max-w-[240px] sm:max-w-md mx-auto transition-all ${
                      idx === 0 ? "opacity-85 translate-y-0" : "opacity-0 translate-y-3"
                    }`}
                    aria-hidden="true"
                  >
                    {set.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
