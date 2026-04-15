import PageTransition from "../components/PageTransition";
import { Briefcase, PlusCircle, Activity } from "lucide-react";
import { motion } from "framer-motion";

const RecruiterJobs = () => {
  return (
    <PageTransition>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 relative min-h-screen">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[var(--color-accent)] opacity-[0.03] blur-[120px] -z-10 pointer-events-none" />

        <div className="md:flex md:items-end md:justify-between mb-16 border-b border-[var(--color-border)] pb-8">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-8 h-[1px] bg-[var(--color-accent)]" />
              <p className="text-sm font-mono tracking-[0.5em] uppercase text-[var(--color-accent)] font-bold">
                Intel_Distribution_Network
              </p>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">
              Job <span className="text-[var(--color-accent)] not-italic">Roles.</span>
            </h2>
            <p className="mt-4 text-sm font-medium opacity-40 uppercase tracking-widest flex items-center gap-3">
              <Activity className="w-4 h-4 animate-pulse" /> Network_Status: Distributing_Evidence
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="mt-12 md:mt-0 flex">
            <button type="button" className="px-10 py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-sm flex items-center gap-4 hover:bg-[var(--color-accent)] hover:text-white transition-all group">
              <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> Post_New_Role
            </button>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center bg-white/5 dark:bg-black/20 backdrop-blur-xl py-32 px-4 border border-[var(--color-border)] flex flex-col items-center group hover:border-[var(--color-accent)] transition-all"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[var(--color-accent)] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
            <Briefcase className="w-16 h-16 text-[var(--color-text)] opacity-20 group-hover:opacity-100 group-hover:text-[var(--color-accent)] transition-all duration-500 relative z-10" />
          </div>
          <h3 className="mt-2 text-2xl font-black italic uppercase tracking-widest">
            Null_Roles_Active
          </h3>
          <p className="mt-6 text-xs tracking-[0.2em] font-mono uppercase text-[var(--color-muted)] max-w-lg mx-auto leading-loose opacity-60">
            No active positions broadcasting on the network. Initialize a new role directive to pull verified talent into your forensics queue.
          </p>
          <button className="mt-10 px-8 py-3 border border-[var(--color-text)] text-[var(--color-text)] font-bold uppercase tracking-widest text-[10px] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors">
            Initialize_Directive
          </button>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default RecruiterJobs;
