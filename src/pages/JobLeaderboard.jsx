import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Trophy, ArrowLeft, ShieldCheck, ShieldAlert, 
  Activity, Star, Clock, AlertTriangle, Target 
} from "lucide-react";
import api from "../utils/api";

export default function JobLeaderboard() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchRankings();
  }, [jobId]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/exams/rankings?jobId=${jobId}`);
      if (data && data.success) {
        setRankings(data.rankings || []);
      }
    } catch (err) {
      console.error("Failed to fetch rankings:", err);
      setError("Failed to load candidate rankings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRankBadgeClass = (index) => {
    switch(index) {
      case 0: return "bg-amber-500 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-300";
      case 1: return "bg-slate-300 text-slate-800 shadow-[0_0_15px_rgba(203,213,225,0.4)] border border-slate-100";
      case 2: return "bg-orange-700 text-orange-100 shadow-[0_0_15px_rgba(194,65,12,0.4)] border border-orange-500";
      default: return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/recruiter-jobs')}
              className="p-2 rounded-xl hover:bg-slate-800/50 text-slate-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <Trophy className="w-6 h-6 text-amber-400" /> Adaptive Leaderboard
              </h1>
              <p className="text-slate-400 text-xs font-mono mt-1">
                Forensic Rankings & Candidate DNA Analysis
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Candidates</div>
            <div className="text-2xl font-black text-indigo-400">{rankings.length}</div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Rankings Table (Left 2/3) */}
          <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold text-slate-500">
                    <th className="p-4 text-center w-16">Rank</th>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Composite Score</th>
                    <th className="p-4">Trust Score</th>
                    <th className="p-4">Integrity</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-500">
                        <div className="animate-pulse flex flex-col items-center">
                          <Activity className="w-8 h-8 text-indigo-500/50 mb-3 animate-bounce" />
                          <span>Generating Forensic Rankings...</span>
                        </div>
                      </td>
                    </tr>
                  ) : rankings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-500 text-sm">
                        No candidates have completed this assessment yet.
                      </td>
                    </tr>
                  ) : (
                    rankings.map((candidate, index) => (
                      <tr 
                        key={candidate._id} 
                        className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${selectedCandidate?._id === candidate._id ? 'bg-indigo-500/5' : ''}`}
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <td className="p-4 text-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black mx-auto ${getRankBadgeClass(index)}`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                            {candidate.candidateName}
                            {candidate.isAdaptive && <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/20 text-indigo-300 uppercase font-bold tracking-wider">Adaptive</span>}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{candidate.candidateEmail}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-xl font-black text-indigo-400">
                            {candidate.adaptiveRankScore}%
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`font-mono text-sm font-bold ${candidate.integrityScore >= 70 ? 'text-blue-400' : 'text-rose-400'}`}>
                            {candidate.score}% 
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            {candidate.integrityScore >= 75 ? (
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ShieldAlert className="w-4 h-4 text-rose-400" />
                            )}
                            <span className={`text-sm font-bold ${candidate.integrityScore >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {candidate.integrityScore}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs font-semibold transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCandidate(candidate);
                            }}
                          >
                            Analyze
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DNA Inspector Panel (Right 1/3) */}
          <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-2xl h-fit sticky top-24">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Forensic Insights
            </h3>

            {!selectedCandidate ? (
              <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                Select a candidate from the leaderboard to view their deep Skill DNA analysis.
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Candidate Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-slate-800/50">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xl border border-indigo-500/30">
                    {selectedCandidate.candidateName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{selectedCandidate.candidateName}</h4>
                    <p className="text-xs font-mono text-slate-400">{selectedCandidate.candidateEmail}</p>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Calibration (Part 1)</div>
                    <div className="text-xl font-black text-slate-300">{selectedCandidate.calibrationScore}%</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Adaptive (Part 2)</div>
                    <div className="text-xl font-black text-indigo-400">{selectedCandidate.adaptiveScore}%</div>
                  </div>
                </div>

                {/* Anti-Cheat Metrics */}
                <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-500/20 space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> Proctoring & Integrity
                  </h5>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Guessing Detected</span>
                    <span className={`font-bold ${selectedCandidate.guessDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedCandidate.guessDetected ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Trap Question Tripped</span>
                    <span className={`font-bold ${selectedCandidate.trapCapApplied ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedCandidate.trapCapApplied ? "Yes (Score Capped)" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Consistency Index</span>
                    <span className="font-mono text-slate-300 font-bold">{selectedCandidate.consistencyIndex}%</span>
                  </div>
                </div>

                {/* Skill DNA Analysis */}
                {selectedCandidate.skillDNA && selectedCandidate.skillDNA.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2">
                      <Target className="w-3 h-3" /> Skill DNA Fingerprint
                    </h5>
                    <div className="space-y-3">
                      {selectedCandidate.skillDNA.map((dna, idx) => (
                        <div key={idx} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-slate-300 text-xs">{dna.skill}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${dna.trueLevel === 'Expert' ? 'bg-indigo-500/20 text-indigo-300' : dna.trueLevel === 'Advanced' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}`}>
                              {dna.trueLevel}
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${dna.calibrationAccuracy}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[9px] uppercase tracking-wider text-slate-500">
                            <span>Accuracy: {Math.round(dna.calibrationAccuracy)}%</span>
                            {dna.trapCapped && <span className="text-rose-400">Trap Capped</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
