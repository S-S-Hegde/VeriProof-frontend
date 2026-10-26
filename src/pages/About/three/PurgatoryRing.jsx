import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * PurgatoryRing
 * Section 3: The Purgatory Intermission (timed holding state 5 to 15 min).
 * A large glowing torus countdown ring with code particles flowing in from left
 * and transformed Phase 2 scenario particles flowing out to the right.
 */
export default function PurgatoryRing({
  progress = 0,
  activeSection = 3,
  isDark = true,
  isMobile = false,
}) {
  const ringRef = useRef();
  const streamInRef = useRef();
  const streamOutRef = useRef();

  const particleCount = isMobile ? 60 : 180;

  // Stream in (Left) and Stream out (Right) particles
  const { inPositions, outPositions } = useMemo(() => {
    const inPos = new Float32Array(particleCount * 3);
    const outPos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Inflow: -8 to -2.2
      inPos[i3] = -7.5 + Math.random() * 5.2;
      inPos[i3 + 1] = (Math.random() - 0.5) * 1.8;
      inPos[i3 + 2] = (Math.random() - 0.5) * 1.5;

      // Outflow: +2.2 to +8
      outPos[i3] = 2.2 + Math.random() * 5.5;
      outPos[i3 + 1] = (Math.random() - 0.5) * 1.8;
      outPos[i3 + 2] = (Math.random() - 0.5) * 1.5;
    }

    return { inPositions: inPos, outPositions: outPos };
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!ringRef.current) return;

    // Rotate torus gently
    ringRef.current.rotation.z += delta * 0.4;
    ringRef.current.rotation.x = Math.PI / 6 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;

    // Animate streaming particles
    if (streamInRef.current && streamOutRef.current) {
      const inAttr = streamInRef.current.geometry.attributes.position;
      const outAttr = streamOutRef.current.geometry.attributes.position;

      for (let i = 0; i < particleCount; i++) {
        // Inflow moves toward center ring (rightward)
        let xIn = inAttr.getX(i) + delta * 2.8;
        if (xIn > -1.8) xIn = -7.5;
        inAttr.setX(i, xIn);

        // Outflow moves away from center ring (rightward)
        let xOut = outAttr.getX(i) + delta * 3.2;
        if (xOut > 7.5) xOut = 2.0;
        outAttr.setX(i, xOut);
      }

      inAttr.needsUpdate = true;
      outAttr.needsUpdate = true;
    }
  });

  const isVisible = activeSection >= 2 && activeSection <= 4;
  if (!isVisible && !isMobile) return null;

  const cyan = isDark ? "#00d4ff" : "#0284c7";
  const indigo = isDark ? "#6366f1" : "#4f46e5";

  // Arc length depletes as S3 scrolls (simulating countdown)
  const arcLength = Math.max(0.3, (1 - Math.min(1, Math.max(0, progress))) * Math.PI * 2);

  return (
    <group position={[isMobile ? 0 : 3.5, 0, 0]}>
      {/* Depleting Count-Down Torus Arc */}
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[2.0, 0.12, 16, 64, arcLength]} />
          <meshStandardMaterial
            color={cyan}
            emissive={cyan}
            emissiveIntensity={isDark ? 1.2 : 0.6}
            roughness={0.2}
          />
        </mesh>

        {/* Outer Wireframe Support Ring */}
        <mesh>
          <torusGeometry args={[2.2, 0.02, 8, 48]} />
          <meshBasicMaterial
            color={indigo}
            transparent
            opacity={isDark ? 0.4 : 0.25}
          />
        </mesh>
      </group>

      {/* Inflow Code Particles (Left -> Ring) */}
      <points ref={streamInRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={inPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 0.08 : 0.1}
          color={isDark ? "#38bdf8" : "#0284c7"}
          transparent
          opacity={0.8}
        />
      </points>

      {/* Outflow Phase 2 Scenario Particles (Ring -> Right) */}
      <points ref={streamOutRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={outPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 0.09 : 0.12}
          color={isDark ? "#818cf8" : "#4338ca"}
          transparent
          opacity={0.85}
        />
      </points>
    </group>
  );
}
