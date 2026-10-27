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
      className="relative w-full h-[100vh] min-h-[580px] flex items-center justify-center overflow-x-clip bg-[#0c0a14]"
      style={{ overflowAnchor: "none" }}
    >
      {/* ── Layer a: Surrounding Ambient Gradient Blobs (Masked so interior stays dark) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          maskImage:
            "radial-gradient(circle at 50% 50%, transparent 25%, rgba(0,0,0,0.4) 42%, black 70%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, transparent 25%, rgba(0,0,0,0.4) 42%, black 70%)",
        }}
      >
        <div className="eterna-blob-1-violet-top" />
        <div className="eterna-blob-2-amber-right" />
        <div className="eterna-blob-3-blue-left" />
        <div className="eterna-blob-4-violet-right" />
        <div className="eterna-blob-5-indigo-center" />
      </div>

      {/* ── Fixed Globe Container (Pinned in center) ── */}
      <div
        ref={globeWrapperRef}
        className="relative z-10 flex items-center justify-center pointer-events-none"
        style={{ willChange: "transform, opacity" }}
      >
        <div ref={globeCircleRef} className="eterna-globe-container relative flex items-center justify-center">
          {/* Layer 1: Dark interior shield (Guarantees center is completely dark obsidian, zero light bleed) */}
          <div className="eterna-globe-interior" />

          {/* Layer 2: Outer perimeter aura (Soft subtle glow strictly outside the ring) */}
          <div className="eterna-globe-outer-aura" />

          {/* Layer 3: Base perimeter track ring (1.5px subtle gradient ring) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 500 500"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="baseTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="35%" stopColor="#818cf8" stopOpacity="0.45" />
                <stop offset="70%" stopColor="#c084fc" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <circle
              cx="250"
              cy="250"
              r="248"
              fill="none"
              stroke="url(#baseTrackGrad)"
              strokeWidth="1.5"
            />
          </svg>

          {/* Layer 4: Primary Rotating Perimeter Glow Arc (Clockwise ~16s, strictly on perimeter, no radar sweep) */}
          <div className="absolute inset-0 pointer-events-none z-20 eterna-ring-rotator-cw">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 500 500"
              aria-hidden="true"
            >
              <defs>
                <filter id="arcGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur1" />
                  <feGaussianBlur stdDeviation="12" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="arcGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
                  <stop offset="30%" stopColor="#a78bfa" stopOpacity="0.5" />
                  <stop offset="75%" stopColor="#c084fc" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Outer soft glow stroke along the perimeter */}
              <circle
                cx="250"
                cy="250"
                r="248"
                fill="none"
                stroke="rgba(192, 132, 252, 0.75)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="400 1158"
                filter="url(#arcGlowFilter)"
              />
              {/* Crisp luminous core arc */}
              <circle
                cx="250"
                cy="250"
                r="248"
                fill="none"
                stroke="url(#arcGlowGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="400 1158"
              />
            </svg>
          </div>

          {/* Layer 5: Secondary Counter-Rotating Accent Glow Arc (Counter-Clockwise ~24s) */}
          <div className="absolute inset-0 pointer-events-none z-20 eterna-ring-rotator-ccw">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 500 500"
              aria-hidden="true"
            >
              <defs>
                <filter id="cyanGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur1" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="cyanArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0" />
                  <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.95" />
                </linearGradient>
              </defs>
              <circle
                cx="250"
                cy="250"
                r="248"
                fill="none"
                stroke="url(#cyanArcGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="240 1318"
                filter="url(#cyanGlowFilter)"
              />
            </svg>
          </div>

          {/* Layer 6: Text Stage inside the Circle (Responsive fitting within circle bounds) */}
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
                          style={{ color: "rgba(255, 255, 255, 0.18)" }}
                        >
                          {w}
                        </span>
                      ))}

                    {set.keyPhrase && (
                      <span className="keyphrase-scrub text-gradient-blue-violet font-semibold opacity-30 transition-opacity">
                        {set.keyPhrase}
                      </span>
                    )}
                  </h1>

                  {/* Subline with smooth fade-up */}
                  <p
                    className="sub-scrub text-[11px] sm:text-xs md:text-sm text-white/70 font-light leading-relaxed max-w-[240px] sm:max-w-md mx-auto opacity-0 translate-y-3 transition-all"
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
