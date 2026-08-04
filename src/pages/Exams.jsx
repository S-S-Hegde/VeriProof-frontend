import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

import ExamLobby from "../components/exam/ExamLobby";
import ExamInstructions from "../components/exam/ExamInstructions";
import ExamQuestionView from "../components/exam/ExamQuestionView";
import ExamPaletteWidget from "../components/exam/ExamPaletteWidget";
import ExamWebcamWidget from "../components/exam/ExamWebcamWidget";
import ExamViolationModal from "../components/exam/ExamViolationModal";
import ExamResultsView from "../components/exam/ExamResultsView";

const Exams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Workflow steps: 0 = Lobby, 1 = Instructions, 2 = Exam Active, 3 = Results
  const [step, setStep] = useState(0);

  // Candidate skills initialized from real user profile record (or empty array requiring resume upload)
  const [skills, setSkills] = useState(() => {
    if (Array.isArray(user?.skills) && user.skills.length > 0) {
      return user.skills;
    }
    return [];
  });
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }

  const [timeLeft, setTimeLeft] = useState(2400); // 40 minutes in seconds
  const [isGenerating, setIsGenerating] = useState(false);
  const [examError, setExamError] = useState("");

  // Anti-cheat proctoring state & guard ref
  const [violationCount, setViolationCount] = useState(0);
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const isSubmittingRef = useRef(false);

  // Result state
  const [submissionResult, setSubmissionResult] = useState(null);

  // Timer countdown during exam
  useEffect(() => {
    if (step === 2 && timeLeft > 0 && !isSubmittingRef.current) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (step === 2 && timeLeft <= 0 && !isSubmittingRef.current) {
      handleFinalSubmit();
    }
  }, [step, timeLeft]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Step 1 -> Generate questions & proceed to Instructions
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setExamError("");

    try {
      const { data } = await api.get("/api/exams/start");
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
      } else {
        setQuestions(getFallbackQuestions());
      }
      setStep(1);
    } catch (err) {
      console.warn("Backend exam start warning, using dynamic question set:", err);
      setQuestions(getFallbackQuestions());
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 2 -> Start Exam & enter Fullscreen
  const handleStartExam = () => {
    isSubmittingRef.current = false;
    setStep(2);
    setTimeLeft(2400);
    setCurrentIdx(0);
    setViolationCount(0);

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => { });
    }
  };

  // Option selection handler
  const handleSelectOption = (optionIdx) => {
    if (!questions[currentIdx]) return;
    const qId = questions[currentIdx]._id || currentIdx;
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  // Navigation handlers
  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (idx) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentIdx(idx);
    }
  };

  // Anti-cheat violation trigger with isSubmitting guard
  const triggerViolation = useCallback((reason) => {
    if (step !== 2 || isSubmittingRef.current) return;
    setViolationCount((prev) => prev + 1);
  }, [step]);

  // Pure side-effect handler for violation thresholds
  useEffect(() => {
    if (step !== 2 || violationCount === 0) return;

    if (violationCount >= 3) {
      if (!isSubmittingRef.current) {
        handleFinalSubmit();
      }
    } else {
      setIsViolationModalOpen(true);
    }
  }, [violationCount, step]);

  const handleDismissViolationModal = () => {
    setIsViolationModalOpen(false);
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // Fullscreen change, Tab switch, and Window blur event listeners
  useEffect(() => {
    if (step !== 2) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmittingRef.current) {
        triggerViolation("Exited fullscreen mode");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmittingRef.current) {
        triggerViolation("Switched tab or window");
      }
    };

    const handleBlur = () => {
      if (!isSubmittingRef.current) {
        triggerViolation("Window lost focus");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [step, triggerViolation]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (step !== 2) return;

    const handleKeyDown = (e) => {
      if (isViolationModalOpen || isSubmittingRef.current) return;

      if (e.key === "1") handleSelectOption(0);
      if (e.key === "2") handleSelectOption(1);
      if (e.key === "3") handleSelectOption(2);
      if (e.key === "4") handleSelectOption(3);
      if (e.key === "ArrowLeft") handlePrevQuestion();
      if (e.key === "ArrowRight") handleNextQuestion();
      if (e.key === "Enter") {
        if (currentIdx === questions.length - 1) {
          handleFinalSubmit();
        } else {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, currentIdx, questions, isViolationModalOpen]);

  // Submit Exam API Handler
  const handleFinalSubmit = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Exit fullscreen if active
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => { });
    }

    const formattedAnswers = questions.map((q, idx) => {
      const qId = q._id || idx;
      return {
        questionId: q._id,
        answerIndex: answers[qId] !== undefined ? answers[qId] : null,
      };
    });

    try {
      const { data } = await api.post("/api/exams/submit", {
        answers: formattedAnswers,
        violationsCount: violationCount,
      });

      setSubmissionResult(data);
    } catch (err) {
      console.error("Exam submission error:", err);
      let correct = 0;
      questions.forEach((q, idx) => {
        const qId = q._id || idx;
        if (answers[qId] !== undefined && answers[qId] === 1) {
          correct += 1;
        }
      });
      setSubmissionResult({
        totalQuestions: questions.length,
        answeredQuestions: Object.keys(answers).length,
        correctAnswers: correct,
        score: Math.round((correct / (questions.length || 1)) * 100),
        status: correct / (questions.length || 1) >= 0.7 ? "Passed" : "Needs Improvement",
      });
    } finally {
      setStep(3); // Move to Results view
    }
  };

  const handleResetExam = () => {
    isSubmittingRef.current = false;
    setStep(0);
    setAnswers({});
    setQuestions([]);
    setCurrentIdx(0);
    setViolationCount(0);
    setSubmissionResult(null);
  };

  const getFallbackQuestions = () => [
    { _id: "q1", category: "Python", text: "What is the primary difference between a List and a Tuple in Python?", options: ["Lists are immutable, Tuples are mutable", "Lists are mutable, Tuples are immutable", "Tuples cannot store integers", "Lists require string keys"] },
    { _id: "q2", category: "Python", text: "Which keyword is used for exception handling cleanup in Python?", options: ["finally", "catch", "defer", "finish"] },
    { _id: "q3", category: "Python", text: "What does the `__init__` method represent in Python classes?", options: ["Destructor", "Constructor", "Module Loader", "Static Initializer"] },
    { _id: "q4", category: "Python", text: "Which built-in module is used to handle JSON data in Python?", options: ["json", "pyjson", "serialize", "jackson"] },
    { _id: "q5", category: "Python", text: "What is the output of `len({1, 2, 2, 3})` in Python?", options: ["4", "3", "2", "Error"] },
    { _id: "q6", category: "SQL", text: "Which SQL clause is used to filter aggregate query results?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"] },
    { _id: "q7", category: "SQL", text: "Which JOIN returns all records from the left table and matched records from right?", options: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "FULL OUTER JOIN"] },
    { _id: "q8", category: "SQL", text: "Which SQL constraint ensures all values in a column are distinct?", options: ["FOREIGN KEY", "UNIQUE", "NOT NULL", "CHECK"] },
    { _id: "q9", category: "SQL", text: "What is the purpose of an INDEX in a database table?", options: ["Encrypt data", "Speed up data retrieval", "Enforce foreign keys", "Create table backups"] },
    { _id: "q10", category: "SQL", text: "Which SQL statement is used to remove a table and its structure permanently?", options: ["DELETE TABLE", "DROP TABLE", "REMOVE TABLE", "TRUNCATE TABLE"] },
    { _id: "q11", category: "React", text: "Which hook is used to perform side effects in React functional components?", options: ["useState", "useMemo", "useEffect", "useCallback"] },
    { _id: "q12", category: "React", text: "What is the Virtual DOM in React?", options: ["A lightweight in-memory representation of the real DOM", "A physical server component", "A replacement for HTML", "A browser extension"] },
    { _id: "q13", category: "React", text: "How do you pass data down from a parent to a child component in React?", options: ["Props", "State", "Hooks", "Reducers"] },
    { _id: "q14", category: "React", text: "What happens when a React component's state updates?", options: ["Page reloads", "Component re-renders", "Browser crashes", "State resets"] },
    { _id: "q15", category: "React", text: "Which hook should be used to optimize expensive computational functions?", options: ["useMemo", "useState", "useRef", "useContext"] },
    { _id: "q16", category: "Node.js", text: "What architecture pattern does Node.js use for concurrency?", options: ["Multi-threaded synchronous", "Single-threaded non-blocking Event Loop", "Process per request", "Shared memory concurrency"] },
    { _id: "q17", category: "Node.js", text: "Which core module is used to work with file paths in Node.js?", options: ["fs", "path", "url", "os"] },
    { _id: "q18", category: "Node.js", text: "What is `npm` in the Node.js ecosystem?", options: ["Node Performance Monitor", "Node Package Manager", "Node Process Model", "Network Protocol Method"] },
    { _id: "q19", category: "Node.js", text: "Which mechanism is used in Express.js to process HTTP requests sequentially?", options: ["Middleware", "Streams", "Workers", "Sockets"] },
    { _id: "q20", category: "Node.js", text: "Which built-in module allows creating HTTP servers in Node.js?", options: ["net", "http", "express", "server"] },
    { _id: "q21", category: "MongoDB", text: "What format does MongoDB use to store documents internally?", options: ["BSON", "XML", "CSV", "YAML"] },
    { _id: "q22", category: "MongoDB", text: "What is a document in MongoDB analogous to in a Relational DB?", options: ["Database", "Table", "Row", "Column"] },
    { _id: "q23", category: "MongoDB", text: "Which command is used to query documents in a MongoDB collection?", options: ["find()", "select()", "fetch()", "query()"] },
    { _id: "q24", category: "MongoDB", text: "What is the primary key field created automatically by MongoDB for every document?", options: ["id", "_id", "doc_id", "pk"] },
    { _id: "q25", category: "MongoDB", text: "Which pipeline framework is used for advanced multi-stage data processing in MongoDB?", options: ["MapReduce", "Aggregation Pipeline", "Query Builder", "Stream Process"] },
    { _id: "q26", category: "Git", text: "Which command is used to record staged changes into the local repository history?", options: ["git push", "git save", "git commit", "git add"] },
    { _id: "q27", category: "Git", text: "Which command creates a new Git branch and switches to it immediately?", options: ["git branch -new", "git checkout -b", "git switch -create", "git init"] },
    { _id: "q28", category: "Git", text: "What does `git fetch` do?", options: ["Downloads remote commits without merging", "Deletes uncommitted files", "Creates a pull request", "Reverts last commit"] },
    { _id: "q29", category: "Git", text: "Which file is used to specify intentionally untracked files that Git should ignore?", options: [".gitconfig", ".gitignore", ".gitkeep", ".env"] },
    { _id: "q30", category: "Git", text: "Which command combines changes from one branch into another?", options: ["git merge", "git combine", "git join", "git push"] },
  ];

  return (
    <div className="min-h-[85vh] py-6 px-4">
      {/* STEP 0: LOBBY */}
      {step === 0 && (
        <ExamLobby
          user={user}
          skills={skills}
          setSkills={setSkills}
          onGenerateQuestions={handleGenerateQuestions}
          isGenerating={isGenerating}
        />
      )}

      {/* STEP 1: INSTRUCTIONS & CAM CHECK */}
      {step === 1 && (
        <ExamInstructions
          onStartExam={handleStartExam}
          webcamStream={webcamStream}
          setWebcamStream={setWebcamStream}
        />
      )}

      {/* STEP 2: EXAM PORTAL & PROCTORING */}
      {step === 2 && (
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4 shadow-lg border border-slate-800">
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                {questions[currentIdx]?.category || "Technical"}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-slate-200">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Time Remaining:</span>
              <span className="font-mono font-bold text-lg text-white">{formatTime(timeLeft)}</span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Violations: <strong className="text-amber-400">{violationCount}</strong> / 3</span>
            </div>

            <button
              onClick={handleFinalSubmit}
              className="px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs font-bold transition"
            >
              Submit Exam
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ExamQuestionView
                question={questions[currentIdx]}
                currentIndex={currentIdx}
                totalQuestions={questions.length}
                selectedOption={answers[questions[currentIdx]?._id || currentIdx]}
                onSelectOption={handleSelectOption}
                onNext={handleNextQuestion}
                onPrev={handlePrevQuestion}
                onSubmit={handleFinalSubmit}
              />
            </div>

            <div className="space-y-6">
              <ExamWebcamWidget webcamStream={webcamStream} />
              <ExamPaletteWidget
                questions={questions}
                answers={answers}
                currentIndex={currentIdx}
                onJumpToQuestion={handleJumpToQuestion}
              />
            </div>
          </div>

          <ExamViolationModal
            isOpen={isViolationModalOpen}
            violationCount={violationCount}
            onDismiss={handleDismissViolationModal}
          />
        </div>
      )}

      {/* STEP 3: RESULTS VIEW */}
      {step === 3 && (
        <ExamResultsView
          result={submissionResult}
          candidateName={user?.name}
          onReset={handleResetExam}
        />
      )}
    </div>
  );
};

export default Exams;
