import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Fingerprint, Layers, Terminal, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import InfiniteMarquee from "../components/InfiniteMarquee";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  
  // Horizontal scroll translates 0 to -300vw to slide exactly 4 panels
  const xTransform = useTransform(smoothProgress, [0.2, 0.8], ["0%", "-300vw"]);

  // Removed return null so authenticated users can view the page

  return (
    <div ref={containerRef} className="relative w-full bg-[var(--color-bg)] text-[var(--color-text)]">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-screen w-full flex flex-col justify-center items-start px-6 md:px-12 pt-32 pb-24 overflow-hidden relative border-b border-[var(--color-border)]">
        <motion.div
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ duration: 1, delay: 0.2 }}
           className="w-full"
        >
          <h1 className="text-[16vw] md:text-[14vw] leading-[0.8] font-black uppercase tracking-tighter italic whitespace-nowrap">
            VERI<span className="text-[var(--color-accent)]">PROOF</span>
          </h1>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mt-8 md:mt-12 gap-8 md:gap-12 w-full">
            <p className="w-full md:max-w-3xl text-lg md:text-3xl font-medium tracking-tight uppercase leading-snug">
              Stop building resumes. Start building a legacy that can be proven. A forensic architectural system designed to verify digital contributions with surgical precision.
            </p>
            <Link to="/register" className="text-xl md:text-2xl uppercase font-black italic border-b-4 border-current hover:text-[var(--color-accent)] transition-all shrink-0 pb-1">
              Initialize Setup
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. HUGE TYPOGRAPHY DIVIDER */}
      <section className="py-20 md:py-32 overflow-hidden bg-[var(--color-accent)] text-[var(--color-bg)]">
        <InfiniteMarquee text="TRUST_WITHOUT_FAITH // CODE_NEVER_LIES // FORENSIC_IDENTITY // " speed={20} />
      </section>

      {/* 3. HORIZONTAL SCROLLING SECTION */}
      <section className="h-[400vh] relative bg-[var(--color-text)] text-[var(--color-bg)]">
         <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
            <motion.div style={{ x: xTransform }} className="flex w-[400vw] h-full items-center">
               
               {/* Slide 1 */}
               <div className="w-[100vw] px-8 md:px-24 flex flex-col justify-center">
                 <Fingerprint className="w-16 h-16 md:w-24 md:h-24 mb-6 md:mb-12 text-[var(--color-bg)] opacity-40 shrink-0" />
                 <h2 className="text-[14vw] md:text-[10vw] leading-[0.85] font-black uppercase tracking-tighter italic whitespace-nowrap">
                    Forensic <br/> Identity
                 </h2>
                 <p className="text-xl md:text-3xl mt-6 md:mt-8 max-w-2xl opacity-70 leading-relaxed font-medium">
                    We don't just look at names. We analyze commit patterns, code fingerprints, and cryptographic signatures to ensure you are who you say you are.
                 </p>
               </div>

               {/* Slide 2 */}
               <div className="w-[100vw] px-8 md:px-24 flex flex-col justify-center">
                 <Layers className="w-16 h-16 md:w-24 md:h-24 mb-6 md:mb-12 text-[var(--color-bg)] opacity-40 shrink-0" />
                 <h2 className="text-[14vw] md:text-[10vw] leading-[0.85] font-black uppercase tracking-tighter italic whitespace-nowrap">
                    Deep Stack <br/> Audit
                 </h2>
                 <p className="text-xl md:text-3xl mt-6 md:mt-8 max-w-2xl opacity-70 leading-relaxed font-medium">
                    Cross-referencing multiple repositories to build a unified talent profile that cannot be faked or hallucinated.
                 </p>
               </div>

               {/* Slide 3 */}
               <div className="w-[100vw] px-8 md:px-24 flex flex-col justify-center">
                 <Terminal className="w-16 h-16 md:w-24 md:h-24 mb-6 md:mb-12 text-[var(--color-bg)] opacity-40 shrink-0" />
                 <h2 className="text-[14vw] md:text-[10vw] leading-[0.85] font-black uppercase tracking-tighter italic whitespace-nowrap">
                    Neural <br/> Plagiarism
                 </h2>
                 <p className="text-xl md:text-3xl mt-6 md:mt-8 max-w-2xl opacity-70 leading-relaxed font-medium">
                    Scanning billions of lines of open-source code to ensure 100% originality of your architectural evidence.
                 </p>
               </div>

               {/* Slide 4 */}
               <div className="w-[100vw] px-8 md:px-24 flex flex-col justify-center">
                 <ShieldCheck className="w-16 h-16 md:w-24 md:h-24 mb-6 md:mb-12 text-[var(--color-bg)] opacity-40 shrink-0" />
                 <h2 className="text-[14vw] md:text-[10vw] leading-[0.85] font-black uppercase tracking-tighter italic whitespace-nowrap">
                    Proof <br/> of Concept
                 </h2>
                 <p className="text-xl md:text-3xl mt-6 md:mt-8 max-w-2xl opacity-70 leading-relaxed font-medium">
                    Converting raw commits into meaningful professional signals that tech recruiters can actually trust.
                 </p>
               </div>

            </motion.div>
         </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="h-screen w-full flex flex-col justify-center items-center text-center px-4 md:px-6 relative overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
        <h2 className="text-[20vw] md:text-[15vw] leading-[0.8] font-black italic uppercase tracking-tighter mb-8 md:mb-12 relative z-10">
           START <br/> THE <br/> <span className="text-[var(--color-accent)] not-italic">AUDIT.</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 md:gap-8 mt-4 md:mt-12 z-20 w-full sm:w-auto px-4">
          <Link to="/register" className="px-8 md:px-16 py-4 md:py-6 bg-[var(--color-text)] text-[var(--color-bg)] uppercase font-black tracking-widest hover:bg-[var(--color-accent)] hover:text-white transition-all text-sm md:text-xl text-center w-full sm:w-auto">
             Access Control
          </Link>
          <Link to="/login" className="px-8 md:px-16 py-4 md:py-6 border border-[var(--color-text)] uppercase font-black tracking-widest hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-all text-sm md:text-xl bg-[var(--color-bg)] text-center w-full sm:w-auto">
             Re-Authenticate
          </Link>
        </div>
      </section>
      
      {/* 5. FOOTER BAR */}
      <div className="w-full py-8 border-t border-[var(--color-border)] flex items-center justify-center font-mono opacity-60 text-lg uppercase font-bold tracking-widest">    
        © 2026 VERIPROOF_LABS // SYSTEM_VERIFIED
      </div>
    </div>
  );
}
