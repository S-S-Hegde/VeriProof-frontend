import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StatementPlant() {
  const sectionRef = useRef(null);
  const stemPathRef = useRef(null);
  const budRef = useRef(null);
  const leavesRef = useRef([]);
  const wordsRef = useRef([]);
  const subLineRef = useRef(null);

  const statementText =
    "We set out to build a hiring process that runs on evidence. One where every claim is checked against real code, and every score can be explained.";

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      if (stemPathRef.current) gsap.set(stemPathRef.current, { strokeDashoffset: 0 });
      if (budRef.current) gsap.set(budRef.current, { scale: 1, opacity: 1 });
      wordsRef.current.forEach((w) => w && gsap.set(w, { color: "#ffffff" }));
      if (subLineRef.current) gsap.set(subLineRef.current, { opacity: 0.85, y: 0 });
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Plant Draw & Bloom Timeline (scrubbed)
      const plantTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 25%",
          scrub: 0.3,
        },
      });

      if (stemPathRef.current) {
        const length = stemPathRef.current.getTotalLength ? stemPathRef.current.getTotalLength() : 200;
        gsap.set(stemPathRef.current, { strokeDasharray: length, strokeDashoffset: length });
        plantTl.to(stemPathRef.current, { strokeDashoffset: 0, ease: "none", duration: 1 });
      }

      leavesRef.current.forEach((leaf) => {
        if (!leaf) return;
        plantTl.fromTo(
          leaf,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 0.9, duration: 0.4, ease: "power2.out" },
          "-=0.4"
        );
      });

      if (budRef.current) {
        plantTl.fromTo(
          budRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" },
          "-=0.2"
        );
      }

      // 2. Statement Words Scrubbed Fill Timeline
      const wordsTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 65%",
          end: "bottom 80%",
          scrub: 0.35,
        },
      });

      if (wordsRef.current.length > 0) {
        wordsTl.to(wordsRef.current, {
          color: "#ffffff",
          stagger: 0.05,
          ease: "power1.inOut",
        });
      }

      if (subLineRef.current) {
        wordsTl.fromTo(
          subLineRef.current,
          { opacity: 0, y: 15 },
          { opacity: 0.85, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.3"
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center z-10"
    >
      {/* ── Original Line-Art Plant (Stem draws on scroll, leaves & blooming bud) ── */}
      <div className="mb-12 flex justify-center">
        <svg
          viewBox="0 0 100 180"
          fill="none"
          className="w-16 h-32 sm:w-20 sm:h-40 overflow-visible"
          aria-label="Botanical blooming plant art"
        >
          <defs>
            <linearGradient id="stemGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="leafGradLeft" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="leafGradRight" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <radialGradient id="budGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <filter id="budBloom" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" />
            </filter>
          </defs>

          {/* Main Stem Line */}
          <path
            ref={stemPathRef}
            d="M 50 170 Q 46 120 50 80 T 50 25"
            stroke="url(#stemGradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Left Leaf Pair */}
          <path
            ref={(el) => (leavesRef.current[0] = el)}
            d="M 48 115 C 30 105 20 120 32 130 C 42 132 46 124 48 115 Z"
            fill="url(#leafGradLeft)"
            opacity="0.85"
            style={{ transformOrigin: "48px 115px" }}
          />
          <circle cx="32" cy="128" r="2" fill="#38bdf8" />

          {/* Right Leaf Pair */}
          <path
            ref={(el) => (leavesRef.current[1] = el)}
            d="M 50 90 C 68 80 76 96 66 106 C 56 108 52 100 50 90 Z"
            fill="url(#leafGradRight)"
            opacity="0.85"
            style={{ transformOrigin: "50px 90px" }}
          />
          <circle cx="66" cy="104" r="2" fill="#f59e0b" />

          {/* Upper Leaf Branch */}
          <path
            ref={(el) => (leavesRef.current[2] = el)}
            d="M 50 65 C 36 55 32 70 42 75 C 48 76 50 70 50 65 Z"
            fill="url(#leafGradLeft)"
            opacity="0.85"
            style={{ transformOrigin: "50px 65px" }}
          />

          {/* Blooming Bud / Flower Head at Top */}
          <g ref={budRef} style={{ transformOrigin: "50px 22px" }}>
            {/* Glowing Petals */}
            <path
              d="M 50 22 C 38 10 32 20 42 28 C 47 30 50 26 50 22 Z"
              fill="url(#leafGradLeft)"
              opacity="0.9"
            />
            <path
              d="M 50 22 C 62 10 68 20 58 28 C 53 30 50 26 50 22 Z"
              fill="url(#leafGradRight)"
              opacity="0.9"
            />
            <circle cx="50" cy="22" r="7" fill="url(#budGlow)" filter="url(#budBloom)" />
            <circle cx="50" cy="22" r="4.5" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* ── Statement Text with Scrubbed Word-by-Word Fill (NO button) ── */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-4xl md:text-[2.6rem] font-normal tracking-tight leading-[1.3] text-center">
          {statementText.split(" ").map((word, i) => (
            <span
              key={i}
              ref={(el) => (wordsRef.current[i] = el)}
              className="inline-block mr-2 transition-colors select-none"
              style={{ color: "rgba(255, 255, 255, 0.20)" }}
            >
              {word}
            </span>
          ))}
        </h2>

        {/* Sub line in soft violet */}
        <p
          ref={subLineRef}
          className="text-base sm:text-lg text-violet-300/85 font-light max-w-xl mx-auto opacity-0"
        >
          A fair look for every builder, whatever the resume looks like.
        </p>
      </div>
    </section>
  );
}
