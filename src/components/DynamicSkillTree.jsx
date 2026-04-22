import { useEffect, useRef, useState, useCallback } from "react";
import { stratify, tree as d3Tree } from "d3-hierarchy";
import gsap from "gsap";
import { useTheme } from "../context/ThemeContext";

// ─── Theme Color Palette ─────────────────────────────────────────────────────
const PALETTE = {
  light: {
    verified:      { fill: "#2563EB", stroke: "#1D4ED8", glow: "rgba(37,99,235,0.6)" },
    foundational:  { fill: "#0EA5E9", stroke: "#0284C7", glow: "rgba(14,165,233,0.3)" },
    recommended:   { fill: "none",    stroke: "#94A3B8", glow: "none" },
    edge:          "#CBD5E1",
    text:          "#0F172A",
    textMuted:     "#64748B",
    bg:            "#F8FAFC",
    legendBg:      "rgba(255,255,255,0.8)",
  },
  dark: {
    verified:      { fill: "#F59E0B", stroke: "#D97706", glow: "rgba(245,158,11,0.6)" },
    foundational:  { fill: "#EAB308", stroke: "#CA8A04", glow: "rgba(234,179,8,0.25)" },
    recommended:   { fill: "none",    stroke: "#475569", glow: "none" },
    edge:          "#334155",
    text:          "#F1F5F9",
    textMuted:     "#94A3B8",
    bg:            "#0F172A",
    legendBg:      "rgba(15,23,42,0.85)",
  },
};

// ─── Category Icons (inline SVG paths) ───────────────────────────────────────
const CATEGORY_ICONS = {
  verified: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  foundational: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  recommended: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
};

// ─── Node radius by category ─────────────────────────────────────────────────
const NODE_RADIUS = { verified: 28, foundational: 22, recommended: 18 };

/**
 * DynamicSkillTree
 * Renders a hierarchical skill tree from flat node data using D3 for layout
 * and GSAP for cinematic animation. Zero hardcoded SVG positions.
 */
