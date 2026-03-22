import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";

const RecruiterDashboard = () => {
  const { user } = useAuth();
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
      
      // Remove from pending list
      setPendingResumes(pendingResumes.filter(r => r._id !== studentId));
    } catch (error) {
      alert("Failed to verify resume");
    }
  };

  return (
    <PageTransition>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-4xl font-serif text-vp-teal font-light tracking-wider uppercase mb-2">
            Talent <span className="text-ibex-rose italic lowercase normal-case">Acquisition</span>
          </h2>
          <div className="h-[2px] w-24 bg-ibex-gold mt-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 border-l-4 border-vp-teal border-r-0 border-y-0 bg-white">
          <p className="text-xs tracking-widest uppercase text-ibex-muted mb-2">Candidates Parsed</p>
          <p className="text-3xl font-serif text-vp-teal">1,204</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-ibex-rose border-r-0 border-y-0 bg-white">
          <p className="text-xs tracking-widest uppercase text-ibex-muted mb-2">Pending Validations</p>
          <p className="text-3xl font-serif text-vp-teal">{pendingResumes.length}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-vp-champagne border-r-0 border-y-0 bg-white">
          <p className="text-xs tracking-widest uppercase text-ibex-muted mb-2">Matching Talent</p>
          <p className="text-3xl font-serif text-vp-teal">342</p>
        </div>
      </div>

      {/* Resume Processing Queue */}
      {pendingResumes.length > 0 && (
        <div className="mb-16">
          <h3 className="text-xl font-serif text-vp-teal mb-6 tracking-wide border-b border-ibex-surface/40 pb-4">
            Pending Credential Validations
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {pendingResumes.map((student) => (
              <div key={student._id} className="glass-card p-6 border border-ibex-surface/40 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full border border-vp-teal/30 flex items-center justify-center text-vp-teal font-serif bg-vp-teal/5">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-vp-teal font-serif text-lg">{student.name}</h4>
                    <p className="text-xs tracking-widest uppercase text-ibex-muted">@{student.githubUsername}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <a 
                    href={student.resumeUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs tracking-widest uppercase text-ibex-gold hover:text-white transition-colors"
                  >
                    View Document →
                  </a>
                  <button 
                    onClick={() => handleVerifyResume(student._id)}
                    className="inline-flex items-center px-4 py-2 border border-green-800/50 text-green-500 bg-green-900/20 text-xs tracking-widest uppercase hover:bg-green-800/40 transition-colors"
                  >
                    Verify Credential
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Gallery */}
      <h3 className="text-xl font-serif text-vp-teal mb-6 tracking-wide border-b border-ibex-surface/40 pb-4">
        Verified Projects
      </h3>
      {loading ? (
        <p className="text-ibex-muted tracking-widest uppercase text-sm">Loading candidate projects...</p>
      ) : projects.length === 0 ? (
        <div className="text-center glass-card py-20 px-4 border border-ibex-surface/40 bg-white">
          <h3 className="mt-2 text-xl font-serif text-vp-teal tracking-widest uppercase">
            No Projects Available
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="glass-card bg-white overflow-hidden flex flex-col transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(145,166,255,0.2)] hover:border-vp-teal/30 duration-500 border-ibex-surface/40"
            >
              <div className="px-6 py-8 flex-grow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-12 w-12 rounded-full border border-vp-teal/30 flex items-center justify-center text-vp-teal font-serif text-xl bg-vp-teal/5">
                    {project.user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-light tracking-widest uppercase text-vp-teal">
                      {project.user.name}
                    </h3>
                    <p className="text-xs text-ibex-rose font-light mt-1">
                      @{project.user.githubUsername}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/project/${project._id}`}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <h3 className="text-2xl font-serif text-vp-teal mb-4">
                    {project.title}
                  </h3>
                </Link>
                <div className="text-sm text-ibex-muted font-light leading-relaxed line-clamp-3 mb-6">
                  <p>{project.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1 text-xs tracking-widest uppercase text-vp-teal border border-vp-teal/20 bg-vp-teal/5"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-vp-teal/5 px-6 py-5 flex flex-col space-y-4 text-sm border-t border-vp-teal/10 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-vp-teal hover:text-ibex-rose uppercase tracking-widest text-xs transition-colors font-medium border-b border-vp-teal"
                  >
                    Source Code
                  </a>
                  <span
                    className={`inline-flex items-center px-3 py-1 text-xs tracking-widest uppercase border ${project.isVerified ? "border-vp-champagne text-vp-champagne bg-vp-champagne/10" : "border-ibex-muted/30 text-ibex-muted bg-ibex-muted/5"}`}
                  >
                    {project.isVerified ? "Verified" : "Pending Evaluation"}
                  </span>
                </div>
                {project.githubStats && project.githubStats.lastCommitDate && (
                  <div className="text-[10px] uppercase tracking-widest text-ibex-muted font-light border-t border-vp-teal/10 pt-4">
                    Last touched:{" "}
                    {new Date(
                      project.githubStats.lastCommitDate,
                    ).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
};

export default RecruiterDashboard;
