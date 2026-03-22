import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";

const AddProject = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const techArray = technologies.split(",").map((tech) => tech.trim());

      await axios.post(
        "/api/projects",
        { title, description, technologies: techArray, repositoryUrl, liveUrl },
        config,
      );

      navigate("/dashboard");
    } catch (error) {
      alert("Error creating project");
    }
  };

  return (
    <PageTransition className="max-w-4xl mx-auto pt-10 pb-20">
      <div className="glass-card px-6 py-8 sm:p-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-ibex-gold/10 rounded-full blur-[80px] -z-10" />
        
        <div className="md:grid md:grid-cols-3 md:gap-12">
          <div className="md:col-span-1 pb-8 md:pb-0">
            <h3 className="text-3xl font-serif text-vp-teal font-light tracking-wide uppercase mb-4">
              Add a <span className="text-ibex-rose italic lowercase normal-case">Project</span>
            </h3>
            <div className="h-[1px] w-16 bg-ibex-gold/30 mb-6" />
            <p className="text-sm text-ibex-muted font-light leading-relaxed">
              Curate your portfolio by providing the source repository and details. Your work will be evaluated by our verified network.
            </p>
          </div>
          
          <div className="mt-5 md:mt-0 md:col-span-2 relative z-10">
            <form onSubmit={submitHandler} className="space-y-8">
              <div className="grid grid-cols-1 gap-y-8">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-medium text-ibex-muted mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full bg-white border-b border-vp-teal/30 focus:border-vp-teal py-3 px-2 text-vp-teal transition-colors focus:outline-none placeholder-ibex-muted"
                    placeholder="E.g., The Midnight Architecture"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-medium text-ibex-muted mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full bg-white border border-vp-teal/30 rounded-lg focus:border-vp-teal py-3 px-4 text-vp-teal transition-colors focus:outline-none placeholder-ibex-muted"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-medium text-ibex-muted mb-2">
                    Medium (Technologies, comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    className="block w-full bg-white border-b border-vp-teal/30 focus:border-vp-teal py-3 px-2 text-vp-teal transition-colors focus:outline-none placeholder-ibex-muted"
                    placeholder="React, Node.js, WebGL"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-medium text-ibex-muted mb-2">
                    Source Repository URL
                  </label>
                  <input
                    type="url"
                    required
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    className="block w-full bg-white border-b border-vp-teal/30 focus:border-vp-teal py-3 px-2 text-vp-teal transition-colors focus:outline-none placeholder-ibex-muted"
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-medium text-ibex-muted mb-2">
                    Live URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="block w-full bg-white border-b border-vp-teal/30 focus:border-vp-teal py-3 px-2 text-vp-teal transition-colors focus:outline-none placeholder-ibex-muted"
                  />
                </div>
              </div>

              <div className="pt-8 flex justify-end space-x-6">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="text-xs uppercase tracking-widest text-ibex-muted hover:text-ibex-gold transition-colors py-3"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="ibex-button-primary px-10"
                >
                  Publish Project
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AddProject;
