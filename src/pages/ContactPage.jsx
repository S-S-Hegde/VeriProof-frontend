import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  Loader2,
} from "lucide-react";

const TextReveal = ({ children, delay = 0 }) => (
  <div className="overflow-hidden">
    <motion.div
      initial={{ y: "110%" }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  </div>
);

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSent(true);
    setLoading(false);
  };

  const INFO = [
    { icon: Mail, label: "Comms Address", value: "hello@veriproof.io" },
    {
      icon: MessageSquare,
      label: "Live Support",
      value: "Available 09:00 – 18:00 IST",
    },
    {
      icon: MapPin,
      label: "Node Location",
      value: "Bengaluru, Karnataka, India",
    },
    { icon: Clock, label: "Response SLA", value: "< 24 hours" },
  ];

  return (
    <div className="min-h-screen pt-20">
      <section className="relative py-24 lg:py-36 px-6 border-b border-[var(--color-border)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--color-accent),transparent_60%)] opacity-[0.04] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-[var(--color-accent)] mb-6"
          >
            <Mail className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-[0.4em]">
              Contact_Protocol
            </span>
          </motion.div>
          <TextReveal>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black italic uppercase tracking-tighter leading-[0.85]">
              Get In
              <br />
              <span className="text-[var(--color-accent)] not-italic">
                Touch.
              </span>
            </h1>
          </TextReveal>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-xl mt-8 text-sm opacity-50 leading-relaxed"
          >
            Have a question about VeriProof, want to report a bug, or explore an
            enterprise partnership? Our team responds within 24 hours.
          </motion.p>
        </div>
      </section>

      <section className="py-20 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-1">
          <div className="border border-[var(--color-border)] p-10 lg:p-16">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-10">
              Contact Info
            </h2>
            <div className="space-y-0">
              {INFO.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-5 py-6 border-b border-[var(--color-border)] last:border-0 group hover:pl-2 transition-all duration-500"
                >
                  <div className="w-10 h-10 border border-[var(--color-border)] flex items-center justify-center shrink-0 group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] transition-all duration-500">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-30 mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm font-bold">{item.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-[var(--color-border)] p-10 lg:p-16"
          >
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                <div className="w-16 h-16 border-2 border-green-500 flex items-center justify-center">
                  <Send className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                  Transmission Received
                </h3>
                <p className="text-sm opacity-50 max-w-sm">
                  We've logged your message and will respond to your comms
                  address within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="mt-4 px-6 py-3 border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  Initialize New Transmission
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">
                  Send Message
                </h2>
                {[
                  {
                    key: "name",
                    label: "Full Name",
                    type: "text",
                    placeholder: "JOHN DOE",
                  },
                  {
                    key: "email",
                    label: "Email Address",
                    type: "email",
                    placeholder: "NAME@DOMAIN.COM",
                  },
                  {
                    key: "subject",
                    label: "Subject",
                    type: "text",
                    placeholder: "PARTNERSHIP / BUG REPORT / GENERAL",
                  },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key} className="relative group">
                    <input
                      id={`contact-${key}`}
                      type={type}
                      required
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, [key]: e.target.value }))
                      }
                      className="w-full bg-transparent border border-[var(--color-border)] px-4 py-4 focus:border-[var(--color-accent)] outline-none transition-all duration-300 text-sm font-mono tracking-wider placeholder:opacity-20"
                    />
                    <label
                      htmlFor={`contact-${key}`}
                      className="absolute -top-3 left-4 px-2 text-[10px] uppercase font-bold tracking-[0.2em] bg-[var(--color-bg)]"
                    >
                      {label}
                    </label>
                  </div>
                ))}
                <div className="relative group">
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="DESCRIBE YOUR QUERY IN DETAIL..."
                    value={form.message}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, message: e.target.value }))
                    }
                    className="w-full bg-transparent border border-[var(--color-border)] px-4 py-4 focus:border-[var(--color-accent)] outline-none transition-all duration-300 text-sm font-mono tracking-wider placeholder:opacity-20 resize-none"
                  />
                  <label
                    htmlFor="contact-message"
                    className="absolute -top-3 left-4 px-2 text-[10px] uppercase font-bold tracking-[0.2em] bg-[var(--color-bg)]"
                  >
                    Message
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--color-text)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all duration-500 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Transmit Message</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
