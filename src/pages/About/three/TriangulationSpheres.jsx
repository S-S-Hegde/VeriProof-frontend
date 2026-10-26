import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * TriangulationSpheres
 * Section 6: The Triangulation Matrix (3 sources: Resume, Repo, Live Assessment)
 * Three translucent spheres smoothly converge into a Venn intersection on scroll.
 */
export default function TriangulationSpheres({
  progress = 0,
  activeSection = 6,
  isDark = true,
  hoveredOutcome = null,
}) {
  const groupRef = useRef();
  const sphere1Ref = useRef();
  const sphere2Ref = useRef();
  const sphere3Ref = useRef();
  const centerGlowRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Slow orbital rotation
    groupRef.current.rotation.y += delta * 0.2;
    groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.1;

    // Convergence offset: starts spread apart, converges to center
    const convergence = THREE.MathUtils.clamp((progress - 0.1) * 1.8, 0, 1);
    const spread = THREE.MathUtils.lerp(2.2, 0.95, convergence);

    if (sphere1Ref.current && sphere2Ref.current && sphere3Ref.current) {
      // Sphere 1: Top (Resume claims)
      sphere1Ref.current.position.set(0, spread * 1.1, 0);

      // Sphere 2: Bottom Left (Repository evidence)
      sphere2Ref.current.position.set(-spread * 1.0, -spread * 0.6, 0);

      // Sphere 3: Bottom Right (Live assessment)
      sphere3Ref.current.position.set(spread * 1.0, -spread * 0.6, 0);
    }

    if (centerGlowRef.current) {
      // Glow pulses higher as spheres converge
      const glowScale = 0.5 + convergence * 0.8 + Math.sin(state.clock.getElapsedTime() * 4) * 0.1;
      centerGlowRef.current.scale.setScalar(glowScale);
    }
  });

  const isVisible = activeSection >= 5 && activeSection <= 7;
  if (!isVisible) return null;

  const cyan = isDark ? "#00d4ff" : "#0284c7";
  const indigo = isDark ? "#6366f1" : "#4338ca";
  const emerald = isDark ? "#10b981" : "#059669";

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Resume Claims Sphere (Cyan) */}
      <mesh ref={sphere1Ref}>
        <sphereGeometry args={[1.35, 24, 24]} />
        <meshStandardMaterial
          color={cyan}
          transparent
          opacity={hoveredOutcome === "overstated-profile" ? 0.75 : 0.35}
          roughness={0.1}
          wireframe={false}
        />
      </mesh>

      {/* 2. Repository Evidence Sphere (Indigo) */}
      <mesh ref={sphere2Ref}>
        <sphereGeometry args={[1.35, 24, 24]} />
        <meshStandardMaterial
          color={indigo}
          transparent
          opacity={hoveredOutcome === "hidden-gem" ? 0.75 : 0.35}
          roughness={0.1}
        />
      </mesh>

      {/* 3. Live Assessment Sphere (Emerald) */}
      <mesh ref={sphere3Ref}>
        <sphereGeometry args={[1.35, 24, 24]} />
        <meshStandardMaterial
          color={emerald}
          transparent
          opacity={hoveredOutcome === "anomalous-evidence" ? 0.75 : 0.35}
          roughness={0.1}
        />
      </mesh>

      {/* Venn Intersection Center Glow (Verified Talent) */}
      <mesh ref={centerGlowRef}>
        <octahedronGeometry args={[0.6, 1]} />
        <meshBasicMaterial
          color={hoveredOutcome === "verified-talent" ? "#34d399" : (isDark ? "#38bdf8" : "#0284c7")}
          transparent
          opacity={0.8}
          wireframe
        />
      </mesh>
    </group>
  );
}
