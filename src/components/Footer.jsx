import { Link } from "react-router-dom";
import { ShieldCheck, Twitter, Linkedin, Github, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-ibex-surface/20 dark:bg-ibex-surface/40 mt-32 border-t border-ibex-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          <div className="md:col-span-1 space-y-6">
            <Link to="/" className="flex items-center space-x-2 text-xl md:text-2xl font-sans tracking-[0.3em] uppercase font-bold text-vp-teal">
              VERIPROOF
            </Link>
            <p className="text-ibex-muted text-sm tracking-wider font-light leading-relaxed">
              The definite standard for cryptographic portfolio validation. Empowering true talent to defeat ordinary expectations.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="p-2 border border-ibex-muted/30 rounded-full text-vp-teal hover:text-ibex-gold hover:border-ibex-gold transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 border border-ibex-muted/30 rounded-full text-vp-teal hover:text-ibex-gold hover:border-ibex-gold transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 border border-ibex-muted/30 rounded-full text-vp-teal hover:text-ibex-gold hover:border-ibex-gold transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="mailto:support@veriproof.com" className="p-2 border border-ibex-muted/30 rounded-full text-vp-teal hover:text-ibex-gold hover:border-ibex-gold transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-ibex-text font-serif uppercase tracking-widest text-sm font-bold">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/discover" className="text-ibex-muted hover:text-vp-teal text-sm tracking-wide transition-colors">Discover Talent</Link></li>
              <li><Link to="/portfolio" className="text-ibex-muted hover:text-vp-teal text-sm tracking-wide transition-colors">Candidate Hub</Link></li>
              <li><Link to="/recruiter/jobs" className="text-ibex-muted hover:text-vp-teal text-sm tracking-wide transition-colors">Recruiter Engine</Link></li>
              <li><Link to="/analytics" className="text-ibex-muted hover:text-vp-teal text-sm tracking-wide transition-colors">Global Analytics</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-ibex-text font-serif uppercase tracking-widest text-sm font-bold">Resources</h4>
            <ul className="space-y-4">
              <li><Link to="/support" className="text-ibex-muted hover:text-vp-teal text-sm tracking-wide transition-colors">Support & Help Center</Link></li>
              <li><Link to="/opportunities" className="text-ibex-muted hover:text-vp-teal text-sm tracking-wide transition-colors">Job Opportunities</Link></li>
              <li><Link to="/terms" className="text-ibex-muted hover:text-vp-teal text-sm tracking-wide transition-colors">System Architecture</Link></li>
              <li><a href="#" className="text-ibex-muted hover:text-vp-teal text-sm tracking-wide transition-colors">Verification APIs (Beta)</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-ibex-text font-serif uppercase tracking-widest text-sm font-bold">Legal & Security</h4>
            <ul className="space-y-4">
              <li><Link to="/terms" className="text-ibex-muted hover:text-vp-teal text-sm tracking-wide transition-colors">Terms of Service</Link></li>
              <li><Link to="/terms" className="text-ibex-muted hover:text-vp-teal text-sm tracking-wide transition-colors">Privacy Database</Link></li>
              <li><Link to="/verification-panel" className="text-ibex-muted hover:text-vp-teal text-sm tracking-wide transition-colors flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-ibex-gold" /> Trust Center</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-ibex-surface/30 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-ibex-muted tracking-widest uppercase">
            &copy; 2026 VeriProof Cryptographic Architecture. All Rights Reserved.
          </p>
          <div className="flex space-x-6 text-xs text-ibex-muted tracking-widest uppercase">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-ibex-gold"></span> System Online</span>
            <span>Version 2.0.26</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
