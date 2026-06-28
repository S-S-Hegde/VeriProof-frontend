import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";
import { 
  Activity, 
  TerminalSquare, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle,
  FileCheck,
  Flag,
  Fingerprint,
  Lock,
  UploadCloud,
} from "lucide-react";
import api from "../utils/api";

const Exams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [hasInitiated, setHasInitiated] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  const [questions, setQuestions] = useState([]);
  const [examError, setExamError] = useState("");
  
  const [answers, setAnswers] = useState({}); // { _id: optionIndex }
  const [reviewFlags, setReviewFlags] = useState({}); // { 1: true }
  const [visited, setVisited] = useState({ 1: true }); // { 1: true }
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    // Fake the scanning sequence based on Awwwards matrix
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsScanning(false), 800);
            return 100;
          }
          return p + Math.floor(Math.random() * 15);
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIdx) => {
    const qId = questions[currentIdx]._id;
    setAnswers({ ...answers, [qId]: optionIdx });
  };

  const clearResponse = () => {
    const qId = questions[currentIdx]._id;
    const newAnswers = { ...answers };
    delete newAnswers[qId];
    setAnswers(newAnswers);
  };

  const markForReview = () => {
    const qId = questions[currentIdx]._id;
    setReviewFlags({ ...reviewFlags, [qId]: !reviewFlags[qId] });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setVisited({ ...visited, [questions[currentIdx + 1]._id]: true });
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setVisited({ ...visited, [questions[currentIdx - 1]._id]: true });
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleJump = (idx) => {
    setVisited({ ...visited, [questions[idx]._id]: true });
    setCurrentIdx(idx);
  };

  async function handleSubmitExam() {
    try {
      const payload = questions.map((question) => ({
        questionId: question._id,
        answerIndex: answers[question._id],
      }));

      const { data } = await api.post("/api/exams/submit", {
        answers: payload,
      });

      setSubmissionResult(data);
      setIsSubmitted(true);
    } catch (error) {
      setExamError(error.response?.data?.message || "Failed to submit exam.");
    }
  }

  useEffect(() => {
    // Exam timer
    if (hasInitiated && !isScanning && !isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && !isSubmitted) {
      const submitTimeout = setTimeout(() => {
        handleSubmitExam();
      }, 0);
      return () => clearTimeout(submitTimeout);
    }
  }, [hasInitiated, isScanning, isSubmitted, timeLeft]);

  const handleStartSequence = async () => {
    setHasInitiated(true);
    setIsScanning(true);
    
    try {
      const { data } = await api.get("/api/exams/start");
      setQuestions(data);
      if (data.length > 0) {
        setVisited({ [data[0]._id]: true });
      }
    } catch (error) {
      console.error(error);
      setExamError("Failed to connect to verification core. Aborting.");
      setIsScanning(false);
      setHasInitiated(false);
    }
  };

  if (!hasInitiated) {
    const hasRepoAnalysis = user?.workflowState?.hasRepoAnalysis;
    
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[var(--color-bg)] z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-accent)] opacity-[0.03] blur-[100px] pointer-events-none" />
        
        <div className="glass-card max-w-3xl w-full p-12 md:p-16 relative z-10 border border-[var(--color-border)] overflow-hidden shadow-2xl">
          <div className="flex flex-col items-center text-center">
            {hasRepoAnalysis ? (
               <Fingerprint className="w-16 h-16 text-[var(--color-accent)] mb-8" />
            ) : (
               <Lock className="w-16 h-16 text-red-500 mb-8" />
            )}
            
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
              {hasRepoAnalysis ? "Certification" : "System" } <span className={`${hasRepoAnalysis ? 'text-[var(--color-accent)]' : 'text-red-500'} not-italic`}>{hasRepoAnalysis ? "Lobby." : "Locked."}</span>
            </h2>
            
            <p className="max-w-md font-mono text-xs tracking-widest uppercase opacity-60 mb-10 leading-relaxed">
              {hasRepoAnalysis 
                ? "You are about to initiate the high-stakes Verification Protocol. This is a strictly monitored, cryptographically signed examination." 
                : "Your profile lacks Repository Analysis data. You must synchronize your GitHub projects to unlock the certification engine."
              }
            </p>

            {hasRepoAnalysis ? (
              <button 
                onClick={handleStartSequence}
                className="group relative px-10 py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-black tracking-[0.3em] uppercase text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all rounded-sm shadow-xl flex items-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 w-0 group-hover:w-full transition-all duration-300 pointer-events-none" />
                <Activity className="w-5 h-5 group-hover:rotate-12 transition-transform relative z-10" />
                <span className="relative z-10">Initiate Verification</span>
              </button>
            ) : (
              <button 
                onClick={() => navigate("/dashboard")}
                className="group relative px-10 py-5 bg-red-500/10 border border-red-500 text-red-500 font-black tracking-[0.3em] uppercase text-sm hover:bg-red-500 hover:text-white transition-all rounded-sm shadow-xl flex items-center gap-4"
              >
                <UploadCloud className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Return to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isScanning) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[var(--color-bg)] z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-accent)] opacity-[0.03] blur-[100px] pointer-events-none" />
        
        <div className="glass-card max-w-3xl w-full p-12 md:p-24 relative z-10 border border-[var(--color-border)] overflow-hidden">
          {/* Scanning Line */}
          <motion.div 
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            className="absolute left-0 right-0 h-[2px] bg-[var(--color-accent)] shadow-[0_0_30px_var(--color-accent)] opacity-50 z-20"
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            <Fingerprint className="w-16 h-16 text-[var(--color-accent)] animate-pulse mb-8" />
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
              Analyzing Profile <span className="text-[var(--color-accent)] not-italic">Data.</span>
            </h2>
            <div className="h-6 w-full max-w-md bg-black/20 border border-[var(--color-border)] mt-8 relative overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-[var(--color-accent)]"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
              />
            </div>
            
            <div className="mt-8 text-left max-w-sm w-full space-y-2 font-mono text-xs tracking-widest uppercase opacity-50">
               <p>&gt; Accessing GitHub Commits... [OK]</p>
               <p>&gt; Computing Language Distribution... [{Math.min(scanProgress * 2, 100)}%]</p>
               {scanProgress > 40 && <p className="text-[var(--color-accent)]">&gt; Extracting Stack: React, Node.js, Graph Theory...</p>}
               {scanProgress > 80 && <p className="text-green-500">&gt; Generating Adaptive Verification Payload...</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted && questions.length > 0) {
    const answeredCount = Object.keys(answers).length;
    const score = submissionResult?.score || 0;

    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4 bg-[var(--color-bg)]">
         <div className="text-center max-w-2xl glass-card border border-[var(--color-border)] p-12 lg:p-24 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 inset-x-0 h-1 bg-[var(--color-accent)]" />
             <FileCheck className="w-20 h-20 text-[var(--color-accent)] mx-auto mb-8" />
             <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6">
                Verification <span className="text-[var(--color-accent)] not-italic">Complete.</span>
             </h2>
             <p className="font-mono text-sm tracking-widest uppercase opacity-60 mb-12">
               Your biometric signature and architectural evidence have been securely transmitted to the core node.
             </p>
             <div className="flex flex-col gap-4 text-left border border-[var(--color-border)] bg-black/10 p-6 mb-12 font-mono uppercase text-sm tracking-widest">
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                   <span>Questions Attempted:</span> <span className="text-white">{answeredCount} / {questions.length}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                   <span>Integrity Score:</span> <span className="text-[var(--color-accent)] font-bold">{score}%</span>
                </div>
                <div className="flex justify-between">
                   <span>Status:</span> <span className={score >= 70 ? "text-green-500" : "text-orange-400"}>{submissionResult?.status || "SUBMITTED"}</span>
                </div>
             </div>
             <button onClick={() => navigate("/dashboard")} className="px-12 py-4 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all shadow-xl">
               Return_To_Archive
             </button>
         </div>
      </div>
    );
  }

  if (questions.length === 0) return null; // Wait until loaded

  const currentQ = questions[currentIdx];
  const hasAnsweredCurrent = currentQ ? answers[currentQ._id] !== undefined : false;
  const isReviewCurrent = currentQ ? reviewFlags[currentQ._id] : false;

  if (!currentQ) return null;

  return (
    <div className="flex-1 bg-[var(--color-bg)] flex flex-col font-sans">
      
      {/* Top Protocol Bar */}
      <div className="px-6 py-3 border-b border-[var(--color-border)] bg-black/20 backdrop-blur-md flex items-center justify-between sticky top-[80px] z-40">
        <div className="flex items-center gap-4">
          <TerminalSquare className="w-5 h-5 text-[var(--color-accent)]" />
          <span className="font-black italic uppercase tracking-widest text-lg">
            VERIPROOF_FORENSIC_ENGINE 
          </span>
          <span className="hidden md:inline-block ml-4 text-[10px] tracking-[0.3em] font-mono opacity-40 uppercase border-l border-[var(--color-border)] pl-4">
            CANDIDATE: {user?.name || "GUEST"}
          </span>
        </div>
        <div className={`flex items-center gap-3 px-4 py-1.5 border font-mono text-sm tracking-widest font-bold 
           ${timeLeft < 300 ? "border-red-500/50 bg-red-500/10 text-red-500 animate-pulse" : "border-[var(--color-border)] text-[var(--color-text)]"}`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative z-10 overflow-y-auto">
          {/* Question Header */}
          <div className="px-8 py-6 border-b border-[var(--color-border)] flex justify-between items-center bg-white/5 dark:bg-black/10">
            <h3 className="text-2xl font-black uppercase tracking-widest flex items-center gap-4 opacity-80">
               Question_{currentIdx + 1}
               {isReviewCurrent && <Flag className="w-5 h-5 text-purple-400" />}
            </h3>
            <span className="text-xs font-mono uppercase tracking-widest opacity-40">
               Multi-Choice / Strict / Sec-1
            </span>
          </div>

          {/* Question Body */}
          <div className="p-8 lg:p-12 flex-1">
             {examError && (
               <div className="mb-6 border border-red-500/40 bg-red-500/10 p-4 text-sm uppercase tracking-[0.2em] text-red-400">
                 {examError}
               </div>
             )}
             <div className="text-xl md:text-2xl font-light leading-relaxed mb-12 tracking-wide">
               {currentQ.text}
             </div>

             <div className="space-y-4 max-w-4xl">
               {currentQ.options.map((opt, i) => {
                 const isSelected = answers[currentQ._id] === i;
                 return (
                   <div 
                     key={i}
                     onClick={() => handleOptionSelect(i)}
                     className={`p-5 flex items-start gap-4 border cursor-pointer transition-all duration-300
                       ${isSelected 
                         ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-[inner_0_0_20px_var(--color-accent)]" 
                         : "border-[var(--color-border)] hover:border-[var(--color-text)]/50 bg-white/5 dark:bg-black/20"
                       }`}
                   >
                     <div className={`mt-0.5 w-5 h-5 border flex items-center justify-center shrink-0 rounded-full transition-colors
                       ${isSelected ? "border-[var(--color-accent)]" : "border-[var(--color-border)]"}
                     `}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full animate-pulse" />}
                     </div>
                     <span className={`text-base tracking-wide ${isSelected && "font-bold text-[var(--color-accent)]"}`}>
                       <span className="opacity-40 font-mono tracking-widest uppercase mr-3">OPT_{i+1}</span> 
                       {opt}
                     </span>
                   </div>
                 );
               })}
             </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="px-8 py-6 border-t border-[var(--color-border)] bg-black/20 flex flex-wrap items-center justify-between gap-4 sticky bottom-0">
             <div className="flex items-center gap-4">
                <button 
                  onClick={markForReview}
                  className="px-6 py-3 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-colors"
                >
                  Mark / Unmark Review
                </button>
                <button 
                  onClick={clearResponse}
                  disabled={!hasAnsweredCurrent}
                  className="px-6 py-3 border border-[var(--color-border)] text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 disabled:opacity-20 transition-all"
                >
                  Clear Selection
                </button>
             </div>
             <div className="flex items-center gap-4">
                <button 
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="w-12 h-12 flex items-center justify-center border border-[var(--color-border)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors disabled:opacity-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleNext}
                  className="px-10 py-3 bg-[var(--color-text)] text-[var(--color-bg)] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--color-accent)] hover:text-white transition-colors flex items-center gap-4 group"
                >
                  Save & Next <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
        </div>

        {/* Right Sidebar Palette */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] bg-[var(--color-bg)] flex flex-col relative z-20">
           <div className="p-6 border-b border-[var(--color-border)] bg-white/5 dark:bg-black/20">
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Question Palette</h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] font-mono tracking-widest uppercase">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[var(--color-accent)]" /> Answered</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500" /> Not Answered</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 border border-[var(--color-border)]" /> Not Visited</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500" /> Review</div>
              </div>
           </div>

           <div className="flex-1 p-6 overflow-y-auto">
             <div className="grid grid-cols-4 gap-3">
               {questions.map((q, idx) => {
                 let bgColor = "bg-transparent border border-[var(--color-border)]"; // Not visited
                 if (visited[q._id]) {
                   bgColor = "bg-red-500/20 text-red-500 border border-red-500/50"; // visited but not answered
                 }
                 if (answers[q._id] !== undefined) {
                   bgColor = "bg-[var(--color-accent)] text-[var(--color-bg)] font-bold border border-[var(--color-accent)]"; // Answered
                 }
                 if (reviewFlags[q._id]) {
                   bgColor = "bg-purple-500 text-white font-bold border border-purple-500"; // Marked for review (takes precedence visually if we want, or combine. Let's just override)
                 }

                 return (
                   <button
                     key={q._id}
                     onClick={() => handleJump(idx)}
                     className={`h-12 w-full flex items-center justify-center font-mono text-sm transition-all hover:scale-105 duration-200
                        ${bgColor} ${currentIdx === idx ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--color-bg)]" : ""}
                     `}
                   >
                     {idx + 1}
                   </button>
                 );
               })}
             </div>
           </div>
           
           <div className="p-6 border-t border-[var(--color-border)] bg-red-500/5 hover:bg-red-500/10 transition-colors">
              <button 
                onClick={handleSubmitExam}
                className="w-full py-4 border border-red-500/50 text-red-500 font-bold tracking-[0.2em] uppercase text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <AlertTriangle className="w-4 h-4" /> End Authentication
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
export default Exams;
