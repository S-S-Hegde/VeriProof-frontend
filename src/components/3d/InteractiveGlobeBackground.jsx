import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "../../context/ThemeContext";
import { useReducedMotion } from "framer-motion";
import { Activity, ShieldCheck, Globe, Wifi, Radio } from "lucide-react";

// Global verification hub coordinates [lat, lng, name]
const HUBS = [
  { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Frankfurt", lat: 50.1109, lng: 8.6821 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
  { name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Zurich", lat: 47.3769, lng: 8.5417 },
  { name: "Seoul", lat: 37.5665, lng: 126.978 },
];

// Active node-to-node cryptographic verification channels
const CONNECTIONS = [
  [0, 1], // SF - NY
  [1, 2], // NY - London
  [2, 3], // London - Frankfurt
  [3, 10], // Frankfurt - Zurich
  [3, 9], // Frankfurt - Dubai
  [9, 6], // Dubai - Bangalore
  [6, 5], // Bangalore - Singapore
  [5, 4], // Singapore - Tokyo
  [4, 11], // Tokyo - Seoul
  [4, 0], // Tokyo - SF
  [4, 7], // Tokyo - Sydney
  [5, 7], // Singapore - Sydney
  [1, 8], // NY - São Paulo
];

const RADIUS = 100;

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/**
 * HeroInteractiveGlobe
 * The central attraction for the Landing Page Hero section.
 * - Responsive 3D WebGL Fibonacci dot sphere
 * - Dynamic Bézier cryptographic verification arcs
 * - Scoped pointer drag-to-rotate interaction (no window event leaks)
 * - Corner live telemetry HUD ticker overlay
 */
export const HeroInteractiveGlobe = ({
  className = "relative w-full max-w-[540px] aspect-square mx-auto flex items-center justify-center select-none group",
  showCornerHUD = true,
  showDragHint = true,
}) => {
  const mountRef = useRef(null);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Telemetry state
  const [resumesScanned, setResumesScanned] = useState(14892);
  const [proofsIssued, setProofsIssued] = useState(6310);
  const [opsPerSec, setOpsPerSec] = useState(892);

  useEffect(() => {
    const interval = setInterval(() => {
      setResumesScanned((prev) => prev + Math.floor(Math.random() * 3) + 1);
      if (Math.random() > 0.4) {
        setProofsIssued((prev) => prev + 1);
      }
      setOpsPerSec(870 + Math.floor(Math.random() * 55));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 480;
    let height = container.clientHeight || 480;

    // 1. Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.z = 265;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Root globe group
    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.22;
    globeGroup.rotation.y = -0.5;
    scene.add(globeGroup);

    // Dynamic theme styling
    const isDark = theme === "dark";
    const primaryColor = isDark ? 0x22d3ee : 0x0284c7; // Cyan vs Slate Sky
    const secondaryColor = isDark ? 0x6366f1 : 0x3b82f6; // Indigo vs Blue
    const wireframeOpacity = isDark ? 0.1 : 0.08;
    const particleOpacity = isDark ? 0.75 : 0.6;

    // 2. Cryptographic Dot Matrix Sphere (1,800 points)
    const dotsCount = 1800;
    const dotPositions = new Float32Array(dotsCount * 3);
    const dotSizes = new Float32Array(dotsCount);

    for (let i = 0; i < dotsCount; i++) {
      const y = 1 - (i / (dotsCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = i * 2.399963229728653; // Golden angle

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      dotPositions[i * 3] = x * RADIUS;
      dotPositions[i * 3 + 1] = y * RADIUS;
      dotPositions[i * 3 + 2] = z * RADIUS;

      dotSizes[i] = Math.random() * 1.6 + 1.2;
    }

    const dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute("position", new THREE.BufferAttribute(dotPositions, 3));
    dotGeometry.setAttribute("size", new THREE.BufferAttribute(dotSizes, 1));

    const dotMaterial = new THREE.PointsMaterial({
      color: primaryColor,
      size: 2.2,
      transparent: true,
      opacity: particleOpacity,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const dotPoints = new THREE.Points(dotGeometry, dotMaterial);
    globeGroup.add(dotPoints);

    // 3. Subtle Wireframe Latitude/Longitude Cage
    const wireGeometry = new THREE.SphereGeometry(RADIUS * 0.995, 36, 24);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      wireframe: true,
      transparent: true,
      opacity: wireframeOpacity,
    });
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    globeGroup.add(wireMesh);

    // 4. Verification Hub Nodes
    const hubPoints = HUBS.map((hub) => latLngToVector3(hub.lat, hub.lng, RADIUS));
    const hubGroup = new THREE.Group();

    hubPoints.forEach((pos) => {
      // Outer ping ring
      const ringGeo = new THREE.RingGeometry(1.4, 2.6, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: primaryColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isDark ? 0.85 : 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);
      hubGroup.add(ringMesh);

      // Inner glowing core
      const coreGeo = new THREE.SphereGeometry(1.6, 8, 8);
      const coreMat = new THREE.MeshBasicMaterial({
        color: isDark ? 0xffffff : primaryColor,
        transparent: true,
        opacity: 0.95,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.copy(pos);
      hubGroup.add(coreMesh);
    });
    globeGroup.add(hubGroup);

    // 5. Curved Arcs & Flowing Data Packets
    const curves = [];
    const packetMeshes = [];

    CONNECTIONS.forEach(([startIdx, endIdx], connIdx) => {
      const p1 = hubPoints[startIdx];
      const p2 = hubPoints[endIdx];

      const distance = p1.distanceTo(p2);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const lift = Math.min(distance * 0.38, 38);
      const control = mid.clone().normalize().multiplyScalar(RADIUS + lift);

      const curve = new THREE.QuadraticBezierCurve3(p1, control, p2);
      curves.push(curve);

      // Arc Line
      const points = curve.getPoints(40);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: isDark ? 0.45 : 0.35,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(line);

      // Animated traveling data packet
      const packetGeo = new THREE.SphereGeometry(1.8, 8, 8);
      const packetMat = new THREE.MeshBasicMaterial({
        color: isDark ? 0xffffff : secondaryColor,
        transparent: true,
        opacity: 1,
      });
      const packet = new THREE.Mesh(packetGeo, packetMat);
      packet.userData = {
        curveIdx: connIdx,
        progress: (connIdx * 0.14) % 1,
        speed: 0.0035 + (connIdx % 3) * 0.0018,
      };
      packetMeshes.push(packet);
      globeGroup.add(packet);
    });

    // 6. Atmospheric Glow Aura
    const haloGeo = new THREE.RingGeometry(RADIUS * 1.01, RADIUS * 1.18, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isDark ? 0.22 : 0.12,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    scene.add(haloMesh);

    // 7. Strictly Scoped Pointer Drag Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationX = 0.22;
    let targetRotationY = -0.5;

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX || 0;
      prevMouseY = e.clientY || 0;
      if (container.setPointerCapture) {
        try {
          container.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || 0;
      const clientY = e.clientY || 0;

      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;

      // Prevent flipping upside-down
      targetRotationX = Math.max(-0.95, Math.min(0.95, targetRotationX));

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerUp = (e) => {
      isDragging = false;
      if (container.releasePointerCapture) {
        try {
          container.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);

    // 8. ResizeObserver for responsive sizing inside grid column
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          width = newW;
          height = newH;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    // 9. Animation Loop
    let animationFrameId;
    const baseSpeed = shouldReduceMotion ? 0 : 0.0022;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging && !shouldReduceMotion) {
        targetRotationY += baseSpeed;
      }
      globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.08;

      haloMesh.lookAt(camera.position);

      packetMeshes.forEach((packet) => {
        const { curveIdx, speed } = packet.userData;
        const curve = curves[curveIdx];
        if (curve) {
          packet.userData.progress = (packet.userData.progress + speed) % 1;
          const pos = curve.getPoint(packet.userData.progress);
          packet.position.copy(pos);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      dotGeometry.dispose();
      dotMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      haloGeo.dispose();
      haloMat.dispose();
    };
  }, [theme, shouldReduceMotion]);

  return (
    <div className={className}>
      {/* Interactive WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none pointer-events-auto relative z-10"
        title="Click and drag to rotate the verification mesh globe"
      />

      {/* Atmospheric Radial Backlight */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl -z-10 scale-90 transform-gpu"
        aria-hidden="true"
      />

      {/* Top-Left Telemetry HUD Widget */}
      {showCornerHUD && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 pointer-events-none font-mono">
          <div className="bg-stone-50/90 dark:bg-slate-950/85 backdrop-blur-md border border-slate-300/80 dark:border-cyan-500/30 p-2.5 sm:p-3 shadow-xl max-w-[200px] sm:max-w-[230px]">
            <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-200 dark:border-gray-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                [GLOBAL_NODES: 48 ACTIVE]
              </span>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-gray-400">Verified:</span>
                <span className="font-bold text-slate-900 dark:text-cyan-300 tabular-nums">
                  {resumesScanned.toLocaleString()} RESUMES
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-gray-400">Speed:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                  {opsPerSec} ops/sec • 42ms
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom-Right Interactive Drag Pill */}
      {showDragHint && (
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 pointer-events-none font-mono">
          <div className="bg-stone-50/90 dark:bg-slate-950/85 backdrop-blur-md border border-slate-300/80 dark:border-cyan-500/30 px-2.5 py-1 text-[9px] text-slate-600 dark:text-cyan-400/80 uppercase tracking-widest flex items-center gap-1.5 shadow-md">
            <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-500" />
            <span>[ DRAG TO ROTATE GLOBE ]</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * InteractiveGlobeBackground
 * Ambient background version for deep layers. Strictly pointer-events-none.
 */
const InteractiveGlobeBackground = () => {
  return null; // Kept as empty placeholder since HeroInteractiveGlobe is now the main attraction
};

export default InteractiveGlobeBackground;
