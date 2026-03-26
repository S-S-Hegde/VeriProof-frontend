import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { motion } from "framer-motion";
import axios from "axios";
import {
  User, Mail, Phone, MapPin, Globe, Linkedin, Twitter,
  Instagram, Github, BookOpen, Shield, Bell, Eye, Lock,
  CheckCircle, AlertCircle, GraduationCap, Save,
} from "lucide-react";

const inputCls = "block w-full px-4 py-3 bg-black/50 border border-orange-500/20 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-600 transition-colors text-sm";
const labelCls = "block text-xs uppercase tracking-widest font-bold text-gray-500 mb-2";
const sectionCls = "bg-black/70 backdrop-blur-xl border border-white/5 rounded-2xl p-7 relative overflow-hidden";

const TABS = ["Profile", "Academic", "Social", "Notifications & Privacy", "Security"];

const Settings = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab]   = useState("Profile");
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [form, setForm] = useState({
    name: "", email: "", bio: "", phone: "", location: "",
    website: "", linkedin: "", twitter: "", instagram: "", githubUsername: "",
    college: "", branch: "", usn: "", batch: "", cgpa: "",
    skills: "",
    profileVisibility: "public",
    notifEmail: true, notifPlatform: true,
    newPassword: "", confirmPassword: "",
  });

  // Load current profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cfg = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get("/api/users/profile", cfg);
        setForm({
          name:               data.name           || "",
          email:              data.email          || "",
          bio:                data.bio            || "",
          phone:              data.phone          || "",
          location:           data.location       || "",
          website:            data.website        || "",
          linkedin:           data.linkedin       || "",
          twitter:            data.twitter        || "",
          instagram:          data.instagram      || "",
          githubUsername:     data.githubUsername || "",
          college:            data.college        || "",
          branch:             data.branch         || "",
          usn:                data.usn            || "",
          batch:              data.batch          || "",
          cgpa:               data.cgpa           || "",
          skills:             (data.skills || []).join(", "),
          profileVisibility:  data.profileVisibility || "public",
          notifEmail:         data.notifications?.email    ?? true,
          notifPlatform:      data.notifications?.platform ?? true,
          newPassword: "", confirmPassword: "",
        });
      } catch {}
    };
    fetchProfile();
  }, [user.token]);

  const f = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setToast({ type: "error", msg: "Passwords do not match" });
      return;
    }
    setSaving(true);
    try {
      const cfg = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        name: form.name, bio: form.bio, phone: form.phone,
        location: form.location, website: form.website,
        linkedin: form.linkedin, twitter: form.twitter,
        instagram: form.instagram, githubUsername: form.githubUsername,
        college: form.college, branch: form.branch,
        usn: form.usn, batch: form.batch, cgpa: form.cgpa,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        profileVisibility: form.profileVisibility,
        notifications: { email: form.notifEmail, platform: form.notifPlatform },
        ...(form.newPassword ? { password: form.newPassword } : {}),
      };
      const { data } = await axios.put("/api/users/profile", payload, cfg);
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem("userInfo", JSON.stringify(updated));
      setToast({ type: "success", msg: "Profile updated successfully" });
      setForm((p) => ({ ...p, newPassword: "", confirmPassword: "" }));
    } catch (err) {
      setToast({ type: "error", msg: err.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto pb-24">

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl font-black text-white uppercase tracking-wide">
            Settings <span className="text-orange-500">&</span> Profile
          </h2>
          <div className="h-[2px] w-20 bg-orange-600 mt-4" />
        </div>

        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl mb-6 text-sm font-bold border ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}

        {/* Tab nav */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-4">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all
                ${activeTab === tab ? "bg-orange-600 text-white shadow-[0_0_12px_rgba(255,69,0,0.4)]" : "text-gray-500 hover:text-gray-300"}`}>
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave}>

          {/* ── PROFILE TAB ── */}
          {activeTab === "Profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className={`${sectionCls} space-y-6`}>
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-orange-500" />
                <h3 className="font-black uppercase tracking-widest text-sm text-white">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><label className={labelCls}><User className="inline w-3 h-3 mr-1" />Full Name</label>
                  <input className={inputCls} value={form.name} onChange={f("name")} required placeholder="Your full name" /></div>
                <div><label className={labelCls}><Mail className="inline w-3 h-3 mr-1" />Email</label>
                  <input className={`${inputCls} opacity-50 cursor-not-allowed`} value={form.email} disabled placeholder="Email cannot be changed" /></div>
                <div><label className={labelCls}><Phone className="inline w-3 h-3 mr-1" />Phone</label>
                  <input className={inputCls} value={form.phone} onChange={f("phone")} placeholder="+91 XXXXX XXXXX" /></div>
                <div><label className={labelCls}><MapPin className="inline w-3 h-3 mr-1" />Location</label>
                  <input className={inputCls} value={form.location} onChange={f("location")} placeholder="City, State" /></div>
                <div className="sm:col-span-2"><label className={labelCls}>Bio</label>
                  <textarea rows={3} className={inputCls} value={form.bio} onChange={f("bio")} placeholder="A short bio about yourself..." /></div>
                <div className="sm:col-span-2"><label className={labelCls}>Skills <span className="text-gray-600 normal-case tracking-normal">(comma separated)</span></label>
                  <input className={inputCls} value={form.skills} onChange={f("skills")} placeholder="React, Python, SQL, Docker" /></div>
              </div>
            </motion.div>
          )}

          {/* ── ACADEMIC TAB ── */}
          {activeTab === "Academic" && (
            <motion.div key="academic" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className={`${sectionCls} space-y-6`}>
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="w-5 h-5 text-orange-500" />
                <h3 className="font-black uppercase tracking-widest text-sm text-white">Academic Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><label className={labelCls}>College / University</label>
                  <input className={inputCls} value={form.college} onChange={f("college")} placeholder="e.g. Visvesvaraya Technological University" /></div>
                <div><label className={labelCls}>Branch / Department</label>
                  <input className={inputCls} value={form.branch} onChange={f("branch")} placeholder="e.g. Computer Science and Engineering" /></div>
                <div><label className={labelCls}>USN (University Seat Number)</label>
                  <input className={inputCls} value={form.usn} onChange={f("usn")} placeholder="e.g. 4SU21IS013" /></div>
                <div><label className={labelCls}>Batch / Year</label>
                  <input className={inputCls} value={form.batch} onChange={f("batch")} placeholder="e.g. 2021–2025" /></div>
                <div><label className={labelCls}>CGPA <span className="text-gray-600 normal-case tracking-normal">(minimal consideration factor)</span></label>
                  <input className={inputCls} value={form.cgpa} onChange={f("cgpa")} placeholder="e.g. 7.8 / 10" /></div>
              </div>
            </motion.div>
          )}

          {/* ── SOCIAL TAB ── */}
          {activeTab === "Social" && (
            <motion.div key="social" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className={`${sectionCls} space-y-6`}>
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-orange-500" />
                <h3 className="font-black uppercase tracking-widest text-sm text-white">Links & Social Profiles</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { key: "website",    icon: Globe,     label: "Portfolio / Website",  ph: "https://yoursite.com" },
                  { key: "linkedin",   icon: Linkedin,  label: "LinkedIn",            ph: "https://linkedin.com/in/username" },
                  { key: "github",     icon: Github,    label: "GitHub Username",     ph: "yourusername", fk: "githubUsername" },
                  { key: "twitter",    icon: Twitter,   label: "Twitter / X",         ph: "@handle" },
                  { key: "instagram",  icon: Instagram, label: "Instagram",           ph: "@handle" },
                ].map(({ key, icon: Icon, label, ph, fk }) => (
                  <div key={key}>
                    <label className={labelCls}><Icon className="inline w-3 h-3 mr-1" />{label}</label>
                    <input className={inputCls} value={form[fk || key]} onChange={f(fk || key)} placeholder={ph} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── NOTIFICATIONS & PRIVACY TAB ── */}
          {activeTab === "Notifications & Privacy" && (
            <motion.div key="notif" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className={`${sectionCls} space-y-8`}>
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <h3 className="font-black uppercase tracking-widest text-sm text-white">Notifications</h3>
                </div>
                {[
                  { key: "notifEmail",    label: "Email Notifications",    desc: "Receive updates, verification results, and recruiter messages via email" },
                  { key: "notifPlatform", label: "Platform Notifications",  desc: "In-app alerts for activity on your projects and profile" },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-4 cursor-pointer group mb-4">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input type="checkbox" className="sr-only" checked={form[key]} onChange={f(key)} />
                      <div className={`w-11 h-6 rounded-full transition-colors ${form[key] ? "bg-orange-600" : "bg-white/10"}`} />
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form[key] ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">{label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-5">
                  <Eye className="w-5 h-5 text-orange-500" />
                  <h3 className="font-black uppercase tracking-widest text-sm text-white">Profile Visibility</h3>
                </div>
                {[
                  { val: "public",           label: "Public",           desc: "Anyone on the platform can view your profile and projects" },
                  { val: "recruiters-only",  label: "Recruiters Only",  desc: "Only verified recruiters can view your full profile" },
                  { val: "private",          label: "Private",          desc: "Only you can see your profile" },
                ].map(({ val, label, desc }) => (
                  <label key={val} className="flex items-start gap-4 cursor-pointer mb-4">
                    <input type="radio" name="visibility" value={val} checked={form.profileVisibility === val}
                      onChange={() => setForm((p) => ({ ...p, profileVisibility: val }))}
                      className="mt-1 accent-orange-500 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-bold">{label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === "Security" && (
            <motion.div key="security" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className={`${sectionCls} space-y-6`}>
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-orange-500" />
                <h3 className="font-black uppercase tracking-widest text-sm text-white">Change Password</h3>
              </div>
              <p className="text-gray-500 text-xs">Leave blank if you don't want to change your password. Minimum 6 characters.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg">
                <div><label className={labelCls}>New Password</label>
                  <input type="password" className={inputCls} value={form.newPassword} onChange={f("newPassword")} placeholder="New password" /></div>
                <div><label className={labelCls}>Confirm Password</label>
                  <input type="password" className={inputCls} value={form.confirmPassword} onChange={f("confirmPassword")} placeholder="Confirm password" /></div>
              </div>
              <div className="flex items-center gap-3 mt-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/15">
                <Shield className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <p className="text-gray-400 text-xs">Session automatically expires after <span className="text-orange-400 font-bold">1 hour</span> of inactivity for security.</p>
              </div>
            </motion.div>
          )}

          {/* Save button – always visible */}
          <div className="flex justify-end mt-6">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-black tracking-widest uppercase text-sm shadow-[0_0_18px_rgba(255,69,0,0.4)] transition-all disabled:opacity-50">
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default Settings;
