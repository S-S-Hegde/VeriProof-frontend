import { Link } from "react-router-dom";
import { ShieldCheck, Twitter, Linkedin, Github, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-32 border-t border-[var(--color-border)] glass-card rounded-none border-x-0 border-b-0">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          
          <div className="md:col-span-1 space-y-8">
            <Link to="/" className="inline-block">
              <span className="text-3xl tracking-[0.3em] font-bold h1 uppercase block">
                VeriProof
              </span>
            </Link>
            <p className="text-base opacity-50 tracking-wider font-light leading-relaxed max-w-xs">
              The definite standard for cryptographic portfolio validation. Empowering true talent to defeat ordinary expectations through verified artifacts.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="opacity-40 hover:opacity-100 hover:text-[var(--color-accent)] transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="opacity-40 hover:opacity-100 hover:text-[var(--color-accent)] transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="opacity-40 hover:opacity-100 hover:text-[var(--color-accent)] transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-sm uppercase tracking-[0.4em] font-bold opacity-30">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/discover" className="text-xs tracking-widest opacity-60 hover:opacity-100 hover:text-[var(--color-accent)] transition-all uppercase">Discover_Talent</Link></li>
              <li><Link to="/dashboard" className="text-xs tracking-widest opacity-60 hover:opacity-100 hover:text-[var(--color-accent)] transition-all uppercase">Candidate_Hub</Link></li>
              <li><Link to="/opportunities" className="text-xs tracking-widest opacity-60 hover:opacity-100 hover:text-[var(--color-accent)] transition-all uppercase">Market_Engine</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-sm uppercase tracking-[0.4em] font-bold opacity-30">Resources</h4>
            <ul className="space-y-4">
              <li><Link to="/support" className="text-xs tracking-widest opacity-60 hover:opacity-100 hover:text-[var(--color-accent)] transition-all uppercase">Help_Center</Link></li>
              <li><Link to="/status" className="text-xs tracking-widest opacity-60 hover:opacity-100 hover:text-[var(--color-accent)] transition-all uppercase">System_Status</Link></li>
              <li><Link to="/terms" className="text-xs tracking-widest opacity-60 hover:opacity-100 hover:text-[var(--color-accent)] transition-all uppercase">Architecture</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-sm uppercase tracking-[0.4em] font-bold opacity-30">Security</h4>
            <div className="p-6 border border-[var(--color-border)] bg-[var(--color-bg)]/50 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-[var(--color-accent)]" />
                <span className="text-sm tracking-widest uppercase font-bold">Verified_Node</span>
              </div>
              <p className="text-sm opacity-40 uppercase tracking-tighter leading-relaxed">
                All artifacts are cryptographically hashed and cross-referenced with repository metadata.
              </p>
            </div>
          </div>

        </div>

        <div className="mt-24 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <p className="text-sm opacity-30 tracking-[0.3em] uppercase">
              &copy; 2026 VeriProof_Global_Systems
            </p>
          </div>
          <div className="flex items-center space-x-8 text-sm opacity-40 tracking-[0.3em] uppercase font-mono">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse"></span> 
              Protocol_Online
            </span>
            <span>v2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
