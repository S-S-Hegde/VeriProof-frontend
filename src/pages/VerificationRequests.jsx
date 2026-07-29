import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  UserCircle,
} from "lucide-react";

const VerificationRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  // Mock Data for the Audit Queue
  // Empty state for actual API integration
  const [requests, setRequests] = useState([]);
  const filteredRequests = requests.filter(
    (req) =>
      req.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Analyzed":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "Flagged":
        return "text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/20";
      default:
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-amber-400";
    return "text-[var(--color-error)]";
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--color-text)]">
            Audit{" "}
            <span className="text-[var(--color-accent)] not-italic">Queue</span>
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Review and verify candidate claims against target job specifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search ID or Candidate..."
              className="vp-input pl-9 w-64 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="vp-btn vp-btn-secondary px-3 py-2 flex items-center gap-2 text-xs">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Pending Reviews",
            value: "0",
            icon: Clock,
            color: "text-amber-400",
          },
          {
            label: "Verified Today",
            value: "0",
            icon: CheckCircle,
            color: "text-green-400",
          },
          {
            label: "Flagged Discrepancies",
            value: "0",
            icon: AlertTriangle,
            color: "text-[var(--color-error)]",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="vp-glass p-5 rounded-[var(--radius-xl)] flex items-center justify-between border border-[var(--color-border)]"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)] mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <stat.icon className={`w-8 h-8 opacity-50 ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)] border-b border-[var(--color-border)]">
          <div className="col-span-3">Candidate</div>
          <div className="col-span-3">Target Role</div>
          <div className="col-span-2 text-center">Match Score</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        <AnimatePresence>
          {filteredRequests.map((req, idx) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="vp-glass p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 transition-colors grid grid-cols-12 gap-4 items-center group"
            >
              {/* Candidate Info */}
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-sunken)] flex items-center justify-center border border-[var(--color-border)]">
                  <UserCircle className="w-5 h-5 text-[var(--color-muted)]" />
                </div>
                <div>
                  <p className="text-sm font-bold">{req.candidate}</p>
                  <p className="font-mono text-[10px] text-[var(--color-muted)]">
                    {req.id}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="col-span-3">
                <p className="text-xs font-mono truncate">{req.role}</p>
                <p className="text-[10px] text-[var(--color-muted)] mt-0.5">
                  {req.date}
                </p>
              </div>

              {/* Match Score */}
              <div className="col-span-2 flex flex-col items-center justify-center">
                <div
                  className={`text-xl font-black italic ${getScoreColor(req.matchScore)}`}
                >
                  {req.matchScore}%
                </div>
                <div className="w-16 h-1 bg-[var(--color-bg-sunken)] rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-current rounded-full"
                    style={{
                      width: `${req.matchScore}%`,
                      backgroundColor: "currentColor",
                    }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2 flex justify-center">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(req.status)}`}
                >
                  {req.status}
                </span>
              </div>

              {/* Action */}
              <div className="col-span-2 flex justify-end">
                <Link
                  to="/verification-panel"
                  className="vp-btn vp-btn-primary px-4 py-2 text-[10px] flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Inspect <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRequests.length === 0 && (
          <div className="vp-glass p-12 rounded-[var(--radius-xl)] text-center flex flex-col items-center justify-center">
            <ShieldCheck className="w-12 h-12 text-[var(--color-muted)] mb-4 opacity-20" />
            <p className="text-[var(--color-muted)] font-mono uppercase tracking-widest text-sm">
              Queue Empty
            </p>
          </div>
        )}
      </div>
    </div>
  );
};;

export default VerificationRequests;
