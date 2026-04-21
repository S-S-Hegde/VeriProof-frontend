import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Code, 
  Database, 
  Shield, 
  Activity,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const inputCls = "w-full bg-black/20 dark:bg-white/5 border border-[var(--color-border)] px-4 py-4 focus:border-[var(--color-accent)] focus:bg-transparent outline-none transition-all duration-300 text-sm font-mono tracking-wider placeholder:opacity-20 rounded-sm";
const labelCls = "text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 flex items-center gap-2 mb-3";

const PLATFORMS = [
  { id: "hackerrank",  label: "HackerRank",  placeholder: "e.g. 5 Star Gold" },
  { id: "leetcode",    label: "LeetCode",     placeholder: "e.g. 1050 rating" },
  { id: "codeforces",  label: "Codeforces",   placeholder: "e.g. Specialist" },
  { id: "codechef",    label: "CodeChef",     placeholder: "e.g. 3 Star" },
  { id: "github",      label: "GitHub",       placeholder: "e.g. github.com/user" },
  { id: "other",       label: "Other",        placeholder: "Platform name/rank" },
];

const AddProject = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [liveUrl, setLiveUrl]         = useState("");
  const [cgpa, setCgpa]               = useState("");
  const [rankings, setRankings]       = useState(
    PLATFORMS.reduce((acc, p) => ({ ...acc, [p.id]: "" }), {})
  );
  const [snippets, setSnippets]       = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const addSnippet = () => {
    setSnippets([...snippets, { title: "", code: "", language: "javascript", explanation: "" }]);
  };

  const updateSnippet = (index, field, value) => {
    const updated = [...snippets];
    updated[index][field] = value;
    setSnippets(updated);
  };

  const removeSnippet = (index) => {
    setSnippets(snippets.filter((_, i) => i !== index));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cfg = {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
      };
      const techArray = technologies.split(",").map((t) => t.trim()).filter(Boolean);
      await axios.post(
        "/api/projects",
        { title, description, technologies: techArray, repositoryUrl, liveUrl, cgpa, rankings, featuredSnippets: snippets },
        cfg,
      );
      navigate("/dashboard");
    } catch {
      alert("Protocol Failure: Evidence synchronization failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const stepVariants = {
    enter: (direction) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 100 : -100, opacity: 0 })
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto pt-12 pb-32 px-6">
        
        {/* PROGRESS HEADER */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 text-[var(--color-accent)] mb-4">
                <Database className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-[0.4em]">Submission_Protocol // v4.0</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                Evidence<br/><span className="text-[var(--color-accent)] not-italic">Manifest.</span>
              </h1>
            </div>
            
            <div className="hidden md:flex flex-col items-end">
                <span className="text-4xl font-black italic opacity-10 tracking-tighter">STEP_0{currentStep} // 03</span>
                <div className="flex gap-2 mt-4">
                    {[1, 2, 3].map(step => (
                        <div key={step} className={`h-1 w-12 transition-all duration-500 ${currentStep >= step ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`} />
                    ))}
                </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <form onSubmit={submitHandler} className="space-y-12">
            
            <AnimatePresence mode="wait" custom={currentStep}>
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-10"
                >
                  <div className="bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-[var(--color-border)] p-8 md:p-12 rounded-sm shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Shield className="w-32 h-32" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
                      <div className="md:col-span-2">
                        <label className={labelCls}>Protocol_Title</label>
                        <input type="text" required className={inputCls} value={title}
                          onChange={(e) => setTitle(e.target.value)} placeholder="E.G. REAL_TIME_CRYPTO_TRACKER" />
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelCls}>Synopsis / Abstract</label>
                        <textarea required rows={5} className={`${inputCls} resize-none`} value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="STATE_PROJECT_OBJECTIVES_AND_IMPACT..." />
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelCls}>Stack_Signature <span className="opacity-40 normal-case tracking-normal">(COMMA_SEPARATED)</span></label>
                        <input type="text" required className={inputCls} value={technologies}
                          onChange={(e) => setTechnologies(e.target.value)} placeholder="REACT, NODEJS, REDIS..." />
                      </div>

                      <div>
                        <label className={labelCls}>Archive_Source_URL</label>
                        <input type="url" required className={inputCls} value={repositoryUrl}
                          onChange={(e) => setRepositoryUrl(e.target.value)} placeholder="HTTPS://GITHUB.COM/REPO" />
                      </div>
                      <div>
                        <label className={labelCls}>Live_Deployment_URL <span className="opacity-40 normal-case tracking-normal">(OPTIONAL)</span></label>
                        <input type="url" className={inputCls} value={liveUrl}
                          onChange={(e) => setLiveUrl(e.target.value)} placeholder="HTTPS://LIVE.SITE" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  custom={1}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-10"
                >
                  <div className="bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-[var(--color-border)] p-8 md:p-12 rounded-sm shadow-2xl">
                    <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-4">
                        <Code className="w-6 h-6 text-[var(--color-accent)]" />
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Technical_Artifacts</h3>
                      </div>
                      <button
                        type="button"
                        onClick={addSnippet}
                        className="flex items-center gap-3 px-6 py-3 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all text-xs font-bold uppercase tracking-widest rounded-sm"
                      >
                        <Plus className="w-4 h-4" /> Add_Snippet_Node
                      </button>
                    </div>
                    
                    <div className="space-y-10">
                      {snippets.map((snippet, index) => (
                        <div key={index} className="p-8 bg-black/10 dark:bg-white/5 border border-[var(--color-border)] rounded-sm space-y-6 relative group transition-all hover:border-[var(--color-accent)]/30">
                          <button
                            type="button"
                            onClick={() => removeSnippet(index)}
                            className="absolute top-6 right-6 text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <label className={labelCls}>Snippet_Header</label>
                              <input className={inputCls} value={snippet.title}
                                onChange={(e) => updateSnippet(index, "title", e.target.value)} placeholder="E.G. CORE_LOGIC" />
                            </div>
                            <div>
                              <label className={labelCls}>Linguistic_Class</label>
                              <select className={inputCls} value={snippet.language}
                                onChange={(e) => updateSnippet(index, "language", e.target.value)}>
                                <option value="javascript">JAVASCRIPT</option>
                                <option value="typescript">TYPESCRIPT</option>
                                <option value="python">PYTHON</option>
                                <option value="java">JAVA</option>
                                <option value="cpp">C++</option>
                                <option value="css">CSS</option>
                                <option value="html">HTML</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className={labelCls}>Raw_Buffer (Code)</label>
                            <textarea rows={8} className={`${inputCls} font-mono text-[11px] leading-relaxed resize-none`} value={snippet.code}
                              onChange={(e) => updateSnippet(index, "code", e.target.value)} placeholder="PASTE_CODE_HERE..." />
                          </div>

                          <div>
                            <label className={labelCls}>Architectural_Context</label>
                            <input className={inputCls} value={snippet.explanation}
                              onChange={(e) => updateSnippet(index, "explanation", e.target.value)} placeholder="EXPLAIN_SIGNIFICANCE..." />
                          </div>
                        </div>
                      ))}
                      {snippets.length === 0 && (
                        <div className="text-center py-20 border border-dashed border-[var(--color-border)] opacity-30">
                          <p className="text-sm font-mono uppercase tracking-[0.4em]">Zero_Artifacts_Detected</p>
                          <p className="text-[10px] mt-2 tracking-widest uppercase">Highlighting code snippets increases verification trust.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  custom={1}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-12"
                >
                  <div className="bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-[var(--color-border)] p-8 md:p-12 rounded-sm shadow-2xl">
                    <div className="mb-12">
                        <label className={labelCls}>Academic_Ledger (CGPA)</label>
                        <div className="flex items-center gap-6">
                            <input className={`${inputCls} max-w-xs`} value={cgpa}
                            onChange={(e) => setCgpa(e.target.value)} placeholder="E.G. 7.6 / 10" />
                            <div className="flex items-start gap-3 opacity-40">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <p className="text-[10px] uppercase tracking-widest leading-relaxed">System_Note: Skill evidence carries significantly higher weight in recruiter analytics.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[var(--color-border)] pt-12">
                        <div className="flex items-center gap-4 mb-10">
                            <Trophy className="w-6 h-6 text-[var(--color-accent)]" />
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Competitive_Programming_Ranks</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {PLATFORMS.map(({ id, label, placeholder }) => (
                                <div key={id} className="group">
                                    <label className={labelCls}>{label.toUpperCase()}</label>
                                    <input
                                        className={inputCls}
                                        placeholder={placeholder.toUpperCase()}
                                        value={rankings[id]}
                                        onChange={(e) => setRankings((r) => ({ ...r, [id]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>

                  <div className="p-10 border border-dashed border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 rounded-sm flex items-start gap-6">
                      <div className="p-3 bg-[var(--color-accent)] text-white rounded-sm">
                          <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                          <h4 className="text-sm font-black italic uppercase tracking-widest text-[var(--color-accent)] mb-2">Ready_For_Manifestation</h4>
                          <p className="text-xs font-medium opacity-50 leading-relaxed uppercase tracking-widest">
                              By submitting this evidence, you authorize the VeriProof engine to cross-reference these artifacts with your digital ledger.
                          </p>
                      </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* NAVIGATION CONTROLS */}
            <div className="flex items-center justify-between pt-12 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => currentStep === 1 ? navigate("/dashboard") : prevStep()}
                className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-all group"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                {currentStep === 1 ? "Discard_Protocol" : "Previous_Module"}
              </button>

              <div className="flex items-center gap-8">
                <div className="hidden sm:flex items-center gap-2">
                    {[1, 2, 3].map(step => (
                        <div key={step} className={`w-2 h-2 rounded-full transition-all duration-500 ${currentStep === step ? "bg-[var(--color-accent)] scale-125" : "bg-[var(--color-border)]"}`} />
                    ))}
                </div>

                {currentStep < 3 ? (
                    <button
                        type="button"
                        onClick={nextStep}
                        className="px-12 py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-sm hover:bg-[var(--color-accent)] transition-all flex items-center gap-4 rounded-sm"
                    >
                        Next_Protocol <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-12 py-5 bg-[var(--color-accent)] text-white font-bold tracking-[0.3em] uppercase text-sm hover:brightness-110 transition-all flex items-center gap-4 rounded-sm shadow-[0_0_30px_rgba(var(--color-accent-rgb),0.3)] disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Activity className="w-5 h-5 animate-spin" />
                        ) : (
                            <>Submit_Evidence <CheckCircle className="w-4 h-4" /></>
                        )}
                    </button>
                )}
              </div>
            </div>

          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default AddProject;
