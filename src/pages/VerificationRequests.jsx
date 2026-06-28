import React, { useState, useEffect } from "react";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Clock, CheckCircle, XCircle, ChevronRight, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";

const VerificationRequests = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [takingExam, setTakingExam] = useState(null); // Will hold the result object if taking an exam
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes mock timer
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  const fetchResults = async () => {
    try {
      if(!user?.token) return;
      const { data } = await api.get("/api/verify/my-results");
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch my results", error);
    }
  };

  useEffect(() => {
    if (!user?.token) return;

    const loadResults = async () => {
      await fetchResults();
    };

    loadResults();
  }, [user?.token]);

  const startExam = async (result) => {
    try {
      const { data } = await api.get(`/api/verify/exam/${result.jobId?._id}`);
      
      setExamData(data);
      setAnswers(new Array(data.questions.length).fill(null));
      setTakingExam(result);
      setTimeLeft(300);
      setExamSubmitted(false);
    } catch (error) {
      console.error("Failed to fetch exam payload", error);
    }
  };

  const handleOptionSelect = (qIndex, oIndex) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = oIndex;
    setAnswers(newAnswers);
  };

  async function submitExam() {
    try {
      const { data } = await api.post(`/api/verify/exam/${takingExam._id}`, {
        examId: examData._id,
        answers
      });
      
      setFinalScore(data);
      setExamSubmitted(true);
      fetchResults(); // Refresh table behind the modal
    } catch (error) {
      console.error("Failed to submit exam", error);
    }
  }

  // Timer Effect for Exams
  useEffect(() => {
    let timer;
    if (takingExam && !examSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && takingExam && !examSubmitted) {
      timer = setTimeout(() => {
        submitExam();
      }, 0);
    }
    return () => clearInterval(timer);
  }, [takingExam, timeLeft, examSubmitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 mt-8 relative">
        <div className="flex justify-between items-end mb-10 border-b border-[var(--color-border)] pb-6">
          <div>
            <h2 className="text-4xl font-serif text-[var(--color-text)] font-light tracking-wider uppercase mb-2">
              Verification <span className="text-[var(--color-accent)] italic lowercase normal-case">Requests</span>
            </h2>
            <p className="text-[var(--color-muted)] tracking-widest uppercase text-xs">
              Algorithmic Portfolio Validation & Exam Protocols
            </p>
          </div>
        </div>

        <div className="vp-surface-1 shadow-lg bg-white dark:bg-[var(--color-bg-sunken)]/50 overflow-hidden">
          {results.length === 0 ? (
            <div className="p-16 text-center text-[var(--color-text)] dark:text-[var(--color-text)] text-lg font-light tracking-wide flex flex-col items-center">
              <ShieldCheck className="w-12 h-12 mb-4 text-[var(--color-muted)]/30" />
              Tracking Network Validation Requests...
              <p className="text-sm mt-4 text-[var(--color-muted)] font-sans uppercase tracking-widest">
                No active validations initialized.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-bg-sunken)]/20">
              {results.map((result) => (
                <div key={result._id} className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-[var(--color-bg-sunken)]/50 transition-colors group">
                  <div className="space-y-2 mb-6 md:mb-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-serif text-[var(--color-text)] uppercase tracking-widest">{result.jobId?.title || "Unknown Specification"}</h4>
                      
                      {result.status === "Verified" ? (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm tracking-widest uppercase border border-green-500/20 font-bold">
                          <CheckCircle className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : result.status === "Pending Exam" ? (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm tracking-widest uppercase border border-yellow-500/20 font-bold">
                          <Clock className="w-3 h-3" />
                          <span>Exam Required</span>
                        </span>
                      ) : result.status === "Failed" ? (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-sm tracking-widest uppercase border border-red-500/20 font-bold">
                          <XCircle className="w-3 h-3" />
                          <span>Validation Failed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-bg-sunken)]/50 text-[var(--color-muted)] text-sm tracking-widest uppercase border border-[var(--color-border)] font-bold">
                          In Review
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2 text-[var(--color-muted)]">
                        <span className="uppercase tracking-widest text-sm">NLP Alignment:</span>
                        <span className="font-medium text-[var(--color-text)]">{result.alignmentScore}%</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[var(--color-muted)]">
                        <span className="uppercase tracking-widest text-sm">Verification Score:</span>
                        <span className="font-medium text-[var(--color-text)]">{result.examScore !== undefined ? `${result.examScore}%` : "—"}</span>
                      </div>
                    </div>
                  </div>

                  {result.status === "Pending Exam" && (
                    <button 
                      onClick={() => startExam(result)}
                      className="px-6 py-3 bg-[var(--color-accent)] text-[var(--color-text)] rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-2"
                    >
                      <span>Take Exam</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {result.status === "Verified" && (
                    <button 
                      disabled
                      className="px-6 py-3 border border-green-500/30 text-green-600 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-widest opacity-80 flex items-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Secured</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Adaptive Exam Portal Modal Overlay */}
        <AnimatePresence>
          {takingExam && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-[var(--color-bg)] dark:bg-[var(--color-bg-sunken)] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-[var(--color-border)] relative my-12 flex flex-col max-h-[90vh]"
              >
                {!examSubmitted ? (
                  <>
                    {/* Header */}
                    <div className="bg-gradient-premium p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center text-white shrink-0 gap-4">
                      <div>
                        <h3 className="font-serif text-xl md:text-2xl tracking-widest uppercase">{examData?.topic || "Verification Exam"}</h3>
                        <p className="text-sm md:text-xs uppercase tracking-widest opacity-90 mt-1">Passing Threshold: {examData?.passingScore}%</p>
                      </div>
                      <div className="flex flex-col sm:items-end w-full sm:w-auto bg-white/10 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
                        <span className="text-sm md:text-xs uppercase tracking-widest opacity-80 mb-1">Time Remaining</span>
                        <div className={`text-2xl md:text-3xl font-mono font-bold ${timeLeft < 60 ? 'text-red-200 animate-pulse' : 'text-white'}`}>
                          {formatTime(timeLeft)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Exam Body */}
                    <div className="p-8 space-y-12 overflow-y-auto">
                      {examData?.questions.map((q, qIndex) => (
                        <div key={q._id} className="space-y-4">
                          <h4 className="text-lg text-[var(--color-text)] font-medium"><span className="text-[var(--color-accent)] mr-2 font-serif font-bold">{qIndex + 1}.</span> {q.questionText}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {q.options.map((opt, oIndex) => (
                              <button
                                key={oIndex}
                                onClick={() => handleOptionSelect(qIndex, oIndex)}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-300 text-sm ${answers[qIndex] === oIndex ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text)] font-medium' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-bg-sunken)]/50'}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-sunken)]/50 flex justify-between items-center shrink-0">
                      <button 
                        onClick={() => {
                          setTakingExam(null);
                        }}
                        className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] hover:text-red-500 transition-colors"
                      >
                        Abandon Exam
                      </button>
                      <button 
                        onClick={submitExam}
                        disabled={answers.includes(null)}
                        className={`px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${answers.includes(null) ? 'bg-[var(--color-bg-sunken)]/50 text-[var(--color-muted)] cursor-not-allowed' : 'bg-[var(--color-accent)] text-[var(--color-text)] hover:shadow-[0_4px_15px_rgba(166,244,220,0.5)]'}`}
                      >
                        Submit Final Answers
                      </button>
                    </div>
                  </>
                ) : (
                  /* Result View */
                  <div className="p-16 text-center flex flex-col items-center justify-center">
                    {finalScore?.status === "Verified" ? (
                      <>
                        <ShieldCheck className="w-24 h-24 text-green-500 mb-6" />
                        <h2 className="text-4xl font-serif text-[var(--color-text)] mb-2">VALIDATED</h2>
                        <p className="text-green-500 font-medium text-xl mb-8">Score: {finalScore.examScore}%</p>
                        <p className="text-[var(--color-muted)] mb-8 max-w-sm">
                          Your cryptographic signature has been secured. Your skills align perfectly with the target parameters.
                        </p>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-24 h-24 text-red-500 mb-6" />
                        <h2 className="text-4xl font-serif text-[var(--color-text)] mb-2">VALIDATION FAILED</h2>
                        <p className="text-red-500 font-medium text-xl mb-8">Score: {finalScore.examScore}%</p>
                        <p className="text-[var(--color-muted)] mb-8 max-w-sm">
                          Your examination algorithms did not meet the required threshold requested by the recruiter.
                        </p>
                      </>
                    )}
                    
                    <button 
                      onClick={() => setTakingExam(null)}
                      className="px-8 py-3 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.2em] uppercase text-xs hover:bg-[var(--color-accent)] hover:text-white transition-all bg-gradient-premium text-white border-0 py-4 px-10 rounded-full"
                    >
                      Return to Requests
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default VerificationRequests;
