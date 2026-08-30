import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { resolveFileUrl } from "../utils/fileUrl";
import {
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  UploadCloud,
  X,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  Layers,
  Zap,
  Tag,
  Download,
  Sliders,
  Cpu,
} from "lucide-react";

const PRESET_ISSUERS = [
  "Amazon Web Services (AWS)",
  "Google Cloud Platform (GCP)",
  "Microsoft Azure",
  "Meta / Facebook",
  "DeepLearning.AI",
  "Stanford Online",
  "Coursera",
  "edX",
  "Udacity",
  "Linux Foundation (CNCF)",
  "Oracle",
  "Cisco",
  "IBM",
  "HashiCorp",
  "MongoDB University",
  "HackerRank",
  "freeCodeCamp",
];

const PRESET_SKILLS = [
  "React",
  "Node.js",
  "Python",
  "TypeScript",
  "Cloud Architecture",
  "Machine Learning",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "System Design",
  "Cybersecurity",
  "REST APIs",
];

const CertificationsPage = () => {
  const { user, setUser } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Form State & Mode
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState("auto"); // "auto" (AI Extract) or "manual" (Specify Details)
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [customIssuer, setCustomIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [formError, setFormError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Modal Lightbox Preview
  const [previewCert, setPreviewCert] = useState(null);

  const fileInputRef = useRef(null);
  const autoFileInputRef = useRef(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const { data } = await api.cachedGet("/api/certificates");
      setCertificates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    setFormError("");
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const clean = customSkillInput.trim();
    if (!selectedSkills.includes(clean)) {
      setSelectedSkills((prev) => [...prev, clean]);
    }
    setCustomSkillInput("");
  };

  const resetForm = () => {
    setTitle("");
    setIssuer("");
    setCustomIssuer("");
    setIssueDate("");
    setExpiryDate("");
    setCredentialId("");
    setCredentialUrl("");
    setSelectedSkills([]);
    setCustomSkillInput("");
    setFile(null);
    setFilePreview(null);
    setFormError("");
    setIsFormOpen(false);
  };

  // Submit Handler supporting both AI Auto-Extract and Manual Specification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!file && uploadMode === "auto") {
      setFormError("Please select or drop a certificate file (PDF or Image) to extract.");
      return;
    }

    if (uploadMode === "manual") {
      const finalIssuer = issuer === "Other" ? customIssuer.trim() : issuer.trim();
      if (!title.trim() || !finalIssuer) {
        setFormError("Certificate title and issuing organization are required.");
        return;
      }
    }

    try {
      setSubmitting(true);
      const formData = new FormData();

      if (uploadMode === "auto") {
        formData.append("autoExtract", "true");
        formData.append("certificate", file);
      } else {
        const finalIssuer = issuer === "Other" ? customIssuer.trim() : issuer.trim();
        formData.append("title", title.trim());
        formData.append("issuer", finalIssuer);
        if (issueDate) formData.append("issueDate", issueDate);
        if (expiryDate) formData.append("expiryDate", expiryDate);
        if (credentialId) formData.append("credentialId", credentialId.trim());
        if (credentialUrl) formData.append("credentialUrl", credentialUrl.trim());
        formData.append("skills", JSON.stringify(selectedSkills));
        if (file) {
          formData.append("certificate", file);
        }
      }

      const { data } = await api.post("/api/certificates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCertificates((prev) => [data, ...prev]);
      setSuccessNotice(
        uploadMode === "auto"
          ? `⚡ AI extracted and verified "${data.title}" from ${data.issuer}! (+250 XP)`
          : `🛡️ Credential "${data.title}" verified and saved to ledger! (+250 XP)`
      );
      setTimeout(() => setSuccessNotice(""), 6000);

      // Refresh global user state for skillProgress & stats
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          skillProgress: {
            ...prev?.skillProgress,
            totalXp: (prev?.skillProgress?.totalXp || 0) + 250,
            verifiedCount: (prev?.skillProgress?.verifiedCount || 0) + 1,
            trustScore: Math.min(99, (prev?.skillProgress?.trustScore || 80) + 3),
          },
        }));
      }

      resetForm();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to upload and verify certificate.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (certId) => {
    if (!window.confirm("Are you sure you want to remove this verified certificate?")) return;
    try {
      await api.delete(`/api/certificates/${certId}`);
      setCertificates((prev) => prev.filter((c) => c._id !== certId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete certificate.");
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cert.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeFilter === "all") return matchesSearch;
    return matchesSearch && cert.verificationStatus === activeFilter;
  });

  const totalXpEarned = certificates.length * 250;
  const totalTrustBoost = certificates.length * 3;

  return (
    <PageTransition>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-12 pb-32">
        {/* Background glow */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-96 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* ── Top Header Bar ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-[0.25em] text-amber-400 font-bold uppercase">
                PROOF_LEDGER // CANDIDATE_CREDENTIALS
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white">
              Certifications &amp; <span className="text-[var(--color-accent)] not-italic">Badges.</span>
            </h1>
            <p className="text-xs font-mono text-[var(--color-muted)] mt-2 max-w-2xl leading-relaxed">
              Cryptographically verify and catalog your industry credentials, university degrees, and professional certifications. Each verified proof unlocks Skill Tree XP and elevates candidate trust ranking.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={fetchCertificates}
              className="vp-btn vp-btn-secondary text-xs px-4 py-2.5 gap-2"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="vp-btn vp-btn-accent text-xs px-5 py-2.5 gap-2 shadow-[0_0_20px_rgba(107,138,255,0.3)]"
            >
              {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isFormOpen ? "Close Upload Panel" : "Upload Credential"}
            </button>
          </div>
        </div>

        {/* ── Telemetry Matrix ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Verified Credentials", val: certificates.length, icon: Award, color: "text-amber-400" },
            { label: "Total Proof XP", val: `+${totalXpEarned} XP`, icon: Sparkles, color: "text-[var(--color-accent)]" },
            { label: "Trust Score Boost", val: `+${totalTrustBoost}%`, icon: ShieldCheck, color: "text-emerald-400" },
            { label: "Active Skills Mapped", val: new Set(certificates.flatMap((c) => c.skills || [])).size, icon: Layers, color: "text-cyan-400" },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)] relative overflow-hidden group hover:border-[var(--color-accent)]/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono tracking-widest text-[var(--color-muted)] uppercase">
                  {stat.label}
                </span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl sm:text-3xl font-black italic uppercase tracking-tight ${stat.color}`}>
                {stat.val}
              </p>
            </div>
          ))}
        </div>

        {/* ── Success Toast Notice ── */}
        <AnimatePresence>
          {successNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center justify-between gap-3 shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successNotice}</span>
              </div>
              <button onClick={() => setSuccessNotice("")} className="text-emerald-400/60 hover:text-emerald-400">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Streamlined Credential Intake Form (Two Options) ── */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] bg-[var(--color-bg-sunken)] border border-[var(--color-accent)]/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                
                {/* Form Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--color-border)] mb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center">
                      <Award className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-white">
                        Upload Certificate Credential
                      </h3>
                      <p className="text-xs font-mono text-[var(--color-muted)]">
                        Select your preferred verification method below.
                      </p>
                    </div>
                  </div>

                  {/* Two-Option Mode Switcher */}
                  <div className="flex items-center p-1 bg-[var(--color-bg-base)] rounded-xl border border-[var(--color-border)] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => { setUploadMode("auto"); setFormError(""); }}
                      className={`px-4 py-1.5 text-xs font-mono rounded-lg font-bold flex items-center gap-2 transition-all ${
                        uploadMode === "auto"
                          ? "bg-[var(--color-accent)] text-white shadow-md"
                          : "text-[var(--color-muted)] hover:text-white"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>1-Click AI Auto-Extract</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUploadMode("manual"); setFormError(""); }}
                      className={`px-4 py-1.5 text-xs font-mono rounded-lg font-bold flex items-center gap-2 transition-all ${
                        uploadMode === "manual"
                          ? "bg-[var(--color-accent)] text-white shadow-md"
                          : "text-[var(--color-muted)] hover:text-white"
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Manual Details + Upload</span>
                    </button>
                  </div>
                </div>

                {formError && (
                  <div className="p-3.5 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ──────────────── OPTION 1: 1-CLICK AI AUTO-EXTRACT ──────────────── */}
                  {uploadMode === "auto" && (
                    <div className="space-y-6">
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleFileDrop}
                        onClick={() => autoFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
                          dragActive
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 scale-[1.01]"
                            : file
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50 bg-[var(--color-bg-base)]/50"
                        }`}
                      >
                        <input
                          ref={autoFileInputRef}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                          className="hidden"
                          onChange={handleFileChange}
                        />

                        <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
                          {file ? (
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                          ) : (
                            <UploadCloud className="w-8 h-8 animate-bounce" />
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-tight">
                            {file ? file.name : "Drop Certificate File (PDF / Image) Here"}
                          </p>
                          <p className="text-xs font-mono text-[var(--color-muted)] mt-1">
                            {file
                              ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Ready for AI extraction`
                              : "or click to browse from device (PDF, PNG, JPG, WEBP • Max 15MB)"}
                          </p>
                        </div>

                        {!file && (
                          <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-400">
                            <Cpu className="w-3.5 h-3.5" />
                            <span>AI automatically extracts Title, Issuer, Date &amp; Skills</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                        <button
                          type="button"
                          onClick={resetForm}
                          className="vp-btn vp-btn-secondary text-xs px-5 py-2.5"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || !file}
                          className="vp-btn vp-btn-accent text-xs px-6 py-2.5 gap-2 shadow-lg disabled:opacity-50"
                        >
                          <Zap className={`w-4 h-4 ${submitting ? "animate-spin" : ""}`} />
                          <span>{submitting ? "Analyzing & Verifying..." : "⚡ Auto-Extract & Verify Credential"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ──────────────── OPTION 2: MANUAL SPECIFICATION + UPLOAD ──────────────── */}
                  {uploadMode === "manual" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Metadata Inputs */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5 font-bold">
                              Certificate Title *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. AWS Certified Solutions Architect - Associate"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="vp-input w-full text-xs font-mono py-2.5"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5 font-bold">
                              Issuing Organization *
                            </label>
                            <select
                              value={issuer}
                              onChange={(e) => setIssuer(e.target.value)}
                              className="vp-input w-full text-xs font-mono py-2.5 mb-2"
                            >
                              <option value="">Select Issuing Body / Provider</option>
                              {PRESET_ISSUERS.map((org) => (
                                <option key={org} value={org}>
                                  {org}
                                </option>
                              ))}
                              <option value="Other">Other / Custom Organization</option>
                            </select>
                            {issuer === "Other" && (
                              <input
                                type="text"
                                required
                                placeholder="Enter issuing organization name"
                                value={customIssuer}
                                onChange={(e) => setCustomIssuer(e.target.value)}
                                className="vp-input w-full text-xs font-mono py-2.5"
                              />
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5 font-bold">
                                Issue Date
                              </label>
                              <input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                className="vp-input w-full text-xs font-mono py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5 font-bold">
                                Expiry Date (Optional)
                              </label>
                              <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                className="vp-input w-full text-xs font-mono py-2"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5 font-bold">
                                Credential ID / License No.
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. AWS-PSA-108924"
                                value={credentialId}
                                onChange={(e) => setCredentialId(e.target.value)}
                                className="vp-input w-full text-xs font-mono py-2.5"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5 font-bold">
                                Verification URL
                              </label>
                              <input
                                type="url"
                                placeholder="https://www.credly.com/badges/..."
                                value={credentialUrl}
                                onChange={(e) => setCredentialUrl(e.target.value)}
                                className="vp-input w-full text-xs font-mono py-2.5"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right: File Drop + Skills */}
                        <div className="space-y-4 flex flex-col justify-between">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5 font-bold">
                              Certificate Proof Document (PDF / Image)
                            </label>
                            <div
                              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                              onDragLeave={() => setDragActive(false)}
                              onDrop={handleFileDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                dragActive
                                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                                  : file
                                  ? "border-emerald-500/50 bg-emerald-500/5"
                                  : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50 bg-[var(--color-bg-base)]"
                              }`}
                            >
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.webp"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                              <UploadCloud className="w-8 h-8 mx-auto text-[var(--color-muted)] mb-2" />
                              <p className="text-xs font-bold text-white uppercase tracking-tight">
                                {file ? file.name : "Drop PDF or Certificate Image here, or Browse"}
                              </p>
                              <p className="text-[10px] font-mono text-[var(--color-muted)] mt-1">
                                Max 15MB • PDF, PNG, JPG, WEBP
                              </p>
                            </div>
                          </div>

                          {/* Skill Tagger */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5 font-bold">
                              Mapped Technical Skills ({selectedSkills.length})
                            </label>
                            <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto p-1.5 bg-[var(--color-bg-base)] rounded-xl border border-[var(--color-border)]">
                              {PRESET_SKILLS.map((sk) => (
                                <button
                                  type="button"
                                  key={sk}
                                  onClick={() => toggleSkill(sk)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                                    selectedSkills.includes(sk)
                                      ? "bg-[var(--color-accent)] text-white font-bold"
                                      : "bg-white/5 text-[var(--color-muted)] hover:text-white"
                                  }`}
                                >
                                  {sk}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Add custom skill (e.g. GraphQL, Solidity)..."
                                value={customSkillInput}
                                onChange={(e) => setCustomSkillInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomSkill(); } }}
                                className="vp-input flex-1 text-xs font-mono py-2"
                              />
                              <button
                                type="button"
                                onClick={handleAddCustomSkill}
                                className="vp-btn vp-btn-secondary text-xs px-3 py-2"
                              >
                                Add Tag
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                        <button
                          type="button"
                          onClick={resetForm}
                          className="vp-btn vp-btn-secondary text-xs px-5 py-2.5"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="vp-btn vp-btn-accent text-xs px-6 py-2.5 gap-2 shadow-lg"
                        >
                          <ShieldCheck className={`w-4 h-4 ${submitting ? "animate-spin" : ""}`} />
                          <span>{submitting ? "Verifying..." : "🛡️ Verify & Save Credential"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--color-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search credentials, issuers, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="vp-input w-full text-xs font-mono pl-10 py-2.5"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {["all", "Verified", "Pending"].map((flt) => (
              <button
                key={flt}
                onClick={() => setActiveFilter(flt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeFilter === flt
                    ? "bg-[var(--color-accent)] text-white font-bold shadow"
                    : "bg-[var(--color-bg-sunken)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white"
                }`}
              >
                {flt === "all" ? "All Credentials" : flt}
              </button>
            ))}
          </div>
        </div>

        {/* ── Certificate Proof Ledger Grid ── */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[var(--color-accent)]" />
            <p className="text-xs font-mono text-[var(--color-muted)] uppercase tracking-widest">
              Querying cryptographically signed credential ledger...
            </p>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="py-20 text-center rounded-[var(--radius-2xl)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)] space-y-4">
            <Award className="w-12 h-12 text-[var(--color-muted)] mx-auto opacity-50" />
            <div>
              <h4 className="text-lg font-bold text-white uppercase tracking-tight">
                No Verified Credentials Found
              </h4>
              <p className="text-xs font-mono text-[var(--color-muted)] mt-1 max-w-md mx-auto">
                {searchQuery
                  ? "No credentials matched your search query."
                  : "Upload your professional certificates, AWS/GCP badges, or university proof to unlock verified status."}
              </p>
            </div>
            {!isFormOpen && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="vp-btn vp-btn-accent text-xs px-5 py-2.5 gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" /> Upload First Credential
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert) => (
              <motion.div
                key={cert._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-[var(--radius-xl)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 p-6 flex flex-col justify-between space-y-6 group transition-all relative overflow-hidden shadow-lg"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-[var(--color-accent)]/10 transition-colors pointer-events-none" />

                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" />
                      {cert.verificationStatus || "Verified"}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      +250 XP
                    </span>
                  </div>

                  {/* Title & Issuer */}
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-[var(--color-accent)] transition-colors leading-snug line-clamp-2">
                      {cert.title}
                    </h4>
                    <p className="text-xs font-mono text-cyan-400 mt-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>{cert.issuer}</span>
                    </p>
                  </div>

                  {/* Metadata row */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[var(--color-muted)] pt-2 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-muted)]" />
                      <span>
                        {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "Active"}
                      </span>
                    </div>
                    {cert.credentialId && (
                      <div className="truncate text-right" title={cert.credentialId}>
                        <span className="text-[var(--color-text)]">ID:</span> {cert.credentialId}
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  {cert.skills && cert.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {cert.skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-[var(--color-muted)]"
                        >
                          #{sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)] gap-2">
                  <div className="flex items-center gap-2">
                    {cert.fileUrl && (
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[11px] font-mono text-[var(--color-text)] flex items-center gap-1.5 transition-colors"
                        title="Preview Proof Document"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span>View Proof</span>
                      </button>
                    )}
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[11px] font-mono text-[var(--color-text)] flex items-center gap-1.5 transition-colors"
                        title="External Credential Link"
                      >
                        <ExternalLink className="w-3 h-3 text-amber-400" />
                        <span>Verify Link</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(cert._id)}
                    className="p-1.5 text-[var(--color-muted)] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Remove Certificate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Document Lightbox Preview Modal ── */}
        <AnimatePresence>
          {previewCert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setPreviewCert(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--color-bg-sunken)] border border-[var(--color-border)] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
              >
                <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-tight">
                        {previewCert.title}
                      </h3>
                      <p className="text-xs font-mono text-cyan-400">
                        {previewCert.issuer} {previewCert.credentialId ? `• ID: ${previewCert.credentialId}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={resolveFileUrl(previewCert.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="vp-btn vp-btn-secondary text-xs px-3 py-1.5 gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <button
                      onClick={() => setPreviewCert(null)}
                      className="text-[var(--color-muted)] hover:text-white p-1.5 rounded hover:bg-white/5"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-black/40 min-h-[400px]">
                  {previewCert.fileUrl?.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={resolveFileUrl(previewCert.fileUrl)}
                      title={previewCert.title}
                      className="w-full h-[600px] rounded-lg border border-[var(--color-border)]"
                    />
                  ) : (
                    <img
                      src={resolveFileUrl(previewCert.fileUrl)}
                      alt={previewCert.title}
                      className="max-h-[600px] w-auto object-contain rounded-lg border border-[var(--color-border)] shadow-lg"
                    />
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default CertificationsPage;
