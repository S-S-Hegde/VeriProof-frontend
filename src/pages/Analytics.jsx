import React from "react";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import { TrendingUp, Activity, BarChart2, PieChart } from "lucide-react";

const Analytics = () => {
  const chartHeight = 250;

  // Mock Data for "Skill Distribution" Bar Chart
  const skillData = [
    { label: "React", value: 95 },
    { label: "Node.js", value: 80 },
    { label: "Python", value: 65 },
    { label: "AWS", value: 40 },
    { label: "Docker", value: 55 },
  ];

  // Mock Data for "Profile Views" Line Chart approximation
  const viewsData = [10, 25, 15, 40, 60, 45, 80];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-8 mt-12 mb-20 px-4">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-vp-teal tracking-wide uppercase mb-2">
            Skill <span className="text-ibex-rose italic lowercase normal-case">Growth</span>
          </h1>
          <p className="text-ibex-muted tracking-widest uppercase text-sm">
            Progressive Activity & Market Demand Visualizations
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Skill Distribution Bar Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card bg-white p-8 border border-vp-teal/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-ibex-rose/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-10 text-vp-teal pb-4 border-b border-vp-teal/10">
              <BarChart2 className="w-5 h-5 text-ibex-rose" />
              <h3 className="font-sans font-bold uppercase tracking-widest text-sm">Skill Proficiency</h3>
            </div>

            <div className="flex items-end justify-between gap-4 h-[250px] px-2 md:px-8">
              {skillData.map((skill, i) => (
                <div key={skill.label} className="flex flex-col items-center flex-1 group/bar">
                  <div className="w-full relative flex justify-center bg-vp-teal/5 rounded-t-lg h-[200px]">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${skill.value}%` }}
                      transition={{ duration: 1.2, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                      className="absolute bottom-0 w-full bg-gradient-premium rounded-t-md opacity-80 group-hover/bar:opacity-100 transition-opacity"
                    >
                      <div className="absolute -top-1 w-full h-2 bg-white/40 rounded-full blur-[2px]" />
                    </motion.div>
                    
                    {/* Hover Value Popup */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute -top-8 bg-vp-teal text-white text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none"
                    >
                      {skill.value}%
                    </motion.div>
                  </div>
                  <span className="mt-4 text-xs font-medium text-ibex-muted rotate-45 origin-left md:rotate-0 md:uppercase tracking-wider">
                    {skill.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Line/Wave Chart Mock */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card bg-white p-8 border border-vp-teal/10 relative overflow-hidden group"
          >
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-ibex-gold/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-10 text-vp-teal pb-4 border-b border-vp-teal/10">
              <Activity className="w-5 h-5 text-ibex-gold" />
              <h3 className="font-sans font-bold uppercase tracking-widest text-sm">Profile Velocity</h3>
            </div>

            <div className="flex items-end justify-between h-[250px] relative px-2">
              {/* Connecting line approximation using SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 600 250">
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                  d="M 10 200 C 100 150, 200 180, 250 100 S 400 120, 500 50 S 590 20, 590 20"
                  fill="none"
                  stroke="#A6F4DC"
                  strokeWidth="4"
                  className="drop-shadow-lg"
                />
              </svg>
              
              {viewsData.map((val, i) => (
                <div key={i} className="flex flex-col items-center flex-1 relative z-10 h-full justify-end">
                   <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 + (i * 0.1), type: "spring" }}
                      className="w-3 h-3 md:w-4 md:h-4 bg-white border-2 border-ibex-rose rounded-full cursor-pointer hover:scale-150 transition-transform shadow-md"
                      style={{ marginBottom: `${val * 2}px` }}
                   />
                   <span className="absolute bottom-[-30px] text-xs font-medium text-ibex-muted tracking-wider">
                     {`W${i+1}`}
                   </span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-vp-teal/10 flex justify-between items-center text-sm">
                <span className="text-ibex-muted">Profile Views (+24% week over week)</span>
                <span className="text-vp-teal font-bold">+184</span>
            </div>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
};

export default Analytics;
