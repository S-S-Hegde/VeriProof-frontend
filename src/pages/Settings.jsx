import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import ConfirmationModal from "../components/common/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { resolveFileUrl } from "../utils/fileUrl";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Shield,
  Bell,
  Eye,
  Lock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Save,
  Terminal as TerminalIcon,
  Cpu,
  Activity,
  Zap,
  HardDrive,
  Fingerprint,
  Camera,
  Loader2,
  UploadCloud,
  FileText,
  FileUp,
  Trash2,
} from "lucide-react";
import { cldProfilePhoto } from "../utils/cloudinaryImage";
import LocationAutoSuggest from "../components/LocationAutoSuggest";

// Redesigned styling constants
const inputCls =
  "block w-full px-5 py-4 bg-[var(--color-bg)]/40 border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 focus:outline-none focus:border-[var(--color-accent)] text-[var(--color-text)] placeholder-[var(--color-muted)]/40 transition-all duration-500 font-mono text-xs tracking-wider";
const labelCls =
  "block text-sm uppercase tracking-[0.3em] font-bold text-[var(--color-muted)] mb-3 flex items-center gap-2";

const TABS = [
  { id: "Identity", icon: User, label: "User Identity" },
  { id: "Records", icon: GraduationCap, label: "Academic Records" },
  { id: "Evidence", icon: FileText, label: "Architectural Evidence" },
  { id: "Nodes", icon: Globe, label: "Network Nodes" },
  { id: "Privacy", icon: Eye, label: "Privacy Sync" },
  { id: "Shield", icon: Lock, label: "Security Shield" },
  { id: "DangerZone", icon: Trash2, label: "Danger Zone" },
];

