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

  // Ref to prevent duplicate submission execution
  const hasSubmittedRef = useRef(false);

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

  const handleSubmitExam = useCallback(async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    try {
      const payload = questions.map(q => ({
        questionId: q._id,
        answerIndex: answers[q._id] !== undefined ? answers[q._id] : null
      }));

      const { data } = await api.post("/api/exams/submit", { answers: payload });
      setExamResult(data);
      setShowViolationModal(false);
      setStage("results");

      // Stop webcam
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }

      // Exit fullscreen safely
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (err) { }
      }

      // Clear autosave
      sessionStorage.removeItem("exam_answers");
      sessionStorage.removeItem("exam_visited");
      sessionStorage.removeItem("exam_currentIndex");
      sessionStorage.removeItem("exam_timeLeft");

    } catch (err) {
      console.error("[ExamSubmit] Error:", err);
      setExamError(err.response?.data?.message || "Failed to submit exam. Please try again.");
      hasSubmittedRef.current = false;
    }
  }, [questions, answers, webcamStream]);

  // Timer Effect & Autosave
  useEffect(() => {
    if (stage === "assessment" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          sessionStorage.setItem("exam_timeLeft", newTime);
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (stage === "assessment" && timeLeft <= 0) {
      handleSubmitExam();
    }
  }, [stage, timeLeft, handleSubmitExam]);

  // Persist answers, visited, and index
  useEffect(() => {
    sessionStorage.setItem("exam_answers", JSON.stringify(answers));
  }, [answers]);
  useEffect(() => {
    sessionStorage.setItem("exam_visited", JSON.stringify(visited));
  }, [visited]);
  useEffect(() => {
    sessionStorage.setItem("exam_currentIndex", currentIndex);
  }, [currentIndex]);

  // Anti-cheat Listeners
  useEffect(() => {
    if (stage !== "assessment") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        triggerViolation();
      }
    };

    const triggerViolation = () => {
      setViolationCount(prev => {
        const newCount = prev + 1;
        if (newCount >= MAX_TAB_SWITCHES) {
          setShowViolationModal(false);
          setTimeout(() => {
            handleSubmitExam();
          }, 0);
        } else {
          setShowViolationModal(true);
        }
        return newCount;
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [stage, handleSubmitExam]);

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
            document.documentElement.requestFullscreen().catch(() => { });
          }
        }}
      />
    </div>
  );
}
