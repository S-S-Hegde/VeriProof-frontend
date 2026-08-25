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
import { AlertTriangle, Eye, ShieldAlert, AlertOctagon, Flame, Activity } from "lucide-react";

// Maximum allowable strikes before immediate automatic exam termination
const MAX_TAB_SWITCHES = 3;

export default function ExamFlowManager() {
  const { user } = useAuth();
  const [stage, setStage] = useState("lobby"); // 'lobby', 'instructions', 'assessment', 'results', 'completed_lock'
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
  const [violationReason, setViolationReason] = useState("");
  const [violationsLog, setViolationsLog] = useState([]);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // Big On-Screen Webpage Alerts & 7-Second Eye Countdown HUD
  const [activeBannerWarning, setActiveBannerWarning] = useState("");
  const [eyeOffSeconds, setEyeOffSeconds] = useState(7);
  const [isEyeOffScreen, setIsEyeOffScreen] = useState(false);

  const eyeOffTimerRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Core Submission Handler (Enforces instant submission on termination)
  const handleSubmitExam = useCallback(async (isTerminated = false, overrideCount = null, overrideLogs = null) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setStage("results");

    const finalCount = overrideCount !== null ? overrideCount : violationCount;
    const finalLogs = overrideLogs !== null ? overrideLogs : violationsLog;
    const calculatedIntegrity = isTerminated ? 0 : Math.max(0, 100 - (finalCount * 25));

    try {
      const payload = questions.map((q) => ({
        questionId: q._id,
        answerIndex: answers[q._id] !== undefined ? answers[q._id] : null,
      }));

      const { data } = await api.post("/api/exams/submit", {
        answers: payload,
        isTerminated: Boolean(isTerminated || finalCount >= MAX_TAB_SWITCHES),
        violationCount: finalCount,
        violations: finalLogs,
        integrityScore: calculatedIntegrity,
      });

      setExamResult(data);

      // Stop webcam
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
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

      if (isTerminated || finalCount >= MAX_TAB_SWITCHES) {
        setTimeout(() => {
          window.location.href = "/student-dashboard";
        }, 3500);
      }
    } catch (err) {
      console.error("[ExamSubmit] Error:", err);
      setExamError(err.response?.data?.message || "Failed to submit exam. Please try again.");
    }
  }, [questions, answers, webcamStream, violationCount, violationsLog]);

  // Security Violation Handler: Automatically terminates and submits when strikes >= 3
  const triggerViolation = useCallback((reason = "Security Violation") => {
    if (stage !== "assessment" || isSubmittingRef.current) return;

    setViolationReason(reason);
    setActiveBannerWarning(reason);

    setViolationCount((prev) => {
      const newCount = prev + 1;
      const newEntry = {
        reason,
        timestamp: new Date().toISOString(),
        strikeNumber: newCount,
      };

      setViolationsLog((vPrev) => {
        const updatedLogs = [...vPrev, newEntry];

        // 🚨 HARD ENFORCEMENT: If strikes >= 3, IMMEDIATELY terminate & submit the exam!
        if (newCount >= MAX_TAB_SWITCHES) {
          setShowViolationModal(true);
          handleSubmitExam(true, newCount, updatedLogs);
        }
        return updatedLogs;
      });

      setShowViolationModal(true);
      return newCount;
    });

    // Auto-clear banner after 8 seconds
    setTimeout(() => {
      setActiveBannerWarning("");
    }, 8000);
  }, [stage, handleSubmitExam]);

  const lastViolationTriggerRef = useRef(0);

  // Real-time AI Telemetry Receiver (Eye tracking, Head Pose, YOLO objects, Multi-face)
  const handleTelemetryUpdate = useCallback((telemetry) => {
    if (stage !== "assessment" || isSubmittingRef.current || !telemetry) return;

    const now = Date.now();
    const canTrigger = (now - lastViolationTriggerRef.current) > 3000;

    // 1. Direct Optical Violations: Phone / Electronic Device
    if (telemetry.phone_detected || (telemetry.active_warnings && telemetry.active_warnings.some(w => w.includes("PHONE")))) {
      if (canTrigger) {
        lastViolationTriggerRef.current = now;
        triggerViolation("Mobile Phone / Electronic Device Detected in Camera View");
      }
      return;
    }

    // 2. Direct Optical Violations: Multiple Faces / Secondary Person
    const faces = telemetry.face_count !== undefined ? telemetry.face_count : (telemetry.faces_count || 0);
    if (faces > 1 || (telemetry.active_warnings && telemetry.active_warnings.some(w => w.includes("MULTIPLE")))) {
      if (canTrigger) {
        lastViolationTriggerRef.current = now;
        triggerViolation(`Multiple People Detected (${faces} faces in camera frame)`);
      }
      return;
    }

    // 3. Direct Optical Violations: Book / Unauthorized Material
    if (telemetry.book_detected || (telemetry.active_warnings && telemetry.active_warnings.some(w => w.includes("BOOK")))) {
      if (canTrigger) {
        lastViolationTriggerRef.current = now;
        triggerViolation("Prohibited Book / Reference Material Detected in Workspace");
      }
      return;
    }

    // 4. Eyes Off-Screen / Head Pose Deviation
    const eyesAway = Boolean(telemetry.gaze_violation || (telemetry.yaw_dev && Math.abs(telemetry.yaw_dev) > 25));

    if (eyesAway) {
      setIsEyeOffScreen(true);
      if (!eyeOffTimerRef.current) {
        let remaining = 7;
        setEyeOffSeconds(remaining);

        eyeOffTimerRef.current = setInterval(() => {
          remaining -= 1;
          setEyeOffSeconds(remaining);

          if (remaining <= 0) {
            clearInterval(eyeOffTimerRef.current);
            eyeOffTimerRef.current = null;
            setIsEyeOffScreen(false);
            setEyeOffSeconds(7);
            triggerViolation("Eyes / Head turned away from screen for > 7 continuous seconds");
          }
        }, 1000);
      }
    } else {
      // Candidate looked back at screen! Reset timer cleanly
      if (eyeOffTimerRef.current) {
        clearInterval(eyeOffTimerRef.current);
        eyeOffTimerRef.current = null;
      }
      setIsEyeOffScreen(false);
      setEyeOffSeconds(7);
    }
  }, [stage, triggerViolation]);

  // Strict Validation: Candidate cannot submit unless all questions are attempted
  const handleManualSubmit = useCallback(() => {
    const answeredCount = Object.keys(answers).filter(
      (k) => answers[k] !== undefined && answers[k] !== null
    ).length;
    const unanswered = questions.length - answeredCount;

    if (unanswered > 0) {
      setShowIncompleteModal(true);
      return;
    }

    handleSubmitExam(false);
  }, [answers, questions.length, handleSubmitExam]);

  // Navigation & Option Selection Handlers
  const handleSelectOption = useCallback((optionIndex) => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex]._id;
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  }, [questions, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setVisited((prev) => ({ ...prev, [questions[nextIdx]._id]: true }));
      setCurrentIndex(nextIdx);
    }
  }, [currentIndex, questions]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setVisited((prev) => ({ ...prev, [questions[prevIdx]._id]: true }));
      setCurrentIndex(prevIdx);
    }
  }, [currentIndex, questions]);

  const handleJump = useCallback((idx) => {
    if (questions[idx]) {
      setVisited((prev) => ({ ...prev, [questions[idx]._id]: true }));
      setCurrentIndex(idx);
    }
  }, [questions]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Generate Questions Handler
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
        setExamResult({ score: err.response?.data?.score || 0, isTerminated: true, integrityScore: 0 });
        setStage("completed_lock");
        return;
      }
      setExamError(err.response?.data?.message || "Failed to load examination blueprint.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Start Exam & Request Fullscreen
  const handleStartExam = async () => {
    setStage("assessment");
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.warn("Fullscreen request denied", err);
      }
    }
  };

  // Active 1-Second Exam Countdown Timer (40 Minutes)
  useEffect(() => {
    if (stage !== "assessment") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
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

  // Anti-cheat Listeners (Browser & OS lockdowns)
  useEffect(() => {
    if (stage !== "assessment") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation("Tab Switch / Window Minimized");
      }
    };

    const handleWindowBlur = () => {
      triggerViolation("Window Unfocused / Switched Application");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && stage === "assessment") {
        triggerViolation("Exited Fullscreen Mode");
      }
    };

    const handleCopyPaste = (e) => {
      e.preventDefault();
      triggerViolation("Clipboard Copy / Paste Attempt");
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerViolation("Right-Click / Inspect Attempt");
    };

    const handleKeyDown = (e) => {
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

      if (
        e.key === "F12" ||
        e.key === "Tab" ||
        e.key === "Meta" ||
        e.key === "Alt" ||
        e.key === "PrintScreen" ||
        (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "u"))
      ) {
        e.preventDefault();
        triggerViolation(`Restricted Shortcut Key (${e.key})`);
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("copy", handleCopyPaste);
    window.addEventListener("paste", handleCopyPaste);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("copy", handleCopyPaste);
      window.removeEventListener("paste", handleCopyPaste);
      window.removeEventListener("keydown", handleKeyDown);
      if (eyeOffTimerRef.current) clearInterval(eyeOffTimerRef.current);
    };
  }, [stage, triggerViolation, currentIndex, questions, handleSelectOption, handleNext, handlePrev]);

  return (
    <div className="min-h-[85vh] text-slate-100 flex flex-col justify-center relative">
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
        <div className="max-w-6xl mx-auto py-6 px-4 w-full relative">
          {/* 🚨 1. BIG ON-SCREEN WARNING BANNER (TOP OF WEBPAGE) */}
          {activeBannerWarning && (
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-900/90 to-rose-950/90 border-2 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)] backdrop-blur-md flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                  <AlertOctagon className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wide">
                    PROCTORING SECURITY WARNING
                  </h4>
                  <p className="text-xs font-semibold text-rose-200">{activeBannerWarning}</p>
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-lg bg-rose-900/80 border border-rose-500/50 font-mono text-xs font-black text-rose-300">
                STRIKE {violationCount} / {MAX_TAB_SWITCHES}
              </div>
            </div>
          )}

          {/* 👁️ 2. BIG 7-SECOND EYE GAZE & HEAD TURN COUNTDOWN HUD */}
          {isEyeOffScreen && (
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/90 via-orange-950/90 to-amber-950/90 border-2 border-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.4)] backdrop-blur-md flex items-center justify-between animate-bounce">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <Eye className="w-7 h-7 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-black text-amber-200 uppercase tracking-wide">
                    ⚠️ ATTENTION: EYES / HEAD TURNED OFF-SCREEN!
                  </h4>
                  <p className="text-xs text-amber-300">
                    Refocus on your examination screen immediately to avoid a violation strike.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-amber-900/80 px-4 py-2 rounded-xl border border-amber-400">
                <span className="text-xs uppercase font-mono font-bold text-amber-300">Strike In:</span>
                <span className="text-2xl font-black font-mono text-white tracking-widest">
                  00:0{eyeOffSeconds}s
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4 glass-card p-4 rounded-2xl border border-slate-800 shadow-lg w-full">
                <div className="font-mono text-sm tracking-widest text-slate-400 uppercase font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Proctored Examination
                </div>
                <div className="flex items-center space-x-4">
                  <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-400">
                    Strikes: <b className={violationCount > 0 ? "text-rose-400" : "text-emerald-400"}>{violationCount}/{MAX_TAB_SWITCHES}</b>
                  </div>
                  <div className="font-mono text-xl tracking-widest text-white font-black bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
                    {formatTime(timeLeft)}
                  </div>
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
              <ExamWebcamWidget
                webcamStream={webcamStream}
                onViolation={triggerViolation}
                onTelemetryUpdate={handleTelemetryUpdate}
              />
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

      {/* Violation Popup Modal */}
      <ExamViolationModal
        isOpen={showViolationModal}
        violationCount={violationCount}
        maxViolations={MAX_TAB_SWITCHES}
        violationReason={violationReason}
        onDismiss={() => {
          setShowViolationModal(false);
          if (violationCount >= MAX_TAB_SWITCHES) {
            handleSubmitExam(true);
          }
        }}
      />
    </div>
  );
}
