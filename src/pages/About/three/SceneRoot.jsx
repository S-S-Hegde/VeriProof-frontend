import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ParticleField from "./ParticleField";
import PipelineRail from "./PipelineRail";
import PurgatoryRing from "./PurgatoryRing";
import TriangulationSpheres from "./TriangulationSpheres";
import SkillTreeGraph from "./SkillTreeGraph";

/**
 * CameraRig
 * Smoothly interpolates camera position & rotation per section
 * and adds subtle mouse parallax on desktop.
 */
function CameraRig({
  scrollProgress = 0,
  activeSection = 0,
  reducedMotion = false,
  mousePos = { x: 0, y: 0 },
}) {
  useFrame((state, delta) => {
    if (reducedMotion) return;

    // Target camera coordinates based on active section
    let targetX = 0;
    let targetY = 0;
    let targetZ = 12;

    switch (activeSection) {
      case 0: // Hero
        targetX = mousePos.x * 0.8;
        targetY = mousePos.y * 0.5;
        targetZ = 11;
        break;
      case 1: // The Problem
        targetX = -1.2 + mousePos.x * 0.5;
        targetY = -0.5;
        targetZ = 13;
        break;
      case 2: // Pipeline Rail
        targetX = 1.0;
        targetY = -1.0;
        targetZ = 10;
        break;
      case 3: // Purgatory
        targetX = 1.5;
        targetY = 0;
        targetZ = 9.5;
        break;
      case 6: // Triangulation Matrix
        targetX = 0;
        targetY = 0;
        targetZ = 8.5;
        break;
      case 7: // Skill Tree
        targetX = 0;
        targetY = 0.5;
        targetZ = 10;
        break;
      case 12: // Final CTA
        targetX = 0;
        targetY = 0;
        targetZ = 9;
        break;
      default:
        targetX = mousePos.x * 0.4;
        targetY = 0;
        targetZ = 12;
    }

    // Smooth camera damping
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, delta * 2.5);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, delta * 2.5);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * 2.5);

    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

/**
 * WebGL Fallback Component
 * Rendered if WebGL context cannot be initialized or is disabled.
 */
function WebGLFallback({ isDark }) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-10 transition-colors duration-500 ${
        isDark ? "bg-[#050816]" : "bg-[#f4f7fb]"
      }`}
    >
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle at 50% 30%, rgba(0, 212, 255, 0.12) 0%, rgba(5, 8, 22, 0.95) 100%)"
            : "radial-gradient(circle at 50% 30%, rgba(2, 132, 199, 0.08) 0%, rgba(244, 247, 251, 0.95) 100%)",
        }}
      />
    </div>
  );
}

/**
 * SceneRoot
 * Unified, persistent 3D Canvas running behind all About sections.
 */
export default function SceneRoot({
  scrollProgress = 0,
  activeSection = 0,
  sectionProgress = {},
  isDark = true,
  isMobile = false,
  reducedMotion = false,
  hoveredOutcome = null,
  onHoverSkillNode = null,
}) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    // Monitor tab visibility to pause rendering when inactive
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Mouse parallax tracking
    const handleMouseMove = (e) => {
      if (isMobile || reducedMotion) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile, reducedMotion]);

  if (!hasWebGL) {
    return <WebGLFallback isDark={isDark} />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background Vignette Tone */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-500"
        style={{
          background: isDark
            ? "radial-gradient(circle at 50% 40%, rgba(10, 15, 36, 0.7) 0%, rgba(5, 8, 22, 0.98) 100%)"
            : "radial-gradient(circle at 50% 40%, rgba(244, 247, 251, 0.6) 0%, rgba(230, 237, 246, 0.95) 100%)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 12], fov: 48 }}
        dpr={Math.min(window.devicePixelRatio || 1, 1.75)}
        frameloop={isTabVisible ? "always" : "demand"}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <CameraRig
            scrollProgress={scrollProgress}
            activeSection={activeSection}
            reducedMotion={reducedMotion}
            mousePos={mousePos}
          />

          <ambientLight intensity={isDark ? 0.6 : 0.8} />
          <pointLight position={[10, 10, 10]} intensity={isDark ? 1.2 : 0.9} color="#00d4ff" />

          {/* Core Dynamic Particle Field */}
          <ParticleField
            scrollProgress={scrollProgress}
            activeSection={activeSection}
            isDark={isDark}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            mousePos={mousePos}
          />

          {/* Section 2: 3D Pipeline Rail */}
          <PipelineRail
            progress={sectionProgress[2] || 0}
            activeSection={activeSection}
            isDark={isDark}
            isMobile={isMobile}
          />

          {/* Section 3: Purgatory Torus Countdown Ring */}
          <PurgatoryRing
            progress={sectionProgress[3] || 0}
            activeSection={activeSection}
            isDark={isDark}
            isMobile={isMobile}
          />

          {/* Section 6: Triangulation Converging Venn Spheres */}
          <TriangulationSpheres
            progress={sectionProgress[6] || 0}
            activeSection={activeSection}
            isDark={isDark}
            hoveredOutcome={hoveredOutcome}
          />

          {/* Section 7: Dynamic Skill Tree DAG */}
          <SkillTreeGraph
            progress={sectionProgress[7] || 0}
            activeSection={activeSection}
            isDark={isDark}
            onHoverNode={onHoverSkillNode}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
