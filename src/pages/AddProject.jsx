import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { Trophy, ExternalLink } from "lucide-react";

const inputCls = "block w-full px-4 py-3 bg-black/50 border border-orange-500/25 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-600 transition-colors text-sm";
const labelCls = "block text-xs uppercase tracking-widest font-bold text-gray-500 mb-2";

const PLATFORMS = [
  { id: "hackerrank",  label: "HackerRank",  placeholder: "e.g. 5 Star Gold — Problem Solving" },
  { id: "leetcode",    label: "LeetCode",     placeholder: "e.g. 1050 rating, 250 problems solved" },
  { id: "codeforces",  label: "Codeforces",   placeholder: "e.g. Specialist — Rating 1450" },
  { id: "codechef",    label: "CodeChef",     placeholder: "e.g. 3 Star — 1650 rating" },
  { id: "github",      label: "GitHub",       placeholder: "e.g. github.com/username" },
  { id: "other",       label: "Other Platform", placeholder: "Platform name and rank/score" },
];

const AddProject = () => {
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [liveUrl, setLiveUrl]         = useState("");
  const [cgpa, setCgpa]               = useState("");
  const [rankings, setRankings]       = useState(
    PLATFORMS.reduce((acc, p) => ({ ...acc, [p.id]: "" }), {})
  );

  const { user } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const cfg = {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
      };
      const techArray = technologies.split(",").map((t) => t.trim()).filter(Boolean);
      await axios.post(
        "/api/projects",
        { title, description, technologies: techArray, repositoryUrl, liveUrl, cgpa, rankings },
        cfg,
      );
      navigate("/dashboard");
    } catch {
      alert("Error creating project — ensure all required fields are filled.");
    }
  };

  return (
    <PageTransition className="max-w-4xl mx-auto pt-8 pb-24">
      <div className="bg-black/70 backdrop-blur-xl border border-orange-500/15 rounded-2xl px-8 py-10 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-600/6 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl font-black text-white uppercase tracking-wide">
            Add a <span className="text-orange-500">Project</span>
          </h2>
          <div className="h-[2px] w-20 bg-orange-600 mt-4" />
          <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-2xl">
            Provide your project's source repository and technical details. Your work will be
            evaluated and verified against your claimed skills. Add your competitive programming
            ranks to strengthen your profile.
          </p>
        </div>

        <form onSubmit={submitHandler} className="space-y-8">

          {/* ── CORE PROJECT INFO ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className={labelCls}>Project Title</label>
              <input type="text" required className={inputCls} value={title}
                onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Real-time Chat Application" />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea required rows={4} className={inputCls} value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what the project does, the problem it solves, and your role in building it." />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Technologies Used <span className="text-gray-600 normal-case tracking-normal">(comma separated)</span></label>
              <input type="text" required className={inputCls} value={technologies}
                onChange={(e) => setTechnologies(e.target.value)} placeholder="React, Node.js, MongoDB, Socket.io" />
            </div>

            <div>
              <label className={labelCls}>Source Repository URL</label>
              <input type="url" required className={inputCls} value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)} placeholder="https://github.com/username/repo" />
            </div>
            <div>
              <label className={labelCls}>Live URL <span className="text-gray-600 normal-case tracking-normal">(optional)</span></label>
              <input type="url" className={inputCls} value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://yourproject.vercel.app" />
            </div>
          </div>

          {/* ── CGPA ── */}
          <div className="border-t border-white/5 pt-8">
            <label className={labelCls}>
              CGPA{" "}
              <span className="text-gray-600 normal-case tracking-normal font-normal">
                — used as a minimal factor only; skill evidence carries more weight
              </span>
            </label>
            <input className={`${inputCls} max-w-xs`} value={cgpa}
              onChange={(e) => setCgpa(e.target.value)} placeholder="e.g. 7.6 / 10 or 8.2 / 10" />
          </div>

          {/* ── COMPETITIVE PROGRAMMING RANKINGS ── */}
          <div className="border-t border-white/5 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-5 h-5 text-orange-500" />
              <h3 className="font-black uppercase tracking-widest text-sm text-white">Platform Rankings</h3>
              <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <p className="text-gray-500 text-xs mb-6">
              Add your rank, rating, or star level from any competitive programming or developer platform.
              These are displayed on your public profile and help recruiters assess real skill levels.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {PLATFORMS.map(({ id, label, placeholder }) => (
                <div key={id}>
                  <label className={labelCls}>{label}</label>
                  <input
                    className={inputCls}
                    placeholder={placeholder}
                    value={rankings[id]}
                    onChange={(e) => setRankings((r) => ({ ...r, [id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── SUBMIT ── */}
          <div className="flex items-center justify-end gap-5 pt-4 border-t border-white/5">
            <button type="button" onClick={() => navigate("/dashboard")}
              className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors py-3">
              Discard
            </button>
            <button type="submit"
              className="px-8 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-black tracking-widest uppercase text-sm shadow-[0_0_18px_rgba(255,69,0,0.4)] transition-all">
              Publish Project
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default AddProject;
