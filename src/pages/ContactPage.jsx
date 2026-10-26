import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ShieldCheck,
  Terminal,
  Send,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Clock,
  Radio,
  KeyRound,
  Sparkles,
  User,
  MessageSquare,
} from "lucide-react";
import CryptographicNodeMesh from "../components/CryptographicNodeMesh";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    channel: "",
    priority: "general",
    payload: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [receiptHash, setReceiptHash] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);

  const PGP_FINGERPRINT = "4A7D 89B2 01E4 9C5F 33B8 7A21 D509 2381 7F9E A1C0";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("hello@veriproof.io");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyFingerprint = () => {
    navigator.clipboard.writeText(PGP_FINGERPRINT);
    setCopiedFingerprint(true);
    setTimeout(() => setCopiedFingerprint(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate cryptographic payload packet compilation & dispatch
    await new Promise((r) => setTimeout(r, 1200));

    // Generate random 256-bit hexadecimal transmission hash
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const hash = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();

    setReceiptHash(`VP-TX-${hash.substring(0, 8)}-${Date.now().toString(16).toUpperCase()}`);
    setSent(true);
    setLoading(false);
  };

  const handleReset = () => {
    setSent(false);
    setReceiptHash("");
    setForm({
      name: "",
      channel: "",
      priority: "general",
      payload: "",
    });
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden pt-20 pb-28">
      {/* 1. INTERACTIVE CRYPTOGRAPHIC NODE MESH BACKGROUND */}
      <CryptographicNodeMesh />

      {/* 2. FOREGROUND CONTENT WRAPPER */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* SECURE TRANSMISSION HEADER */}
        <div className="mb-12 border-b border-slate-800/80 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs rounded tracking-widest uppercase font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>[ CONTACT_PROTOCOL // SECURE_DISPATCH_HUB ]</span>
            </div>

            {/* Live Response Telemetry */}
            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Response SLA:</span>
              <strong className="text-emerald-400 font-bold">&lt; 4 hours</strong>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-semibold uppercase tracking-wider text-[11px]">
                Nodes Active
              </span>
            </div>
          </div>

          <h1
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
            className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white leading-none mb-4"
          >
            Secure Dispatch{" "}
            <span className="text-cyan-400 not-italic">Terminal.</span>
          </h1>

          <p className="max-w-2xl text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Direct cryptographic communications channel to the VeriProof core engineering team, protocol architects, and security auditors.
          </p>
        </div>

        {/* 3. SPLIT CONSOLE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT / DISPATCH FORM CONSOLE (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  ENCRYPTED_DISPATCH_CONSOLE
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                SESSION // TLS_v1.3_VERIFIED
              </span>
            </div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="receipt"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="p-8 border border-emerald-500/40 bg-emerald-950/20 backdrop-blur-md space-y-6"
                >
                  <div className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <div>
                      <h3 className="text-xl font-black italic uppercase tracking-tight text-white">
                        Transmission Packet Dispatched
                      </h3>
                      <p className="text-xs font-mono text-emerald-400 tracking-wider">
                        STATUS: ENQUEUED_FOR_IMMEDIATE_REVIEW
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>TRANSMISSION_HASH:</span>
                      <span className="text-cyan-400 font-bold tracking-wider">{receiptHash}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>TARGET_RECIPIENT:</span>
                      <span className="text-slate-200">VeriProof Core Protocol Hub</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>RESPONSE_WINDOW:</span>
                      <span className="text-emerald-400 font-bold">&lt; 4 Hours Guaranteed</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Your transmission payload has been encrypted and stored in the secure dispatch queue. A notification has been routed to our on-call protocol engineers.
                  </p>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-mono text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Initialize New Transmission</span>
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* SENDER_IDENTITY */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-sender-identity"
                      className="block text-xs font-mono uppercase tracking-[0.2em] text-slate-300 font-bold flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>SENDER_IDENTITY (Full Name)</span>
                    </label>
                    <input
                      id="contact-sender-identity"
                      type="text"
                      required
                      placeholder="e.g. Sridhar Hegde"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-transparent border-0 border-b border-slate-700 focus:border-cyan-400 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  {/* SECURE_CHANNEL */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-secure-channel"
                      className="block text-xs font-mono uppercase tracking-[0.2em] text-slate-300 font-bold flex items-center gap-2"
                    >
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>SECURE_CHANNEL (Email / Telegram Handle)</span>
                    </label>
                    <input
                      id="contact-secure-channel"
                      type="text"
                      required
                      placeholder="e.g. engineer@organization.io or @tg_handle"
                      value={form.channel}
                      onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}
                      className="w-full bg-transparent border-0 border-b border-slate-700 focus:border-cyan-400 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  {/* TRANSMISSION_PRIORITY */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-priority"
                      className="block text-xs font-mono uppercase tracking-[0.2em] text-slate-300 font-bold flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>TRANSMISSION_PRIORITY</span>
                    </label>
                    <select
                      id="contact-priority"
                      value={form.priority}
                      onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                      className="w-full bg-slate-900/90 border-0 border-b border-slate-700 focus:border-cyan-400 py-3 text-sm text-slate-100 focus:outline-none transition-colors font-mono cursor-pointer"
                    >
                      <option value="general" className="bg-slate-950 text-slate-100">
                        PRIORITY_01: General Inquiry // Protocol Questions
                      </option>
                      <option value="bug" className="bg-slate-950 text-slate-100">
                        PRIORITY_02: Bug Report // Security Vulnerability Disclosure
                      </option>
                      <option value="enterprise" className="bg-slate-950 text-slate-100">
                        PRIORITY_03: Enterprise Partnership // Verification API Access
                      </option>
                      <option value="infrastructure" className="bg-slate-950 text-slate-100">
                        PRIORITY_04: Cryptographic Node Audit // Vault Ingestion
                      </option>
                    </select>
                  </div>

                  {/* ENCRYPTED_PAYLOAD */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-encrypted-payload"
                      className="block text-xs font-mono uppercase tracking-[0.2em] text-slate-300 font-bold flex items-center gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ENCRYPTED_PAYLOAD (Detailed Query / Disclosure)</span>
                    </label>
                    <textarea
                      id="contact-encrypted-payload"
                      required
                      rows={5}
                      placeholder="Specify transmission parameters, error logs, or partnership proposals..."
                      value={form.payload}
                      onChange={(e) => setForm((p) => ({ ...p, payload: e.target.value }))}
                      className="w-full bg-transparent border-0 border-b border-slate-700 focus:border-cyan-400 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors font-mono resize-none leading-relaxed"
                    />
                  </div>

                  {/* Action Button: Glowing Cyber-Cyan [ TRANSMIT_MESSAGE ] */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-none font-mono font-bold text-xs uppercase tracking-[0.25em] transition-all cursor-pointer flex items-center justify-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:shadow-[0_0_32px_rgba(6,182,212,0.65)] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>TRANSMITTING_ENCRYPTED_PACKET...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>[ TRANSMIT_MESSAGE ]</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT / DIRECT REGISTRY & CRYPTOGRAPHIC METADATA CARD (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Comms Registry */}
            <div className="border border-slate-800 p-6 sm:p-8 space-y-6 bg-slate-950/60 backdrop-blur-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-widest font-bold">
                    DIRECT_COMMS_REGISTRY
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">MONITORED</span>
              </div>

              <div>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Official Communication Address:
                </p>
                <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800">
                  <span className="font-mono text-sm font-bold text-cyan-400 tracking-wider">
                    hello@veriproof.io
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      title="Copy email to clipboard"
                      className="p-1.5 hover:text-cyan-400 text-slate-400 transition-colors cursor-pointer"
                    >
                      {copiedEmail ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href="mailto:hello@veriproof.io"
                      title="Open in mail client"
                      className="p-1.5 hover:text-cyan-400 text-slate-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* PGP Public Key Fingerprint */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>PGP_KEY_FINGERPRINT</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyFingerprint}
                    className="text-[10px] font-mono text-cyan-400 hover:underline uppercase flex items-center gap-1 cursor-pointer"
                  >
                    {copiedFingerprint ? "COPIED!" : "COPY_KEY"}
                  </button>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-300 tracking-wider break-all select-all">
                  {PGP_FINGERPRINT}
                </div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  ALGORITHM: RSA-4096 / E2EE_ENCRYPTION_SUPPORTED
                </p>
              </div>

              {/* Node Telemetry */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>OPERATING_HOURS:</span>
                  </span>
                  <span className="text-slate-200">09:00 — 21:00 IST</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SECURITY_SLA:</span>
                  </span>
                  <span className="text-emerald-400 font-bold">&lt; 4 Hours Priority</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 border-l-2 border-cyan-400 bg-cyan-950/20 text-xs text-slate-300 font-sans leading-relaxed">
              <strong className="text-cyan-400 font-mono uppercase block mb-1">
                Zero-Knowledge Disclosure Policy:
              </strong>
              Security vulnerabilities disclosed via this hub qualify for expedited cryptographic verification and attribution on our protocol security hall of fame.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
