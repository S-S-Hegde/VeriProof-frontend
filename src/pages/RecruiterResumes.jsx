import PageTransition from "../components/PageTransition";
import { UploadCloud, Activity } from "lucide-react";
import { motion } from "framer-motion";

const RecruiterResumes = () => {
  return (
    <PageTransition>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 relative min-h-screen">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-accent)] opacity-[0.03] blur-[120px] -z-10 pointer-events-none" />

        <div className="mb-16 border-b border-[var(--color-border)] pb-8">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-4 mb-4">
              <span className="w-8 h-[1px] bg-[var(--color-accent)]" />
              <p className="text-sm font-mono tracking-[0.5em] uppercase text-[var(--color-accent)] font-bold">
                Mass_Intelligence_Upload
              </p>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">
              Bulk <span className="text-[var(--color-accent)] not-italic">Intel.</span>
            </h2>
            <p className="mt-4 text-sm font-medium opacity-40 uppercase tracking-widest flex items-center gap-3 max-w-3xl leading-relaxed">
              Upload large batches of intel documents to parse and match them against the core forensics database of verified skills.
            </p>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/5 dark:bg-black/20 backdrop-blur-xl p-12 lg:p-32 border border-[var(--color-border)] flex flex-col items-center justify-center text-center transition-all duration-500 hover:border-[var(--color-accent)] cursor-pointer group border-dashed relative overflow-hidden"
        >
          {/* Scanning line animation */}
          <div className="absolute left-0 right-0 h-[1px] bg-[var(--color-accent)] shadow-[0_0_20px_var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:animate-scan z-0 pointer-events-none" />

          <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 p-8 mb-8 text-[var(--color-accent)] shadow-[0_0_30px_var(--color-accent)]/10 group-hover:scale-110 transition-transform duration-500 relative z-10 rounded-sm">
            <UploadCloud className="w-16 h-16" />
          </div>
          
          <h3 className="text-3xl font-black italic uppercase tracking-widest mb-4 relative z-10 group-hover:text-[var(--color-accent)] transition-colors">
            Init_File_Transfer
          </h3>
          <p className="text-xs tracking-[0.2em] font-mono uppercase text-[var(--color-muted)] max-w-xl mx-auto leading-loose opacity-50 mb-12 relative z-10">
            Supported protocols: PDF, DOCX. The AI forensics engine will automatically extract intelligence and cross-reference records against verified nodes.
          </p>
          
          <button className="px-12 py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-black tracking-[0.4em] uppercase text-xs hover:bg-[var(--color-accent)] hover:text-white transition-all shadow-xl relative z-10">
            Browse_Local_System
          </button>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default RecruiterResumes;
