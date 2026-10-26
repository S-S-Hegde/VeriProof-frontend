import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * PipelineRail
 * 3D curved spline rail for Section 2 (The 6-Step Verification Pipeline).
 * Followed by a glowing evidence packet (octahedron) traveling between 6 stations.
 */
export default function PipelineRail({
  progress = 0,
  activeSection = 2,
  isDark = true,
  isMobile = false,
}) {
  const packetRef = useRef();
  const sparkRef = useRef();

  // Create curved 3D rail path through 6 station coordinates
  const { curve, tubeGeometry, stationPositions } = useMemo(() => {
    const points = [
      new THREE.Vector3(-4.5, 3.5, -2),   // 01: Connect GitHub
      new THREE.Vector3(-2.0, 1.8, 0),    // 02: Check Authorship (<600s clusters)
      new THREE.Vector3(0.5, 0.2, -1.5),  // 03: AST Code Parser
      new THREE.Vector3(2.5, -1.2, 0.5),  // 04: Evidence Fusion
      new THREE.Vector3(0.0, -2.8, -1),   // 05: 2-Phase Adaptive Exam
      new THREE.Vector3(-3.0, -4.5, 1.2), // 06: Forensic Trust Score
    ];

    const catmullCurve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(catmullCurve, 90, 0.04, 8, false);

    return {
      curve: catmullCurve,
      tubeGeometry: tubeGeo,
      stationPositions: points,
    };
  }, []);

  useFrame((state) => {
    if (!packetRef.current) return;

    // S2 progress mapped 0..1
    const clampedProgress = THREE.MathUtils.clamp(progress, 0, 1);
    const pos = curve.getPointAt(clampedProgress);
    const tangent = curve.getTangentAt(clampedProgress);

    packetRef.current.position.copy(pos);
    packetRef.current.rotation.x += 0.04;
    packetRef.current.rotation.y += 0.06;

    // Station 4 spark effect (Resume/Repo mismatch)
    if (sparkRef.current) {
      const isStation4 = clampedProgress > 0.55 && clampedProgress < 0.72;
      sparkRef.current.visible = isStation4;
      if (isStation4) {
        sparkRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 20) * 0.4);
      }
    }
  });

  // Only render rail prominently when S2 is active or nearby
  const isS2Nearby = activeSection >= 1 && activeSection <= 3;
  if (!isS2Nearby && !isMobile) return null;

  const cyan = isDark ? "#00d4ff" : "#0284c7";
  const red = "#ef4444";

  return (
    <group position={[isMobile ? 0 : 2.5, 0, 0]}>
      {/* 3D Curved Rail Tube */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color={cyan}
          transparent
          opacity={isDark ? 0.45 : 0.3}
          wireframe={false}
        />
      </mesh>

      {/* Traveling Glowing Evidence Packet (Octahedron) */}
      <mesh ref={packetRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color={cyan}
          emissive={cyan}
          emissiveIntensity={isDark ? 1.5 : 0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Station Visual Markers along the Rail */}
      {stationPositions.map((stPos, index) => {
        const isCurrentStation = Math.abs(progress * 5 - index) < 0.6;
        return (
          <group key={index} position={stPos}>
            {/* Station Halo Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.25, 0.32, 16]} />
              <meshBasicMaterial
                color={index === 1 && isCurrentStation ? red : cyan}
                transparent
                opacity={isCurrentStation ? 0.9 : 0.35}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Station Core Node */}
            <mesh>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshBasicMaterial
                color={index === 1 && isCurrentStation ? red : cyan}
              />
            </mesh>

            {/* Station 4 Mismatch Spark */}
            {index === 3 && (
              <mesh ref={sparkRef} position={[0, 0.4, 0]}>
                <dodecahedronGeometry args={[0.15, 0]} />
                <meshBasicMaterial color="#ef4444" wireframe />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
