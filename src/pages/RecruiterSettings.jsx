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
  "block w-full px-5 py-3.5 bg-[var(--color-bg-sunken)] border border-[var(--color-border)] hover:border-[var(--color-accent)] focus:outline-none focus:border-[var(--color-accent)] text-[var(--color-text)] placeholder-[var(--color-muted)] font-mono text-xs tracking-wider rounded-xl transition-all duration-200 shadow-sm";
const labelCls =
  "block text-xs uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-2 flex items-center gap-2 font-mono";

const TABS = [
  { id: "Identity", icon: User, label: "Recruiter Profile" },
  { id: "Organization", icon: Building2, label: "Company & Organization" },
  { id: "Outreach", icon: Bell, label: "Outreach & Alerts" },
  { id: "Security", icon: Lock, label: "Security & Keys" },
  { id: "DangerZone", icon: Trash2, label: "Danger Zone" },
];

export default function RecruiterSettings() {
  const { user, setUser, logout } = useAuth();
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

        const rawCompany = data.college || data.companyName || user?.companyName || "";
        const cleanCompany = (rawCompany.includes("linkedin.com") || rawCompany.startsWith("http")) ? "" : rawCompany;

        let savedLinkedin = data.linkedinUrl || data.linkedin || data.linkedinUsername || user?.linkedinUrl || user?.linkedin || user?.linkedinUsername || "";
        if (
          savedLinkedin.includes("www.linkedin.com/in/www.linkedin.com") ||
          savedLinkedin === "www.linkedin.com" ||
          savedLinkedin === "https://www.linkedin.com" ||
          savedLinkedin === "linkedin.com"
        ) {
          savedLinkedin = "";
        } else if (savedLinkedin.includes("linkedin.com/in/")) {
          const parts = savedLinkedin.split("linkedin.com/in/");
          const handle = parts[parts.length - 1].replace(/\/+$/, "").trim();
          savedLinkedin = (handle && handle !== "www.linkedin.com" && !handle.includes("http"))
            ? `https://www.linkedin.com/in/${handle}`
            : "";
        }

        setForm({
          name: data.name || user?.name || "",
          email: data.email || user?.email || "",
          bio: data.bio || "",
          phone: data.phone || "",
          location: data.location || "",
          website: data.website || "",
          company: cleanCompany,
          title: data.branch || "",
          linkedin: savedLinkedin,
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
      setUser((prev) => ({ ...prev, profileImage: data.profileImage }));
      triggerToast("Profile photo updated successfully.");
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
    setSaving(true);

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      triggerToast("New passwords do not match.", "error");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
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
      triggerToast("Recruiter settings updated successfully.");
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
        headers: { "x-confirm-password": "DELETE" },
      });
    } catch (err) {
      if (err.response?.status !== 404) {
        setDeleteError(
          err.response?.data?.message || "Failed to delete recruiter account."
        );
        setDeletingAccount(false);
        return;
      }
    }

    try {
      if (typeof logout === "function") logout();
    } catch (e) {
      // ignore
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-8 pb-16 pt-24 px-4 sm:px-6">
        {/* ── Toast Notification ── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 right-6 z-[9999] px-5 py-3.5 rounded-[var(--radius-lg)] border shadow-2xl flex items-center gap-3 font-mono text-xs ${
                toast.type === "error"
                  ? "bg-red-500/15 border-red-500/30 text-red-500"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-600"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-accent)]/10 mb-3">
              <Shield className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                Recruiter_Authority_Console
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-[var(--color-text)]">
              Recruiter <span className="text-[var(--color-accent)] not-italic">Settings</span>
            </h1>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              Configure organization identity, recruiter credentials, outreach parameters, and security keys.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
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
        <div className="vp-glass p-6 sm:p-8 rounded-3xl border border-[var(--color-border)] relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar & Camera Overlay */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[var(--color-accent)]/40 bg-[var(--color-bg-sunken)] flex items-center justify-center shadow-lg">
                {form.profileImage || user?.googlePhotoURL || user?.profileImage ? (
                  <img
                    src={cldProfilePhoto(form.profileImage || user?.googlePhotoURL || user?.profileImage)}
                    alt={form.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-[var(--color-accent)]">
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
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--color-accent)]" />
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
                <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
                  {form.name || "Verified Recruiter"}
                </h2>
                <span className="px-3 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/40 bg-emerald-500/15 text-emerald-600">
                  Verified Recruiter
                </span>
              </div>
              <p className="font-mono text-xs text-[var(--color-muted)] flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                {form.email}
              </p>
              {(form.company || form.linkedin) && (
                <p className="font-mono text-xs text-[var(--color-text-secondary)] flex items-center justify-center sm:justify-start gap-2">
                  <Building2 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
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
                      ? "bg-red-500/15 text-red-500 border border-red-500/30"
                      : "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30 shadow-sm font-black"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-sunken)]/60 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Form Content Area */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="vp-glass p-6 sm:p-8 rounded-3xl border border-[var(--color-border)] shadow-xl space-y-6">
              {/* ── TAB 1: IDENTITY ── */}
              {activeTab === "Identity" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-[var(--color-text)] mb-1">
                      Recruiter Identity
                    </h3>
                    <p className="text-xs text-[var(--color-muted)]">
                      Your personal recruiter details shown to verified candidates.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>
                        <User className="w-3.5 h-3.5 text-[var(--color-accent)]" />
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
                        <Mail className="w-3.5 h-3.5 text-[var(--color-accent)]" />
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
                        <Phone className="w-3.5 h-3.5 text-[var(--color-accent)]" />
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
                        label="Location / HQ"
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
                        <Cpu className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Role / Designation Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="e.g. Lead Technical Recruiter"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        <Linkedin className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Personal LinkedIn Profile
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
                  </div>

                  <div>
                    <label className={labelCls}>
                      <Fingerprint className="w-3.5 h-3.5 text-[var(--color-accent)]" />
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
                      Organization &amp; Agency Details
                    </h3>
                    <p className="text-xs text-[var(--color-muted)]">
                      Specify company details, corporate domain, and official talent branding nodes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>
                        <Building2 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Company / Organization Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="e.g. Infosys Technologies / SDMIT Labs"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        <Globe className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Corporate Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={form.website}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>
                        <Linkedin className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Company LinkedIn Page
                      </label>
                      <input
                        type="text"
                        name="linkedin"
                        value={form.linkedin}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        <Twitter className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        Twitter / X Handle
                      </label>
                      <input
                        type="text"
                        name="twitter"
                        value={form.twitter}
                        onChange={handleInputChange}
                        className={inputCls}
                        placeholder="@company_careers"
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
                      Outreach &amp; Notification Telemetry
                    </h3>
                    <p className="text-xs text-[var(--color-muted)]">
                      Control automated candidate notification updates and verdict alerts.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg-sunken)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-accent)]/50 transition-colors">
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

                    <label className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg-sunken)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-accent)]/50 transition-colors">
                      <div className="space-y-1">
                        <p className="text-xs font-mono font-bold uppercase text-[var(--color-text)]">
                          Platform Dashboard Alerts
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
                      Security &amp; Password Management
                    </h3>
                    <p className="text-xs text-[var(--color-muted)]">
                      Update your recruiter account password and security credentials.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>
                        <Lock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        New Password
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
                        Confirm Password
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
                  <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 space-y-2">
                    <h3 className="text-base font-black uppercase italic tracking-tight flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      Danger Zone — Purge Recruiter Account
                    </h3>
                    <p className="text-xs leading-relaxed opacity-90">
                      Permanently delete your recruiter account, created job postings, and applicant evaluations. This action is immediate and cannot be undone.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 cursor-pointer"
                  >
                    Purge Recruiter Account
                  </button>
                </motion.div>
              )}

              {/* Submit Button */}
              {activeTab !== "DangerZone" && (
                <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
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
