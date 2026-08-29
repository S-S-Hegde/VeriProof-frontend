import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  Loader2, CheckCircle, Sparkles, AlertCircle
} from "lucide-react";

export default function CandidateProcessingCenter({ onComplete, initialFileName = "" }) {
  const { user, setUser } = useAuth();
  const [analysisState, setAnalysisState] = useState(null);
  const [githubState, setGithubState] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);
  const [displayProgress, setDisplayProgress] = useState(25);
  
  const pollingRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const pollPipeline = async () => {
      try {
        const [resAnalysis, ghStatus, profileRes] = await Promise.all([
          api.get("/api/users/profile/resume-analysis").catch(() => ({ data: null })),
          api.get("/api/github/status").catch(() => ({ data: null })),
          api.get("/api/users/profile").catch(() => ({ data: null }))
        ]);

        if (!isMounted) return;

        if (resAnalysis?.data) {
          setAnalysisState(resAnalysis.data);
        }
        if (ghStatus?.data) {
          setGithubState(ghStatus.data);
        }

        const isUserAnalyzed = profileRes?.data?.resumeStatus === "Analyzed" ||
                               profileRes?.data?.workflowState?.hasResume === true ||
                               ["repository_analysis", "technical_assessment", "verification_complete"].includes(profileRes?.data?.pipelineStage);

        const isResumeDone = resAnalysis?.data?.status === "Analysis Complete" || 
                             resAnalysis?.data?.status === "Completed" ||
                             resAnalysis?.data?.status === "Analyzed" ||
                             (resAnalysis?.data?.progress >= 100) ||
                             isUserAnalyzed;

        const isResumeFailed = resAnalysis?.data?.status === "Analysis Failed" || 
                               resAnalysis?.data?.status === "Failed" || 
                               resAnalysis?.data?.status === "Email Mismatch";
        
        const ghStatusStr = ghStatus?.data?.status;
        const isGhDone = !ghStatusStr || ghStatusStr === "complete" || ghStatusStr === "idle" || ghStatusStr === "failed" || ghStatusStr === "GitHub Analysis Complete";

        if (isResumeFailed || resAnalysis?.data?.error) {
          setError(resAnalysis?.data?.error || "Resume processing failed.");
          if (pollingRef.current) clearInterval(pollingRef.current);
          return;
        }

        if (isResumeDone && isGhDone) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setIsFinished(true);
          setDisplayProgress(100);

          // Synchronize state by refetching profile & projects
          try {
            const projectsRes = await api.get("/api/projects/myprojects").catch(() => ({ data: [] }));

            if (!isMounted) return;

            // Refresh AuthContext
            if (profileRes?.data) {
              setUser((prev) => ({
                ...prev,
                resumeStatus: profileRes.data.resumeStatus,
                workflowState: profileRes.data.workflowState,
                githubUsername: profileRes.data.githubUsername || prev.githubUsername,
              }));
            }

            // Delay briefly so user sees 100% Complete status badge
            setTimeout(() => {
              if (onComplete) {
                onComplete({
                  profileData: profileRes?.data || {},
                  projects: projectsRes.data || [],
                });
              }
            }, 800);
          } catch (err) {
            console.error("[Processing Center] Synchronization error:", err);
            if (onComplete) onComplete();
          }
        }
      } catch (err) {
        console.error("[Processing Center] Polling error:", err);
      }
    };

    // Immediate first check + tight polling
    pollPipeline();
    pollingRef.current = setInterval(pollPipeline, 600);

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [setUser, onComplete]);

  // Compute live progress
  const isResumeDone = analysisState?.status === "Analysis Complete" || 
                       analysisState?.status === "Completed" || 
                       analysisState?.status === "Analyzed" || 
                       user?.resumeStatus === "Analyzed" ||
                       isFinished;
  const resumeProgress = isResumeDone ? 100 : (analysisState?.progress || 35);
  const claimsCount = analysisState?.claims?.skills?.length || 0;
  const hasGithub = Boolean(githubState?.githubUsername || user?.githubUsername);
  const isGhRunning = hasGithub && githubState?.status === "running";

  let targetProgress = 35;
  if (isFinished || isResumeDone) {
    targetProgress = 100;
  } else {
    targetProgress = Math.max(35, Math.min(95, resumeProgress));
  }

  // Smooth interpolation toward targetProgress
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < targetProgress) return Math.min(targetProgress, prev + 5);
        if (prev > targetProgress) return targetProgress;
        return prev;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [targetProgress]);

  // Stages definition
  const STAGES = [
    { key: "upload", label: `Uploading Resume ${initialFileName ? `(${initialFileName})` : ""}`, done: true },
    { key: "parsing", label: "Parsing Resume PDF", done: isResumeDone || displayProgress >= 40, active: !isResumeDone && displayProgress < 40 },
    { key: "claims", label: `Extracting Claims ${claimsCount > 0 ? `(${claimsCount} Found)` : ""}`, done: isResumeDone || displayProgress >= 70, active: !isResumeDone && displayProgress >= 40 && displayProgress < 70 },
    { key: "skills", label: "Building Skill Tree", done: isResumeDone || displayProgress >= 90, active: !isResumeDone && displayProgress >= 70 },
    { key: "github", label: "GitHub Repository Analysis", done: isFinished || isResumeDone || githubState?.status === "complete" || !hasGithub, active: isGhRunning },
    { key: "complete", label: "Candidate Profile Synchronization", done: isFinished || displayProgress >= 100, active: false },
  ];

  return (
    <div className="p-1 sm:p-2 flex flex-col items-center justify-center text-center max-w-lg w-full mx-auto">
      {/* ── Circular Orbital Loading Ring ── */}
      <div className="relative mb-3 flex items-center justify-center">
        {/* Ambient Pulsing Glow Aura */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-cyan-500/20 rounded-full blur-lg animate-pulse pointer-events-none" />

        {/* Continuous Rotating Outer Track */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full relative flex items-center justify-center">
          {/* Background Rotating Dash Ring */}
          {!isFinished && (
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30 animate-[spin_6s_linear_infinite]" />
          )}

          {/* SVG Progress & Spinner Arc */}
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
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="6"
              fill="transparent"
            />

            {/* Animated Loading Sweep (Rotates continuously while loading) */}
            {!isFinished && (
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#cyberProgressGrad)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="40 210"
                strokeLinecap="round"
                className="animate-[spin_1.4s_linear_infinite] origin-center opacity-80"
              />
            )}

            {/* Accurate Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#cyberProgressGrad)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * displayProgress) / 100}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Center Content: Animated Percentage or Verified Check */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isFinished ? (
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
        {isFinished ? "Pipeline Processing Complete" : "Processing Candidate Intelligence"}
      </h3>
      <p className="text-xs text-[var(--color-muted)] mb-3 font-medium">
        {analysisState?.stage || (isFinished ? "Profile Synchronized" : "Running automated analysis...")}
      </p>

      {/* Stage Checklist */}
      <div className="w-full space-y-1.5 mb-3 text-left bg-[var(--color-bg-sunken)] p-3 sm:p-3.5 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
        {STAGES.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between py-0.5 text-xs sm:text-sm gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {s.done ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : s.active ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-[var(--color-border)] shrink-0" />
              )}
              <span className={`text-xs sm:text-[13px] truncate ${s.done ? "text-[var(--color-text)] font-semibold" : s.active ? "text-cyan-400 font-bold" : "text-[var(--color-muted)]"}`}>
                {s.label}
              </span>
            </div>
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
