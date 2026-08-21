import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Building2,
  Shield,
  Bell,
  Eye,
  Lock,
  CheckCircle,
  AlertCircle,
  Save,
  Cpu,
  Activity,
  Zap,
  Fingerprint,
  Camera,
  Loader2,
  Trash2,
} from "lucide-react";
import { cldProfilePhoto } from "../utils/cloudinaryImage";
import LocationAutoSuggest from "../components/LocationAutoSuggest";
import ConfirmModal from "../components/ConfirmModal";

/* ═══════════════════════════════════════════════════
   RECRUITER SETTINGS — Investigator Protocols
   Tailored configuration portal for Recruiters.
   Identity, Organization, Outreach & Security.
   ═══════════════════════════════════════════════════ */

const inputCls =
  "block w-full px-5 py-3.5 bg-slate-950/80 border border-slate-700 hover:border-cyan-400/80 focus:outline-none focus:border-cyan-400 text-white placeholder-slate-500 font-mono text-xs tracking-wider rounded-xl transition-all duration-200 shadow-inner";
const labelCls =
  "block text-xs uppercase tracking-wider font-bold text-slate-300 mb-2 flex items-center gap-2 font-mono";

const TABS = [
  { id: "Identity", icon: User, label: "Recruiter Profile" },
  { id: "Organization", icon: Building2, label: "Company & Organization" },
  { id: "Outreach", icon: Bell, label: "Outreach & Alerts" },
  { id: "Security", icon: Lock, label: "Security & Keys" },
  { id: "DangerZone", icon: Trash2, label: "Danger Zone" },
];

