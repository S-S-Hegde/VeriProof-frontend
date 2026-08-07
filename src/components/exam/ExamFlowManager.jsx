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
  
  // Handlers
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const { data } = await api.get("/api/exams/start");
      setQuestions(data);
      if (data.length > 0) {
        setVisited({ [data[0]._id]: true });
      }
      setStage("instructions");
    } catch (err) {
      console.error(err);
      setExamError("Failed to generate questions. Please try again.");
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

  const handleSubmitExam = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setStage("results");

    try {
      const payload = questions.map(q => ({
        questionId: q._id,
        answerIndex: answers[q._id] !== undefined ? answers[q._id] : null
      }));
      
      const { data } = await api.post("/api/exams/submit", { answers: payload });
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
      
    } catch (err) {
      console.error("[ExamSubmit] Error:", err);
      setExamError(err.response?.data?.message || "Failed to submit exam. Please try again.");
    }
  }, [questions, answers, webcamStream]);

  const triggerViolation = useCallback((reason = "Security Violation") => {
    if (stage !== "assessment" || isSubmittingRef.current) return;

    setViolationCount(prev => {
      const newCount = prev + 1;
      setShowViolationModal(true);

      if (newCount >= MAX_TAB_SWITCHES) {
        handleSubmitExam();
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
                    onSubmit={handleSubmitExam}
                    user={user}
                  />
                </div>
              )}
            </div>

            <div className="w-full lg:w-80 space-y-6 shrink-0">
              <ExamWebcamWidget webcamStream={webcamStream} />
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
          onReset={() => window.location.reload()}
        />
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
