import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { animate, stagger } from "animejs";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Filler, 
  Legend,
  ArcElement
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { DateTime } from "luxon";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";
import Spline from "@splinetool/react-spline";
import { 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Zap, 
  Fingerprint, 
  Globe, 
  ArrowRight,
  Database
} from "lucide-react";

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement
);

gsap.registerPlugin(ScrollTrigger);

const Demo = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const [time, setTime] = useState(DateTime.now().toFormat("HH:mm:ss:SSS 'UTC'"));
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    lenis.on('scroll', (e) => {
      const progress = (e.animatedScroll / e.limit) * 100;
      setScrollProgress(progress);
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. Initialize AOS
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true
    });

    // 3. GSAP Parallax & Pinning
    const ctx = gsap.context(() => {
      // Hero split animation
      gsap.to(".hero-shutter-left", {
        xPercent: -100,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          pin: true
        }
      });
      gsap.to(".hero-shutter-right", {
        xPercent: 100,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      // Text reveal on scroll
      gsap.from(".reveal-text", {
        opacity: 0,
        y: 100,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".content-section",
          start: "top 80%",
          end: "top 20%",
          scrub: 1
        }
      });
    }, containerRef);

    // 4. Anime.js Path Drawing
    animate({
      targets: ".grid-path",
      strokeDashoffset: [1000, 0],
      ease: "inOutSine",
      duration: 3000,
      delay: stagger(250),
      loop: true,
      direction: "alternate"
    });

    // 5. System Clock Loop
    const clockInterval = setInterval(() => {
      setTime(DateTime.now().toFormat("HH:mm:ss:SSS 'UTC'"));
    }, 10);

    return () => {
      lenis.destroy();
      ctx.revert();
      clearInterval(clockInterval);
    };
  }, []);

  const showAlert = () => {
    Swal.fire({
      title: "PROTOCOL_ENGAGED",
      text: "Neural Archive Manifestation Initialized.",
      icon: "success",
      background: "#000",
      color: "#fff",
      confirmButtonColor: "#2563EB",
      buttonsStyling: true,
      customClass: {
        popup: "border-2 border-blue-500 font-mono"
      }
    });
  };

  // Chart Data
  const lineData = {
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
    datasets: [{
      label: "Truth_Density",
      data: [65, 59, 80, 81, 56, 95],
      fill: true,
      borderColor: "#2563EB",
      backgroundColor: "rgba(37, 99, 235, 0.1)",
      tension: 0.4,
    }]
  };

  return (
    <div ref={containerRef} className="bg-black text-white min-h-[400vh] selection:bg-blue-600">
      
      {/* ── LOCAL KING SIZE SCROLL PROGRESS BAR ── */}
      <div 
        className="fixed top-0 left-0 right-0 h-[4px] bg-blue-500 z-[200] origin-left shadow-[0_0_20px_#3b82f6]"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* 1. TOP SYSTEM BAR */}
      <div className="fixed top-28 inset-x-0 z-[100] px-12 flex justify-between items-center mix-blend-difference pointer-events-none">
        <div className="flex items-center gap-4 text-sm font-mono tracking-[0.5em] opacity-40">
          <Activity className="w-3 h-3 animate-pulse" />
          SYSTEM_VERSION_1.0.4
        </div>
        <div className="text-sm font-mono tracking-[0.3em] opacity-40">
          {time}
        </div>
      </div>

      {/* 2. HERO SECTION (GSAP PINNED) */}
      <section ref={heroRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* 3D Background (Spline) */}
        <div className="absolute inset-0 opacity-40">
          <Spline scene="https://prod.spline.design/6Wq1Q7YRyS7QZp9X/scene.splinecode" />
        </div>

        {/* Shutters */}
        <div className="hero-shutter-left absolute inset-y-0 left-0 w-1/2 bg-black z-20 border-r border-blue-500/20 flex items-center justify-end overflow-hidden">
          <h1 className="text-[15vw] font-black italic tracking-tighter leading-none translate-x-1/2">VERI</h1>
        </div>
        <div className="hero-shutter-right absolute inset-y-0 right-0 w-1/2 bg-black z-20 border-l border-blue-500/20 flex items-center justify-start overflow-hidden">
          <h1 className="text-[15vw] font-black italic tracking-tighter leading-none -translate-x-1/2 text-blue-600">PROOF</h1>
        </div>

        {/* Center Content (Behind Shutters) */}
        <div className="relative z-10 text-center space-y-8 p-12 max-w-4xl">
          <div className="inline-flex items-center gap-4 px-6 py-2 border border-blue-500/30 bg-blue-500/5 text-sm font-mono uppercase tracking-[0.5em]">
            <ShieldCheck className="w-4 h-4" />
            Core_Verified_Archive
          </div>
          <p className="text-2xl font-medium opacity-60 leading-relaxed">
            Where cryptographic precision meets architectural storytelling. 
            The global truth layer for professional identities.
          </p>
          <button 
            onClick={showAlert}
            className="group px-12 py-5 bg-white text-black font-bold uppercase tracking-[0.4em] text-sm hover:bg-blue-600 hover:text-white transition-all flex items-center gap-4 mx-auto"
          >
            INITIALIZE_SEQUENCE
            <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
          </button>
        </div>
      </section>

      {/* 3. FORENSIC GRID SECTION */}
      <section className="content-section py-32 px-12 border-t border-white/5 relative overflow-hidden">
        
        {/* Anime.js SVG Background */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 1000 1000">
          <path className="grid-path" d="M0,100 L1000,100 M0,300 L1000,300 M0,500 L1000,500 M0,700 L1000,700 M0,900 L1000,900" stroke="white" strokeWidth="1" fill="none" />
          <path className="grid-path" d="M100,0 L100,1000 M300,0 L300,1000 M500,0 L500,1000 M700,0 L700,1000 M900,0 L900,1000" stroke="white" strokeWidth="1" fill="none" />
        </svg>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
          
          <div data-aos="fade-right">
            <h2 className="text-7xl font-black italic uppercase tracking-tighter mb-12">
              The_Evidence<span className="text-blue-600">_</span>Protocol
            </h2>
            <div className="space-y-12">
              {[
                { icon: Fingerprint, label: "Biometric_Verification", desc: "Hash-based identity validation across distributed nodes." },
                { icon: Globe, label: "Global_Sync", desc: "Real-time synchronization with primary talent repositories." },
                { icon: Database, label: "Neural_Archive", desc: "Permanent, immutable record of skill manifestations." }
              ].map((item, i) => (
                <div key={i} className="flex gap-8 group">
                  <div className="w-16 h-16 border border-white/10 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-600/5 transition-all">
                    <item.icon className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h4 className="text-sm font-mono uppercase tracking-[0.4em] mb-2 opacity-40">{item.label}</h4>
                    <p className="text-xl font-medium opacity-60 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-aos="fade-left" className="bg-white/[0.02] border border-white/5 p-12 backdrop-blur-3xl">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-sm font-mono uppercase tracking-[0.4em] opacity-40">Live_Network_Load</h3>
              <div className="flex items-center gap-2 text-green-500 text-sm font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                OPERATIONAL
              </div>
            </div>
            
            <div className="h-64 mb-12">
              <Line 
                data={lineData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { display: false },
                    x: { grid: { display: false }, ticks: { color: "#ffffff40", font: { family: "monospace", size: 9 } } }
                  },
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>

            <div className="grid grid-cols-2 gap-12">
              <div>
                <p className="text-sm font-mono opacity-20 uppercase mb-2">Accuracy_Rating</p>
                <p className="text-4xl font-black italic tracking-tighter">99.98%</p>
              </div>
              <div>
                <p className="text-sm font-mono opacity-20 uppercase mb-2">Active_Nodes</p>
                <p className="text-4xl font-black italic tracking-tighter">1,204</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION SECTION */}
      <section className="py-64 flex flex-col items-center justify-center text-center px-6">
        <div data-aos="zoom-in" className="space-y-12 max-w-4xl">
          <h2 className="text-[10vw] font-black italic tracking-tighter leading-none uppercase">
            Start_The<br/><span className="text-blue-600">Audit.</span>
          </h2>
          <p className="text-2xl opacity-40 font-medium leading-relaxed">
            The era of the "King Size" resume is over. <br/>
            Enter the era of the Architectural Proof.
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-12">
            <button className="px-12 py-5 bg-blue-600 text-white font-bold uppercase tracking-[0.4em] text-sm hover:bg-blue-500 transition-all flex items-center gap-4">
              MANIFEST_NOW
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-12 py-5 border border-white/10 hover:border-white transition-all text-white font-bold uppercase tracking-[0.4em] text-sm">
              VIEW_PROTOCOLS
            </button>
          </div>
        </div>
      </section>

      {/* 5. FOOTER GRID */}
      <footer className="py-24 px-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-24 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
        <div className="md:col-span-2">
          <span className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-8 block">
            VeriProof<span className="text-blue-600">.</span>
          </span>
          <p className="text-xs leading-loose tracking-widest uppercase font-mono max-w-sm">
            A high-fidelity truth layer for professional identities. 
            Powered by Veri-Protocol v4.0.0.
          </p>
        </div>
        {[1, 2].map(i => (
          <div key={i} className="space-y-6">
            <h5 className="text-sm font-mono uppercase tracking-[0.4em]">Section_0{i}</h5>
            <ul className="space-y-4 text-sm uppercase tracking-widest font-bold">
              <li>Terminal</li>
              <li>Evidence</li>
              <li>Verification</li>
              <li>Security</li>
            </ul>
          </div>
        ))}
      </footer>

    </div>
  );
};

export default Demo;
