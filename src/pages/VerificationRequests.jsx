import { useState, useEffect } from "react";
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
  RefreshCw,
  Loader2,
  Trash2,
} from "lucide-react";
import api from "../utils/api";
import ConfirmModal from "../components/ConfirmModal";

const VerificationRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/verify/applicants/${deleteTarget._id}`);
      setRequests((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove applicant.");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchApplicants = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/verify/applicants");
      setRequests(data || []);
    } catch (err) {
      setError("Failed to load audit queue. Please check connection.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const filteredRequests = requests.filter((req) => {
    const candidateName = req.extractedName || req.originalFileName || "";
    const roleTitle = req.jobId?.title || "";
    const matchesSearch =
      candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleTitle.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "Completed") return matchesSearch && req.status === "Completed";
    if (filter === "Failed") return matchesSearch && req.status === "Failed";
    if (filter === "Pending") return matchesSearch && (req.status === "Processing" || req.status === "Pending");
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
      case "Analyzed":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "Failed":
      case "Flagged":
        return "text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/20";
      default:
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 40) return "text-amber-400";
    return "text-[var(--color-error)]";
  };

  const pendingCount = requests.filter((r) => r.status === "Processing" || r.status === "Pending").length;
  const verifiedCount = requests.filter((r) => r.status === "Completed").length;
  const flaggedCount = requests.filter((r) => r.status === "Failed" || (r.missingSkills && r.missingSkills.length > 2)).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--color-text)]">
            Audit <span className="text-[var(--color-accent)] not-italic">Queue</span>
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Review and verify candidate claims against target job specifications in real-time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search Candidate or Job..."
              className="vp-input pl-9 w-64 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="vp-input py-2 px-3 text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Flagged</option>
          </select>
          <button
            onClick={fetchApplicants}
            className="vp-btn vp-btn-secondary px-3 py-2 flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Pending Reviews",
            value: pendingCount,
            icon: Clock,
            color: "text-amber-400",
          },
          {
            label: "Verified Applicants",
            value: verifiedCount,
            icon: CheckCircle,
            color: "text-emerald-400",
          },
          {
            label: "Flagged Discrepancies",
            value: flaggedCount,
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

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--color-muted)] gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-mono text-xs uppercase tracking-widest">Loading Audit Queue…</span>
          </div>
        ) : (
          <AnimatePresence>
            {filteredRequests.map((req, idx) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="vp-glass p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 transition-colors grid grid-cols-12 gap-4 items-center group"
              >
                {/* Candidate Info */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-bg-sunken)] flex items-center justify-center border border-[var(--color-border)] font-black text-sm uppercase">
                    {(req.extractedName || req.originalFileName || "C").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">
                      {req.extractedName || req.originalFileName}
                    </p>
                    <p className="font-mono text-[10px] text-[var(--color-muted)] truncate">
                      {req.extractedEmail || `ID: ${req._id.substring(0, 8)}`}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-3 min-w-0">
                  <p className="text-xs font-bold truncate">{req.jobId?.title || "General Intake"}</p>
                  <p className="text-[10px] text-[var(--color-muted)] mt-0.5 font-mono">
                    {req.processedAt ? new Date(req.processedAt).toLocaleDateString() : "Recent"}
                  </p>
                </div>

                {/* Match Score */}
                <div className="col-span-2 flex flex-col items-center justify-center">
                  <div className={`text-xl font-black italic ${getScoreColor(req.alignmentScore || 0)}`}>
                    {req.alignmentScore || 0}%
                  </div>
                  <div className="w-16 h-1 bg-[var(--color-bg-sunken)] rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${req.alignmentScore || 0}%`,
                        backgroundColor: req.alignmentScore >= 70 ? "#34d399" : req.alignmentScore >= 40 ? "#fbbf24" : "#f87171",
                      }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2 flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(req.status)}`}>
                    {req.status === "Completed" ? "Analyzed" : req.status === "Failed" ? "Flagged" : "Processing"}
                  </span>
                </div>

                {/* Action */}
                <div className="col-span-2 flex justify-end items-center gap-2">
                  <Link
                    to="/verdicts"
                    className="vp-btn vp-btn-primary px-3 py-2 text-[10px] flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity"
                  >
                    Inspect <ArrowRight className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(req)}
                    className="p-2 rounded text-[var(--color-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove Applicant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!loading && filteredRequests.length === 0 && (
          <div className="vp-glass p-12 rounded-[var(--radius-xl)] text-center flex flex-col items-center justify-center">
            <ShieldCheck className="w-12 h-12 text-[var(--color-muted)] mb-4 opacity-20" />
            <p className="text-[var(--color-muted)] font-mono uppercase tracking-widest text-sm">
              No Audit Queue Items Discovered
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Applicant"
        message="Remove this applicant from the audit queue?"
        subtitle={deleteTarget ? `${deleteTarget.extractedName || "Unknown"} — ${deleteTarget.originalFileName}` : ""}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
};

export default VerificationRequests;
