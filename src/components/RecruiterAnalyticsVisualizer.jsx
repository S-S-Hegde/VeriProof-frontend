import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
} from "chart.js";
import { Bar, Radar, Doughnut } from "react-chartjs-2";
import {
  BarChart3,
  Briefcase,
  Users,
  Award,
  Zap,
  TrendingUp,
  GitCompare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement
);

const RecruiterAnalyticsVisualizer = ({ applicants = [], jobs = [], selectedJobId, isDark = true }) => {
  // Filter applicants by selected job if applicable
  const filteredApplicants = useMemo(() => {
    if (!selectedJobId) return applicants;
    return applicants.filter((a) => {
      const jid = a.jobId?._id || a.jobId;
      return String(jid) === String(selectedJobId);
    });
  }, [applicants, selectedJobId]);

  // Head-to-Head Comparison Candidates State
  const [candidateAId, setCandidateAId] = useState("");
  const [candidateBId, setCandidateBId] = useState("");

  // Default candidate selection
  const validApplicants = useMemo(() => {
    return filteredApplicants.filter((a) => a.extractedName || a.extractedEmail);
  }, [filteredApplicants]);

  const candidateA = useMemo(() => {
    return validApplicants.find((a) => a._id === candidateAId) || validApplicants[0] || null;
  }, [validApplicants, candidateAId]);

  const candidateB = useMemo(() => {
    return validApplicants.find((a) => a._id === candidateBId) || validApplicants[1] || validApplicants[0] || null;
  }, [validApplicants, candidateBId]);

  // ── 1. Job Roles Cross-Comparison Data ──
  const jobComparisonData = useMemo(() => {
    const jobStats = jobs.map((job) => {
      const jobApps = applicants.filter((a) => {
        const jid = a.jobId?._id || a.jobId;
        return String(jid) === String(job._id);
      });
      const avgScore = jobApps.length
        ? Math.round(jobApps.reduce((acc, curr) => acc + (curr.alignmentScore || 0), 0) / jobApps.length)
        : 0;
      const attendedCount = jobApps.filter((a) => a.examStatus === "Attended").length;

      return {
        title: job.title.length > 18 ? `${job.title.substring(0, 18)}...` : job.title,
        candidates: jobApps.length,
        avgScore,
        attendedCount,
      };
    });

    const labels = jobStats.map((j) => j.title);

    return {
      labels: labels.length ? labels : ["No Job Roles Created"],
      datasets: [
        {
          label: "Candidate Volume",
          data: jobStats.map((j) => j.candidates),
          backgroundColor: "rgba(99, 102, 241, 0.7)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 1.5,
          borderRadius: 6,
        },
        {
          label: "Avg Alignment (%)",
          data: jobStats.map((j) => j.avgScore),
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1.5,
          borderRadius: 6,
        },
        {
          label: "Exams Completed",
          data: jobStats.map((j) => j.attendedCount),
          backgroundColor: "rgba(6, 182, 212, 0.7)",
          borderColor: "rgba(6, 182, 212, 1)",
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    };
  }, [jobs, applicants]);

  // ── 2. Candidate Score Tier Distribution ──
  const scoreTierData = useMemo(() => {
    const topTier = filteredApplicants.filter((a) => (a.alignmentScore || 0) >= 80).length;
    const midTier = filteredApplicants.filter((a) => (a.alignmentScore || 0) >= 50 && (a.alignmentScore || 0) < 80).length;
    const reviewTier = filteredApplicants.filter((a) => (a.alignmentScore || 0) < 50).length;

    return {
      labels: ["High Alignment (≥80%)", "Moderate Fit (50-79%)", "Needs Review (<50%)"],
      datasets: [
        {
          data: [topTier, midTier, reviewTier],
          backgroundColor: [
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: [
            "rgba(16, 185, 129, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(239, 68, 68, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [filteredApplicants]);

  // ── 3. Top Skills Frequency ──
  const skillFrequencyData = useMemo(() => {
    const skillCounts = {};
    filteredApplicants.forEach((a) => {
      (a.matchedSkills || []).forEach((sk) => {
        const clean = sk.trim().toUpperCase();
        if (clean) skillCounts[clean] = (skillCounts[clean] || 0) + 1;
      });
    });

    const sortedSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const labels = sortedSkills.map((s) => s[0]);
    const counts = sortedSkills.map((s) => s[1]);

    return {
      labels: labels.length ? labels : ["No Skills Detected Yet"],
      datasets: [
        {
          label: "Candidate Frequency",
          data: counts.length ? counts : [0],
          backgroundColor: "rgba(59, 130, 246, 0.75)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    };
  }, [filteredApplicants]);

  // ── 4. Candidate Head-to-Head Radar Comparison ──
  const radarComparisonData = useMemo(() => {
    if (!candidateA) return null;

    const labels = [
      "Resume Alignment",
      "Exam Score",
      "Skill Coverage",
      "Code Forensic Index",
      "Profile Reliability",
    ];

    const getScoreArray = (cand) => {
      if (!cand) return [0, 0, 0, 0, 0];
      const align = cand.alignmentScore || 0;
      const exam = cand.examScore != null ? cand.examScore : align * 0.9;
      const skillCount = Math.min((cand.matchedSkills || []).length * 15, 100);
      const codeIndex = cand.githubUsername ? 90 : 45;
      const reliability = cand.examStatus === "Attended" ? 95 : 65;
      return [align, exam, skillCount, codeIndex, reliability];
    };

    return {
      labels,
      datasets: [
        {
          label: candidateA.extractedName || candidateA.extractedEmail || "Candidate A",
          data: getScoreArray(candidateA),
          backgroundColor: "rgba(99, 102, 241, 0.3)",
          borderColor: "rgba(99, 102, 241, 1)",
          pointBackgroundColor: "rgba(99, 102, 241, 1)",
          borderWidth: 2,
        },
        ...(candidateB && candidateB._id !== candidateA._id
          ? [
              {
                label: candidateB.extractedName || candidateB.extractedEmail || "Candidate B",
                data: getScoreArray(candidateB),
                backgroundColor: "rgba(16, 185, 129, 0.3)",
                borderColor: "rgba(16, 185, 129, 1)",
                pointBackgroundColor: "rgba(16, 185, 129, 1)",
                borderWidth: 2,
              },
            ]
          : []),
      ],
    };
  }, [candidateA, candidateB]);

  // Shared chart styling options
  const textColor = isDark ? "#e2e8f0" : "#1e293b";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: textColor, font: { family: "monospace", size: 11 } },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#38bdf8",
        bodyColor: "#f8fafc",
        borderColor: "rgba(56, 189, 248, 0.3)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { family: "monospace", size: 10 } },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor, font: { family: "monospace", size: 10 } },
        grid: { color: gridColor },
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: textColor, font: { family: "monospace", size: 11 } },
      },
    },
    scales: {
      r: {
        angleLines: { color: gridColor },
        grid: { color: gridColor },
        pointLabels: { color: textColor, font: { family: "monospace", size: 10, weight: "bold" } },
        ticks: { backdropColor: "transparent", color: textColor, font: { size: 9 } },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="space-y-10">
      {/* ── METRIC SNAPSHOT COUNTERS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] relative overflow-hidden backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted)]">Active Roles</span>
            <Briefcase className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-[var(--color-text)] font-mono">{jobs.length}</div>
          <div className="text-[11px] text-[var(--color-muted)] mt-1 font-mono">Roles with candidate pools</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] relative overflow-hidden backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted)]">Total Screened</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-[var(--color-text)] font-mono">{filteredApplicants.length}</div>
          <div className="text-[11px] text-[var(--color-muted)] mt-1 font-mono">Candidates in active scope</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] relative overflow-hidden backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted)]">High Potential</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {filteredApplicants.filter((a) => (a.alignmentScore || 0) >= 80).length}
          </div>
          <div className="text-[11px] text-[var(--color-muted)] mt-1 font-mono">Score &ge; 80% threshold</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] relative overflow-hidden backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted)]">Exams Attended</span>
            <UserCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            {filteredApplicants.filter((a) => a.examStatus === "Attended").length}
          </div>
          <div className="text-[11px] text-[var(--color-muted)] mt-1 font-mono">Completed technical tests</div>
        </div>
      </div>

      {/* ── MAIN CHARTS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHART 1: Job Roles Cross-Comparison */}
        <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-xl backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Job Role Performance Comparison
                </h4>
                <p className="text-[11px] text-[var(--color-muted)] font-mono">
                  Volume, Avg Score &amp; Attendance per Blueprint
                </p>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <Bar data={jobComparisonData} options={barChartOptions} />
          </div>
        </div>

        {/* CHART 2: Candidate Score Quality Distribution */}
        <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-xl backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Candidate Score Tier Distribution
                </h4>
                <p className="text-[11px] text-[var(--color-muted)] font-mono">
                  Quality Segments across Current Scope
                </p>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            {filteredApplicants.length > 0 ? (
              <Doughnut
                data={scoreTierData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { color: textColor, font: { family: "monospace", size: 10 } },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-center text-[var(--color-muted)] font-mono text-xs">
                No candidates uploaded for this scope yet.
              </div>
            )}
          </div>
        </div>

        {/* CHART 3: Skill Demand & Talent Frequency */}
        <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-xl backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Top Detected Skills Frequency
                </h4>
                <p className="text-[11px] text-[var(--color-muted)] font-mono">
                  Most Prevalent Technologies in Applicant Resumes
                </p>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <Bar
              data={skillFrequencyData}
              options={{
                ...barChartOptions,
                indexAxis: "y",
              }}
            />
          </div>
        </div>

        {/* CHART 4: Head-to-Head Candidate Radar Matrix */}
        <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-xl backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <GitCompare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Head-to-Head Candidate Radar
                </h4>
                <p className="text-[11px] text-[var(--color-muted)] font-mono">
                  Comparative Multi-Axis Competency Matrix
                </p>
              </div>
            </div>
          </div>

          {/* Candidate Selectors */}
          {validApplicants.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-indigo-400 mb-1">
                  Candidate A:
                </label>
                <select
                  value={candidateA?._id || ""}
                  onChange={(e) => setCandidateAId(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-1.5 rounded-lg bg-[var(--color-bg-sunken)] border border-indigo-500/40 text-[var(--color-text)] focus:outline-none"
                >
                  {validApplicants.map((cand) => (
                    <option key={cand._id} value={cand._id}>
                      {cand.extractedName || cand.extractedEmail} ({cand.alignmentScore || 0}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-emerald-400 mb-1">
                  Candidate B:
                </label>
                <select
                  value={candidateB?._id || ""}
                  onChange={(e) => setCandidateBId(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-1.5 rounded-lg bg-[var(--color-bg-sunken)] border border-emerald-500/40 text-[var(--color-text)] focus:outline-none"
                >
                  {validApplicants.map((cand) => (
                    <option key={cand._id} value={cand._id}>
                      {cand.extractedName || cand.extractedEmail} ({cand.alignmentScore || 0}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="h-[250px] w-full flex items-center justify-center">
            {radarComparisonData ? (
              <Radar data={radarComparisonData} options={radarOptions} />
            ) : (
              <div className="text-center text-[var(--color-muted)] font-mono text-xs">
                Upload at least 1 candidate to enable radar comparison.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterAnalyticsVisualizer;
