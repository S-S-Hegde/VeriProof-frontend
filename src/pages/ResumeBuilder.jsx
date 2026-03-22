import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { FileText, Upload, PlusCircle, CheckCircle } from "lucide-react";

const ResumeBuilder = () => {
  const { user } = useAuth();
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeStatus, setResumeStatus] = useState(user?.resumeStatus || "Not Submitted");
  const [resumeCurrentUrl, setResumeCurrentUrl] = useState(user?.resumeUrl || "");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get("/api/users/profile", config);
        if (data.resumeUrl) {
           setResumeCurrentUrl(data.resumeUrl);
           setResumeStatus(data.resumeStatus || "Pending Evaluation");
           setResumeUrl(data.resumeUrl);
        }
      } catch (error) {
        console.error("Failed to fetch profile info");
      }
    };
    fetchProfile();
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
      <div className="mb-12">
        <h2 className="text-4xl font-serif text-vp-teal font-light tracking-wider uppercase mb-2">
          My <span className="text-ibex-rose italic lowercase normal-case">Resume</span>
        </h2>
        <div className="h-[2px] w-24 bg-ibex-gold mt-4" />
        <p className="mt-4 text-ibex-muted font-light tracking-wide text-sm max-w-2xl leading-relaxed">
          Manage your verified professional credentials. Upload an existing portfolio link or use our integrated builder to generate a new resume tailored for technical recruiters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Option 1: Upload Existing Link */}
        <div className="glass-card p-8 border border-ibex-surface/40 flex flex-col items-start transition-all duration-300 hover:border-vp-teal/30 hover:shadow-lg bg-white">
          <div className="bg-ibex-gold/30 p-4 rounded-full mb-6 text-vp-teal shadow-sm">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif text-vp-teal mb-2 tracking-wide">
            Link Existing Resume
          </h3>
          <p className="text-ibex-muted font-light text-sm mb-8 leading-relaxed">
            Already have a PDF hosted online or a live portfolio? Submit your URL here for our automated verification and recruiter queuing system.
          </p>

          <form onSubmit={handleResumeSubmit} className="w-full flex justify-between flex-col h-full flex-grow">
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest font-medium text-ibex-muted mb-2">
                Resume/CV URL
              </label>
              <input
                type="url"
                required
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="block w-full bg-ibex-bg/50 border-b border-ibex-gold/30 focus:border-ibex-gold py-3 px-2 text-ibex-text transition-colors focus:outline-none placeholder-ibex-muted/50"
              />
            </div>
            
            <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-ibex-gold/10">
              <div className="flex flex-col">
                <span className="text-[10px] text-ibex-muted uppercase tracking-widest mb-1">Status</span>
                <span className={`text-xs tracking-widest uppercase font-medium flex items-center gap-2 ${resumeStatus === 'Verified' ? 'text-vp-champagne' : resumeStatus === 'Rejected' ? 'text-ibex-rose' : 'text-vp-teal'}`}>
                  {resumeStatus === 'Verified' && <CheckCircle className="w-3 h-3 text-vp-champagne" />}
                  {resumeStatus}
                </span>
              </div>
              <button type="submit" className="ibex-button-primary whitespace-nowrap !py-2 !px-6 text-xs shadow-lg">
                Submit URL
              </button>
            </div>
          </form>
        </div>

        {/* Option 2: Resume Builder for Beginners */}
        <div className="glass-card p-8 border border-ibex-surface/40 flex flex-col items-start transition-all duration-300 hover:border-ibex-rose/40 hover:shadow-lg relative overflow-hidden group bg-white">
          {/* subtle glow behind */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-ibex-rose/10 rounded-full blur-[80px] -z-10 pointer-events-none transition-all duration-500 group-hover:bg-ibex-rose/20" />
          
          <div className="bg-ibex-rose/20 p-4 rounded-full mb-6 text-ibex-rose">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif text-vp-teal mb-2 tracking-wide">
            Build a New Resume
          </h3>
          <p className="text-ibex-muted font-light text-sm mb-6 leading-relaxed flex-grow">
            Don't have a professional resume yet? Use our guided builder to generate a highly-optimized, recruiter-friendly verifiable resume right here on the platform.
          </p>

          <div className="w-full bg-ibex-bg/60 border border-ibex-gold/10 rounded-xl p-4 mb-8">
            <ul className="space-y-4">
              <li className="flex items-center text-xs text-ibex-text font-light tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-ibex-rose mr-3" /> Auto-syncs your Verified Projects
              </li>
              <li className="flex items-center text-xs text-ibex-text font-light tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-ibex-rose mr-3" /> ATS-Friendly structure by default
              </li>
              <li className="flex items-center text-xs text-ibex-text font-light tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-ibex-rose mr-3" /> Standardized for our Recruiters
              </li>
            </ul>
          </div>
          
          <button 
            type="button"
            className="w-full ibex-button flex items-center justify-center gap-2 !py-3 hover:border-transparent group-hover:bg-gradient-premium relative overflow-hidden"
          >
            <PlusCircle className="w-4 h-4 text-ibex-gold group-hover:text-white transition-colors relative z-10" />
            <span className="relative z-10 group-hover:text-white transition-colors">Launch Builder</span>
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResumeBuilder;
