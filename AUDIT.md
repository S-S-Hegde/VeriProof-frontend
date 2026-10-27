# AUDIT.md — Reference Analysis: EternaCloud About Us
**Reference URL:** `https://www.eternacloud.com/about-us`  
**Audited At:** 1440px desktop & 390px mobile viewports (Reduced-motion OFF & ON)  
**Date of Audit:** October 2026

---

## 1. Section List, Purpose & Approximate Height
1. **Hero Section (`.hero_about`, `.div-block-645`)**:
   - *Purpose:* Central brand hook ("We are value creators with hyperfocus.") with large glowing ring and WebGL shader backdrop.
   - *Approx. Height:* ~369vh total scrub height (sticky pinned ~300vh for scroll progression).
2. **Offer Showcase (`.div-block-366.hero-2`, `.div-block-642.desktop`)**:
   - *Purpose:* "One Adaptive Service" — 3 glassmorphic vector constellation cards showcasing core capabilities.
   - *Approx. Height:* ~100vh.
3. **Manifesto / Story Statement (`.div-block-204`, `.img-flower`)**:
   - *Purpose:* Large editorial statement with botanical blossom Lottie animation and "Read our story" modal trigger.
   - *Approx. Height:* ~55vh.
4. **Vision (`.div-block-686`, `.div-block-685`)**:
   - *Purpose:* "One Vision" statement ("Freedom for every individual in business") with vertical filament botanical blossom.
   - *Approx. Height:* ~45vh.
5. **Meet the Founders (`.section.light-grey`, `.mob-overscroll`)**:
   - *Purpose:* Leadership cards with photos and LinkedIn links.
   - *Approx. Height:* ~168vh.
   - *Rebuild Action:* **EXPLICITLY REMOVED** per project rules.
6. **Core Values (`.div-block-670`, `.div-block-671`)**:
   - *Purpose:* "We are all One" — 4 expandable interactive letter cards (L • I • F • E).
   - *Approx. Height:* ~89vh.
7. **Culture & Expansion (`.section.last_section.darkest`)**:
   - *Purpose:* "Our people are world-class, our expansion is boundless!" — 3 accordion items with botanical flower icons, followed by empowerment quote with hanging flower motif.
   - *Approx. Height:* ~328.5vh.
8. **Culture Fit Checklist (`.container-small`, `.div-block-252`)**:
   - *Purpose:* "Experience work in a new way" — 5-point checklist with "Explore open roles" button.
   - *Approx. Height:* ~75vh.
9. **Footer & Interactive Modals (`.div-block-69`, `.div-block-244`, `.modals-wrapper`)**:
   - *Purpose:* "Nothing is impossible" statement, 3 square modal triggers (Wisdom, Why Name, Cause & Effects), illuminated botanical foliage, and footer legal links.
   - *Approx. Height:* ~100vh.

---

## 2. Tech Stack (By Inspection)
- **Scroll Engine:** **Lenis** (v1.0.23, `window.Lenis`) with custom lerp parameters.
- **Animation Framework:** **GSAP (v3.12.2)** (`window.gsap`), **ScrollTrigger** (`window.ScrollTrigger`, 4 instances), and **CustomEase**.
- **Typography Split Engine:** **SplitType** (`window.SplitType`), targeting `[text-split]`, `[words-slide-up]`, `[letters-fade-in]`, `[scrub-each-word]`.
- **Canvas / WebGL:** **UnicornStudio** (`window.UnicornStudio`, v1.4.25) running WebGL project ID `9FtTEJXmORVnmV6er47O` on a `<canvas>` element.
- **Vector / Lottie Animations:** SVG Lottie runtimes (`first_appear.json`, `main (1).json`, `clear_loop.json`, `main_3.json`).
- **Sliders:** **Swiper (v11)** (`.wb-swiper-1`, `.wb-swiper-2`, `#swiper3`).
- **Platform:** Webflow with custom embedded scripts and styles.

---

## 3. The Background
- **Base Colour:** `#13101c` (deep midnight obsidian plum).
- **Architecture:**
  - A fixed/pinned WebGL canvas (`.div-block-684 [data-us-project="9FtTEJXmORVnmV6er47O"]`) generating fluid particle/liquid shader distortion.
  - Layered with radial blur gradients: purple (`#7C3AED` / `#5B21B6`), warm amber (`#D97706`), and royal blue (`#1D4ED8`).
  - Circular glowing halo ring with layered `box-shadow` breathe keyframe.
- **Reactivity:**
  - *Cursor:* Mouse position warps shader field coordinates in real time.
  - *Scroll:* Sticky pinned through hero scrub (~300vh), slowly fading canvas opacity to transition into solid `#13101c` for subsequent sections.

---