export default function RecruiterSettings() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Identity");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
    website: "",
    company: "",
    title: "",
    linkedin: "",
    twitter: "",
    notifEmail: true,
    notifPlatform: true,
    newPassword: "",
    confirmPassword: "",
    profileImage: "",
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Danger Zone Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Load recruiter profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get("/api/users/profile");
        const activePhoto =
          data.profileImage ||
          data.googlePhotoURL ||
          user?.googlePhotoURL ||
          user?.profileImage ||
          "";

        setForm({
          name: data.name || user?.name || "",
          email: data.email || user?.email || "",
          bio: data.bio || "",
          phone: data.phone || "",
          location: data.location || "",
          website: data.website || "",
          company: data.college || data.companyName || user?.companyName || "",
          title: data.branch || "",
          linkedin: data.linkedin || data.linkedinUsername || user?.linkedinUsername || "",
          twitter: data.twitter || "",
          notifEmail: data.notifications?.email ?? true,
          notifPlatform: data.notifications?.platform ?? true,
          newPassword: "",
          confirmPassword: "",
          profileImage: activePhoto,
        });

        setUser((prev) => ({
          ...prev,
          profileImage: activePhoto || prev?.profileImage || "",
        }));
      } catch (err) {
        console.error("Failed to load recruiter profile:", err);
        if (err.response?.status === 401 || err.response?.status === 404) {
          logout();
          localStorage.clear();
          sessionStorage.clear();
          navigate("/", { replace: true });
        }
      }
    };
    loadProfile();
  }, []);

  const triggerToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post("/api/users/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, profileImage: data.profileImage }));
      if (user) {
        setUser({ ...user, profileImage: data.profileImage });
      }
      triggerToast("Investigator avatar updated successfully.");
    } catch (err) {
      triggerToast(
        err.response?.data?.message || "Failed to upload profile photo.",
        "error"
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      triggerToast("Access key passwords do not match.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        bio: form.bio,
        phone: form.phone,
        location: form.location,
        website: form.website,
        college: form.company, // maps company to college field in DB
        branch: form.title,    // maps designation to branch field in DB
        linkedin: form.linkedin,
        twitter: form.twitter,
        notifications: {
          email: form.notifEmail,
          platform: form.notifPlatform,
        },
      };

      if (form.newPassword) {
        payload.password = form.newPassword;
      }

      const { data } = await api.put("/api/users/profile", payload);
      setUser(data);
      triggerToast("Investigator settings updated successfully.");
      setForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
    } catch (err) {
      triggerToast(
        err.response?.data?.message || "Failed to update recruiter settings.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteError("");
    try {
      await api.delete("/api/users/profile", {
        data: { password: "DELETE" },
        headers: { "x-confirm-password": "DELETE" }
      });
      logout();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    } catch (err) {
      if (err.response?.status === 404) {
        logout();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
        return;
      }
      setDeleteError(
        err.response?.data?.message || "Failed to delete recruiter account."
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* ── Toast Notification ── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 right-6 z-[9999] px-5 py-3.5 rounded-[var(--radius-lg)] border shadow-2xl flex items-center gap-3 font-mono text-xs ${
                toast.type === "error"
                  ? "bg-red-500/15 border-red-500/30 text-red-400"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              }`}
            >
              {toast.type === "error" ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{toast.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-3">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-cyan-400">
                Recruiter_Authority_Console
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white">
              Recruiter <span className="text-cyan-400 not-italic">Settings</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Configure organization identity, recruiter credentials, outreach parameters, and security keys.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save_Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Profile Header Card ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1222]/90 border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar & Camera Overlay */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-cyan-400/40 bg-slate-950 flex items-center justify-center shadow-xl">
                {form.profileImage || user?.googlePhotoURL || user?.profileImage ? (
                  <img
                    src={cldProfilePhoto(form.profileImage || user?.googlePhotoURL || user?.profileImage)}
                    alt={form.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-cyan-400">
                    {form.name ? form.name.charAt(0).toUpperCase() : "R"}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 text-[10px] font-mono uppercase tracking-wider cursor-pointer"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>Upload</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Recruiter Details Summary */}
            <div className="text-center sm:text-left space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {form.name || "Verified Recruiter"}
                </h2>
                <span className="px-3 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
                  Verified Recruiter
                </span>
              </div>
              <p className="font-mono text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                {form.email}
              </p>
              {(form.company || form.linkedin) && (
                <p className="font-mono text-xs text-gray-300 flex items-center justify-center sm:justify-start gap-2">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  {form.title ? `${form.title} at ${form.company}` : form.company || form.linkedin}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Layout: Tabs + Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            {TABS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider text-left transition-all cursor-pointer ${
                  activeTab === id
                    ? id === "DangerZone"
                      ? "bg-red-500/15 text-red-400 border border-red-500/30"
                      : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Form Content Area */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#0c1222]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
              {/* ── TAB 1: IDENTITY ── */}
              {activeTab === "Identity" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white mb-1">
                      Recruiter Identity
                    </h3>
                    <p className="text-xs text-gray-400">
                      Your personal recruiter details shown to verified candidates.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="e.g. Sharatkumar Hegde"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email || ""}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="recruiter@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>
                        <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <LocationAutoSuggest
                        labelCls={labelCls}
                        className={inputCls}
                        value={form.location || ""}
                        onChange={(val) => {
                          setForm((p) => ({ ...p, location: val }));
                        }}
                        placeholder="Select or type HQ Location (e.g. Bengaluru, India)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>
                        <Linkedin className="w-3.5 h-3.5 text-cyan-400" />
                        LinkedIn Profile / Handle
                      </label>
                      <input
                        type="text"
                        name="linkedin"
                        value={form.linkedin}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="e.g. SDMIT Labs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>
                      <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                      Professional Bio &amp; Outreach Signature
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={form.bio}
                      onChange={handleInputChange}
                      className={inputCls}
                      placeholder="Lead Technical Recruiter specializing in Software Engineering & AI talent."
                    />
                  </div>
                </motion.div>
              )}

              {/* ── TAB 2: ORGANIZATION ── */}
              {activeTab === "Organization" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-[var(--color-text)] mb-1">
                      Organization & Agency Details
                    </h3>
                    <p className="text-xs text-[var(--color-muted)]">
                      Specify company name, recruiter role title, and official web nodes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>
                        <Building2 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Organization / Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="Infosys Technologies Ltd."
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        <Cpu className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Designation / Role_Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="Principal Engineering Recruiter"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className={labelCls}>
                        <Globe className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Corporate_Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={form.website}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="https://company.in"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        <Linkedin className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        LinkedIn_Node
                      </label>
                      <input
                        type="text"
                        name="linkedin"
                        value={form.linkedin}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="https://linkedin.com/in/recruiter"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        <Twitter className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Twitter_Handle
                      </label>
                      <input
                        type="text"
                        name="twitter"
                        value={form.twitter}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="@recruiter_india"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── TAB 3: OUTREACH ── */}
              {activeTab === "Outreach" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-[var(--color-text)] mb-1">
                      Outreach & Automation Telemetry
                    </h3>
                    <p className="text-xs text-[var(--color-muted)]">
                      Control automated candidate notification updates and verdict alerts.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 rounded-[var(--radius-xl)] bg-[var(--color-bg-sunken)]/50 border border-[var(--color-border)] cursor-pointer">
                      <div className="space-y-1">
                        <p className="text-xs font-mono font-bold uppercase text-[var(--color-text)]">
                          Email Outreach Confirmations
                        </p>
                        <p className="text-[11px] text-[var(--color-muted)]">
                          Receive automated email dispatches when candidates are ranked or verified.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        name="notifEmail"
                        checked={form.notifEmail}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-[var(--color-accent)] cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-[var(--radius-xl)] bg-[var(--color-bg-sunken)]/50 border border-[var(--color-border)] cursor-pointer">
                      <div className="space-y-1">
                        <p className="text-xs font-mono font-bold uppercase text-[var(--color-text)]">
                          System Platform Notifications
                        </p>
                        <p className="text-[11px] text-[var(--color-muted)]">
                          Show real-time dashboard notifications for new candidate applications.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        name="notifPlatform"
                        checked={form.notifPlatform}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-[var(--color-accent)] cursor-pointer"
                      />
                    </label>
                  </div>
                </motion.div>
              )}

              {/* ── TAB 4: SECURITY ── */}
              {activeTab === "Security" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-[var(--color-text)] mb-1">
                      Security Shield & Access Keys
                    </h3>
                    <p className="text-xs text-[var(--color-muted)]">
                      Update your recruiter account password and cryptographic key parameters.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>
                        <Lock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        New_Access_Key
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        <Lock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Confirm_Access_Key
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── TAB 5: DANGER ZONE ── */}
              {activeTab === "DangerZone" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="p-4 rounded-[var(--radius-xl)] bg-red-500/10 border border-red-500/30 text-red-400">
                    <h3 className="text-lg font-black uppercase italic tracking-tight mb-1 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      Danger Zone — Purge Recruiter Account
                    </h3>
                    <p className="text-xs leading-relaxed opacity-90">
                      Permanently delete your recruiter account, job postings, and saved applicant pools. This action is irreversible.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 rounded-[var(--radius-md)] bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-500/20"
                  >
                    Purge_Recruiter_Account
                  </button>
                </motion.div>
              )}

              {/* Submit Button */}
              {activeTab !== "DangerZone" && (
                <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="vp-btn vp-btn-accent text-xs px-6 py-3 gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save_Configuration</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ── Delete Account Confirmation Modal ── */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => !deletingAccount && setShowDeleteModal(false)}
          onConfirm={handleConfirmDeleteAccount}
          title="Purge Recruiter Account"
          message="Are you sure you want to permanently delete your recruiter profile, organization credentials, and saved applicant records?"
          subtitle={deleteError ? deleteError : `Account: ${form.email}`}
          confirmText="Purge Account"
          cancelText="Cancel"
          variant="danger"
          loading={deletingAccount}
        />
      </div>
    </PageTransition>
  );
}
