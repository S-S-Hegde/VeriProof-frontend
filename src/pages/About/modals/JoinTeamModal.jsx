import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Check } from "lucide-react";
import Swal from "sweetalert2";

export default function JoinTeamModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    email: "",
    linkedin: "",
    story: "",
    strengths: [],
    realms: []
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleStrength = (item) => {
    setFormData((prev) => ({
      ...prev,
      strengths: prev.strengths.includes(item)
        ? prev.strengths.filter((s) => s !== item)
        : [...prev.strengths, item]
    }));
  };

  const toggleRealm = (item) => {
    setFormData((prev) => ({
      ...prev,
      realms: prev.realms.includes(item)
        ? prev.realms.filter((r) => r !== item)
        : [...prev.realms, item]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Swal.fire({
        title: "We're excited!",
        text: "Thank you for helping us understand who you are. We appreciate you! We're usually in touch within about 2 weeks.",
        icon: "success",
        background: "#161226",
        color: "#ffffff",
        confirmButtonColor: "#AC24FF"
      });
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl border border-white/10 bg-[#161228]/98 p-6 sm:p-10 text-white shadow-2xl backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-5">
            <div>
              <span className="text-xs uppercase tracking-widest text-purple-400 font-medium">
                Join VeriProof
              </span>
              <h2 className="text-2xl font-medium tracking-tight mt-1">
                Tell us <span className="text-gradient-eterna">your story</span> :)
              </h2>
              <p className="text-xs text-white/60 mt-1">
                How did you get to where you are? What do you truly enjoy doing? (These are your superpowers)
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Location *
                </label>
                <input
                  required
                  type="text"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Email *
                </label>
                <input
                  required
                  type="email"
                  placeholder="you@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  LinkedIn / GitHub URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Strengths */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">
                Your primary enjoyable strength(s)
              </label>
              <div className="flex flex-wrap gap-2">
                {["Architecture & Systems", "Compilers & AST", "UI/UX & Design", "Security & Forensics", "Team Leadership"].map((item) => {
                  const active = formData.strengths.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleStrength(item)}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                          : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Realms of expertise */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">
                Your predominant realm(s) of expertise
              </label>
              <div className="flex flex-wrap gap-2">
                {["Frontend (React / Three.js)", "Backend (Node / Python)", "Algorithms / AI", "DevOps / Infrastructure"].map((item) => {
                  const active = formData.realms.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleRealm(item)}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                          : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Story textarea */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                What's your story? *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Tell us what excites you, what you've built, or what you'd love to work on..."
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-eterna-gradient rounded-xl px-7 py-2.5 text-sm font-medium text-white shadow-lg flex items-center gap-2"
              >
                {submitting ? "Sending..." : "Submit Story"}
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
