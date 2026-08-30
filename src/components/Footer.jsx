import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, Twitter, Linkedin, ExternalLink } from "lucide-react";

const Footer = () => {
  const location = useLocation();

  if (location.pathname === "/exams") {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-32 border-t border-[var(--color-border)] relative bg-[var(--color-bg)]/80 backdrop-blur-sm">
      {/* Gradient fade top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/30 to-transparent" />

      <div className="max-w-[1600px] mx-auto px-6 xl:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">

          {/* ── Brand + Tagline ── */}
          <div className="space-y-6 md:col-span-1">
            <Link to="/" onClick={scrollToTop} className="inline-block">
              <span className="text-2xl font-black italic tracking-tighter uppercase">
                VeriProof<span className="text-[var(--color-accent)] not-italic">.</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-xs">
              The definitive standard for cryptographic portfolio validation. Empowering verified talent through architectural evidence.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* ── Platform Domain Links ── */}
          <div className="space-y-5">
            <h4 className="vp-label font-bold text-xs uppercase tracking-widest text-[var(--color-accent)]">
              Platform
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/dashboard", label: "Candidate Dashboard" },
                { to: "/certifications", label: "Certifications Ledger" },
                { to: "/exams", label: "Technical Assessments" },
                { to: "/skill-tree", label: "Verified Skill Tree" },
                { to: "/project-archive", label: "Project Archive" },
                { to: "/discover", label: "Recruiter Discovery" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={scrollToTop}
                    className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Resources & Institutional Info ── */}
          <div className="space-y-5">
            <h4 className="vp-label font-bold text-xs uppercase tracking-widest text-[var(--color-accent)]">
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/about", label: "About VeriProof" },
                { to: "/support", label: "Support Center" },
                { to: "/terms", label: "Terms & Conditions" },
                { to: "/contact", label: "Contact Protocol" },
                { to: "/roadmap", label: "Platform Roadmap" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={scrollToTop}
                    className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Security Node ── */}
          <div className="space-y-5">
            <h4 className="vp-label font-bold text-xs uppercase tracking-widest text-[var(--color-accent)]">
              Security
            </h4>
            <div className="vp-surface-1 p-5 space-y-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)]/40">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text)]">
                  Cryptographic Trust
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
                All candidate claims are cryptographically verified through repository commit provenance, live coding assessments, and credential audits.
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-16 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
            &copy; {new Date().getFullYear()} VeriProof Systems
          </p>
          <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="vp-status-dot bg-emerald-400" style={{ width: 6, height: 6 }} />
              Protocol_Online
            </span>
            <span>v5.2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
