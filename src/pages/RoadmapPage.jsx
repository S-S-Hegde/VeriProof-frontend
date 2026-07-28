import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Flame, Loader2 } from "lucide-react";

const DevelopmentStatus = () => {
  const roadmap = [
    {
      title: "Asteroid Canvas Engine",
      status: "completed",
      desc: "High-performance HTML5 canvas generating physics-based trailing asteroid fields.",
    },
    {
      title: "Fiery Interaction Pipeline",
      status: "completed",
      desc: "Global React event hooks mapping Framer Motion explosive SVGs to exact viewport coordinates.",
    },
    {
      title: "Burning Page Router",
      status: "completed",
      desc: "Filter-based CSS distortion mapping simulating page disintegration during Route mounts/unmounts.",
    },
    {
      title: "Recruiter Verification NLP Engine",
      status: "active",
      desc: "Deploying Python/Node wrappers for algorithmic JD-to-Resume resume compatibility scanning.",
    },
    {
      title: "Adaptive Exam Dispatcher",
      status: "active",
      desc: "Tuning the automated testing platform triggering randomized questions for candidate screening.",
    },
    {
      title: "Global Global Styling Pivot",
      status: "completed",
      desc: "Annihilation of legacy Dual-Tone Tiffany Blue layouts in favor of raw Space/Fire interactions.",
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-32 text-white relative z-10 min-h-[85vh]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <Flame className="w-16 h-16 text-orange-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(255,69,0,0.8)]" />
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,100,0,0.4)]">
          Development Status
        </h1>
        <p className="mt-4 text-orange-300 uppercase tracking-widest text-sm font-bold">
          Live Platform Architecture Log
        </p>
      </motion.div>

      <div className="space-y-6">
        {roadmap.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`p-6 md:p-8 rounded-xl backdrop-blur-md border border-white/5 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden ${
              item.status === 'completed' ? 'bg-black/80' : 'bg-orange-900/20'
            }`}
          >
            {item.status === 'completed' && (
              <div className="absolute top-0 right-0 w-32 h-full bg-green-500/5 blur-3xl pointer-events-none" />
            )}
            {item.status === 'active' && (
              <div className="absolute top-0 right-0 w-32 h-full bg-orange-500/10 blur-3xl pointer-events-none" />
            )}

            <div className="flex-shrink-0 mt-1 md:mt-0">
              {item.status === "completed" ? (
                <CheckCircle2 className="w-8 h-8 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              ) : (
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin drop-shadow-[0_0_10px_rgba(255,100,0,0.5)]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold tracking-wide">{item.title}</h3>
                <span className={`text-sm uppercase tracking-widest px-2 py-1 rounded-sm font-bold ${
                  item.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {item.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DevelopmentStatus;
