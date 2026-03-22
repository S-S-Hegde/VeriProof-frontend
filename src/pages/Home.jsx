import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldCheck, Target, Zap, Globe, Cpu, Award } from "lucide-react";

const Home = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  return (
    <div className="w-full min-h-screen bg-gradient-cerulean text-slate-900 relative overflow-hidden -mt-28 pt-28 pb-20 font-sans">
      {/* Organic Background Blobs - Toned down opacity to prevent washing out the UI */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          x: [0, 30, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] md:w-[50vw] md:h-[50vw] bg-[#B5838D]/20 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] md:w-[60vw] md:h-[60vw] bg-[#A6F4DC]/20 rounded-full mix-blend-multiply filter blur-[100px] md:blur-[150px] pointer-events-none"
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />

      {/* Hero Section */}
      <motion.section 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-4 sm:px-6 w-full max-w-[100vw] overflow-hidden"
      >
        <motion.div variants={fadeUp} className="inline-block mb-8 px-6 py-2 rounded-full border border-slate-900/10 bg-white/20 backdrop-blur-md shadow-sm">
          <span className="text-xs md:text-sm tracking-[0.2em] uppercase font-bold text-slate-800">
            The Definite Standard for Trust
          </span>
        </motion.div>

        <motion.h1 
          variants={fadeUp}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.1] mb-8 text-slate-900 max-w-full break-words px-2"
        >
          DEFEAT ORDINARY.<br/>
          <span className="font-serif italic font-light tracking-wide text-white drop-shadow-[0_4px_15px_rgba(0,168,204,0.6)]">
            Prove Excellence.
          </span>
        </motion.h1>

        <motion.p 
          variants={fadeUp}
          className="max-w-3xl text-sm sm:text-base md:text-xl text-slate-800 font-medium leading-relaxed mb-12 px-4 shadow-sm backdrop-blur-sm bg-white/5 p-4 rounded-xl"
        >
          An immersive, cryptographic verification platform designed to elevate pristine engineering talent over local competitors. Experience the absolute pinnacle of premium portfolio validation.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-lg px-4 justify-center">
          <Link
            to="/register"
            className="group relative px-6 md:px-8 py-4 md:py-5 rounded-full overflow-hidden bg-slate-900 text-[#A6F4DC] font-bold tracking-widest uppercase text-xs md:text-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="absolute inset-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              Join as Candidate <Zap className="w-4 h-4" />
            </span>
          </Link>
          <Link
            to="/register"
            className="px-6 md:px-8 py-4 md:py-5 rounded-full border-2 border-slate-900 bg-transparent hover:bg-slate-900 hover:text-white text-slate-900 transition-all duration-300 font-bold tracking-widest uppercase text-xs md:text-sm shadow-sm group text-center"
          >
            Hire Verified Talent
          </Link>
        </motion.div>
      </motion.section>

      {/* Organic Asymmetrical Features (Scroll Triggered) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24 text-center md:text-left"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight flex flex-col gap-1 sm:gap-2 text-slate-900">
            <span>UNMATCHED</span>
            <span className="font-serif italic font-light text-white drop-shadow-md">Functionality.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min md:auto-rows-[minmax(300px,_auto)]">
          {/* Card 1: Large Asymmetrical */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: 0 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="md:col-span-8 bg-white/20 backdrop-blur-2xl border border-white/40 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden group shadow-lg"
          >
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-white opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />
            <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-slate-900 mb-6 md:mb-8" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">Cryptographic Portfolios</h3>
            <p className="text-slate-800 text-base md:text-lg leading-relaxed max-w-xl font-medium">
              We move beyond simple links. Every uploaded project is analyzed, skill-checked, and locked into our immutable Verification Panel, guaranteeing recruiters 100% authentic candidate data.
            </p>
          </motion.div>

          {/* Card 2: Vertical */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="md:col-span-4 bg-slate-900 border border-slate-800/50 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-end relative overflow-hidden group shadow-xl"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <Globe className="w-10 h-10 md:w-12 md:h-12 text-[#A6F4DC] mb-12 md:mb-auto" />
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-white">Regional Dominance</h3>
              <p className="text-white/70 font-light text-sm md:text-base">Outperforming all local competitors through sheer UX superiority and data trust.</p>
            </div>
          </motion.div>

          {/* Card 3: Small Horizontal */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 hover:bg-white/30 transition-colors shadow-lg"
          >
            <Target className="w-8 h-8 md:w-10 md:h-10 text-slate-900 mb-4 md:mb-6" />
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-slate-900">Role-Based Intelligence</h3>
            <p className="text-slate-800 font-medium text-xs md:text-sm">Separated dashboards ensuring recruiters and students only see exactly what matters to them.</p>
          </motion.div>

          {/* Card 4: Massive Visual Data Mock */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-7 bg-black/10 backdrop-blur-2xl border border-black/5 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-inner overflow-hidden"
          >
             <div className="flex items-end justify-center gap-2 sm:gap-4 h-24 md:h-32 mb-6 md:mb-8 w-full px-4 md:px-8">
               {/* Animated chart bars */}
               {[40, 70, 45, 90, 60].map((h, i) => (
                 <motion.div 
                   key={i}
                   initial={{ height: 0 }}
                   whileInView={{ height: `${h}%` }}
                   viewport={{ once: true }}
                   transition={{ duration: 1, delay: 0.4 + (i * 0.1), ease: "easeOut" }}
                   className="w-full max-w-[30px] md:max-w-[40px] bg-white rounded-t-xl relative "
                 >
                   <div className="absolute top-1 left-1 bottom-1 right-1 bg-gradient-to-t from-slate-900 to-transparent rounded-lg opacity-20" />
                 </motion.div>
               ))}
             </div>
             <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 text-slate-900">Algorithmic Verifications</h3>
             <p className="text-slate-800 font-bold text-[10px] md:text-xs tracking-widest uppercase">Real-time candidate NLP scaling</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
