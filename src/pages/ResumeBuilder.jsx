import { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { motion } from "framer-motion";
import { Upload, Link2, Wand2, CheckCircle, FileText, FolderOpen, Download, Loader2 } from "lucide-react";

const TABS = [
  { id: "file",    label: "File Upload",    icon: FolderOpen },
  { id: "link",    label: "Paste Link",     icon: Link2      },
];

const inputCls = "block w-full px-4 py-3 bg-black/50 border border-orange-500/25 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-600 transition-colors text-sm";
const labelCls = "block text-xs uppercase tracking-widest font-bold text-gray-500 mb-2";

const ResumeBuilder = () => {
  const { user } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState("file");

  // ── File upload
  const fileRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileStatus, setFileStatus] = useState("");

  // ── Link/URL
  const [resumeUrl, setResumeUrl] = useState("");
  const [urlStatus, setUrlStatus] = useState(user?.resumeStatus || "Not Submitted");

  /* ── Handlers ─────────────────────────────────────────── */
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    try {
      const cfg = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put("/api/users/profile/resume", { resumeUrl }, cfg);
      setUrlStatus(data.resumeStatus || "Pending Evaluation");
    } catch {
      setUrlStatus("Submission failed — try again");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("resume", selectedFile);
    try {
      const cfg = { headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "multipart/form-data" } };
      await axios.post("/api/users/profile/resume-file", formData, cfg);
      setFileStatus("Uploaded — Pending Evaluation");
    } catch {
      setFileStatus("Upload failed — check file format (PDF/DOCX)");
    }
  };

  /* ── UI ───────────────────────────────────────────────── */
  const cardCls = "bg-black/70 backdrop-blur-xl border border-orange-500/15 rounded-2xl p-8 relative overflow-hidden";

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto pb-24">

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl font-black text-white uppercase tracking-wide">
            My <span className="text-orange-500">Resume</span>
          </h2>
          <div className="h-[2px] w-20 bg-orange-600 mt-4" />
          <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-2xl">
            Upload your existing resume via file or link, or use our AI builder to generate a structured,
            recruiter-ready document directly from your platform data.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-8 p-1 bg-black/50 border border-white/5 rounded-xl w-fit flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold tracking-widest uppercase transition-all duration-200
                ${activeTab === id
                  ? "bg-orange-600 text-white shadow-[0_0_15px_rgba(255,69,0,0.5)]"
                  : "text-gray-500 hover:text-gray-300"}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* ── TAB: FILE UPLOAD ── */}
        {activeTab === "file" && (
          <motion.div key="file" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={cardCls}>
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-6">
              <FolderOpen className="w-6 h-6 text-orange-500" />
              <h3 className="font-black uppercase tracking-widest text-white">Upload from Device</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Select a PDF or DOCX resume from your computer. It will be parsed and queued for recruiter evaluation.
            </p>

            <form onSubmit={handleFileUpload} className="space-y-6">
              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); setSelectedFile(e.dataTransfer.files[0]); }}
                className="border-2 border-dashed border-orange-500/30 hover:border-orange-500/60 rounded-xl p-10 text-center cursor-pointer transition-colors group"
              >
                <Upload className="w-10 h-10 text-orange-500/50 group-hover:text-orange-500 mx-auto mb-3 transition-colors" />
                {selectedFile
                  ? <p className="text-white font-bold text-sm">{selectedFile.name}</p>
                  : <><p className="text-gray-400 text-sm">Drag & drop your resume here</p><p className="text-gray-600 text-xs mt-1">or click to browse — PDF or DOCX only</p></>}
                <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
              </div>

              <div className="flex items-center justify-between">
                {fileStatus && (
                  <span className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${fileStatus.includes("failed") ? "text-red-400" : "text-orange-400"}`}>
                    {!fileStatus.includes("failed") && <CheckCircle className="w-3.5 h-3.5" />} {fileStatus}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="ml-auto px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold tracking-widest uppercase text-xs shadow-[0_0_15px_rgba(255,69,0,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Upload Resume
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── TAB: LINK ── */}
        {activeTab === "link" && (
          <motion.div key="link" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={cardCls}>
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-6">
              <Link2 className="w-6 h-6 text-orange-500" />
              <h3 className="font-black uppercase tracking-widest text-white">Paste a Resume Link</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Already have your resume hosted on Google Drive, Notion, or a portfolio site? Paste the public URL here.
            </p>

            <form onSubmit={handleUrlSubmit} className="space-y-6">
              <div>
                <label className={labelCls}>Resume / Portfolio URL</label>
                <input type="url" required value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/..., https://yourportfolio.com/resume"
                  className={inputCls} />
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${urlStatus === "Verified" ? "text-green-400" : urlStatus.includes("failed") ? "text-red-400" : "text-orange-400"}`}>
                  {urlStatus === "Verified" && <CheckCircle className="w-3.5 h-3.5" />} {urlStatus}
                </span>
                <button type="submit" className="px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold tracking-widest uppercase text-xs shadow-[0_0_15px_rgba(255,69,0,0.4)] transition-all">
                  Submit URL
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default ResumeBuilder;
