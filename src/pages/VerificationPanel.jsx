import React, { useState, useEffect } from "react";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";
import { Plus, Upload, CheckCircle, Clock, XCircle, Search } from "lucide-react";
import api from "../utils/api";

const VerificationPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("builder"); // 'builder' or 'results'
  const [jobs, setJobs] = useState([]);
  const [results, setResults] = useState([]);
  const [candidates, setCandidates] = useState([]);
  
  // Job Form Data
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  
  // Parse Form Data
  const [selectedJob, setSelectedJob] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [candidateId, setCandidateId] = useState("");

  const fetchJobs = async () => {
    try {
      if(!user?.token) return;
      const { data } = await api.get("/api/verify/my-jobs");
      setJobs(data);
      if (data.length > 0) setSelectedJob(data[0]._id);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  };

  const fetchResults = async () => {
    try {
      if(!user?.token) return;
      const { data } = await api.get("/api/verify/results");
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch results", error);
    }
  };

  useEffect(() => {
    if (!user?.token) return;

    let isMounted = true;

    const loadPanelData = async () => {
      try {
        const [jobsResponse, resultsResponse, candidatesResponse] = await Promise.all([
          api.get("/api/verify/my-jobs"),
          api.get("/api/verify/results"),
          api.get("/api/users/resumes/pending"),
        ]);

        if (!isMounted) return;

        const jobsData = jobsResponse.data || [];
        const candidatesData = candidatesResponse.data || [];

        setJobs(jobsData);
        setResults(resultsResponse.data || []);
        setCandidates(candidatesData);

        if (jobsData.length > 0) setSelectedJob(jobsData[0]._id);
        if (candidatesData.length > 0) setCandidateId(candidatesData[0]._id);
      } catch (error) {
        console.error("Failed to initialize verification panel", error);
      }
    };

    loadPanelData();

    return () => {
      isMounted = false;
    };
  }, [user?.token]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = jobSkills.split(",").map(s => s.trim()).filter(Boolean);
      await api.post("/api/verify/job", {
        title: jobTitle,
        description: jobDesc,
        targetSkills: skillsArray
      });
      setJobTitle("");
      setJobDesc("");
      setJobSkills("");
      fetchJobs();
      setActiveTab("results");
    } catch (error) {
      console.error("Failed to create job", error);
    }
  };

  const handleParseResume = async (e) => {
    e.preventDefault();
    if (!selectedJob || !resumeText || !candidateId) return;
    try {
      await api.post("/api/verify/parse", {
        jobId: selectedJob,
        candidateId,
        resumeText
      });
      
      setResumeText("");
      fetchResults();
    } catch (error) {
      console.error("Failed to parse resume", error);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 mt-8 mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-[var(--color-border)] pb-6 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-[var(--color-text)] font-light tracking-wider uppercase mb-2">
              Verification <span className="text-[var(--color-accent)] italic lowercase normal-case">Engine</span>
            </h2>
            <p className="text-[var(--color-muted)] tracking-widest uppercase text-xs">
              Algorithmic Resume Parsing & Adaptive Exam Dispatcher
            </p>
          </div>
          
          <div className="flex w-full md:w-auto space-x-2 bg-[var(--color-bg-sunken)]/50 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('builder')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-md text-xs uppercase tracking-widest transition-all ${activeTab === 'builder' ? 'bg-[var(--color-accent)] text-[var(--color-text)] shadow-md font-bold' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
            >
              Job Builder
            </button>
            <button 
              onClick={() => setActiveTab('results')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-md text-xs uppercase tracking-widest transition-all ${activeTab === 'results' ? 'bg-[var(--color-accent)] text-[var(--color-text)] shadow-md font-bold' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
            >
              Verification Flow
            </button>
          </div>
        </div>

        {activeTab === 'builder' ? (
          <div className="vp-surface-1 p-8 border-[var(--color-border)] bg-white dark:bg-[var(--color-bg-sunken)]/50 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 mb-8">
              <Plus className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="text-lg font-serif tracking-widest uppercase text-[var(--color-text)]">Create Job Role</h3>
            </div>
            
            <form onSubmit={handleCreateJob} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2">Job Title</label>
                <input 
                  type="text" 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-[var(--color-border)] px-2 py-3 focus:outline-none focus:border-[var(--color-accent)] text-[var(--color-text)] transition-colors"
                  placeholder="e.g. Senior React Developer"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2">Job Description</label>
                <textarea 
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full bg-[var(--color-bg-sunken)]/50 border border-[var(--color-border)] rounded-lg p-4 focus:outline-none focus:border-[var(--color-accent)] text-[var(--color-text)] transition-colors h-32 resize-none"
                  placeholder="Paste the raw job description..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2">Target Skills (Comma Separated)</label>
                <input 
                  type="text" 
                  value={jobSkills}
                  onChange={(e) => setJobSkills(e.target.value)}
                  className="w-full bg-transparent border-b border-[var(--color-border)] px-2 py-3 focus:outline-none focus:border-[var(--color-accent)] text-[var(--color-text)] transition-colors"
                  placeholder="React, Node, MongoDB, GraphQL"
                  required
                />
              </div>
              <button type="submit" className="px-8 py-3 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.2em] uppercase text-xs hover:bg-[var(--color-accent)] hover:text-white transition-all w-full mt-4">
                Initialize Job Role
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Parser Upload Tool */}
            <div className="vp-surface-1 p-8 border-[var(--color-border)] bg-white dark:bg-[var(--color-bg-sunken)]/50">
              <div className="flex items-center space-x-3 mb-6">
                <Upload className="w-5 h-5 text-[var(--color-accent)]" />
                <h3 className="text-lg font-serif tracking-widest uppercase text-[var(--color-text)]">Resume Parsing Engine</h3>
              </div>
              <form onSubmit={handleParseResume} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2">Select Target Job</label>
                  <select 
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="w-full bg-[var(--color-bg-sunken)]/50 border border-[var(--color-border)] rounded-lg p-3 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
                    required
                  >
                    {jobs.length === 0 && <option value="">No Jobs Available</option>}
                    {jobs.map(job => (
                      <option key={job._id} value={job._id}>{job.title}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2">Candidate</label>
                  <select
                    value={candidateId}
                    onChange={(e) => setCandidateId(e.target.value)}
                    className="w-full bg-[var(--color-bg-sunken)]/50 border border-[var(--color-border)] rounded-lg p-3 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
                    required
                  >
                    {candidates.length === 0 && <option value="">No candidates with resumes</option>}
                    {candidates.map((candidate) => (
                      <option key={candidate._id} value={candidate._id}>
                        {candidate.name}{candidate.githubUsername ? ` (@${candidate.githubUsername})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2">Paste Candidate Resume</label>
                  <input 
                    type="text" 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full bg-[var(--color-bg-sunken)]/50 border border-[var(--color-border)] rounded-lg p-3 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
                    placeholder="Candidate experience text..."
                    required
                  />
                </div>
                <div className="md:col-span-12 flex items-end justify-end">
                  <button type="submit" className="w-full py-3 bg-[var(--color-accent)] text-[var(--color-text)] rounded-lg font-bold uppercase tracking-widest text-xs hover:shadow-lg transition-all">
                    Run NLP
                  </button>
                </div>
              </form>
            </div>

            {/* Results Table */}
            <div className="vp-surface-1 overflow-hidden border-[var(--color-border)] bg-white dark:bg-[var(--color-bg-sunken)]/50">
              <div className="p-4 md:p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-sunken)]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-base md:text-lg font-serif tracking-widest uppercase text-[var(--color-text)]">Verification Pipeline</h3>
                </div>
                <span className="text-sm md:text-xs uppercase tracking-widest text-[var(--color-muted)] bg-[var(--color-bg-sunken)]/50 px-3 py-1 rounded-full">Total Processed: {results.length}</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--color-bg-sunken)]/50 border-b border-[var(--color-border)]">
                      <th className="p-4 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest">Candidate ID</th>
                      <th className="p-4 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest">Target Role</th>
                      <th className="p-4 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest">Alignment</th>
                      <th className="p-4 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest">Exam State</th>
                      <th className="p-4 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest">Exam Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-[var(--color-muted)] tracking-wide text-sm">
                          No resumes processed yet. Select a candidate with an uploaded resume to trigger verification.
                        </td>
                      </tr>
                    ) : (
                      results.map((result) => (
                        <tr key={result._id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-sunken)]/50 transition-colors">
                          <td className="p-4 text-sm font-medium text-[var(--color-text)]">
                            {result.candidateId?.name || "Candidate-" + result.candidateId.toString().substring(0, 5)}
                          </td>
                          <td className="p-4 text-sm text-[var(--color-muted)]">
                            {result.jobId?.title || "Unknown Job"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-full bg-[var(--color-bg-sunken)]/50 rounded-full h-1.5 max-w-[100px]">
                                <div className="bg-[var(--color-accent)] h-1.5 rounded-full" style={{ width: `${result.alignmentScore}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-[var(--color-text)] dark:text-[var(--color-accent)]">{result.alignmentScore}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {result.status === "Verified" ? (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs tracking-widest uppercase border border-green-500/20">
                                <CheckCircle className="w-3 h-3" />
                                <span>Verified</span>
                              </span>
                            ) : result.status === "Pending Exam" ? (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs tracking-widest uppercase border border-yellow-500/20">
                                <Clock className="w-3 h-3" />
                                <span>Exam Sent</span>
                              </span>
                            ) : result.status === "Failed" ? (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs tracking-widest uppercase border border-red-500/20">
                                <XCircle className="w-3 h-3" />
                                <span>Failed</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-bg-sunken)]/50 text-[var(--color-muted)] text-xs tracking-widest uppercase border border-[var(--color-border)]">
                                In Review
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm font-medium text-[var(--color-text)]">
                            {result.examScore !== undefined ? `${result.examScore}%` : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default VerificationPanel;