const Settings = () => {
  const { user, setUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("Identity");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [systemStatus, setSystemStatus] = useState("Idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    githubUsername: "",
    college: "",
    branch: "",
    usn: "",
    batch: "",
    cgpa: "",
    skills: "",
    profileVisibility: "public",
    notifEmail: true,
    notifPlatform: true,
    newPassword: "",
    confirmPassword: "",
    profileImage: "",
    resumeUrl: "",
    resumeStatus: "",
  });

  const [uploading, setUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Danger Zone States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStepIndex, setDeleteStepIndex] = useState(-1);
  const [deleteError, setDeleteError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const navigate = useNavigate();

  const progressSteps = [
    "Removing Resume & File Artifacts...",
    "Removing Extracted Claims & Projects...",
    "Removing Exams & Verification Results...",
    "Annihilating Account Record..."
  ];

  const executeAccountDeletion = async (confirmData) => {
    setDeletingAccount(true);
    setDeleteError("");
    setDeleteStepIndex(0);

    const submittedPassword = typeof confirmData === "string" ? confirmData : confirmData?.password || "";
    const submittedConfirmText = typeof confirmData === "object" ? confirmData?.confirmText || "DELETE" : "DELETE";
    const activeToken = user?.token || localStorage.getItem("token");

    try {
      await new Promise((r) => setTimeout(r, 300));
      setDeleteStepIndex(1);

      await new Promise((r) => setTimeout(r, 300));
      setDeleteStepIndex(2);

      await new Promise((r) => setTimeout(r, 300));
      setDeleteStepIndex(3);

      await api.delete("/api/users/profile", {
        data: {
          password: submittedPassword,
          confirmText: submittedConfirmText,
        },
        headers: {
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });

      logout();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Destruction: Authorization Failed";
      if (err.response?.status === 404) {
        // Account already deleted
        logout();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
        return;
      }
      setDeleteError(errorMsg);
      setDeletingAccount(false);
      setDeleteStepIndex(-1);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setSystemStatus("Fetching_Data...");
      try {
        const { data } = await api.get("/api/users/profile");
        setForm({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          phone: data.phone || "",
          location: data.location || "",
          website: data.website || "",
          linkedin: data.linkedin || "",
          twitter: data.twitter || "",
          instagram: data.instagram || "",
          githubUsername: data.githubUsername || "",
          college: data.college || "",
          branch: data.branch || "",
          usn: data.usn || "",
          batch: data.batch || "",
          cgpa: data.cgpa || "",
          skills: (data.skills || []).join(", "),
          profileVisibility: data.profileVisibility || "public",
          notifEmail: data.notifications?.email ?? true,
          notifPlatform: data.notifications?.platform ?? true,
          newPassword: "",
          confirmPassword: "",
          profileImage: data.profileImage || "",
          resumeUrl: data.resumeUrl || "",
          resumeStatus: data.resumeStatus || "Not_Found",
        });
        setUser((prev) => ({
          ...prev,
          profileImage: data.profileImage || prev?.profileImage || "",
        }));
        setSystemStatus("Sync_Complete");
      } catch (err) {
        setSystemStatus("Sync_Error");
        if (err.response?.status === 401 || err.response?.status === 404) {
          logout();
          localStorage.clear();
          sessionStorage.clear();
          navigate("/", { replace: true });
        }
      }
    };
    fetchProfile();
  }, [user?.token]);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowed.includes(file.type)) {
      setToast({
        type: "error",
        msg: "Invalid file type. Use PDF, DOCX, or TXT.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", msg: "File too large. Maximum 5MB." });
      return;
    }

    setResumeUploading(true);
    setSystemStatus("Injecting_Evidence...");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const { data } = await api.post(
        "/api/users/profile/resume-file",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setForm((p) => ({
        ...p,
        resumeUrl: data.resumeUrl,
        resumeStatus: data.resumeStatus,
      }));
      setUser((prev) => ({
        ...prev,
        resumeUrl: data.resumeUrl,
        resumeStatus: data.resumeStatus,
        workflowState: prev ? { ...prev.workflowState, hasResume: true } : null,
      }));
      setToast({ type: "success", msg: "Evidence: Uplink Secured" });
      setSystemStatus("Sync_Success");
    } catch (err) {
      setToast({
        type: "error",
        msg: err.response?.data?.message || "Evidence: Protocol Fail",
      });
      setSystemStatus("Fatal_Error");
    } finally {
      setResumeUploading(false);
      setTimeout(() => setSystemStatus("Idle"), 2000);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        type: "error",
        msg: "Invalid image format. Please select an image file (JPG, PNG, WEBP, GIF).",
      });
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", msg: "Image too large. Maximum supported size is 5MB." });
      e.target.value = "";
      return;
    }

    setUploading(true);
    setSystemStatus("Syncing_Image_Node...");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const cfg = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const { data } = await api.post(
        "/api/users/profile/image",
        formData,
        cfg,
      );
      const newImg = data.profileImage || data.user?.profileImage;
      setForm((p) => ({ ...p, profileImage: newImg }));
      setUser((prev) => ({ ...prev, profileImage: newImg }));
      setToast({ type: "success", msg: "Image Stored Successfully in Database" });
      setSystemStatus("Sync_Success");
    } catch (err) {
      setToast({
        type: "error",
        msg: err.response?.data?.message || "Image Uplink Failed. Please check file size and format.",
      });
      setSystemStatus("Fatal_Error");
    } finally {
      setUploading(false);
      e.target.value = "";
      setTimeout(() => setSystemStatus("Idle"), 2000);
    }
  };

  const f = (key) => (e) => {
    setForm((p) => ({
      ...p,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
    setSystemStatus("Awaiting_Save");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setToast({ type: "error", msg: "Protocols: Password Mismatch" });
      return;
    }
    setSaving(true);
    setSystemStatus("Injecting_Data...");
    try {
      const payload = {
        name: form.name,
        bio: form.bio,
        phone: form.phone,
        location: form.location,
        website: form.website,
        linkedin: form.linkedin,
        twitter: form.twitter,
        instagram: form.instagram,
        githubUsername: form.githubUsername,
        college: form.college,
        branch: form.branch,
        usn: form.usn,
        batch: form.batch,
        cgpa: form.cgpa,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        profileVisibility: form.profileVisibility,
        notifications: { email: form.notifEmail, platform: form.notifPlatform },
        ...(form.newPassword ? { password: form.newPassword } : {}),
      };
      const { data } = await api.put("/api/users/profile", payload);
      setUser((prev) => ({ ...prev, ...data }));
      setToast({ type: "success", msg: "Success: Protocols Updated" });
      setSystemStatus("Protocol_Secured");
      setForm((p) => ({ ...p, newPassword: "", confirmPassword: "" }));
    } catch (err) {
      setToast({
        type: "error",
        msg: err.response?.data?.message || "Protocol: Update Failed",
      });
      setSystemStatus("Fatal_Error");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 pb-32 pt-12">
        {/* ── TOP TERMINAL BAR ── */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-[var(--color-border)] pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TerminalIcon className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-sm font-mono uppercase tracking-[0.4em] opacity-40">
                System // Configuration
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter h1 uppercase">
              Protocols.
            </h1>
          </div>

          <div className="flex flex-col items-end font-mono">
            <div className="flex items-center gap-4 text-sm uppercase tracking-[0.2em] mb-2">
              <span className="opacity-40">System_Status:</span>
              <span
                className={`flex items-center gap-2 ${systemStatus.includes("Error") ? "text-red-500" : "text-[var(--color-accent)]"}`}
              >
                <Activity className="w-3 h-3 animate-pulse" />
                {systemStatus}
              </span>
            </div>
            <div className="text-sm opacity-20 uppercase tracking-[0.2em]">
              Verified_Node: {user?.name?.replace(/\s+/g, "_").toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* ── SIDEBAR NAVIGATION ── */}
          <aside className="lg:col-span-3 flex flex-col gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center justify-between p-4 transition-all duration-500 ${
                    isActive
                      ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                      : "hover:bg-[var(--color-accent)]/5 text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? "opacity-100" : "opacity-40"}`}
                    />
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-left leading-tight">
                      {tab.label.replace("_", " ")}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-white"
                    />
                  )}
                  <Zap
                    className={`w-3 h-3 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}
                  />
                </button>
              );
            })}

            <div className="mt-12 p-6 border border-[var(--color-border)] opacity-30">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-3 h-3 text-[var(--color-accent)]" />
                <span className="text-sm uppercase font-bold tracking-widest">
                  Security_Level: 04
                </span>
              </div>
              <div className="h-1 bg-[var(--color-border)] w-full">
                <div className="h-full bg-[var(--color-accent)] w-3/4" />
              </div>
            </div>
          </aside>

          {/* ── MAIN CONFIGURATION AREA ── */}
          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {toast && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`fixed top-32 right-12 z-[100] flex items-center gap-4 px-6 py-4 backdrop-blur-xl border font-mono text-sm uppercase tracking-widest ${
                    toast.type === "success"
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
                >
                  {toast.type === "success" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {toast.msg}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSave} className="space-y-12">
              <AnimatePresence mode="wait">
                {/* ── IDENTITY TAB ── */}
                {activeTab === "Identity" && (
                  <motion.div
                    key="identity"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10"
                  >
                    <div className="md:col-span-2 flex items-center justify-between mb-8 border-b border-[var(--color-border)] pb-8">
                      <div className="flex items-center gap-4">
                        <Fingerprint className="w-6 h-6 text-[var(--color-accent)]" />
                        <h3 className="text-2xl font-bold h1 uppercase tracking-tighter">
                          Core Identity
                        </h3>
                      </div>

                      {/* MODERN IMAGE UPLOADER */}
                      <div className="relative group">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          className="hidden"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                        />
                        <div
                          onClick={() => fileInputRef.current.click()}
                          className="w-24 h-24 border-2 border-[var(--color-accent)] border-dashed flex items-center justify-center cursor-pointer overflow-hidden group-hover:bg-[var(--color-accent)]/5 transition-all relative"
                        >
                          {uploading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
                          ) : form.profileImage ? (
                            <img
                              src={cldProfilePhoto(form.profileImage)}
                              alt="Profile"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <Camera className="w-8 h-8 text-[var(--color-accent)] opacity-40" />
                          )}

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                            <UploadCloud className="w-5 h-5 text-white mb-1" />
                            <span className="text-xs text-white font-bold uppercase tracking-widest">
                              Update_Node
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelCls}>
                        <User className="w-3 h-3" />
                        Full_Legal_Name
                      </label>
                      <input
                        className={inputCls}
                        value={form.name}
                        onChange={f("name")}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        <Mail className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Gmail / Email Address
                      </label>
                      <input
                        type="email"
                        className={inputCls}
                        value={form.email || ""}
                        onChange={f("email")}
                        placeholder="user@gmail.com"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        <Phone className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Voice_Comms
                      </label>
                      <input
                        className={inputCls}
                        value={form.phone}
                        onChange={f("phone")}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <LocationAutoSuggest
                        labelCls={labelCls}
                        className={inputCls}
                        value={form.location || ""}
                        onChange={(val) => {
                          setForm((p) => ({ ...p, location: val }));
                          setSystemStatus("Awaiting_Save");
                        }}
                        placeholder="Select or type geographic origin (e.g. Bengaluru, India)"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelCls}>
                        <Cpu className="w-3 h-3" />
                        Personal_Manifesto
                      </label>
                      <textarea
                        rows={4}
                        className={inputCls}
                        value={form.bio}
                        onChange={f("bio")}
                        placeholder="ENCODE YOUR BIO..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelCls}>
                        <Zap className="w-3 h-3" />
                        Verified_Skill_Nodes
                      </label>
                      <input
                        className={inputCls}
                        value={form.skills}
                        onChange={f("skills")}
                        placeholder="REACT, TYPESCRIPT, KUBERNETES..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* ── EVIDENCE TAB ── */}
                {activeTab === "Evidence" && (
                  <motion.div
                    key="evidence"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-12"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="w-6 h-6 text-[var(--color-accent)]" />
                      <h3 className="text-2xl font-bold h1 uppercase tracking-tighter">
                        Architectural Evidence
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <div className="p-8 border border-[var(--color-border)] bg-[var(--color-bg)]/40 relative group overflow-hidden">
                          <h4 className={labelCls}>Resume_Protocol</h4>
                          <input
                            type="file"
                            ref={resumeInputRef}
                            onChange={handleResumeUpload}
                            className="hidden"
                            accept=".pdf,.docx,.txt"
                          />
                          <div
                            onClick={() => resumeInputRef.current.click()}
                            className="w-full h-48 border-2 border-[var(--color-accent)] border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-accent)]/5 transition-all relative group"
                          >
                            {resumeUploading ? (
                              <Loader2 className="w-10 h-10 animate-spin text-[var(--color-accent)]" />
                            ) : (
                              <>
                                <FileUp className="w-10 h-10 text-[var(--color-accent)] mb-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                <p className="text-sm font-bold uppercase tracking-widest">
                                  Inject_Binary_Evidence
                                </p>
                                <p className="text-xs opacity-40 uppercase mt-2 tracking-tighter">
                                  PDF // DOCX // TXT (MAX 5MB)
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="p-8 border border-[var(--color-border)] bg-[var(--color-bg)]/40">
                          <h4 className={labelCls}>Verification_Status</h4>
                          <div className="space-y-6">
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-sm font-mono opacity-40 uppercase mb-1">
                                  Current_State
                                </p>
                                <p className="text-2xl font-black italic tracking-tighter uppercase">
                                  {form.resumeStatus}
                                </p>
                              </div>
                              <div
                                className={`text-sm font-mono border px-2 py-0.5 ${form.resumeStatus === "Verified" ? "border-green-500 text-green-500" : "border-[var(--color-accent)] text-[var(--color-accent)]"}`}
                              >
                                {form.resumeStatus === "Verified"
                                  ? "ACTIVE"
                                  : "AWAITING_AUDIT"}
                              </div>
                            </div>

                            {form.resumeUrl && (
                              <a
                                href={resolveFileUrl(form.resumeUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full text-center py-4 border border-[var(--color-border)] hover:border-[var(--color-accent)] text-sm font-bold uppercase tracking-widest transition-all"
                              >
                                View_Current_Evidence
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="p-6 border border-dashed border-[var(--color-border)] opacity-40 italic">
                          <p className="text-sm leading-relaxed uppercase tracking-widest">
                            * Uploading new evidence will overwrite existing
                            metadata and reset the verification clock. Manual
                            audit typically completes within 24 standard cycles.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── RECORDS TAB ── */}
                {activeTab === "Records" && (
                  <motion.div
                    key="records"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10"
                  >
                    <div className="md:col-span-2 flex items-center gap-4 mb-4">
                      <GraduationCap className="w-6 h-6 text-[var(--color-accent)]" />
                      <h3 className="text-2xl font-bold h1 uppercase tracking-tighter">
                        Academic Ledger
                      </h3>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelCls}>Institution_Identifier</label>
                      <input
                        className={inputCls}
                        value={form.college}
                        onChange={f("college")}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        Field_of_Specialization
                      </label>
                      <input
                        className={inputCls}
                        value={form.branch}
                        onChange={f("branch")}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>System_Index (USN)</label>
                      <input
                        className={inputCls}
                        value={form.usn}
                        onChange={f("usn")}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Batch_Cycle</label>
                      <input
                        className={inputCls}
                        value={form.batch}
                        onChange={f("batch")}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        Performance_Index (CGPA)
                      </label>
                      <input
                        className={inputCls}
                        value={form.cgpa}
                        onChange={f("cgpa")}
                      />
                    </div>
                  </motion.div>
                )}

                {/* ── NODES TAB ── */}
                {activeTab === "Nodes" && (
                  <motion.div
                    key="nodes"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10"
                  >
                    <div className="md:col-span-2 flex items-center gap-4 mb-4">
                      <Globe className="w-6 h-6 text-[var(--color-accent)]" />
                      <h3 className="text-2xl font-bold h1 uppercase tracking-tighter">
                        External Links
                      </h3>
                    </div>

                    {[
                      {
                        key: "website",
                        icon: Globe,
                        label: "Primary_Node_URL",
                        ph: "HTTPS://...",
                      },
                      {
                        key: "linkedin",
                        icon: Linkedin,
                        label: "Professional_Registry",
                        ph: "LINKEDIN.COM/IN/...",
                      },
                      {
                        key: "github",
                        icon: Github,
                        label: "Source_Control_ID",
                        ph: "GITHUB_USERNAME",
                        fk: "githubUsername",
                      },
                      {
                        key: "twitter",
                        icon: Twitter,
                        label: "Signal_Stream",
                        ph: "@HANDLE",
                      },
                      {
                        key: "instagram",
                        icon: Instagram,
                        label: "Visual_Archive",
                        ph: "@HANDLE",
                      },
                    ].map(({ key, icon: Icon, label, ph, fk }) => (
                      <div key={key}>
                        <label className={labelCls}>
                          <Icon className="w-3 h-3" />
                          {label}
                        </label>
                        <input
                          className={inputCls}
                          value={form[fk || key]}
                          onChange={f(fk || key)}
                          placeholder={ph}
                        />
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* ── PRIVACY TAB ── */}
                {activeTab === "Privacy" && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-16"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-10">
                        <Bell className="w-6 h-6 text-[var(--color-accent)]" />
                        <h3 className="text-2xl font-bold h1 uppercase tracking-tighter">
                          Transmission Protocols
                        </h3>
                      </div>
                      <div className="space-y-6 max-w-2xl">
                        {[
                          {
                            key: "notifEmail",
                            label: "Email_Broadcasts",
                            desc: "Verification reports and secure handshakes via SMTP.",
                          },
                          {
                            key: "notifPlatform",
                            label: "Direct_Uplink",
                            desc: "Real-time system alerts and recruiter signals.",
                          },
                        ].map(({ key, label, desc }) => (
                          <label
                            key={key}
                            className="flex items-center justify-between group cursor-pointer p-4 border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-bold uppercase tracking-widest">
                                {label}
                              </span>
                              <span className="text-sm opacity-40 uppercase tracking-tighter">
                                {desc}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={form[key]}
                              onChange={f(key)}
                            />
                            <div
                              className={`w-10 h-5 rounded-sm transition-colors relative ${form[key] ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`}
                            >
                              <div
                                className={`absolute top-1 w-3 h-3 bg-white transition-all ${form[key] ? "left-6" : "left-1"}`}
                              />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-4 mb-10">
                        <Eye className="w-6 h-6 text-[var(--color-accent)]" />
                        <h3 className="text-2xl font-bold h1 uppercase tracking-tighter">
                          Visibility Shield
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          {
                            val: "public",
                            label: "Open_Mesh",
                            desc: "GLOBAL READ ACCESS",
                          },
                          {
                            val: "recruiters-only",
                            label: "Authorized_Only",
                            desc: "RECRUITER CLEARANCE",
                          },
                          {
                            val: "private",
                            label: "Restricted",
                            desc: "ZERO EXTERNAL ACCESS",
                          },
                        ].map(({ val, label, desc }) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              setForm((p) => ({
                                ...p,
                                profileVisibility: val,
                              }));
                              setSystemStatus("Awaiting_Save");
                            }}
                            className={`flex flex-col p-6 border transition-all text-left ${form.profileVisibility === val ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-bg)]" : "border-[var(--color-border)] opacity-40 hover:opacity-100 hover:border-[var(--color-accent)]/50"}`}
                          >
                            <span className="text-sm font-bold uppercase tracking-[0.2em] mb-2">
                              {label}
                            </span>
                            <span className="text-xs uppercase tracking-tighter font-mono">
                              {desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── SECURITY TAB ── */}
                {activeTab === "Shield" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10"
                  >
                    <div className="md:col-span-2 flex items-center gap-4 mb-4">
                      <Lock className="w-6 h-6 text-[var(--color-accent)]" />
                      <h3 className="text-2xl font-bold h1 uppercase tracking-tighter">
                        Authentication Re-Key
                      </h3>
                    </div>

                    <div className="md:col-span-2 text-sm opacity-40 font-mono uppercase tracking-[0.2em]">
                      MINIMUM_ENTROPY: 06_CHARACTERS // LEAVE BLANK TO RETAIN
                      CURRENT KEY
                    </div>

                    <div>
                      <label className={labelCls}>New_Access_Key</label>
                      <input
                        type="password"
                        className={inputCls}
                        value={form.newPassword}
                        onChange={f("newPassword")}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Validate_Access_Key</label>
                      <input
                        type="password"
                        className={inputCls}
                        value={form.confirmPassword}
                        onChange={f("confirmPassword")}
                      />
                    </div>

                    <div className="md:col-span-2 p-6 border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 flex items-center gap-6">
                      <HardDrive className="w-6 h-6 text-[var(--color-accent)] animate-pulse" />
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-accent)]">
                          Session_Persistence_Protocol
                        </p>
                        <p className="text-sm opacity-50 uppercase tracking-tighter mt-1">
                          Automatic session termination after 3600 seconds of
                          inactivity.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── DANGER ZONE TAB ── */}
                {activeTab === "DangerZone" && (
                  <motion.div
                    key="dangerzone"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4 border-b border-red-500/20 pb-6">
                      <Trash2 className="w-6 h-6 text-red-500" />
                      <h3 className="text-2xl font-bold h1 uppercase tracking-tighter text-red-500">
                        Danger Zone
                      </h3>
                    </div>

                    <div className="p-8 border border-red-500/30 bg-red-500/5 rounded-[var(--radius-md)] space-y-6">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-red-500">
                            Permanent Account Deletion
                          </h4>
                          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider leading-relaxed">
                            Warning: This action is completely irreversible.
                            Once confirmed, your candidate profile, claims
                            repository, verified projects, certificates, exam
                            results, and all local files will be permanently
                            erased. There is no way to recover your data.
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-red-500/20">
                        <button
                          type="button"
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full py-4 border border-red-500 hover:bg-red-500 hover:text-white text-red-500 font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-red-500/10"
                        >
                          INITIATE ACCOUNT ANNIHILATION
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── GLOBAL ACTION BAR (HIDDEN IN DANGER ZONE) ── */}
              {activeTab !== "DangerZone" && (
                <div className="flex items-center justify-between pt-12 border-t border-[var(--color-border)]">
                  <div className="hidden md:flex flex-col gap-1">
                    <span className="text-sm font-mono uppercase tracking-[0.2em] opacity-40">
                      Changes:{" "}
                      {systemStatus === "Awaiting_Save"
                        ? "UNCOMMITTED"
                        : "SYNCHRONIZED"}
                    </span>
                    <div
                      className={`h-[1px] w-32 ${systemStatus === "Awaiting_Save" ? "bg-red-500 animate-pulse" : "bg-[var(--color-accent)]"}`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="group flex items-center gap-4 px-12 py-5 bg-[var(--color-accent)] text-[var(--color-bg)] font-bold tracking-[0.4em] uppercase text-base shadow-[0_0_30px_var(--color-accent)]/20 hover:shadow-[0_0_40px_var(--color-accent)]/40 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      "SYNCHRONIZING..."
                    ) : (
                      <>
                        Execute_Update{" "}
                        <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* Confirmation Modal Component (Rendered outside outer form to prevent nested form submit) */}
            <ConfirmationModal
              isOpen={showDeleteModal}
              onClose={() => {
                if (!deletingAccount) setShowDeleteModal(false);
              }}
              onConfirm={executeAccountDeletion}
              title="Permanent Account Annihilation"
              subtitle="All evidence claims, GitHub nodes, assessment histories, and verified credentials will be permanently erased. This operation cannot be reversed."
              confirmText="DELETE"
              confirmButtonText="Annihilate Account"
              requirePassword={true}
              requireConfirmText={true}
              variant="danger"
              progressSteps={progressSteps}
              currentStepIndex={deleteStepIndex}
              isProcessing={deletingAccount}
              error={deleteError}
            />
          </main>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