## 4. Distinct Animations & Timings
| Animation | Trigger | Element | Properties Changed | Duration / Easing | Stagger |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Words Slide Up** | ScrollTrigger `top 60%` | `[words-slide-up] .word` | `opacity: 0 → 1`, `yPercent: 100 → 0` | 0.5s–0.6s / `back.out(2)` | `0.04s` per word |
| **Letters Fade In** | ScrollTrigger `top bottom` | `[letters-fade-in] .char` | `opacity: 0.25 → 1` | 0.2s / `power1.out` | `amount: 0.8s` |
| **Scrubbed Word Reveal**| Scroll scrub `top 90% → top center` | `[scrub-each-word] .word` | `opacity: 0.2 → 1` | Scrub-linked | `each: 0.4s` |
| **Halo Ring Parallax** | Scroll scrub | `.eterna-halo-ring` | `y: 0 → 200px`, `scale: 1 → 1.16` | Continuous scroll scrub | N/A |
| **Halo Glow Breathe** | CSS infinite | `.eterna-halo-ring` | `box-shadow`, `opacity: 0.88 ↔ 1` | 7.0s / `ease-in-out` | Infinite loop |
| **Botanical Blossom** | ScrollTrigger enter | `.img-flower` (Lottie) | Frame progression `0 → 100%` | 3.5s / linear | N/A |
| **Offer Cards In-View** | ScrollTrigger enter | `.div-block-644` | `opacity: 0 → 1`, `y: 40px → 0` | 0.8s / `power2.out` | `0.14s` stagger |
| **Letter Card Hover** | Hover | `.square-2` | `flex: 1 → auto`, `box-shadow`, `border` | 0.8s / `ease` | N/A |
| **Accordion Expand** | Click | `.dropdown .div-block-651` | `height: 0 ↔ auto`, icon rotate 60° | 0.4s / `cubic-bezier(0.16, 1, 0.3, 1)` | N/A |
| **Modal Drawer Slide** | Click | `.modals-wrapper` | `translate3d(100%, 0, 0) → (0, 0, 0)` | 0.6s / `power3.out` | N/A |

---

## 5. Smooth-Scroll Feel
- **Parameters:** `lerp: 0.1`, `wheelMultiplier: 0.7`, `normalizeWheel: false`, `smoothTouch: false`.
- **Sensory Feel:** Weighted, friction-damped luxury glide. No aggressive spring bounce.
- **Pinning:** Hero cards section pinned for ~300vh scroll length.
- **Horizontal Scroll:** None. Pure vertical stack.

---

## 6. Typography
- **Primary Family:** `Mazzardh, Arial, sans-serif` (Computed: MazzardH 300 Light, 400 Regular, 500 Medium).
- **H1 Scale:** ~61.9px at 1440px desktop, clamping to 36px on mobile. Line-height: `68px` (1.08). Letter-spacing: `-1.86px` (-0.03em). Weight: 500. Case: Normal sentence case.
- **H2 / H3 Scale:** 32px–48px desktop, clamping to 24px–32px on mobile. Letter-spacing: `-0.02em`. Weight: 400.
- **Body Copy:** 16px desktop, 15px mobile. Line-height: 1.6. Weight: 300. Color: `#a6a3b8` / `rgba(255, 255, 255, 0.6)`.
- **Eyebrow Badges:** 14px, uppercase, letter-spacing: -0.01em, border-radius: 999px.

---

## 7. Layout System
- **Grid & Alignment:** 12-column grid inside centered containers (`max-width: 1200px` / `1440px`).
- **Cards (`.div-block-644`):** `border-radius: 2rem` (2.08vw), background: `radial-gradient(circle at 50% 100%, #362c52, #1a1429 80%)`, border: `1px solid rgba(255, 255, 255, 0.08)`.
- **Buttons:** Pill-shaped `rounded-full` with gradient (`#4F46E5` → `#7C3AED`) or solid purple (`#4F46E5`), with subtle hover lift and shadow expansion.
- **Cursor:** Default system pointer, no custom cursor ring.

---

## 8. Mobile & Reduced-Motion Behavior
- **Mobile (390px):**
  - Switches from `.div-block-642.desktop` (3 horizontal cards) to `.div-block-642.mobile` (vertical card stack).
  - Navigation collapses to standard Webflow hamburger drawer.
  - Swipers adjust `spaceBetween` dynamically via resize listener.
  - Section heights reduce: Hero from ~369vh to ~120vh; pinned scrub simplified.
- **Reduced-Motion (`prefers-reduced-motion: reduce`):**
  - Lenis smooth scroll disabled (`smooth: false`, native scroll fallback).
  - WebGL shader particle motion and background warping stopped.
  - Pinning and parallax transforms disabled; replaced with static layout and standard opacity reveals.

---

## 9. Items Marked UNKNOWN
- **Exact UnicornStudio GLSL Shader Source:** The compiled WebGL shader bytecode in `9FtTEJXmORVnmV6er47O` is hosted behind a proprietary CDN bundle and cannot be extracted as raw GLSL text. *Resolution for Rebuild:* Recreate procedurally using procedural CSS mesh radial layers and Framer Motion parallax/blur filters.
- **Lottie Raw Source JSONs:** External JSON files (`first_appear.json`, `main (1).json`) are proprietary assets. *Resolution for Rebuild:* Recreate using clean procedural SVGs with `motion.path` and `pathLength` draw animations.
