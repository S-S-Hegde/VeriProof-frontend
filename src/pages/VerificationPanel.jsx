import React, { useState, useEffect } from "react";
import PageTransition from "../components/PageTransition";
import { ShieldCheck, Plus, Upload, CheckCircle, Clock, XCircle, Search } from "lucide-react";
import axios from "axios";

const VerificationPanel = () => {
  const [activeTab, setActiveTab] = useState("builder"); // 'builder' or 'results'
  const [jobs, setJobs] = useState([]);
  const [results, setResults] = useState([]);
  
  // Job Form Data
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  
  // Parse Form Data
  const [selectedJob, setSelectedJob] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [candidateId, setCandidateId] = useState("65f1a2b3c4d5e6f7a8b9c0d1"); // Mock candidate ID for UI demo purposes

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      if(!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get("http://localhost:5000/api/verify/my-jobs", config);
      setJobs(data);
      if (data.length > 0) setSelectedJob(data[0]._id);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  };

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem("token");
      if(!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get("http://localhost:5000/api/verify/results", config);
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch results", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchResults();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const skillsArray = jobSkills.split(",").map(s => s.trim());
      await axios.post("http://localhost:5000/api/verify/job", {
        title: jobTitle,
        description: jobDesc,
        targetSkills: skillsArray
      }, config);
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
    if (!selectedJob || !resumeText) return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post("http://localhost:5000/api/verify/parse", {
        jobId: selectedJob,
        candidateId, // Sending mock ID or auth user ID for demo
        resumeText
      }, config);
      
      setResumeText("");
      fetchResults();
    } catch (error) {
      console.error("Failed to parse resume", error);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 mt-8 mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-ibex-surface/30 pb-6 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-ibex-text font-light tracking-wider uppercase mb-2">
              Verification <span className="text-ibex-gold italic lowercase normal-case">Engine</span>
            </h2>
            <p className="text-ibex-muted tracking-widest uppercase text-xs">
              Algorithmic Resume Parsing & Adaptive Exam Dispatcher
            </p>
          </div>
          
          <div className="flex w-full md:w-auto space-x-2 bg-ibex-surface/20 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('builder')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-md text-xs uppercase tracking-widest transition-all ${activeTab === 'builder' ? 'bg-ibex-gold text-vp-teal shadow-md font-bold' : 'text-ibex-muted hover:text-ibex-text'}`}
            >
              Job Builder
            </button>
            <button 
              onClick={() => setActiveTab('results')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-md text-xs uppercase tracking-widest transition-all ${activeTab === 'results' ? 'bg-ibex-gold text-vp-teal shadow-md font-bold' : 'text-ibex-muted hover:text-ibex-text'}`}
            >
              NLP Results
            </button>
          </div>
        </div>

        {activeTab === 'builder' ? (
          <div className="glass-card p-8 border-ibex-surface/20 bg-white dark:bg-ibex-surface/40 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 mb-8">
              <Plus className="w-5 h-5 text-ibex-rose" />
              <h3 className="text-lg font-serif tracking-widest uppercase text-ibex-text">Create Job Role</h3>
            </div>
            
            <form onSubmit={handleCreateJob} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-ibex-muted mb-2">Job Title</label>
                <input 
                  type="text" 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-ibex-surface/50 px-2 py-3 focus:outline-none focus:border-ibex-gold text-ibex-text transition-colors"
                  placeholder="e.g. Senior React Developer"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-ibex-muted mb-2">Job Description</label>
                <textarea 
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full bg-ibex-surface/5 border border-ibex-surface/20 rounded-lg p-4 focus:outline-none focus:border-ibex-gold text-ibex-text transition-colors h-32 resize-none"
                  placeholder="Paste the raw job description..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-ibex-muted mb-2">Target Skills (Comma Separated)</label>
                <input 
                  type="text" 
                  value={jobSkills}
                  onChange={(e) => setJobSkills(e.target.value)}
                  className="w-full bg-transparent border-b border-ibex-surface/50 px-2 py-3 focus:outline-none focus:border-ibex-gold text-ibex-text transition-colors"
                  placeholder="React, Node, MongoDB, GraphQL"
                  required
                />
              </div>
              <button type="submit" className="ibex-button-primary w-full mt-4">
                Initialize Job Role
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Parser Upload Tool */}
            <div className="glass-card p-8 border-ibex-surface/20 bg-white dark:bg-ibex-surface/40">
              <div className="flex items-center space-x-3 mb-6">
                <Upload className="w-5 h-5 text-ibex-gold" />
                <h3 className="text-lg font-serif tracking-widest uppercase text-ibex-text">Resume Parsing Engine</h3>
              </div>
              <form onSubmit={handleParseResume} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                  <label className="block text-xs uppercase tracking-widest text-ibex-muted mb-2">Select Target Job</label>
                  <select 
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="w-full bg-ibex-surface/5 border border-ibex-surface/20 rounded-lg p-3 text-sm text-ibex-text focus:outline-none focus:border-ibex-gold"
                    required
                  >
                    {jobs.length === 0 && <option value="">No Jobs Available</option>}
                    {jobs.map(job => (
                      <option key={job._id} value={job._id}>{job.title}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-6">
                  <label className="block text-xs uppercase tracking-widest text-ibex-muted mb-2">Paste Candidate Resume</label>
                  <input 
                    type="text" 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full bg-ibex-surface/5 border border-ibex-surface/20 rounded-lg p-3 text-sm text-ibex-text focus:outline-none focus:border-ibex-gold"
                    placeholder="Candidate experience text..."
                    required
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <button type="submit" className="w-full py-3 bg-ibex-gold text-vp-teal rounded-lg font-bold uppercase tracking-widest text-xs hover:shadow-lg transition-all">
                    Run NLP
                  </button>
                </div>
              </form>
            </div>

            {/* Results Table */}
            <div className="glass-card overflow-hidden border-ibex-surface/20 bg-white dark:bg-ibex-surface/40">
              <div className="p-4 md:p-6 border-b border-ibex-surface/20 bg-ibex-surface/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-ibex-rose" />
                  <h3 className="text-base md:text-lg font-serif tracking-widest uppercase text-ibex-text">Verification Pipeline</h3>
                </div>
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-ibex-muted bg-ibex-surface/10 px-3 py-1 rounded-full">Total Processed: {results.length}</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-ibex-surface/10 border-b border-ibex-surface/20">
                      <th className="p-4 text-xs font-semibold text-ibex-muted uppercase tracking-widest">Candidate ID</th>
                      <th className="p-4 text-xs font-semibold text-ibex-muted uppercase tracking-widest">Target Role</th>
                      <th className="p-4 text-xs font-semibold text-ibex-muted uppercase tracking-widest">Alignment</th>
                      <th className="p-4 text-xs font-semibold text-ibex-muted uppercase tracking-widest">Exam State</th>
                      <th className="p-4 text-xs font-semibold text-ibex-muted uppercase tracking-widest">Exam Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-ibex-muted tracking-wide text-sm">
                          No resumes processed yet. Upload a resume to trigger the NLP engine.
                        </td>
                      </tr>
                    ) : (
                      results.map((result) => (
                        <tr key={result._id} className="border-b border-ibex-surface/10 hover:bg-ibex-surface/5 transition-colors">
                          <td className="p-4 text-sm font-medium text-ibex-text">
                            {result.candidateId?.name || "Candidate-" + result.candidateId.toString().substring(0, 5)}
                          </td>
                          <td className="p-4 text-sm text-ibex-muted">
                            {result.jobId?.title || "Unknown Job"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-full bg-ibex-surface/20 rounded-full h-1.5 max-w-[100px]">
                                <div className="bg-ibex-gold h-1.5 rounded-full" style={{ width: `${result.alignmentScore}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-vp-teal dark:text-ibex-gold">{result.alignmentScore}%</span>
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
                                <span>Snt Exam</span>
                              </span>
                            ) : result.status === "Failed" ? (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs tracking-widest uppercase border border-red-500/20">
                                <XCircle className="w-3 h-3" />
                                <span>Failed</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-ibex-surface/10 text-ibex-muted text-xs tracking-widest uppercase border border-ibex-surface/20">
                                In Review
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm font-medium text-ibex-text">
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
