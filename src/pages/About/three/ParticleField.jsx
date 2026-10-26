import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ParticleField
 * ~1500 soft particles (reduced to ~400 on mobile)
 * - S0: Drifting "claims" around wireframe icosahedron core
 * - S1: Amber/red noise jitter ("noise to be cleaned")
 * - S2-S6: Pulling into commit lattice coordinates
 * - S12: Reassembles into a glowing shield/check shape before drifting
 */
export default function ParticleField({
  scrollProgress = 0,
  activeSection = 0,
  isDark = true,
  isMobile = false,
  reducedMotion = false,
  mousePos = { x: 0, y: 0 },
}) {
  const pointsRef = useRef();
  const coreRef = useRef();

  const count = isMobile ? 420 : 1400;

  // Generate target configurations: Drifting Claims, Commit Lattice, and Shield
  const { positionsInitial, positionsLattice, positionsShield, colors } = useMemo(() => {
    const posInit = new Float32Array(count * 3);
    const posLat = new Float32Array(count * 3);
    const posSh = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cyan = new THREE.Color(isDark ? "#00d4ff" : "#0284c7");
    const indigo = new THREE.Color(isDark ? "#6366f1" : "#4338ca");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // 1. Initial Cloud (sphere distribution)
      const radius = 6 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      posInit[i3] = radius * Math.sin(phi) * Math.cos(theta);
      posInit[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posInit[i3 + 2] = radius * Math.cos(phi);

      // 2. Commit Lattice (structured columns & branch rows)
      const colIndex = i % 8;
      const rowIndex = Math.floor(i / 8) % 30;
      posLat[i3] = (colIndex - 3.5) * 2.2 + (Math.sin(rowIndex * 0.4) * 0.8);
      posLat[i3 + 1] = (rowIndex - 15) * 0.9 + (Math.cos(colIndex) * 0.5);
      posLat[i3 + 2] = ((i % 5) - 2) * 1.5;

      // 3. Shield / Checkmark for Final CTA
      const t = (i / count) * Math.PI * 2;
      if (i % 2 === 0) {
        // Shield outline
        const sx = Math.sin(t) * 5;
        const sy = (Math.cos(t) * 5) - Math.abs(sx) * 0.35;
        posSh[i3] = sx;
        posSh[i3 + 1] = sy;
        posSh[i3 + 2] = (Math.random() - 0.5) * 1.5;
      } else {
        // Central checkmark
        const prog = (i % 100) / 100;
        if (prog < 0.4) {
          posSh[i3] = -2.5 + prog * 4;
          posSh[i3 + 1] = -0.5 - prog * 3.5;
        } else {
          posSh[i3] = -0.9 + (prog - 0.4) * 6;
          posSh[i3 + 1] = -1.9 + (prog - 0.4) * 7;
        }
        posSh[i3 + 2] = (Math.random() - 0.5) * 0.5;
      }

      // Colors: Cyan to Indigo gradient
      const c = cyan.clone().lerp(indigo, Math.random() * 0.5);
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }

    return {
      positionsInitial: posInit,
      positionsLattice: posLat,
      positionsShield: posSh,
      colors: col,
    };
  }, [count, isDark]);

  // Working positions buffer
  const currentPositions = useMemo(() => new Float32Array(positionsInitial), [positionsInitial]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const colAttr = geo.attributes.color;

    // Determine phase weights based on scrollProgress & activeSection
    const isS0 = activeSection === 0;
    const isS1 = activeSection === 1;
    const isS12 = activeSection >= 12 || scrollProgress > 0.92;

    const latticeWeight = Math.min(1, Math.max(0, (scrollProgress - 0.12) / 0.3));
    const shieldWeight = isS12 ? 1 : 0;

    const amber = new THREE.Color("#f59e0b");
    const rose = new THREE.Color("#ef4444");
    const defaultColor = new THREE.Color(isDark ? "#00d4ff" : "#0284c7");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      let targetX = positionsInitial[i3];
      let targetY = positionsInitial[i3 + 1];
      let targetZ = positionsInitial[i3 + 2];

      // Blend into Lattice
      if (latticeWeight > 0 && !isS12) {
        targetX = THREE.MathUtils.lerp(targetX, positionsLattice[i3], latticeWeight);
        targetY = THREE.MathUtils.lerp(targetY, positionsLattice[i3 + 1], latticeWeight);
        targetZ = THREE.MathUtils.lerp(targetZ, positionsLattice[i3 + 2], latticeWeight);
      }

      // Blend into Shield in S12
      if (shieldWeight > 0) {
        targetX = THREE.MathUtils.lerp(targetX, positionsShield[i3], THREE.MathUtils.clamp((scrollProgress - 0.9) * 10, 0, 1));
        targetY = THREE.MathUtils.lerp(targetY, positionsShield[i3 + 1], THREE.MathUtils.clamp((scrollProgress - 0.9) * 10, 0, 1));
        targetZ = THREE.MathUtils.lerp(targetZ, positionsShield[i3 + 2], THREE.MathUtils.clamp((scrollProgress - 0.9) * 10, 0, 1));
      }

      // Add gentle drift (unless reduced motion is enabled)
      if (!reducedMotion) {
        const driftSpeed = isS1 ? 4.5 : 0.8;
        const driftAmp = isS1 ? 0.35 : 0.12;
        targetX += Math.sin(time * driftSpeed + i * 0.1) * driftAmp;
        targetY += Math.cos(time * driftSpeed + i * 0.15) * driftAmp;

        // Noise Jitter in S1: Technical Hiring Truth Problem
        if (isS1) {
          targetX += (Math.random() - 0.5) * 0.45;
          targetY += (Math.random() - 0.5) * 0.45;
          targetZ += (Math.random() - 0.5) * 0.45;
        }
      }

      // Smooth lerp to current
      currentPositions[i3] = THREE.MathUtils.lerp(currentPositions[i3], targetX, delta * 3.5);
      currentPositions[i3 + 1] = THREE.MathUtils.lerp(currentPositions[i3 + 1], targetY, delta * 3.5);
      currentPositions[i3 + 2] = THREE.MathUtils.lerp(currentPositions[i3 + 2], targetZ, delta * 3.5);

      posAttr.setXYZ(i, currentPositions[i3], currentPositions[i3 + 1], currentPositions[i3 + 2]);

      // Color shifts: S1 flashes amber/red jitter, otherwise cyan/indigo
      if (isS1) {
        const jitterColor = (i % 2 === 0 ? amber : rose).clone();
        colAttr.setXYZ(i, jitterColor.r, jitterColor.g, jitterColor.b);
      } else {
        colAttr.setXYZ(i, colors[i3], colors[i3 + 1], colors[i3 + 2]);
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // Rotate core icosahedron in S0
    if (coreRef.current) {
      if (!reducedMotion) {
        coreRef.current.rotation.x = time * 0.15;
        coreRef.current.rotation.y = time * 0.22;
      }
      // Core scales down smoothly as user scrolls past S0
      const coreScale = Math.max(0.01, 1 - scrollProgress * 5);
      coreRef.current.scale.setScalar(coreScale);
    }
  });

  return (
    <group>
      {/* Central Rotating Wireframe Icosahedron Core in Hero */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshBasicMaterial
          wireframe
          color={isDark ? "#00d4ff" : "#0284c7"}
          transparent
          opacity={isDark ? 0.35 : 0.25}
        />
      </mesh>

      {/* Dynamic Particle Field */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={currentPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 0.08 : 0.12}
          vertexColors
          transparent
          opacity={isDark ? 0.85 : 0.75}
          blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
