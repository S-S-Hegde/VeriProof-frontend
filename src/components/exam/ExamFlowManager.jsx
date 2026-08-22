import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import ExamLobby from "./ExamLobby";
import ExamInstructions from "./ExamInstructions";
import ExamQuestionView from "./ExamQuestionView";
import ExamPaletteWidget from "./ExamPaletteWidget";
import ExamWebcamWidget from "./ExamWebcamWidget";
import ExamViolationModal from "./ExamViolationModal";
import ExamResultsView from "./ExamResultsView";

// Configuration for anti-cheat limits
const MAX_TAB_SWITCHES = 3;
const MAX_FULLSCREEN_EXITS = 3;

export default function ExamFlowManager() {
  const { user } = useAuth();
  const [stage, setStage] = useState("lobby"); // 'lobby', 'instructions', 'assessment', 'results'
  const [skills, setSkills] = useState([]);
  
  // API State
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [examResult, setExamResult] = useState(null);
  const [examError, setExamError] = useState(null);
  
  // Exam State (with sessionStorage hydration)
  const [answers, setAnswers] = useState(() => {
    const saved = sessionStorage.getItem("exam_answers");
    return saved ? JSON.parse(saved) : {};
  });
  const [visited, setVisited] = useState(() => {
    const saved = sessionStorage.getItem("exam_visited");
    return saved ? JSON.parse(saved) : {};
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = sessionStorage.getItem("exam_currentIndex");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem("exam_timeLeft");
    return saved ? parseInt(saved, 10) : 2400; // 40 minutes (2400 seconds)
  });
  
  // Anti-Cheat & Camera State
  const [webcamStream, setWebcamStream] = useState(null);
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // Active 1-Second Exam Countdown Timer
  useEffect(() => {
    if (stage !== "assessment") return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(false);
          return 0;
        }
        const updated = prev - 1;
        sessionStorage.setItem("exam_timeLeft", String(updated));
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, handleSubmitExam]);

  // Handlers
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setExamError(null);
    try {
      const { data } = await api.get("/api/exams/start");
      setQuestions(data);
      if (data.length > 0) {
        setVisited({ [data[0]._id]: true });
      }
      setStage("instructions");
    } catch (err) {
      console.error(err);
      if (err.response?.data?.completed || err.response?.status === 403) {
        setExamResult({
          completed: true,
          score: err.response?.data?.score ?? 0,
          status: err.response?.data?.status || "Completed",
          message: err.response?.data?.error || "Single attempt limit reached. Retakes are not permitted."
        });
        setStage("completed_lock");
      } else {
        setExamError(err.response?.data?.message || "Failed to generate questions. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartExam = async () => {
    setStage("assessment");
    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.warn("Fullscreen request denied", err);
      }
    }
  };

  const isSubmittingRef = useRef(false);

  const handleSubmitExam = useCallback(async (isTerminated = false) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setStage("results");

    try {
      const payload = questions.map(q => ({
        questionId: q._id,
        answerIndex: answers[q._id] !== undefined ? answers[q._id] : null
      }));
      
      const { data } = await api.post("/api/exams/submit", {
        answers: payload,
        isTerminated
      });
      setExamResult(data);
      
      // Stop webcam
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }
      
      // Exit fullscreen safely
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (err) {}
      }
      
      // Clear autosave
      sessionStorage.removeItem("exam_answers");
      sessionStorage.removeItem("exam_visited");
      sessionStorage.removeItem("exam_currentIndex");
      sessionStorage.removeItem("exam_timeLeft");

      if (isTerminated) {
        setTimeout(() => {
          window.location.href = "/student-dashboard";
        }, 3000);
      }
    } catch (err) {
      console.error("[ExamSubmit] Error:", err);
      setExamError(err.response?.data?.message || "Failed to submit exam. Please try again.");
    }
  }, [questions, answers, webcamStream]);

  // Strict Validation: Candidate cannot submit unless all questions are attempted
  const handleManualSubmit = () => {
    const answeredCount = Object.keys(answers).filter(
      k => answers[k] !== undefined && answers[k] !== null
    ).length;
    const unanswered = questions.length - answeredCount;

    if (unanswered > 0) {
      setShowIncompleteModal(true);
      return;
    }

    handleSubmitExam(false);
  };

  const triggerViolation = useCallback((reason = "Security Violation") => {
    if (stage !== "assessment" || isSubmittingRef.current) return;

    setViolationCount(prev => {
      const newCount = prev + 1;
      setShowViolationModal(true);

      if (newCount >= MAX_TAB_SWITCHES) {
        handleSubmitExam(true); // Terminate exam immediately on 3 violations
      }
      return newCount;
    });
  }, [stage, handleSubmitExam]);

  // Anti-cheat Listeners
  useEffect(() => {
    if (stage !== "assessment") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation("Tab Switch / Window Hidden");
      }
    };

    const handleWindowBlur = () => {
      triggerViolation("Window Blur / App Switch / External Screen Interaction");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && stage === "assessment") {
        triggerViolation("Fullscreen Exit");
      }
    };

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        triggerViolation("Cursor Left Assessment Viewport");
      }
    };

    const handleResize = () => {
      if (window.outerWidth < window.screen.availWidth * 0.75 || window.outerHeight < window.screen.availHeight * 0.75) {
        triggerViolation("Split-Screen / Window Resizing Detected");
      }
    };

    const checkMultiDisplay = () => {
      if (window.screen && window.screen.isExtended) {
        triggerViolation("Multiple Displays / Extended Monitor Detected");
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerViolation("Context Menu / Inspect Element Attempt");
    };

    const handleCopyPaste = (e) => {
      e.preventDefault();
      triggerViolation("Copy / Paste Attempt");
    };

    const handleKeyDown = (e) => {
      // Allow numerical 1-4 for option selection, ArrowLeft/Right for nav
      if (["1", "2", "3", "4"].includes(e.key)) {
        const optionIdx = parseInt(e.key, 10) - 1;
        if (questions[currentIndex]) {
          handleSelectOption(optionIdx);
        }
        return;
      }
      if (e.key === "ArrowRight") {
        handleNext();
        return;
      }
      if (e.key === "ArrowLeft") {
        handlePrev();
        return;
      }

      // Block all non-essential shortcuts and navigation keys
      if (
        e.key === "F12" ||
        e.key === "Tab" ||
        e.key === "Meta" ||
        e.key === "Alt" ||
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U")) ||
        (e.ctrlKey && (e.key === "c" || e.key === "C" || e.key === "v" || e.key === "V" || e.key === "x" || e.key === "X" || e.key === "a" || e.key === "A"))
      ) {
        e.preventDefault();
        triggerViolation(`Restricted System Input (${e.key})`);
      }
    };

    // Check display configuration on mount & interval
    checkMultiDisplay();
    const displayInterval = setInterval(checkMultiDisplay, 3000);

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("copy", handleCopyPaste);
    window.addEventListener("cut", handleCopyPaste);
    window.addEventListener("paste", handleCopyPaste);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(displayInterval);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("copy", handleCopyPaste);
      window.removeEventListener("cut", handleCopyPaste);
      window.removeEventListener("paste", handleCopyPaste);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [stage, triggerViolation, currentIndex, questions]);

  const handleSelectOption = (optionIndex) => {
    const qId = questions[currentIndex]._id;
    setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setVisited(prev => ({ ...prev, [questions[nextIdx]._id]: true }));
      setCurrentIndex(nextIdx);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setVisited(prev => ({ ...prev, [questions[prevIdx]._id]: true }));
      setCurrentIndex(prevIdx);
    }
  };

  const handleJump = (idx) => {
    setVisited(prev => ({ ...prev, [questions[idx]._id]: true }));
    setCurrentIndex(idx);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[85vh] text-slate-100 flex flex-col justify-center">
      {stage === "lobby" && (
        <ExamLobby
          user={user}
          skills={skills}
          setSkills={setSkills}
          onGenerateQuestions={handleGenerateQuestions}
          isGenerating={isGenerating}
        />
      )}

      {stage === "instructions" && (
        <ExamInstructions
          onStartExam={handleStartExam}
          webcamStream={webcamStream}
          setWebcamStream={setWebcamStream}
        />
      )}

      {stage === "assessment" && (
        <div className="max-w-6xl mx-auto py-6 px-4 w-full">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4 glass-card p-4 rounded-2xl border border-slate-800 shadow-lg w-full">
                <div className="font-mono text-sm tracking-widest text-slate-400 uppercase font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Proctored Examination
                </div>
                <div className="font-mono text-xl tracking-widest text-white font-black bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
                  {formatTime(timeLeft)}
                </div>
              </div>
              
              {questions.length > 0 && (
                <div className="flex-1">
                  <ExamQuestionView
                    question={questions[currentIndex]}
                    currentIndex={currentIndex}
                    totalQuestions={questions.length}
                    selectedOption={answers[questions[currentIndex]._id]}
                    onSelectOption={handleSelectOption}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onSubmit={handleManualSubmit}
                    user={user}
                  />
                </div>
              )}
            </div>

            <div className="w-full lg:w-80 space-y-6 shrink-0">
              <ExamWebcamWidget webcamStream={webcamStream} onViolation={triggerViolation} />
              <ExamPaletteWidget
                questions={questions}
                answers={answers}
                currentIndex={currentIndex}
                onJumpToQuestion={handleJump}
              />
            </div>
          </div>
        </div>
      )}

      {stage === "results" && (
        <ExamResultsView
          result={examResult}
          candidateName={user?.name}
          onReset={() => { window.location.href = "/student-dashboard"; }}
        />
      )}

      {stage === "completed_lock" && (
        <div className="max-w-xl mx-auto py-12 px-4 text-center">
          <div className="glass-card rounded-2xl p-10 shadow-2xl border border-blue-500/30 bg-blue-950/20 space-y-6">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-3xl shadow-inner border border-blue-500/20">
              🔒
            </div>
            <div>
              <span className="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-extrabold uppercase tracking-widest">
                Single Attempt Limit Reached
              </span>
              <h3 className="text-2xl font-black text-white mt-3 mb-2">
                Assessment Complete
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                You have already attempted your technical examination. Results are encoded to the recruiter pipeline. Retakes are strictly prohibited.
              </p>
            </div>

            <div className="py-4 px-6 rounded-xl bg-slate-900/60 border border-slate-800 inline-block">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block">Recorded Score</span>
              <span className="text-3xl font-black text-blue-400">{examResult?.score || 0}%</span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => { window.location.href = "/student-dashboard"; }}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition border border-blue-400/30 cursor-pointer uppercase tracking-wider"
              >
                Return to Candidate Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Unanswered Questions Block Modal ── */}
      {showIncompleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0c1222] border border-amber-500/40 text-white shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-black uppercase text-amber-400 tracking-tight">
                Incomplete Assessment
              </h3>
              <p className="text-xs text-gray-300 mt-2 font-mono leading-relaxed">
                You have <strong className="text-amber-300 text-sm font-bold">{questions.length - Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null).length}</strong> unanswered questions remaining out of {questions.length}.
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                You must attempt all questions before submitting your assessment.
              </p>
            </div>
            <button
              onClick={() => setShowIncompleteModal(false)}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg cursor-pointer"
            >
              ← Return &amp; Answer Questions
            </button>
          </div>
        </div>
      )}

      <ExamViolationModal
        isOpen={showViolationModal}
        violationCount={violationCount}
        maxViolations={MAX_TAB_SWITCHES}
        onDismiss={() => {
          setShowViolationModal(false);
          if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        }}
      />
    </div>
  );
}
