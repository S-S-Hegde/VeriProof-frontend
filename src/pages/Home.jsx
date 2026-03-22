import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, ShieldAlert, Rocket, Target } from "lucide-react";

const Home = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 40, filter: "brightness(2) sepia(1)" },
    visible: { opacity: 1, y: 0, filter: "brightness(1) sepia(0)", transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  return (
    <div className="w-full min-h-screen text-white relative z-10 pt-20 pb-20 font-sans">
      
      {/* Hero Section */}
      <motion.section 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center min-h-[75vh] text-center px-4 sm:px-6 w-full max-w-[100vw]"
      >
        <motion.div variants={fadeUp} className="inline-block mb-8 px-6 py-2 rounded-full border border-orange-500/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(255,69,0,0.5)]">
          <span className="text-xs md:text-sm tracking-[0.3em] uppercase font-bold text-orange-500">
            Absolute Verification Protocol
          </span>
        </motion.div>

        <motion.h1 
          variants={fadeUp}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.1] mb-8 text-white max-w-full drop-shadow-[0_0_30px_rgba(255,100,0,0.4)]"
        >
          CRUCIAL FOR FRESHERS.<br/>
          <span className="font-serif italic font-light tracking-wide text-orange-500">
            Vital for Recruiters.
          </span>
        </motion.h1>

        <motion.p 
          variants={fadeUp}
          className="max-w-3xl text-sm sm:text-base md:text-xl text-gray-300 font-medium leading-relaxed mb-12 px-4"
        >
          The chaotic market requires undeniable proof. We forge cryptographic portfolios that test, parse, and lock your engineering talent on-chain, eliminating resume fraud and accelerating raw recruiter trust.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-6 w-full max-w-lg px-4 justify-center">
          <Link
            to="/register"
            className="group relative px-6 md:px-8 py-4 md:py-5 rounded-md overflow-hidden bg-orange-600 text-white font-bold tracking-widest uppercase text-xs md:text-sm shadow-[0_0_20px_rgba(255,69,0,0.6)] hover:shadow-[0_0_40px_rgba(255,69,0,0.8)] transition-all"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              Ignite Your Profile <Zap className="w-4 h-4 fill-white" />
            </span>
          </Link>
          <Link
            to="/status"
            className="px-6 md:px-8 py-4 md:py-5 rounded-md border-2 border-orange-500/50 hover:border-orange-500 bg-black/40 backdrop-blur-sm text-gray-200 hover:text-white transition-all duration-300 font-bold tracking-widest uppercase text-xs md:text-sm text-center shadow-[0_0_15px_rgba(255,100,0,0.2)]"
          >
            Development Status
          </Link>
        </motion.div>
      </motion.section>

      {/* Why It's Crucial */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_15px_rgba(255,50,0,0.5)]">
            Platform Necessity
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Fresher Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-black/60 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8 md:p-12 hover:border-orange-500/50 transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-3xl group-hover:bg-orange-600/30 transition-all duration-700 pointer-events-none" />
            <Rocket className="w-12 h-12 text-orange-500 mb-6" />
            <h3 className="text-2xl font-black mb-4 tracking-wider uppercase text-white">Why Freshers Need This</h3>
            <ul className="space-y-4 text-gray-300 font-light text-lg">
              <li className="flex gap-3"><span className="text-orange-500">►</span> Stand out in a saturated market with cryptographically verified skills instead of self-proclaimed bullet points.</li>
              <li className="flex gap-3"><span className="text-orange-500">►</span> Secure automated interviews bypassing standard ATS filters through our Adaptive Exam gateways.</li>
              <li className="flex gap-3"><span className="text-orange-500">►</span> Defend your hard work against fraudulent competitors duplicating open-source repositories.</li>
            </ul>
          </motion.div>

          {/* Recruiter Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-black/60 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 md:p-12 hover:border-red-500/50 transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl group-hover:bg-red-600/30 transition-all duration-700 pointer-events-none" />
            <ShieldAlert className="w-12 h-12 text-red-500 mb-6" />
            <h3 className="text-2xl font-black mb-4 tracking-wider uppercase text-white">Why Recruiters Need This</h3>
            <ul className="space-y-4 text-gray-300 font-light text-lg">
              <li className="flex gap-3"><span className="text-red-500">►</span> Instantly filter candidates by absolute, verified skill metrics rather than keyword-stuffed resumes.</li>
              <li className="flex gap-3"><span className="text-red-500">►</span> Deploy bulk, specialized NLP verification pipelines directly mapping your Job Descriptions to candidate talent.</li>
              <li className="flex gap-3"><span className="text-red-500">►</span> Drastically reduce time-to-hire by guaranteeing interview-ready applicants entirely vetted on platform.</li>
            </ul>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