const DynamicSkillTree = ({ nodes = [], isLoading = false }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PALETTE.dark : PALETTE.light;

  // ─── Responsive resize ───────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const height = Math.max(500, Math.min(width * 0.7, 800));
        setDimensions({ width, height });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ─── D3 Layout computation ──────────────────────────────────────────
  const computeLayout = useCallback(() => {
    if (!nodes || nodes.length === 0) return { layoutNodes: [], layoutEdges: [] };

    // Find root nodes (parentId === null)
    const rootNodes = nodes.filter((n) => n.parentId === null);
    const hasMultipleRoots = rootNodes.length > 1;

    // Build flat array for d3.stratify — add synthetic root if needed
    let flatData = nodes.map((n) => ({
      ...n,
      parentId: n.parentId === null ? (hasMultipleRoots ? "__root__" : null) : n.parentId,
    }));

    if (hasMultipleRoots) {
      flatData.unshift({
        id: "__root__",
        name: "",
        category: "foundational",
        parentId: null,
        confidence: 0,
        evidence: [],
      });
    }

    try {
      const root = stratify()
        .id((d) => d.id)
        .parentId((d) => d.parentId)(flatData);

      const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };
      const innerW = dimensions.width - MARGIN.left - MARGIN.right;
      const innerH = dimensions.height - MARGIN.top - MARGIN.bottom;

      const treeLayout = d3Tree().size([innerW, innerH]);
      treeLayout(root);

      // Collect nodes and edges, skipping the synthetic root
      const layoutNodes = [];
      const layoutEdges = [];

      root.each((d) => {
        if (d.data.id === "__root__") return;
        layoutNodes.push({
          ...d.data,
          x: d.x + MARGIN.left,
          y: d.y + MARGIN.top,
          depth: d.depth,
        });
      });

      root.links().forEach((link) => {
        if (link.source.data.id === "__root__") {
          // Direct edge from synthetic root → draw straight from top-center
          layoutEdges.push({
            sourceX: link.target.x + MARGIN.left,
            sourceY: MARGIN.top - 20,
            targetX: link.target.x + MARGIN.left,
            targetY: link.target.y + MARGIN.top,
            targetId: link.target.data.id,
            depth: link.target.depth,
          });
        } else {
          layoutEdges.push({
            sourceX: link.source.x + MARGIN.left,
            sourceY: link.source.y + MARGIN.top,
            targetX: link.target.x + MARGIN.left,
            targetY: link.target.y + MARGIN.top,
            targetId: link.target.data.id,
            depth: link.target.depth,
          });
        }
      });

      // Sort edges by depth so parents animate before children
      layoutEdges.sort((a, b) => a.depth - b.depth);

      return { layoutNodes, layoutEdges };
    } catch (err) {
      console.error("[SkillTree] D3 layout error:", err);
      return { layoutNodes: [], layoutEdges: [] };
    }
  }, [nodes, dimensions]);

  const { layoutNodes, layoutEdges } = computeLayout();

  // ─── Build SVG path string (cubic bezier) ──────────────────────────
  const buildEdgePath = (edge) => {
    const midY = (edge.sourceY + edge.targetY) / 2;
    return `M ${edge.sourceX},${edge.sourceY} C ${edge.sourceX},${midY} ${edge.targetX},${midY} ${edge.targetX},${edge.targetY}`;
  };

  // ─── GSAP Cinematic Animation ──────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current || layoutNodes.length === 0) return;

    // Kill previous timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const svg = svgRef.current;
    const paths = svg.querySelectorAll("[data-edge]");
    const nodeGroups = svg.querySelectorAll("[data-node]");

    // Measure and set initial states
    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 0,
      });
    });

    nodeGroups.forEach((node) => {
      gsap.set(node, { scale: 0, opacity: 0, transformOrigin: "center center" });
    });

    // Build timeline
    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      delay: 0.3,
    });

    // Phase 1: Animate edges by depth
    const edgesByDepth = {};
    paths.forEach((path) => {
      const depth = parseInt(path.getAttribute("data-depth"), 10);
      if (!edgesByDepth[depth]) edgesByDepth[depth] = [];
      edgesByDepth[depth].push(path);
    });

    const sortedDepths = Object.keys(edgesByDepth)
      .map(Number)
      .sort((a, b) => a - b);

    sortedDepths.forEach((depth, depthIndex) => {
      const depthEdges = edgesByDepth[depth];

      // Fade in and draw edges at this depth
      tl.to(
        depthEdges,
        {
          opacity: 1,
          duration: 0.2,
        },
        depthIndex * 0.6
      );

      tl.to(
        depthEdges,
        {
          strokeDashoffset: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: "power2.inOut",
        },
        depthIndex * 0.6 + 0.1
      );

      // Phase 2: As edges complete, pop in target nodes
      const targetIds = depthEdges.map((p) => p.getAttribute("data-target-id"));
      const targetNodes = Array.from(nodeGroups).filter((n) =>
        targetIds.includes(n.getAttribute("data-node-id"))
      );

      if (targetNodes.length > 0) {
        tl.to(
          targetNodes,
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.06,
            ease: "back.out(1.7)",
          },
          depthIndex * 0.6 + 0.5
        );
      }
    });

    // Phase 2b: Animate root nodes (they have no incoming edges)
    const rootNodeEls = Array.from(nodeGroups).filter(
      (n) => n.getAttribute("data-depth") === "1" || n.getAttribute("data-depth") === "0"
    );
    if (rootNodeEls.length > 0) {
      tl.to(
        rootNodeEls,
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(2)",
        },
        0
      );
    }

    // Phase 3: Verified glow pulse
    const verifiedNodes = Array.from(nodeGroups).filter(
      (n) => n.getAttribute("data-category") === "verified"
    );
    if (verifiedNodes.length > 0) {
      const glowColor = isDarkMode ? PALETTE.dark.verified.glow : PALETTE.light.verified.glow;
      tl.to(verifiedNodes, {
        filter: `drop-shadow(0 0 14px ${glowColor})`,
        duration: 0.6,
        stagger: 0.04,
        ease: "power2.out",
      });
      tl.to(verifiedNodes, {
        filter: `drop-shadow(0 0 6px ${glowColor})`,
        duration: 1.2,
        stagger: 0.04,
        ease: "sine.inOut",
      });
    }

    // Phase 4: Dim recommended nodes to locked state
    const recommendedNodes = Array.from(nodeGroups).filter(
      (n) => n.getAttribute("data-category") === "recommended"
    );
    if (recommendedNodes.length > 0) {
      tl.to(
        recommendedNodes,
        {
          opacity: 0.4,
          duration: 0.5,
          ease: "power1.out",
        },
        "-=0.8"
      );
    }

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [layoutNodes, layoutEdges, isDarkMode]);

  // ─── Loading state ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: colors.verified.stroke, borderTopColor: "transparent" }}
          />
          <p
            className="font-mono text-xs tracking-[0.3em] uppercase animate-pulse"
            style={{ color: colors.textMuted }}
          >
            Generating_Skill_Topology...
          </p>
        </div>
      </div>
    );
  }

  // ─── Empty state ───────────────────────────────────────────────────
  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-sm" style={{ color: colors.textMuted }}>
          No skill tree data available.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full" style={{ minHeight: 500 }}>
      {/* ── Legend ── */}
      <div
        className="absolute top-4 right-4 z-10 rounded-lg px-4 py-3 backdrop-blur-md border"
        style={{
          background: colors.legendBg,
          borderColor: isDarkMode ? "#1E293B" : "#E2E8F0",
        }}
      >
        <p
          className="font-mono text-[10px] uppercase tracking-[0.2em] mb-2"
          style={{ color: colors.textMuted }}
        >
          Classification
        </p>
        {["verified", "foundational", "recommended"].map((cat) => (
          <div key={cat} className="flex items-center gap-2 mb-1.5 last:mb-0">
            <div
              className="w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: colors[cat].fill,
                borderColor: colors[cat].stroke,
              }}
            />
            <span
              className="font-mono text-[11px] capitalize"
              style={{ color: colors.text }}
            >
              {cat}
            </span>
          </div>
        ))}
      </div>

      {/* ── SVG Tree ── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-auto"
        style={{ minHeight: dimensions.height }}
        aria-label="Dynamic Skill Tree Visualization"
      >
        {/* Background grid pattern */}
        <defs>
          <pattern id="skill-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={isDarkMode ? "#1E293B" : "#E2E8F0"}
              strokeWidth="0.5"
              opacity="0.4"
            />
          </pattern>
          {/* Glow filters */}
          <filter id="glow-verified" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#skill-grid)" opacity="0.3" />

        {/* ── Edges ── */}
        <g className="edges">
          {layoutEdges.map((edge, i) => (
            <path
              key={`edge-${i}`}
              d={buildEdgePath(edge)}
              fill="none"
              stroke={colors.edge}
              strokeWidth={2}
              strokeLinecap="round"
              data-edge="true"
              data-depth={edge.depth}
              data-target-id={edge.targetId}
            />
          ))}
        </g>

        {/* ── Nodes ── */}
        <g className="nodes">
          {layoutNodes.map((node) => {
            const catColors = colors[node.category];
            const radius = NODE_RADIUS[node.category];
            const isRecommended = node.category === "recommended";
            const isVerified = node.category === "verified";

            return (
              <g
                key={node.id}
                data-node="true"
                data-node-id={node.id}
                data-category={node.category}
                data-depth={node.depth}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                role="img"
                aria-label={`${node.name} — ${node.category} (${node.confidence}% confidence)`}
              >
                {/* Outer glow ring for verified */}
                {isVerified && (
                  <circle
                    r={radius + 6}
                    fill="none"
                    stroke={catColors.glow}
                    strokeWidth={2}
                    opacity={0.5}
                    filter="url(#glow-verified)"
                  />
                )}

                {/* Main circle */}
                <circle
                  r={radius}
                  fill={catColors.fill === "none" ? (isDarkMode ? "#0F172A" : "#F8FAFC") : catColors.fill}
                  stroke={catColors.stroke}
                  strokeWidth={isRecommended ? 2 : 2.5}
                  strokeDasharray={isRecommended ? "4 3" : "none"}
                  opacity={1}
                />

                {/* Category icon */}
                <g transform={`translate(-10, -10) scale(0.85)`}>
                  <path
                    d={CATEGORY_ICONS[node.category]}
                    fill="none"
                    stroke={isRecommended ? colors.textMuted : (isDarkMode ? "#0F172A" : "#FFFFFF")}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Confidence arc (partial ring) */}
                {node.confidence > 0 && (
                  <circle
                    r={radius + 3}
                    fill="none"
                    stroke={catColors.stroke}
                    strokeWidth={1.5}
                    strokeDasharray={`${(node.confidence / 100) * (2 * Math.PI * (radius + 3))} ${2 * Math.PI * (radius + 3)}`}
                    strokeLinecap="round"
                    transform="rotate(-90)"
                    opacity={0.6}
                  />
                )}

                {/* Lock icon for recommended */}
                {isRecommended && (
                  <g transform="translate(-5, -6) scale(0.45)">
                    <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke={colors.textMuted} strokeWidth="2.5" />
                    <path d="M7 11V7a5 5 0 0110 0v4" fill="none" stroke={colors.textMuted} strokeWidth="2.5" strokeLinecap="round" />
                  </g>
                )}

                {/* Label */}
                <text
                  y={radius + 16}
                  textAnchor="middle"
                  className="font-mono"
                  style={{
                    fontSize: node.category === "verified" ? "11px" : "10px",
                    fontWeight: node.category === "verified" ? 700 : 500,
                    fill: colors.text,
                    letterSpacing: "0.02em",
                  }}
                >
                  {node.name}
                </text>

                {/* Confidence label */}
                <text
                  y={radius + 28}
                  textAnchor="middle"
                  style={{
                    fontSize: "9px",
                    fill: colors.textMuted,
                    fontFamily: "monospace",
                  }}
                >
                  {node.confidence}%
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default DynamicSkillTree;
