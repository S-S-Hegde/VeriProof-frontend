import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  Loader2, CheckCircle, Sparkles, AlertCircle, XCircle
} from "lucide-react";

export default function CandidateProcessingCenter({ onComplete, initialFileName = "" }) {
  const { user, setUser } = useAuth();
  const [analysisState, setAnalysisState] = useState(null);
  const [githubState, setGithubState] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);
  const [displayProgress, setDisplayProgress] = useState(15);
  const [isAnalyzedGlobal, setIsAnalyzedGlobal] = useState(false);
  
  const pollingRef = useRef(null);
  const completionHandledRef = useRef(false);
  const latestProfileRef = useRef(null);
  const consecutiveErrorsRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  // Poll pipeline status
  useEffect(() => {
    let isMounted = true;
    startTimeRef.current = Date.now();
    consecutiveErrorsRef.current = 0;

    const pollPipeline = async () => {
      try {
        let resAnalysis = null;
        let ghStatus = null;
        let profileRes = null;
        let fatalError = null;

        // 1. Fetch granular resume analysis status
        try {
          resAnalysis = await api.get("/api/users/profile/resume-analysis");
          consecutiveErrorsRef.current = 0;
        } catch (err) {
          const status = err.response?.status;
          if (status >= 500) {
            fatalError = err.response?.data?.message || `Server error (${status}) during resume analysis.`;
          } else if (status === 401 || status === 403) {
            fatalError = "Session expired or unauthorized. Please log in again.";
          } else if (!err.response) {
            consecutiveErrorsRef.current += 1;
            if (consecutiveErrorsRef.current >= 4) {
              fatalError = "Network connection lost. Unable to reach verification servers.";
            }
          }
        }

        // 2. Fetch global profile status
        try {
          profileRes = await api.get("/api/users/profile");
          consecutiveErrorsRef.current = 0;
        } catch (err) {
          const status = err.response?.status;
          if (status >= 500 && !fatalError) {
            fatalError = err.response?.data?.message || `Server error (${status}) fetching candidate profile.`;
          }
        }

        // 3. Fetch GitHub analysis status (non-critical, fail-soft)
        try {
          ghStatus = await api.get("/api/github/status");
        } catch (_) {}

        if (!isMounted) return;

        // Surface fatal network or 500 server error and halt polling
        if (fatalError) {
          setError(fatalError);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          return;
        }

        // Check for explicit backend error or failure status
        const isResumeFailed = resAnalysis?.data?.status === "Analysis Failed" || 
                               resAnalysis?.data?.status === "Failed" || 
                               resAnalysis?.data?.status === "Email Mismatch";

        if (isResumeFailed || resAnalysis?.data?.error) {
          setError(resAnalysis?.data?.error || "Resume processing encountered an error.");
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          return;
        }

        // Guard against runaway polling (> 60 seconds without terminal state)
        if (Date.now() - startTimeRef.current > 60000) {
          setError("Resume analysis is taking longer than expected. Please verify on your dashboard or try again.");
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          return;
        }

        if (profileRes?.data) {
          latestProfileRef.current = profileRes.data;
        }
        if (ghStatus?.data) {
          setGithubState(ghStatus.data);
        }

        // Explicit verification: only consider complete when valid payload is received
        const hasValidProfile = Boolean(profileRes?.data && typeof profileRes.data === "object");
        const hasValidAnalysis = Boolean(resAnalysis?.data && typeof resAnalysis.data === "object");

        const isUserAnalyzed = hasValidProfile && (
          profileRes.data.resumeStatus === "Analyzed" ||
          profileRes.data.resumeStatus === "Verified" ||
          profileRes.data.workflowState?.hasResume === true ||
          ["repository_analysis", "technical_assessment", "verification_complete"].includes(profileRes.data.pipelineStage)
        );

        const isAnalysisComplete = hasValidAnalysis && (
          resAnalysis.data.status === "Analysis Complete" || 
          resAnalysis.data.status === "Completed" || 
          (Number(resAnalysis.data.progress) >= 100)
        );

        const isResumeDone = isUserAnalyzed || isAnalysisComplete;

        if (isResumeDone) {
          setIsAnalyzedGlobal(true);

          // Force analysisState to full completion with valid payload data
          setAnalysisState((prev) => {
            const incoming = resAnalysis?.data || {};
            return {
              ...prev,
              ...incoming,
              status: "Analysis Complete",
              progress: 100,
              stage: incoming.stage || "Ready",
              claims: incoming.claims || prev?.claims || { skills: [] },
            };
          });

          // Synchronize global AuthContext immediately
          if (profileRes?.data) {
            setUser((prev) => ({
              ...prev,
              resumeStatus: profileRes.data.resumeStatus || "Analyzed",
              workflowState: profileRes.data.workflowState || prev?.workflowState,
              githubUsername: profileRes.data.githubUsername || prev?.githubUsername,
              pipelineStage: profileRes.data.pipelineStage || prev?.pipelineStage,
            }));
          }

          // Verified complete; halt further polling
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        } else {
          if (resAnalysis?.data) {
            setAnalysisState(resAnalysis.data);
          }
        }
      } catch (err) {
        console.error("[Processing Center] Unexpected polling error:", err);
      }
    };

    // Immediate first check + tight polling
    pollPipeline();
    pollingRef.current = setInterval(pollPipeline, 500);

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [setUser]);

  // Determine failure and completion statuses
  const isFailed = Boolean(error || analysisState?.status === "Email Mismatch" || analysisState?.status === "Analysis Failed" || analysisState?.status === "Failed");
  const isResumeDone = !isFailed && (
    isAnalyzedGlobal ||
    analysisState?.status === "Analysis Complete" || 
    analysisState?.status === "Completed" || 
    (analysisState?.progress !== undefined && Number(analysisState.progress) >= 100) ||
    isFinished
  );

  const claimsCount = analysisState?.claims?.skills?.length || 0;
  const hasGithub = Boolean(githubState?.githubUsername || user?.githubUsername);
  const isGhRunning = !isFailed && hasGithub && githubState?.status === "running";

  // Calculate target progress: strictly 100% only on validated success, 0% on failure
  let targetProgress = 15;
  if (isFailed) {
    targetProgress = 0;
  } else if (isResumeDone || isFinished) {
    targetProgress = 100;
  } else {
    const rawProgress = analysisState?.progress !== undefined ? analysisState.progress : 15;
    targetProgress = Math.max(15, Math.min(95, rawProgress));
  }

  // Smooth interpolation toward targetProgress
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayProgress((prev) => {
        if (isFailed) return 0;
        if (prev < targetProgress) {
          // Accelerate transition if completing to 100%
          const step = targetProgress === 100 ? Math.max(6, Math.ceil((100 - prev) / 4)) : 5;
          return Math.min(targetProgress, prev + step);
        }
        if (prev > targetProgress) return targetProgress;
        return prev;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [targetProgress, isFailed]);

  // Trigger completion once display reaches 100%
  useEffect(() => {
    if (isResumeDone && displayProgress >= 100 && !completionHandledRef.current) {
      completionHandledRef.current = true;
      setIsFinished(true);

      const finalize = async () => {
        try {
          const projectsRes = await api.get("/api/projects/myprojects").catch(() => ({ data: [] }));
          
          setTimeout(() => {
            if (onComplete) {
              onComplete({
                profileData: latestProfileRef.current || {},
                projects: projectsRes.data || [],
              });
            }
          }, 700);
        } catch (err) {
          console.error("[Processing Center] Finalization error:", err);
          if (onComplete) onComplete();
        }
      };

      finalize();
    }
  }, [isResumeDone, displayProgress, onComplete]);

  // Stages definition
  const STAGES = [
    { key: "upload", label: `Uploading Resume ${initialFileName ? `(${initialFileName})` : ""}`, done: true, failed: false },
    { key: "parsing", label: "Parsing Resume PDF", done: isResumeDone || (!isFailed && displayProgress >= 30), active: !isFailed && !isResumeDone && displayProgress < 30, failed: isFailed },
    { key: "claims", label: `Extracting Claims ${claimsCount > 0 ? `(${claimsCount} Found)` : ""}`, done: isResumeDone || (!isFailed && displayProgress >= 60), active: !isFailed && !isResumeDone && displayProgress >= 30 && displayProgress < 60, failed: false },
    { key: "skills", label: "Building Skill Tree", done: isResumeDone || (!isFailed && displayProgress >= 85), active: !isFailed && !isResumeDone && displayProgress >= 60 && displayProgress < 85, failed: false },
    { key: "github", label: "GitHub Repository Analysis", done: isFinished || isResumeDone || githubState?.status === "complete" || !hasGithub, active: isGhRunning && !isResumeDone, failed: false },
    { key: "complete", label: "Candidate Profile Synchronization", done: isFinished || displayProgress >= 100, active: !isFailed && !isFinished && displayProgress >= 85 && displayProgress < 100, failed: false },
  ];

  return (
    <div className="p-1 sm:p-2 flex flex-col items-center justify-center text-center max-w-lg w-full mx-auto">
      {/* ── Circular Orbital Loading Ring ── */}
      <div className="relative mb-3 flex items-center justify-center">
        {/* Ambient Pulsing Glow Aura */}
        <div className={`absolute -inset-1.5 ${isFailed ? "bg-red-500/20" : "bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-cyan-500/20"} rounded-full blur-lg animate-pulse pointer-events-none`} />

        {/* Continuous Rotating Outer Track */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full relative flex items-center justify-center">
          {/* Background Rotating Dash Ring */}
          {!isFinished && !isFailed && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30"
            />
          )}

          {/* SVG Progress & Spinner Arc */}
          <div className="relative w-full h-full">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="cyberProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>

              {/* Base Track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={isFailed ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.08)"}
                strokeWidth="6"
                fill="transparent"
              />

              {/* Accurate Progress Arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={isFailed ? "#ef4444" : "url(#cyberProgressGrad)"}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={isFailed ? 0 : 251.2 - (251.2 * displayProgress) / 100}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
              />
            </svg>

            {/* Rotating Halo Flare */}
            {!isFinished && !isFailed && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400 opacity-80 pointer-events-none"
              />
            )}
          </div>

          {/* Center Content: Animated Percentage or Verified Check */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isFailed ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center"
              >
                <XCircle className="w-8 h-8 sm:w-9 sm:h-9 text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.6)]" />
                <span className="text-[8px] font-mono uppercase tracking-widest text-red-400 font-bold mt-0.5">Blocked</span>
              </motion.div>
            ) : isFinished ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-lg sm:text-xl font-black text-[var(--color-text)] font-mono tracking-tight leading-none">
                  {displayProgress}<span className="text-[10px] text-cyan-400 font-sans ml-0.5">%</span>
                </span>
                <span className="text-[8px] font-mono uppercase tracking-widest text-[var(--color-muted)] mt-0.5">
                  {displayProgress < 50 ? "Parsing" : displayProgress < 85 ? "Analyzing" : "Syncing"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-black uppercase tracking-tight mb-1 text-[var(--color-text)]">
        {isFailed ? "Verification Blocked" : isFinished ? "Pipeline Processing Complete" : "Processing Candidate Intelligence"}
      </h3>
      <p className="text-xs text-[var(--color-muted)] mb-3 font-medium">
        {isFailed ? "Security Forensic Alert" : analysisState?.stage || (isFinished ? "Profile Synchronized" : "Running automated analysis...")}
      </p>

      {/* Stage Checklist */}
      <div className="w-full space-y-1.5 mb-3 text-left bg-[var(--color-bg-sunken)] p-3 sm:p-3.5 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
        {STAGES.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between py-0.5 text-xs sm:text-sm gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {s.failed ? (
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : s.done ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : s.active ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-[var(--color-border)] shrink-0" />
              )}
              <span className={`text-xs sm:text-[13px] truncate ${s.failed ? "text-red-400 font-semibold" : s.done ? "text-[var(--color-text)] font-semibold" : s.active ? "text-cyan-400 font-bold" : "text-[var(--color-muted)]"}`}>
                {s.label}
              </span>
            </div>
            {s.failed && <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold px-1.5 py-0.5 rounded bg-red-400/10 border border-red-400/20 shrink-0">Blocked</span>}
            {s.active && <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold animate-pulse px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 shrink-0">Running</span>}
            {s.done && <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/20 shrink-0">Done</span>}
          </div>
        ))}
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="w-full p-3 mb-2.5 rounded-[var(--radius-lg)] bg-red-950/40 border border-red-500/40 text-red-200 text-xs sm:text-sm text-left flex items-start gap-2.5 shadow-lg">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1 font-sans text-xs sm:text-[13px] leading-relaxed font-medium">
            {error}
          </div>
        </motion.div>
      )}

      {isFinished && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-[var(--radius-lg)] text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Profile Synchronized. Loading Dashboard...
          </div>
        </motion.div>
      )}
    </div>
  );
}
