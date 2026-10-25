import React, { Component } from "react";
import { ShieldAlert, RefreshCw, Home, Terminal } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[VeriProof ErrorBoundary Caught]", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-xl p-8 backdrop-blur-xl shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono rounded tracking-wider uppercase">
                <Terminal className="w-3.5 h-3.5" />
                <span>[ PROTOCOL_SAFEGUARD_ACTIVE ]</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Integrity Recovery
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                A rendering exception was isolated by the VeriProof safety boundary to prevent an application crash.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded font-mono text-xs text-red-400/90 text-left overflow-x-auto max-h-28">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition-all shadow-lg shadow-cyan-500/20"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
              <button
                type="button"
                onClick={this.handleHardReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-mono text-xs uppercase tracking-wider rounded transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Clear Cache &amp; Reboot</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
