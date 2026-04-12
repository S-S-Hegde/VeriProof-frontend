import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import ProjectCard3D from "../components/ProjectCard3D";
import { Plus, Database, Shield, Award, Activity } from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeStatus, setResumeStatus] = useState(user?.resumeStatus || "Not Submitted");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const profileRes = await axios.get("/api/users/profile", config);
        if (profileRes.data.resumeUrl) {
           setResumeStatus(profileRes.data.resumeStatus || "Pending Evaluation");
        }
        const { data } = await axios.get("/api/projects/myprojects", config);
        setProjects(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data");
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <PageTransition>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-12">
        {/* HEADER AREA */}
        <div className="md:flex md:items-end md:justify-between mb-16 border-b border-[var(--color-border)] pb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                <Database className="w-64 h-64 -mr-24 -mt-24" />
            </div>
            
            <div className="flex-1 min-w-0 z-10">
              <div className="flex items-center gap-4 mb-6">
                  <span className="w-8 h-[1px] bg-[var(--color-accent)]" />
                  <p className="text-[9px] font-mono tracking-[0.5em] uppercase text-[var(--color-accent)] font-bold">
                    Archive_Authorized // {user.name?.replace(" ", "_").toUpperCase()}
                  </p>
              </div>
              <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-4">
                CORE <span className="text-[var(--color-accent)] not-italic">ARCHIVE.</span>
              </h2>
              <p className="text-sm font-medium opacity-40 uppercase tracking-widest flex items-center gap-3">
                  <Activity className="w-4 h-4" /> System_Status: Syncing_Global_Nodes...
              </p>
            </div>

            <div className="mt-12 md:mt-0 flex gap-4 z-10">
              <button
                onClick={() => navigate("/add-project")}
                className="px-10 py-5 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-[var(--color-accent)] transition-all flex items-center gap-4"
              >
                <Plus className="w-4 h-4" /> Upload_Evidence
              </button>
            </div>
        </div>

        {/* STATS STRIP (Surgical Grid Style) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-24 border border-[var(--color-border)] bg-[var(--color-bg)]">
            {[
                { label: "Authenticated_Nodes", val: projects.length, icon: Database, id: "01" },
                { label: "Verification_Level", val: resumeStatus.toUpperCase(), icon: Shield, id: "02" },
                { label: "Talent_Signal", val: "ALPHA", icon: Activity, id: "03" },
                { label: "Global_Integrity", val: "99.2%", icon: Award, id: "04" }
            ].map((stat, i) => (
                <div key={i} className="p-10 border-r border-b md:border-b-0 last:border-r-0 border-[var(--color-border)] group hover:bg-[var(--color-text)]/[0.02] transition-colors">
                    <div className="flex justify-between items-start mb-10">
                        <stat.icon className="w-5 h-5 opacity-20 group-hover:text-[var(--color-accent)] group-hover:opacity-100 transition-all" />
                        <span className="text-[9px] font-mono opacity-20">STAT_{stat.id}</span>
                    </div>
                    <p className="text-[9px] font-mono tracking-[0.2em] uppercase opacity-40 mb-2">{stat.label}</p>
                    <p className="text-3xl font-black italic uppercase tracking-tighter">{stat.val}</p>
                </div>
            ))}
        </div>

        {/* CONTENT GRID */}
        {loading ? (
            <div className="flex flex-col items-center py-32 border border-dashed border-[var(--color-border)]">
                <div className="w-12 h-[1px] bg-[var(--color-accent)] animate-pulse mb-8" />
                <p className="text-[10px] font-mono tracking-[0.4em] uppercase opacity-30">Parsing_Secure_Data_Stream...</p>
            </div>
        ) : projects.length === 0 ? (
            <div className="text-center py-48 border border-[var(--color-border)] bg-[var(--color-bg)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]" />
                <div className="relative z-10">
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4 opacity-20">EMPTY_ARCHIVE</h3>
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 mb-12">No evidence has been synchronized with this node.</p>
                    <button 
                        onClick={() => navigate("/add-project")}
                        className="px-8 py-4 border border-[var(--color-text)] text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-all"
                    >
                        Initiate_First_Sync
                    </button>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {projects.map((project) => (
                <ProjectCard3D key={project._id} project={project} />
              ))}
            </div>
        )}
      </div>
    </PageTransition>
  );
};

export default StudentDashboard;
