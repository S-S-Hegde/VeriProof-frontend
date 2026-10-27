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
    const isMobile = window.innerWidth < 768;

    // Pin length: desktop 40svh + 4 * 100svh + 10svh = 450svh; mobile 300svh
    const pinDistance = isMobile ? "300svh" : "450svh";

    const ctx = gsap.context(() => {
      // Main Scrubbed Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: `+=${pinDistance}`,
          pin: true,
          scrub: 0.25,
          invalidateOnRefresh: true,
          anticipatePin: 1,
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

      // Unroll the 4 text sets across the timeline
      setRefs.current.forEach((el, idx) => {
        if (!el) return;
        const words = el.querySelectorAll(".word-scrub");
        const keyPhrase = el.querySelector(".keyphrase-scrub");
        const sub = el.querySelector(".sub-scrub");

        // Words fill progressively from faint to solid
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
              duration: 0.25,
              onComplete: () => {
                gsap.set(el, { visibility: "hidden" });
              },
              onReverseComplete: () => {
                gsap.set(el, { visibility: "visible" });
              },
            },
            0.6
          );
        } else {
          // Subsequent sets (2, 3, 4)
          const enterTime = idx * 0.9;
          const wordFillTime = enterTime + 0.15;
          const exitTime = enterTime + 0.75;

          // Enter set
          tl.set(el, { visibility: "visible" }, enterTime);
          tl.fromTo(
            el,
            { opacity: 0, y: 16, filter: "blur(6px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.25 },
            enterTime
          );

          // Words fill
          tl.to(
            words,
            {
              color: "#ffffff",
              stagger: 0.035,
              duration: 0.3,
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
              wordFillTime + 0.1
            );
          }

          if (sub) {
            tl.to(sub, { opacity: 0.85, y: 0, duration: 0.25 }, wordFillTime + 0.15);
          }

          // If not the last set, exit
          if (idx < setRefs.current.length - 1) {
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
              exitTime
            );
          }
        }
      });

      // After pin finishes: Globe fades slightly and scales to 1.06 as next section slides over
      const endTimeline = (setRefs.current.length - 1) * 0.9 + 0.65;
      tl.to(
        globeWrapper,
        {
          scale: 1.06,
          opacity: 0.25,
          duration: 0.45,
          ease: "power2.out",
        },
        endTimeline
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100svh] flex items-center justify-center overflow-x-clip bg-[#0c0a14]"
      style={{ overflowAnchor: "none" }}
    >
      {/* ── Layer a: Surrounding Ambient Gradient Blobs (Masked so interior stays dark) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          maskImage:
            "radial-gradient(circle at 50% 50%, transparent 22%, rgba(0,0,0,0.3) 38%, black 65%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, transparent 22%, rgba(0,0,0,0.3) 38%, black 65%)",
        }}
      >
        <div className="eterna-blob-1-violet-top" />
        <div className="eterna-blob-2-amber-right" />
        <div className="eterna-blob-3-blue-left" />
        <div className="eterna-blob-4-violet-right" />
        <div className="eterna-blob-5-indigo-center" />
      </div>

      {/* ── Fixed Globe Container (Pinned in center, does not move or scale during text changes) ── */}
      <div
        ref={globeWrapperRef}
        className="relative z-10 flex items-center justify-center pointer-events-none"
        style={{ willChange: "transform, opacity" }}
      >
        <div ref={globeCircleRef} className="eterna-globe-container relative flex items-center justify-center">
          {/* Layer b: Interior Soft Radial Darkening (No disc, no edge) */}
          <div className="eterna-globe-interior" />

          {/* Layer c: 2px Conic-Gradient Stroke Ring */}
          <div className="eterna-globe-stroke" />

          {/* Layer d: Rotating Glow Arcs (~100 deg wide, trailing fade, blur 18px & 48px) */}
          <div className="eterna-glow-arc-clockwise" />
          <div className="eterna-glow-arc-blurred" />
          <div className="eterna-glow-arc-bloom" />
          <div className="eterna-glow-arc-counter" />

          {/* Layer e: Text Stage inside the Circle (All text sized to sit within 0.9 * R) */}
          <div
            ref={textStageRef}
            className="relative z-10 w-[78%] max-w-[520px] px-4 text-center pointer-events-auto select-none"
            style={{
              maxHeight: "78%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Tagline above headline: gradient text, blue to violet to amber, no pill */}
            <div className="mb-4 sm:mb-5">
              <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-gradient-eterna">
                Provenance, Rigor & Fairness
              </span>
            </div>

            {/* Stage for the 4 Text Sets */}
            <div className="relative w-full min-h-[180px] sm:min-h-[220px] flex items-center justify-center">
              {TEXT_SETS.map((set, idx) => (
                <div
                  key={set.id}
                  ref={(el) => (setRefs.current[idx] = el)}
                  className={`absolute inset-0 flex flex-col items-center justify-center space-y-3.5 ${
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
                    className="text-2xl sm:text-4xl md:text-[2.6rem] font-medium tracking-tight leading-[1.12] text-center"
                    aria-hidden="true"
                  >
                    {set.headlineLead &&
                      set.headlineLead.split(" ").map((w, wi) => (
                        <span
                          key={wi}
                          className="word-scrub inline-block mr-1.5 transition-colors"
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
                    className="sub-scrub text-xs sm:text-sm md:text-base text-white/70 font-light leading-relaxed max-w-md mx-auto opacity-0 translate-y-3 transition-all"
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
