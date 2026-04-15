import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { 
  Wand2, 
  Download, 
  ShieldCheck, 
  Cpu, 
  Activity,
  Loader2,
  TerminalSquare
} from "lucide-react";
import axios from "axios";

// Framer motion variants for staggering form fields
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const AIResumeBuilder = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("System_Ready");
  
  const [fields, setFields] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    skills: "",
    education: "",
    experience: "",
    manifesto: ""
  });

  // Dynamic Metrics Calculation
  const calculateMetrics = () => {
    const filledFields = Object.values(fields).filter(v => String(v).trim() !== "").length;
    const totalFields = Object.keys(fields).length;
    const contentDensity = fields.experience.length + fields.education.length + fields.manifesto.length;
    
    const atsScore = Math.min(100, Math.round((filledFields / totalFields) * 80) + (fields.skills.split(",").length > 3 ? 20 : 0));
    const truthIndex = filledFields > 4 ? 100 : 98;
    
    let complexity = "BASIC";
    if (contentDensity > 150) complexity = "OPTIMIZED";
    if (contentDensity > 400) complexity = "ARCHITECTURAL";

    return { atsScore, truthIndex, complexity };
  };

  const metrics = calculateMetrics();

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Analyzing_Skill_Nodes...");
    
    try {
      // Simulate Deep Architectural Analysis delay
      await new Promise(r => setTimeout(r, 2000));
      setStatus("Compiling_Architectural_PDF...");
      
      const cfg = {
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: "blob",
      };
      
      const response = await axios.post("/api/resume/generate", {
        ...fields,
        summary: fields.manifesto
      }, cfg);
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fields.fullName.replace(/\s+/g, "_")}_AI_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setStatus("Manifestation_Complete");
    } catch (err) {
      console.error(err);
      setStatus("Protocol_Error_0x44");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-black/10 dark:bg-white/5 border border-[var(--color-border)] px-4 py-4 focus:border-[var(--color-accent)] focus:bg-transparent outline-none transition-all duration-300 text-sm font-mono tracking-wider placeholder:opacity-20 shadow-inner rounded-sm";
  const labelCls = "text-xs uppercase tracking-[0.3em] font-bold opacity-60 flex items-center gap-2 mb-3";

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden bg-[var(--color-bg)]">
        {/* Dynamic Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-accent),transparent_50%)] opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-[var(--color-accent)] to-transparent opacity-[0.02] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto pt-24 pb-32 px-6 relative z-10">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
              <div className="flex items-center gap-4 text-[var(--color-accent)] mb-6">
                <Cpu className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-mono uppercase tracking-[0.4em]">Neural_Archive_Constructor</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] mb-6">
                AI_Resume<br/><span className="text-[var(--color-accent)] not-italic">Architect.</span>
              </h1>
              <p className="text-lg opacity-50 font-medium max-w-xl leading-relaxed">
                Transform your raw career metadata into a surgically precise, verified manifestation of your professional identity. 
              </p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex flex-col lg:items-end">
              <div className="text-sm font-mono opacity-30 uppercase tracking-[0.3em] mb-3">System Context Hub</div>
              <div className={`px-6 py-4 backdrop-blur-md border font-bold text-xs tracking-[0.2em] uppercase flex items-center gap-3 transition-all rounded-sm shadow-xl ${
                status.includes("Error") ? "border-red-500/50 text-red-500 bg-red-500/10" : "border-[var(--color-border)] text-[var(--color-text)] bg-white/5 dark:bg-black/20"
              }`}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent)]" /> : <TerminalSquare className="w-4 h-4 opacity-50" />}
                {status}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 relative">

            {/* Left: Glassmorphic Forge */}
            <motion.form 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              onSubmit={handleGenerate} 
              className="xl:col-span-8 space-y-12 bg-white/10 dark:bg-black/40 backdrop-blur-2xl p-8 md:p-12 border border-[var(--color-border)] shadow-2xl rounded-xl relative overflow-hidden"
            >
              {/* Internal subtle glow */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-accent)] blur-[100px] opacity-[0.05] rounded-full pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 relative z-10">
                <motion.div variants={itemVariants} className="group">
                  <label className={labelCls}>Identity_String</label>
                  <input 
                    className={inputCls} 
                    placeholder="FULL_LEGAL_NAME" 
                    value={fields.fullName}
                    onChange={e => setFields({...fields, fullName: e.target.value})}
                    required 
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="group">
                  <label className={labelCls}>Comm_Address</label>
                  <input 
                    type="email" 
                    className={inputCls} 
                    placeholder="EMAIL@DOMAIN.COM" 
                    value={fields.email}
                    onChange={e => setFields({...fields, email: e.target.value})}
                    required 
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="group">
                  <label className={labelCls}>Contact_Protocol</label>
                  <input 
                    className={inputCls} 
                    placeholder="+XX XXXXXXXXXX" 
                    value={fields.phone}
                    onChange={e => setFields({...fields, phone: e.target.value})}
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="group">
                  <label className={labelCls}>Verified_Skillset</label>
                  <input 
                    className={inputCls} 
                    placeholder="REACT, NODE.JS, NEURAL_NETS..." 
                    value={fields.skills}
                    onChange={e => setFields({...fields, skills: e.target.value})}
                    required
                  />
                </motion.div>
              </div>

              <motion.div variants={containerVariants} className="space-y-10 relative z-10">
                <motion.div variants={itemVariants} className="group">
                  <label className={labelCls}>Academic_Ledger</label>
                  <textarea 
                    className={`${inputCls} h-28 resize-none`} 
                    placeholder="INSTITUTION // DEGREE // GPA"
                    value={fields.education}
                    onChange={e => setFields({...fields, education: e.target.value})}
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="group">
                  <label className={labelCls}>Practical_Experience</label>
                  <textarea 
                    className={`${inputCls} h-36 resize-none`} 
                    placeholder="ROLE @ ORGANIZATION // CONTRIBUTIONS"
                    value={fields.experience}
                    onChange={e => setFields({...fields, experience: e.target.value})}
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="group">
                  <label className={labelCls}>Professional_Manifesto</label>
                  <textarea 
                    className={`${inputCls} h-36 resize-none`} 
                    placeholder="STATE_YOUR_MISSION_OBJECTIVE..."
                    value={fields.manifesto}
                    onChange={e => setFields({...fields, manifesto: e.target.value})}
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-10 mb-2 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-4 text-xs font-mono opacity-40 uppercase tracking-widest">
                  <ShieldCheck className="w-5 h-5 text-[var(--color-accent)]" />
                  <span>Verified_By_Trust_Protocol</span>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="group relative overflow-hidden px-10 py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-black tracking-[0.3em] uppercase text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all flex items-center gap-4 rounded-sm shadow-xl w-full md:w-auto justify-center"
                >
                  <div className="absolute inset-0 bg-white/20 w-0 group-hover:w-full transition-all duration-300 pointer-events-none" />
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wand2 className="w-5 h-5 group-hover:rotate-12 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="relative z-10">{loading ? "MANIFESTING..." : "MANIFEST_RESUME"}</span>
                </button>
              </motion.div>
            </motion.form>

            {/* Right: Sidebar Metrics & Output */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="xl:col-span-4 space-y-6"
            >
              {/* The Matrix Readout */}
              <div className="p-8 border border-[var(--color-border)] bg-black/5 dark:bg-white/5 backdrop-blur-xl relative group overflow-hidden rounded-xl shadow-xl">
                
                {/* Cybernetic Scanning Line */}
                <AnimatePresence>
                  {loading && (
                    <motion.div 
                      initial={{ top: "-10%" }}
                      animate={{ top: "110%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-[var(--color-accent)]/80 blur-sm z-20 shadow-[0_0_20px_var(--color-accent)]"
                    />
                  )}
                </AnimatePresence>

                <h3 className="text-xs font-mono uppercase tracking-[0.3em] mb-8 opacity-50 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Real_Time_Metrics
                </h3>
                
                <div className="space-y-8 relative z-10">
                  {[
                    { label: "ATS_Visibility", val: `${metrics.atsScore}%`, detail: metrics.atsScore > 80 ? "Optimized" : "Calibrating" },
                    { label: "Authenticity", val: `${metrics.truthIndex}%`, detail: "Verified" },
                    { label: "Density", val: metrics.complexity, detail: "Dynamic" }
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-[var(--color-border)]/50 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-xs font-mono opacity-40 uppercase mb-2 tracking-wider">{stat.label}</p>
                        <p className={`text-3xl font-black italic tracking-tighter transition-colors duration-500 ${loading ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}>
                          {stat.val}
                        </p>
                      </div>
                      <div className="text-[10px] font-mono text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-3 py-1 bg-[var(--color-accent)]/5 rounded-full uppercase tracking-widest">
                        {stat.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secure Notice */}
              <div className="p-6 border border-dashed border-[var(--color-border)] bg-transparent rounded-xl flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 opacity-40 mt-1 shrink-0 text-[var(--color-accent)]" />
                <div>
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] mb-2 opacity-50">System_Directive</h3>
                  <p className="text-xs leading-relaxed uppercase tracking-widest opacity-70">
                    Outputs are cross-referenced with your ledger. Fraudulent metadata will trigger immediate structural lockout.
                  </p>
                </div>
              </div>

              {/* Ready Indicator */}
              <button 
                onClick={e => { if(!loading) handleGenerate(e); }}
                className={`w-full flex items-center justify-between p-6 border transition-all group rounded-xl shadow-lg backdrop-blur-md ${
                loading ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 cursor-not-allowed" : "border-[var(--color-border)] bg-white/5 dark:bg-black/20 hover:border-[var(--color-accent)]"
              }`}>
                <div className="flex flex-col items-start focus:outline-none">
                  <span className="text-[10px] font-mono opacity-50 uppercase mb-2 tracking-[0.2em]">Output_Format</span>
                  <span className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                    PDF_Architecture <span className="bg-[var(--color-text)] text-[var(--color-bg)] w-1 h-3 animate-pulse inline-block" />
                  </span>
                </div>
                <Download className={`w-6 h-6 transition-all duration-300 ${loading ? "opacity-20 translate-y-1" : "opacity-40 group-hover:opacity-100 group-hover:text-[var(--color-accent)]"}`} />
              </button>
            </motion.div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AIResumeBuilder;
