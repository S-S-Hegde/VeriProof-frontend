import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  Loader2, CheckCircle, Sparkles, AlertCircle
} from "lucide-react";

export default function CandidateProcessingCenter({ onComplete, initialFileName = "" }) {
  const { setUser } = useAuth();
  const [analysisState, setAnalysisState] = useState(null);
  const [githubState, setGithubState] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);
  
  const pollingRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const pollPipeline = async () => {
      try {
        const [resAnalysis, ghStatus] = await Promise.all([
          api.get("/api/users/profile/resume-analysis").catch(() => ({ data: null })),
          api.get("/api/github/status").catch(() => ({ data: null }))
        ]);

        if (!isMounted) return;

        if (resAnalysis?.data) {
          setAnalysisState(resAnalysis.data);
        }
        if (ghStatus?.data) {
          setGithubState(ghStatus.data);
        }

        const isResumeDone = resAnalysis?.data?.status === "Analysis Complete" || resAnalysis?.data?.status === "Completed";
        const isResumeFailed = resAnalysis?.data?.status === "Analysis Failed" || resAnalysis?.data?.status === "Failed";
        
        const ghStatusStr = ghStatus?.data?.status;
        const isGhDone = !ghStatusStr || ghStatusStr === "complete" || ghStatusStr === "idle" || ghStatusStr === "failed" || ghStatusStr === "GitHub Analysis Complete";

        if (isResumeFailed) {
          setError(resAnalysis?.data?.error || "Resume processing failed.");
          if (pollingRef.current) clearInterval(pollingRef.current);
          return;
        }

        if (isResumeDone && isGhDone) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setIsFinished(true);

          // Synchronize state by refetching everything
          try {
            const [profileRes, projectsRes] = await Promise.all([
              api.get("/api/users/profile"),
              api.get("/api/projects/myprojects"),
            ]);

            if (!isMounted) return;

            // Refresh AuthContext
            setUser((prev) => ({
              ...prev,
              resumeStatus: profileRes.data.resumeStatus,
              workflowState: profileRes.data.workflowState,
            }));

            // Delay briefly so user sees 100% Complete status badge
            setTimeout(() => {
              if (onComplete) {
                onComplete({
                  profileData: profileRes.data,
                  projects: projectsRes.data || [],
                });
              }
            }, 1200);
          } catch (err) {
            console.error("[Processing Center] Synchronization error:", err);
            if (onComplete) onComplete();
          }
        }
      } catch (err) {
        console.error("[Processing Center] Polling error:", err);
      }
    };

    // Immediate first check
    pollPipeline();
    pollingRef.current = setInterval(pollPipeline, 1000);

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [setUser, onComplete]);

  // Compute aggregate progress (0 to 100%)
  const resumeProgress = analysisState?.progress || 20;
  const claimsCount = analysisState?.claims?.skills?.length || 0;
  const ghProgress = githubState?.status === "running" ? 60 : (githubState?.status === "complete" ? 100 : 0);
  
  let overallProgress = Math.min(99, Math.round((resumeProgress * 0.7) + (ghProgress * 0.3)));
  if (isFinished) overallProgress = 100;

  // Stages definition
  const STAGES = [
    { key: "upload", label: `Uploading Resume ${initialFileName ? `(${initialFileName})` : ""}`, done: true },
    { key: "parsing", label: "Parsing Resume PDF", done: resumeProgress >= 30, active: resumeProgress < 30 },
    { key: "claims", label: `Extracting Claims ${claimsCount > 0 ? `(${claimsCount} Found)` : ""}`, done: resumeProgress >= 60, active: resumeProgress >= 30 && resumeProgress < 60 },
    { key: "skills", label: "Building Skill Tree", done: resumeProgress >= 100, active: resumeProgress >= 60 && resumeProgress < 100 },
    { key: "github", label: "GitHub Repository Analysis", done: githubState?.status === "complete" || isFinished, active: githubState?.status === "running" },
    { key: "docs", label: "Generating Repository Documentation", done: githubState?.status === "complete" || isFinished, active: githubState?.status === "running" },
    { key: "complete", label: "Candidate Profile Synchronization", done: isFinished, active: false },
  ];

  return (
    <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
      {/* Animated Glowing Ring */}
      <div className="relative mb-6 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border-4 border-[var(--color-border)] flex items-center justify-center relative overflow-hidden">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="var(--color-accent)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * overallProgress) / 100}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isFinished ? (
              <CheckCircle className="w-10 h-10 text-emerald-400 animate-bounce" />
            ) : (
              <span className="text-xl font-black text-[var(--color-accent)] font-mono">
                {overallProgress}%
              </span>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-1">
        {isFinished ? "Pipeline Processing Complete" : "Processing Candidate Intelligence"}
      </h3>
      <p className="text-xs text-[var(--color-muted)] mb-6 font-mono">
        {analysisState?.stage || (isFinished ? "Profile Synchronized" : "Running automated analysis...")}
      </p>

      {/* Stage Checklist */}
      <div className="w-full space-y-2 mb-6 text-left bg-[var(--color-bg-sunken)] p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
        {STAGES.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between py-1 text-xs">
            <div className="flex items-center gap-2.5">
              {s.done ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : s.active ? (
                <Loader2 className="w-4 h-4 text-[var(--color-accent)] animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-[var(--color-border)] shrink-0" />
              )}
              <span className={`font-mono text-[11px] ${s.done ? "text-[var(--color-text)] font-semibold" : s.active ? "text-[var(--color-accent)] font-bold" : "text-[var(--color-muted)]"}`}>
                {s.label}
              </span>
            </div>
            {s.active && <span className="text-[9px] uppercase tracking-widest text-[var(--color-accent)] font-bold animate-pulse">Running</span>}
            {s.done && <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Done</span>}
          </div>
        ))}
      </div>

      {error && (
        <div className="w-full p-3 mb-4 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isFinished && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-[var(--radius-md)] text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Profile Synchronized. Loading Dashboard...
          </div>
        </motion.div>
      )}
    </div>
  );
}
