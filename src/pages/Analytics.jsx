import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";
import { BarChart2, Activity, PieChart, Info } from "lucide-react";
import api from "../utils/api";

/* ──────────────────────────────────────────────────────────
   SVG Pie Chart — pure, no external lib needed
   Accepts: slices = [{ label, value, color }]
   Values are percentages (must sum to ≈100)
────────────────────────────────────────────────────────── */
const SVGPieChart = ({ slices }) => {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 85;
  const holeR = 48; // donut hole

  // Convert values to angles
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  const arcs = slices.map((slice, index) => {
    const previousValue = slices
      .slice(0, index)
      .reduce((sum, currentSlice) => sum + currentSlice.value, 0);
    const nextValue = previousValue + slice.value;
    const startAngle = (previousValue / total) * 2 * Math.PI - Math.PI / 2;
    const endAngle = (nextValue / total) * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const hx1 = cx + holeR * Math.cos(startAngle);
    const hy1 = cy + holeR * Math.sin(startAngle);
    const hx2 = cx + holeR * Math.cos(endAngle);
    const hy2 = cy + holeR * Math.sin(endAngle);

    const largeArc = slice.value / total > 0.5 ? 1 : 0;

    return {
      ...slice,
      d: `M ${hx1} ${hy1} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${hx2} ${hy2} A ${holeR} ${holeR} 0 ${largeArc} 0 ${hx1} ${hy1} Z`,
      pct: Math.round((slice.value / total) * 100),
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <svg width={size} height={size} className="flex-shrink-0">
        {arcs.map((arc, i) => (
          <motion.path
            key={i}
            d={arc.d}
            fill={arc.color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.5 }}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <title>{arc.label} — {arc.pct}%</title>
          </motion.path>
        ))}
        {/* Centre label */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="900">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#6b7280" fontSize="10" letterSpacing="2">TOTAL</text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-3">
        {arcs.map((arc, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: arc.color }} />
            <span className="text-gray-300 font-medium">{arc.label}</span>
            <span className="text-gray-600 text-xs ml-auto pl-4">{arc.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────── */
const EMPTY_STATE = (
  <div className="flex flex-col items-center justify-center h-48 gap-2 text-center">
    <Info className="w-8 h-8 text-gray-700" />
    <p className="text-gray-600 text-sm">No data yet — add projects to see your analytics</p>
  </div>
);

const cardCls = "bg-black/70 backdrop-blur-xl border border-orange-500/12 rounded-2xl p-8 relative overflow-hidden";

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get("/api/projects/analytics");
        setAnalytics(data);
      } catch {
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchAnalytics();
  }, [user]);

  const skillBarData = analytics?.skillData?.slice(0, 7) || [];
  const maxSkillVal = Math.max(...skillBarData.map((skill) => skill.value), 1);

  const statusColors = {
    Published: "#f97316",
    Verified: "#22c55e",
    Pending: "#eab308",
    Draft: "#6b7280",
  };
  const pieSlices = (analytics?.statusData || []).map(({ label, value }) => ({
    label,
    value,
    color: statusColors[label] || "#6b7280",
  }));

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto pb-24 space-y-8">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-white uppercase tracking-wide">
            Skill <span className="text-orange-500">Growth</span>
          </h1>
          <div className="h-[2px] w-20 bg-orange-600 mt-4" />
          <p className="mt-4 text-gray-500 text-sm">
            This dashboard now uses the backend analytics pipeline as its single source of truth.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Bar Chart: Skills by frequency ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className={cardCls}>
            <div className="absolute -top-8 -right-8 w-36 h-36 bg-orange-600/6 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <BarChart2 className="w-5 h-5 text-orange-500" />
              <h3 className="font-black uppercase tracking-widest text-sm text-white">Skill Frequency</h3>
              <span className="ml-auto text-gray-600 text-xs">from verified analytics</span>
            </div>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : skillBarData.length === 0 ? EMPTY_STATE : (
              <div className="flex items-end justify-between gap-3 h-52 px-2">
                {skillBarData.map((skill, i) => (
                  <div key={skill.label} className="flex flex-col items-center flex-1 group/bar">
                    <div className="w-full flex justify-center bg-white/[0.03] rounded-t-lg" style={{ height: "180px" }}>
                      <div className="relative w-full flex justify-center">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(skill.value / maxSkillVal) * 100}%` }}
                          transition={{ duration: 1.1, delay: 0.15 + i * 0.1, ease: "easeOut" }}
                          className="absolute bottom-0 w-3/4 bg-gradient-to-t from-orange-700 to-orange-400 rounded-t-md"
                        />
                        {/* tooltip */}
                        <span className="absolute -top-7 text-xs bg-orange-600 text-white px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
                          {skill.value}×
                        </span>
                      </div>
                    </div>
                    <span className="mt-3 text-sm font-bold text-gray-500 uppercase tracking-wider text-center leading-tight">
                      {skill.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Pie Chart: Project status ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className={cardCls}>
            <div className="absolute -top-8 -right-8 w-36 h-36 bg-orange-600/6 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <PieChart className="w-5 h-5 text-orange-500" />
              <h3 className="font-black uppercase tracking-widest text-sm text-white">Project Status Distribution</h3>
            </div>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : pieSlices.length === 0 ? EMPTY_STATE : (
              <SVGPieChart slices={pieSlices} />
            )}
          </motion.div>

          {/* ── Activity: project timeline ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className={`${cardCls} lg:col-span-2`}>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <Activity className="w-5 h-5 text-orange-500" />
              <h3 className="font-black uppercase tracking-widest text-sm text-white">Project Activity Timeline</h3>
              <span className="ml-auto text-gray-600 text-xs">{analytics?.totalProjects || 0} project{(analytics?.totalProjects || 0) !== 1 ? "s" : ""} recorded</span>
            </div>

            {loading ? (
              <div className="h-24 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : !analytics?.timeline?.length ? EMPTY_STATE : (
              <div className="space-y-3">
                {analytics.timeline.slice(0, 6).map((p, i) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center gap-4 p-3.5 rounded-lg bg-white/[0.025] border border-white/5"
                    >
                      <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                      <span className="text-white text-sm font-bold flex-1 truncate">{p.title}</span>
                      <span className="text-gray-600 text-xs flex-shrink-0">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className={`text-sm uppercase tracking-widest font-black px-2 py-0.5 rounded flex-shrink-0 ${p.isVerified ? "bg-green-500/15 text-green-400" : "bg-orange-500/15 text-orange-400"}`}>
                        {p.isVerified ? "Verified" : "Pending"}
                      </span>
                    </motion.div>
                  ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
};

export default Analytics;
