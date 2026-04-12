import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { useTheme, THEMES } from "../context/ThemeContext";
import { Search, Users, ShieldCheck, Activity, ExternalLink, CheckCircle } from "lucide-react";

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [pendingResumes, setPendingResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        
        const [projectsRes, resumesRes] = await Promise.all([
          axios.get("/api/projects", config),
          axios.get("/api/users/resumes/pending", config)
        ]);

        setProjects(projectsRes.data);
        setPendingResumes(resumesRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleVerifyResume = async (studentId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/users/${studentId}/verify-resume`, { status: "Verified" }, config);
      setPendingResumes(pendingResumes.filter(r => r._id !== studentId));
    } catch (error) {
      alert("Failed to verify resume");
    }
  };

  return (
    <PageTransition>
      <div className="md:flex md:items-end md:justify-between mb-12 border-b border-[var(--color-border)] pb-8">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-mono tracking-[0.4em] uppercase opacity-40 mb-2 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Investigator_Auth: {user.name?.toUpperCase()}
          </p>
          <h2 className="text-5xl h1">
            Talent <span className="opacity-40 italic">Forensics</span>
          </h2>
        </div>
        <div className="mt-8 flex md:mt-0 md:ml-4">
          <Link
            to="/discover"
            className="px-8 py-3 bg-[var(--color-accent)] text-[var(--color-bg)] font-bold tracking-[0.2em] uppercase text-[10px] flex items-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_var(--color-accent)]/20"
          >
            <Search className="w-3 h-3" /> Global Search
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 border-l-4 border-[var(--color-accent)]">
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-50 mb-1">Authenticated_Talent</p>
          <p className="text-3xl font-bold h1">1,204</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-[var(--color-accent)]/30">
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-50 mb-1">Pending_Verifications</p>
          <p className="text-3xl font-bold h1">{pendingResumes.length}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-[var(--color-accent)]/10">
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-50 mb-1">High_Integrity_Matches</p>
          <p className="text-3xl font-bold h1">342</p>
        </div>
      </div>

      {/* Resume Processing Queue */}
      {pendingResumes.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="text-xl tracking-widest uppercase h1">Verification Queue</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {pendingResumes.map((student) => (
              <div key={student._id} className="glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 group hover:border-[var(--color-accent)] transition-all">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 border border-[var(--color-border)] flex items-center justify-center font-mono text-lg bg-[var(--color-bg)]/50">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold h1 leading-none mb-1">{student.name}</h4>
                    <p className="text-[10px] tracking-[0.2em] uppercase opacity-40 font-mono">GH: @{student.githubUsername}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <a 
                    href={student.resumeUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity underline decoration-[var(--color-accent)] underline-offset-4"
                  >
                    Examine_Docs <ExternalLink className="w-3 h-3" />
                  </a>
                  <button 
                    onClick={() => handleVerifyResume(student._id)}
                    className="px-6 py-2 bg-[var(--color-accent)] text-[var(--color-bg)] text-[10px] tracking-[0.2em] uppercase font-bold hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <CheckCircle className="w-3 h-3" /> Authenticate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Gallery */}
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-5 h-5 text-[var(--color-accent)]" />
        <h3 className="text-xl tracking-widest uppercase h1">Verified Artifacts</h3>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center py-20 opacity-40">
           <div className="w-8 h-8 border-[var(--color-accent)] border-t-transparent animate-spin mb-4" />
           <p className="text-[10px] font-mono tracking-widest uppercase">Fetching_Archive_Data...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center glass-card py-20 border opacity-40">
          <h3 className="text-[10px] uppercase tracking-[0.3em]">
            No Authenticated Evidence Found
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="glass-card group overflow-hidden flex flex-col transition-all duration-700 hover:shadow-[0_0_30px_var(--color-accent)]/10"
            >
              <div className="p-8 flex-grow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-10 w-10 border border-[var(--color-border)] flex items-center justify-center font-mono text-sm bg-[var(--color-bg)]">
                    {project.user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[10px] font-mono tracking-widest uppercase opacity-40">
                      {project.user.name}
                    </h3>
                    <p className="text-[9px] font-mono uppercase tracking-tighter mt-1 text-[var(--color-accent)]">
                      @{project.user.githubUsername}
                    </p>
                  </div>
                </div>
                <Link to={`/project/${project._id}`} className="block hover:opacity-80 transition-opacity">
                  <h3 className="text-2xl mb-4 h1 leading-tight">
                    {project.title}
                  </h3>
                </Link>
                <div className="text-xs opacity-60 font-light leading-relaxed line-clamp-3 mb-8 italic">
                  "{project.description}"
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-1 text-[8px] tracking-[0.2em] uppercase font-mono border border-[var(--color-border)] text-[var(--color-muted)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-8 py-5 flex items-center justify-between border-t border-[var(--color-border)] bg-black/5">
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] uppercase tracking-[0.2em] font-bold border-b border-transparent hover:border-[var(--color-accent)] text-[var(--color-accent)] transition-all"
                >
                  Source_Archive
                </a>
                <span className={`inline-flex items-center px-2 py-1 text-[8px] tracking-[0.2em] uppercase font-mono border ${project.isVerified ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "opacity-40"}`}>
                  {project.isVerified ? "AUTHENTICATED" : "PENDING_REVIEW"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
};

export default RecruiterDashboard;
