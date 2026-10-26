import { useState, useEffect } from "react";

export function useScrollProgress() {
  const [scrollData, setScrollData] = useState({
    globalProgress: 0,
    scrollY: 0,
    activeSection: 0,
    sectionProgress: {},
  });

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const globalProgress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;

          // Estimate active section (0 to 12)
          const sectionElements = document.querySelectorAll("[data-about-section]");
          let activeIndex = 0;
          const newSectionProgress = {};

          sectionElements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            const elHeight = rect.height;
            const top = rect.top;

            // Section progress: 0 when entering viewport bottom, 1 when exiting top
            const progress = elHeight > 0 ? Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight + elHeight))) : 0;
            newSectionProgress[index] = progress;

            if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.2) {
              activeIndex = index;
            }
          });

          setScrollData({
            globalProgress,
            scrollY,
            activeSection: activeIndex,
            sectionProgress: newSectionProgress,
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollData;
}
