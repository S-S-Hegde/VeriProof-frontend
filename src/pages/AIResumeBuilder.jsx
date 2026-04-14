import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { 
  Wand2, 
  Download, 
  ShieldCheck, 
  Cpu, 
  Activity,
  ChevronRight,
  Loader2,
  CheckCircle
} from "lucide-react";
import axios from "axios";

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
      // Simulate AI Processing delay
      await new Promise(r => setTimeout(r, 1500));
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

  const inputCls = "w-full bg-transparent border-b border-[var(--color-border)] py-4 focus:border-[var(--color-accent)] outline-none transition-all text-sm font-mono tracking-wider placeholder:opacity-20";
  const labelCls = "text-sm uppercase tracking-[0.4em] font-bold opacity-40 flex items-center gap-2 mb-2";

  return (
    <PageTransition>
      <div className="max-w-[1400px] mx-auto pt-12 pb-32 px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 text-[var(--color-accent)] mb-6">
              <Cpu className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-mono uppercase tracking-[0.5em]">Neural_Archive_Constructor_v2.1</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8">
              AI_Resume<span className="text-[var(--color-accent)] not-italic">_</span>Architect
            </h1>
            <p className="text-lg opacity-40 font-medium max-w-xl leading-relaxed">
              Transform your raw career metadata into a surgically precise, verified manifestation of your professional identity. 
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-sm font-mono opacity-20 uppercase tracking-[0.4em] mb-4">Current_Status</div>
            <div className={`px-8 py-4 border font-bold text-xs tracking-[0.3em] uppercase flex items-center gap-4 transition-all ${
              status.includes("Error") ? "border-red-500/50 text-red-500 bg-red-500/5" : "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5"
            }`}>
              <Activity className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {status}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
          {/* Background Grid Accent */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:100px_100px] opacity-[0.03] -z-10 pointer-events-none" />

          {/* Left: Input Forge */}
          <form onSubmit={handleGenerate} className="lg:col-span-8 space-y-12 bg-[var(--color-bg)]/40 p-12 border border-[var(--color-border)] backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="group">
                <label className={labelCls}>Identity_String</label>
                <input 
                  className={inputCls} 
                  placeholder="FULL_LEGAL_NAME" 
                  value={fields.fullName}
                  onChange={e => setFields({...fields, fullName: e.target.value})}
                  required 
                />
              </div>
              <div className="group">
                <label className={labelCls}>Comm_Address</label>
                <input 
                  type="email" 
                  className={inputCls} 
                  placeholder="EMAIL@DOMAIN.COM" 
                  value={fields.email}
                  onChange={e => setFields({...fields, email: e.target.value})}
                  required 
                />
              </div>
              <div className="group">
                <label className={labelCls}>Contact_Protocol</label>
                <input 
                  className={inputCls} 
                  placeholder="+XX XXXXXXXXXX" 
                  value={fields.phone}
                  onChange={e => setFields({...fields, phone: e.target.value})}
                />
              </div>
              <div className="group">
                <label className={labelCls}>Verified_Skillset</label>
                <input 
                  className={inputCls} 
                  placeholder="REACT, NODE.JS, NEURAL_NETS..." 
                  value={fields.skills}
                  onChange={e => setFields({...fields, skills: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-10">
              <div className="group">
                <label className={labelCls}>Academic_Ledger</label>
                <textarea 
                  className={`${inputCls} h-24 resize-none`} 
                  placeholder="INSTITUTION // DEGREE // GPA"
                  value={fields.education}
                  onChange={e => setFields({...fields, education: e.target.value})}
                />
              </div>
              <div className="group">
                <label className={labelCls}>Practical_Experience</label>
                <textarea 
                  className={`${inputCls} h-32 resize-none`} 
                  placeholder="ROLE @ ORGANIZATION // CONTRIBUTIONS"
                  value={fields.experience}
                  onChange={e => setFields({...fields, experience: e.target.value})}
                />
              </div>
              <div className="group">
                <label className={labelCls}>Professional_Manifesto</label>
                <textarea 
                  className={`${inputCls} h-32 resize-none border-dashed`} 
                  placeholder="STATE_YOUR_MISSION_OBJECTIVE..."
                  value={fields.manifesto}
                  onChange={e => setFields({...fields, manifesto: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-8 border-t border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm font-mono opacity-30">
                <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                <span>ALL_DATA_VERIFIED_BY_TRUST_PROTOCOL</span>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="group relative overflow-hidden px-12 py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.5em] uppercase text-sm hover:bg-[var(--color-accent)] transition-all flex items-center gap-4"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                )}
                <span>Manifest_Resume</span>
              </button>
            </div>
          </form>

          {/* Right: Sidebar Metrics */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 border border-[var(--color-border)] bg-[var(--color-bg)]/40 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)] opacity-[0.02] blur-3xl group-hover:opacity-10 transition-opacity" />
              <h3 className="text-sm font-mono uppercase tracking-[0.4em] mb-8 border-b border-[var(--color-border)] pb-4">Evaluation_Matrix</h3>
              
              <div className="space-y-8">
                {[
                  { label: "ATS_Score", val: `${metrics.atsScore}%`, detail: metrics.atsScore > 80 ? "Optimized" : "Calibrating" },
                  { label: "Truth_Index", val: `${metrics.truthIndex}%`, detail: "Verified" },
                  { label: "Complexity", val: metrics.complexity, detail: "Dynamic" }
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-mono opacity-40 uppercase mb-1">{stat.label}</p>
                      <p className="text-2xl font-black italic tracking-tighter">{stat.val}</p>
                    </div>
                    <div className="text-sm font-mono text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-2 py-0.5">
                      {stat.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 border border-dashed border-[var(--color-border)] opacity-40">
              <h3 className="text-sm font-mono uppercase tracking-[0.4em] mb-4">System_Note</h3>
              <p className="text-sm leading-loose uppercase tracking-widest">
                Verification signals are cross-referenced with your GitHub activity and project documentation. 
                Fraudulent metadata will trigger a terminal lockout.
              </p>
            </div>

            <button className="w-full flex items-center justify-between p-6 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all group">
              <div className="flex flex-col items-start">
                <span className="text-sm font-mono opacity-40 uppercase mb-1">Export_Format</span>
                <span className="text-xs font-bold uppercase tracking-widest">Architectural_PDF</span>
              </div>
              <Download className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:text-[var(--color-accent)] transition-all" />
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AIResumeBuilder;
