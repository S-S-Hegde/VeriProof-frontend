import { Link } from "react-router-dom";
import { ShieldCheck, Twitter, Linkedin, Github, Activity } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-32 border-t border-[var(--color-border)] relative">
      {/* Gradient fade top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/20 to-transparent" />

      <div className="max-w-[1600px] mx-auto px-6 xl:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">

          {/* ── Brand + Tagline ── */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-black italic tracking-tighter uppercase">
                VeriProof<span className="text-[var(--color-accent)] not-italic">.</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-xs">
              The definitive standard for cryptographic portfolio validation. Empowering verified talent through architectural evidence.
            </p>
            <div className="flex items-center gap-5">
              {[
                { icon: Twitter, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Github, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-5">
              <h4 className="vp-label">Platform</h4>
              <ul className="space-y-3">
                {[
                  { to: "/discover", label: "Discover" },
                  { to: "/dashboard", label: "Dashboard" },
                  { to: "/about", label: "About" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="vp-label">Resources</h4>
              <ul className="space-y-3">
                {[
                  { to: "/support", label: "Support" },
                  { to: "/status", label: "System_Status" },
                  { to: "/terms", label: "Terms" },
                  { to: "/contact", label: "Contact" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── System Status ── */}
          <div className="space-y-5">
            <h4 className="vp-label">Security</h4>
            <div className="vp-surface-1 p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text)]">Verified_Node</span>
              </div>
              <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
                All artifacts are cryptographically hashed and cross-referenced with repository metadata.
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-16 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
            &copy; {new Date().getFullYear()} VeriProof_Global_Systems
          </p>
          <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="vp-status-dot" style={{ width: 4, height: 4 }} />
              Protocol_Online
            </span>
            <span>v5.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
