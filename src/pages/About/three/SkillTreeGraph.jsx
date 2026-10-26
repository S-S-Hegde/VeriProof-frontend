import React, { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * SkillTreeGraph
 * Section 7: Dynamic Skill Tree DAG (~25 nodes with 3 tiers: Foundational, Intermediate, Advanced)
 * Interactive rotation, dependency unlock ripple pulse, hover tooltips.
 */
export default function SkillTreeGraph({
  progress = 0,
  activeSection = 7,
  isDark = true,
  onHoverNode = null,
}) {
  const groupRef = useRef();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Generate ~25 DAG nodes across 3 tiers
  const { nodes, edges } = useMemo(() => {
    const rawNodes = [
      // Tier 1: Foundational (0-7)
      { id: "git", name: "Git Provenance", tier: "Foundational", type: "Repo", x: -3.2, y: -2.0, z: -0.5 },
      { id: "syntax", name: "Language Grammar", tier: "Foundational", type: "Exam", x: -1.8, y: -2.2, z: 0.2 },
      { id: "io", name: "I/O & Streams", tier: "Foundational", type: "Repo", x: -0.5, y: -2.0, z: -0.4 },
      { id: "ds", name: "Data Structures", tier: "Foundational", type: "Exam", x: 0.8, y: -2.1, z: 0.3 },
      { id: "alg", name: "Sorting & Search", tier: "Foundational", type: "Exam", x: 2.1, y: -1.9, z: -0.2 },
      { id: "http", name: "HTTP Protocols", tier: "Foundational", type: "Repo", x: 3.3, y: -2.1, z: 0.4 },
      { id: "sql", name: "Relational Schemas", tier: "Foundational", type: "Repo", x: -2.5, y: -1.2, z: 0.5 },
      { id: "auth", name: "Auth Fundamentals", tier: "Foundational", type: "Exam", x: 1.5, y: -1.3, z: -0.5 },

      // Tier 2: Intermediate (8-16)
      { id: "concur", name: "Async Concurrency", tier: "Intermediate", type: "Repo", x: -2.8, y: 0.2, z: -0.2 },
      { id: "ast", name: "AST Contribution", tier: "Intermediate", type: "Repo", x: -1.4, y: 0.0, z: 0.4 },
      { id: "rest", name: "REST API Contracts", tier: "Intermediate", type: "Repo", x: 0.0, y: 0.1, z: -0.3 },
      { id: "state", name: "State Pipelines", tier: "Intermediate", type: "Exam", x: 1.4, y: 0.2, z: 0.3 },
      { id: "orm", name: "Query Optimization", tier: "Intermediate", type: "Repo", x: 2.7, y: 0.0, z: -0.4 },
      { id: "mod", name: "Component Boundaries", tier: "Intermediate", type: "Exam", x: -0.7, y: 0.8, z: 0.5 },
      { id: "test", name: "Integration Suites", tier: "Intermediate", type: "Repo", x: 0.7, y: 0.9, z: -0.2 },
      { id: "cache", name: "Redis Caching", tier: "Intermediate", type: "Repo", x: -2.0, y: 1.0, z: -0.5 },
      { id: "sec", name: "OWASP Hardening", tier: "Intermediate", type: "Exam", x: 2.0, y: 1.0, z: 0.4 },

      // Tier 3: Advanced (17-24)
      { id: "scale", name: "System Scalability", tier: "Advanced", type: "Exam", x: -2.2, y: 2.2, z: 0.3 },
      { id: "micro", name: "Event Architecture", tier: "Advanced", type: "Repo", x: -0.9, y: 2.4, z: -0.4 },
      { id: "trade", name: "Architecture Trade-offs", tier: "Advanced", type: "Exam", x: 0.4, y: 2.3, z: 0.2 },
      { id: "perf", name: "Profiling & Latency", tier: "Advanced", type: "Repo", x: 1.8, y: 2.2, z: -0.3 },
      { id: "k8s", name: "Cluster Orchestration", tier: "Advanced", type: "Repo", x: 3.0, y: 2.1, z: 0.5 },
      { id: "purg", name: "Dynamic Code Sandbox", tier: "Advanced", type: "Exam", x: -0.2, y: 3.2, z: 0.0 },
      { id: "dna", name: "Skill DNA Synthesis", tier: "Advanced", type: "Exam", x: 1.2, y: 3.1, z: -0.2 },
      { id: "score", name: "Forensic Trust Master", tier: "Advanced", type: "Exam", x: 0.5, y: 3.9, z: 0.3 },
    ];

    // Edges connecting dependency DAG
    const rawEdges = [
      [0, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 10], [6, 12], [7, 16],
      [8, 17], [9, 18], [10, 19], [11, 19], [12, 20], [13, 18], [14, 20], [15, 17],
      [16, 21], [17, 22], [18, 22], [19, 23], [20, 23], [21, 23], [22, 24], [23, 24]
    ];

    return { nodes: rawNodes, edges: rawEdges };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Auto-rotate slowly when idle
    groupRef.current.rotation.y += delta * 0.15;
  });

  const isVisible = activeSection >= 6 && activeSection <= 8;
  if (!isVisible) return null;

  const cyan = isDark ? "#00d4ff" : "#0284c7";
  const indigo = isDark ? "#818cf8" : "#4338ca";

  // Compute unlock threshold (ripple pulse across 25 nodes based on scroll progress)
  const unlockIndexThreshold = Math.min(25, Math.floor(progress * 28));

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {/* Dependency Edges */}
      {edges.map(([fromIdx, toIdx], edgeIdx) => {
        const from = nodes[fromIdx];
        const to = nodes[toIdx];
        const isUnlocked = toIdx <= unlockIndexThreshold;

        const points = [new THREE.Vector3(from.x, from.y, from.z), new THREE.Vector3(to.x, to.y, to.z)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <line key={edgeIdx} geometry={lineGeo}>
            <lineBasicMaterial
              color={isUnlocked ? cyan : (isDark ? "#334155" : "#cbd5e1")}
              transparent
              opacity={isUnlocked ? 0.65 : 0.2}
            />
          </line>
        );
      })}

      {/* DAG Skill Nodes */}
      {nodes.map((node, idx) => {
        const isUnlocked = idx <= unlockIndexThreshold;
        const isHovered = hoveredIndex === idx;

        return (
          <group
            key={node.id}
            position={[node.x, node.y, node.z]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredIndex(idx);
              if (onHoverNode) onHoverNode(node);
            }}
            onPointerOut={() => {
              setHoveredIndex(null);
              if (onHoverNode) onHoverNode(null);
            }}
          >
            {/* Outer Hex/Octahedron Ring */}
            <mesh>
              <octahedronGeometry args={[isHovered ? 0.32 : 0.22, 0]} />
              <meshStandardMaterial
                color={isUnlocked ? (node.tier === "Advanced" ? indigo : cyan) : "#475569"}
                emissive={isUnlocked ? (node.tier === "Advanced" ? indigo : cyan) : "#1e293b"}
                emissiveIntensity={isUnlocked ? (isHovered ? 1.5 : 0.7) : 0.1}
                wireframe={!isUnlocked}
              />
            </mesh>

            {/* Core Pulse */}
            {isUnlocked && (
              <mesh>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
