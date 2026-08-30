import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  ShieldCheck,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  Sparkles,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  Loader2,
  Building,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  Check,
} from "lucide-react";
import api from "../utils/api";

const PRESET_ISSUERS = [
  "Amazon Web Services (AWS)",
  "Google Cloud Platform (GCP)",
  "Microsoft Azure",
  "Meta / Coursera",
  "DeepLearning.AI",
  "HackerRank",
  "Linux Foundation",
  "Oracle",
  "Stanford University Online",
  "HarvardX",
];

const SUGGESTED_SKILLS = [
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

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  // Modal Preview
  const [previewCert, setPreviewCert] = useState(null);

  const fileInputRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const finalIssuer = issuer === "Other" ? customIssuer.trim() : issuer.trim();
    if (!title.trim() || !finalIssuer) {
      setFormError("Certificate title and issuing organization are required.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
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

      const { data } = await api.post("/api/certificates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCertificates((prev) => [data, ...prev]);
      setSuccessNotice(`Credential "${data.title}" successfully verified and added to your proof ledger! (+250 XP)`);
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
      setFormError(err.response?.data?.message || "Failed to upload certificate.");
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
              {isFormOpen ? "Close Vault Intake" : "Upload Credential"}
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

        {/* ── Credential Intake Form (Interactive Matrix) ── */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] bg-[var(--color-bg-sunken)] border border-[var(--color-accent)]/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                <div className="flex items-center justify-between pb-6 border-b border-[var(--color-border)] mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center">
                      <Award className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-white">
                        Submit Credential Proof
                      </h3>
                      <p className="text-xs font-mono text-[var(--color-muted)]">
                        Attach document evidence &amp; map technical skills to verify.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-[var(--color-muted)] hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <div className="p-3.5 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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

                    {/* Right: File Upload & Skill Tagging */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5 font-bold">
                          Certificate Proof Document (PDF / Image)
                        </label>
                        <div
                          onDragEnter={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleFileDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                            dragActive
                              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                              : file
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50 bg-black/20"
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.webp"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          {file ? (
                            <div className="flex flex-col items-center gap-2">
                              <CheckCircle className="w-8 h-8 text-emerald-400" />
                              <p className="text-xs font-mono font-bold text-white truncate max-w-xs">
                                {file.name}
                              </p>
                              <span className="text-[10px] font-mono text-[var(--color-muted)]">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB · Click to replace
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="w-8 h-8 text-[var(--color-muted)] group-hover:text-[var(--color-accent)]" />
                              <p className="text-xs font-mono text-white">
                                Drop PDF or Certificate Image here, or <span className="text-[var(--color-accent)] underline">Browse</span>
                              </p>
                              <span className="text-[10px] font-mono text-[var(--color-muted)]">
                                Max 15MB · PDF, PNG, JPG, WEBP
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Skill Tags */}
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5 font-bold">
                          Mapped Technical Skills ({selectedSkills.length})
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-28 overflow-y-auto p-2 bg-black/20 rounded-lg border border-[var(--color-border)]">
                          {SUGGESTED_SKILLS.map((sk) => {
                            const active = selectedSkills.includes(sk);
                            return (
                              <button
                                type="button"
                                key={sk}
                                onClick={() => toggleSkill(sk)}
                                className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-all flex items-center gap-1 border ${
                                  active
                                    ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-sm"
                                    : "bg-white/5 text-[var(--color-muted)] border-white/5 hover:border-white/20 hover:text-white"
                                }`}
                              >
                                {active && <Check className="w-3 h-3" />}
                                {sk}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add custom skill (e.g. GraphQL, Solidity)..."
                            value={customSkillInput}
                            onChange={(e) => setCustomSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomSkill();
                              }
                            }}
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

                  <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="vp-btn vp-btn-secondary text-xs px-4 py-2.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="vp-btn vp-btn-accent text-xs px-6 py-2.5 gap-2 shadow-lg disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      {submitting ? "Cryptographically Stamping..." : "Verify & Save Credential"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search certificates, skills, or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="vp-input w-full pl-9 pr-4 py-2 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">
              Ledger Vault: {filteredCertificates.length} {filteredCertificates.length === 1 ? "Proof" : "Proofs"}
            </span>
          </div>
        </div>

        {/* ── Certificate Vault Grid ── */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 border border-dashed border-[var(--color-border)] rounded-2xl bg-black/10">
            <Loader2 className="w-7 h-7 text-[var(--color-accent)] animate-spin" />
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted)]">
              Loading Proof Ledger &amp; Badges...
            </p>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="p-12 text-center border border-[var(--color-border)] rounded-2xl bg-black/20 space-y-4">
            <Award className="w-12 h-12 text-amber-400/40 mx-auto" />
            <h3 className="text-lg font-bold uppercase tracking-tight text-white">
              {searchQuery ? "No Matching Credentials Found" : "No Certifications Added Yet"}
            </h3>
            <p className="text-xs font-mono text-[var(--color-muted)] max-w-md mx-auto">
              {searchQuery
                ? "Try searching with different skill keywords or provider names."
                : "Upload your professional licenses, course completions, and cloud badges to prove technical capability and boost your candidate ranking."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="vp-btn vp-btn-accent text-xs py-2.5 px-5 inline-flex gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Upload First Credential
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert) => {
              const formattedDate = cert.issueDate
                ? new Date(cert.issueDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "Verified Proof";

              return (
                <motion.div
                  key={cert._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[var(--radius-xl)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)] hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group shadow-md hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]"
                >
                  {/* Glowing Top Amber Stripe */}
                  <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

                  <div className="p-6 space-y-4">
                    {/* Header: Verified Stamp & Node ID */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/30">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        Verified Badge
                      </span>
                      <span className="text-[10px] font-mono text-[var(--color-muted)]">
                        +250 XP
                      </span>
                    </div>

                    {/* Title & Provider */}
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                        {cert.title}
                      </h3>
                      <p className="text-xs font-mono text-cyan-400 mt-1 flex items-center gap-1.5 font-bold">
                        <Building className="w-3.5 h-3.5" />
                        {cert.issuer}
                      </p>
                    </div>

                    {/* Metadata & Credential ID */}
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-[var(--color-muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-500" /> Issue Date:
                        </span>
                        <span className="text-white font-bold">{formattedDate}</span>
                      </div>
                      {cert.credentialId && (
                        <div className="flex items-center justify-between text-[var(--color-muted)] pt-1 border-t border-white/5">
                          <span>License ID:</span>
                          <span className="text-amber-300 font-bold truncate max-w-[140px]" title={cert.credentialId}>
                            {cert.credentialId}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Skill Tags */}
                    {cert.skills && cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cert.skills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/[0.04] text-gray-300 border border-white/10"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="px-6 py-3.5 bg-black/30 border-t border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {cert.fileUrl && (
                        <button
                          onClick={() => setPreviewCert(cert)}
                          className="text-[10px] font-mono font-bold uppercase text-[var(--color-muted)] hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Proof
                        </button>
                      )}
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono font-bold uppercase text-[var(--color-muted)] hover:text-amber-400 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Check URL
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(cert._id)}
                      className="text-[10px] font-mono text-red-400/60 hover:text-red-400 transition-colors p-1"
                      title="Delete Certificate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Document Lightbox Modal ── */}
        <AnimatePresence>
          {previewCert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
              onClick={() => setPreviewCert(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[90vh] bg-[var(--color-bg-sunken)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] overflow-hidden flex flex-col shadow-2xl"
              >
                {/* Modal Header */}
                <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-black/30">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-base font-bold text-white uppercase tracking-tight">
                        {previewCert.title}
                      </h4>
                      <p className="text-xs font-mono text-[var(--color-muted)]">
                        Issued by {previewCert.issuer}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {previewCert.fileUrl && (
                      <a
                        href={previewCert.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="vp-btn vp-btn-secondary text-xs px-3 py-1.5 gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Direct
                      </a>
                    )}
                    <button
                      onClick={() => setPreviewCert(null)}
                      className="text-[var(--color-muted)] hover:text-white p-1 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-auto p-4 bg-black/50 flex items-center justify-center min-h-[400px]">
                  {previewCert.fileUrl?.endsWith(".pdf") ? (
                    <iframe
                      src={previewCert.fileUrl}
                      title="Certificate PDF"
                      className="w-full h-[600px] rounded-lg border border-white/10"
                    />
                  ) : (
                    <img
                      src={previewCert.fileUrl}
                      alt={previewCert.title}
                      className="max-h-[600px] object-contain rounded-lg border border-white/10 shadow-2xl"
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
