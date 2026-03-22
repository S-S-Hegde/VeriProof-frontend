import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import ProjectCard3D from "../components/ProjectCard3D";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeStatus, setResumeStatus] = useState(user?.resumeStatus || "Not Submitted");
  const [resumeCurrentUrl, setResumeCurrentUrl] = useState(user?.resumeUrl || "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        // Fetch profile for latest resume status
        const profileRes = await axios.get("/api/users/profile", config);
        if (profileRes.data.resumeUrl) {
           setResumeCurrentUrl(profileRes.data.resumeUrl);
           setResumeStatus(profileRes.data.resumeStatus || "Pending Evaluation");
           setResumeUrl(profileRes.data.resumeUrl);
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

  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put("/api/users/profile/resume", { resumeUrl }, config);
      setResumeStatus(data.resumeStatus);
      setResumeCurrentUrl(data.resumeUrl);
      alert("Resume submitted for verification!");
    } catch (error) {
      alert("Error submitting resume");
    }
  };

  return (
    <PageTransition>
      <div className="md:flex md:items-center md:justify-between mb-12">
        <div className="flex-1 min-w-0">
          <h2 className="text-4xl font-serif text-vp-teal font-light tracking-wider uppercase mb-2">
            My <span className="text-ibex-rose italic lowercase normal-case">Portfolio</span>
          </h2>
          <div className="h-[2px] w-24 bg-ibex-gold mt-4" />
        </div>
        <div className="mt-8 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => navigate("/add-project")}
            className="ibex-button-primary"
          >
            Add New Project
          </button>
        </div>
      </div>



      {loading ? (
        <p className="text-ibex-muted tracking-widest uppercase text-sm">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="text-center glass-card py-20 px-4 border border-ibex-gold/20">
          <h3 className="mt-2 text-xl font-serif text-ibex-text tracking-widest uppercase">
            Your Portfolio is Empty
          </h3>
          <p className="mt-4 text-sm text-ibex-muted font-light">
            Begin your legacy by adding your first verified project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard3D key={project._id} project={project} />
          ))}
        </div>
      )}
    </PageTransition>
  );
};

export default StudentDashboard;
