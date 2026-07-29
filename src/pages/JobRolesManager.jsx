import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  UploadCloud,
  FileText,
  X,
  Save,
  Loader2,
  Trash2,
  CheckCircle,
} from "lucide-react";

const JobRolesManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [stagedRoles, setStagedRoles] = useState([]);
  const [jobForm, setJobForm] = useState({ title: "", description: "" });
  const fileInputRef = useRef(null);

  // Initialize from localStorage to survive page refreshes
  const [jobs, setJobs] = useState(() => {
    const savedJobs = localStorage.getItem("vp-jobs");
    return savedJobs ? JSON.parse(savedJobs) : [];
  });

  // Automatically sync jobs to localStorage whenever they are added or updated
  useEffect(() => {
    localStorage.setItem("vp-jobs", JSON.stringify(jobs));
  }, [jobs]);
  const handleJdUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const pdfs = files.filter((f) => f.type === "application/pdf");

    if (pdfs.length > 0) {
      setIsExtracting(true);

      // Simulate LLM extraction delay
      setTimeout(() => {
        const extractedRoles = pdfs.map((pdf) => ({
          id: Math.random().toString(36).substr(2, 9),
          title: pdf.name.replace(".pdf", "").replace(/[-_]/g, " "),
          description: `Extracted requirements from ${pdf.name}. Automatically parsed baseline skills, experience requirements, and core responsibilities for verification mapping.`,
        }));

        setStagedRoles((prev) => [...prev, ...extractedRoles]);
        setIsExtracting(false);
        // Reset file input so the same file can be uploaded again if needed
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 2500);
    }
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    if (jobForm.title && jobForm.description) {
      setStagedRoles((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          ...jobForm,
        },
      ]);
      setJobForm({ title: "", description: "" });
    }
  };

  const removeStagedRole = (idToRemove) => {
    setStagedRoles(stagedRoles.filter((role) => role.id !== idToRemove));
  };

  const handleSaveAllRoles = () => {
    // Merge staged roles into main jobs array (Mocking successful API creation)
    const newJobs = stagedRoles.map((role) => ({
      ...role,
      status: "Active",
      candidates: 0,
    }));

    setJobs((prev) => [...prev, ...newJobs]);
    setStagedRoles([]);
    setIsCreating(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--color-text)]">
            Job{" "}
            <span className="text-[var(--color-accent)] not-italic">Roles</span>
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Manage target specifications and open positions
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setStagedRoles([]); // Reset staging on cancel
          }}
          className={`vp-btn px-5 py-2 text-xs flex items-center gap-2 ${isCreating ? "vp-btn-secondary" : "vp-btn-primary"}`}
        >
          {isCreating ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isCreating ? "Cancel Creation" : "Create Roles"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div
            key="create-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Input Methods Column */}
            <div className="space-y-6">
              {/* Option A: AI Upload */}
              <div className="vp-glass p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] relative overflow-hidden">
                {isExtracting && (
                  <div className="absolute inset-0 bg-[var(--vp-glass-bg)] backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin mb-3" />
                    <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] animate-pulse">
                      LLM Parsing PDFs...
                    </p>
                  </div>
                )}
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2">
                  Option A: Smart Batch Upload
                </h3>
                <p className="text-xs text-[var(--color-muted)] mb-6">
                  Upload multiple PDF Job Descriptions to automatically generate
                  roles.
                </p>

                <div
                  className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-[var(--radius-md)] flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-colors bg-[var(--color-bg-sunken)]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf"
                    multiple
                    onChange={handleJdUpload}
                  />
                  <UploadCloud className="w-10 h-10 text-[var(--color-muted)] mb-3" />
                  <p className="text-sm font-bold mb-1">Click to Upload PDFs</p>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
                    Multiple files supported
                  </p>
                </div>
              </div>

              {/* OR Divider */}
              <div className="flex items-center text-[var(--color-muted)] text-[10px] font-mono uppercase tracking-[0.3em]">
                <div className="flex-1 border-t border-[var(--color-border)]"></div>
                <span className="mx-4">OR</span>
                <div className="flex-1 border-t border-[var(--color-border)]"></div>
              </div>

              {/* Option B: Manual Entry */}
              <div className="vp-glass p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)]">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2">
                  Option B: Manual Configuration
                </h3>
                <p className="text-xs text-[var(--color-muted)] mb-6">
                  Manually define target requirements for a single role.
                </p>
                <form onSubmit={handleManualAdd} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      required
                      className="vp-input w-full text-sm"
                      placeholder="Role Title (e.g. Associate Software Engineer)"
                      value={jobForm.title}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <textarea
                      required
                      className="vp-input w-full min-h-[120px] resize-none text-sm"
                      placeholder="Define the required baseline skills..."
                      value={jobForm.description}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, description: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="vp-btn vp-btn-secondary w-full py-2 text-xs flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Stage Manual Role
                  </button>
                </form>
              </div>
            </div>

            {/* Staging Area Column */}
            <div className="vp-glass p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] flex flex-col h-[700px] lg:h-auto">
              <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Staging Queue
                </h3>
                <span className="text-[10px] font-mono bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-1 rounded-full">
                  {stagedRoles.length} Ready
                </span>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                <AnimatePresence>
                  {stagedRoles.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-[var(--color-muted)] opacity-50"
                    >
                      <Briefcase className="w-12 h-12 mb-3" />
                      <p className="text-xs font-mono uppercase tracking-widest text-center">
                        No roles staged.
                        <br />
                        Upload JD or Add Manually.
                      </p>
                    </motion.div>
                  ) : (
                    stagedRoles.map((role) => (
                      <motion.div
                        key={role.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)] group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm text-[var(--color-text)] truncate pr-4">
                            {role.title}
                          </h4>
                          <button
                            onClick={() => removeStagedRole(role.id)}
                            className="text-[var(--color-muted)] hover:text-[var(--color-error)] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[var(--color-muted)] line-clamp-2 leading-relaxed">
                          {role.description}
                        </p>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-4 border-t border-[var(--color-border)] mt-4">
                <button
                  onClick={handleSaveAllRoles}
                  disabled={stagedRoles.length === 0}
                  className="vp-btn vp-btn-accent w-full py-3 text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" /> Save{" "}
                  {stagedRoles.length > 0 ? stagedRoles.length : ""} Roles to
                  Database
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="job-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {jobs.length === 0 ? (
              <div className="col-span-full vp-glass p-12 rounded-[var(--radius-xl)] flex flex-col items-center justify-center text-[var(--color-muted)]">
                <Briefcase className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm font-mono uppercase tracking-widest">
                  No Active Job Roles
                </p>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="vp-glass p-6 rounded-[var(--radius-xl)] hover:border-[var(--color-accent)]/50 transition-colors cursor-pointer group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] flex items-center justify-center border border-[var(--color-border)] group-hover:bg-[var(--color-accent-subtle)] transition-colors">
                      <Briefcase className="w-5 h-5 text-[var(--color-text)] group-hover:text-[var(--color-accent)]" />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {job.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{job.title}</h3>
                  <p className="text-xs text-[var(--color-muted)] line-clamp-2 mb-4 flex-1">
                    {job.description}
                  </p>
                  <div className="pt-4 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-muted)] font-mono">
                      {job.candidates} Applicants Staged
                    </p>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobRolesManager;
