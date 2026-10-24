import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useTheme } from "../../context/ThemeContext";
import { useReducedMotion } from "framer-motion";
import { Activity, ShieldCheck, Globe, Wifi, Minimize2, Maximize2, Cpu } from "lucide-react";

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
 * Live Telemetry HUD Widget
 */
export const GlobeTelemetryHUD = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [resumesScanned, setResumesScanned] = useState(14892);
  const [proofsIssued, setProofsIssued] = useState(6310);
  const [opsPerSec, setOpsPerSec] = useState(892);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live verification stream traffic
      setResumesScanned((prev) => prev + Math.floor(Math.random() * 3) + 1);
      if (Math.random() > 0.4) {
        setProofsIssued((prev) => prev + 1);
      }
      setOpsPerSec(870 + Math.floor(Math.random() * 55));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      aria-label="Global Verification Telemetry"
      className="fixed bottom-6 right-6 z-20 pointer-events-auto transition-all duration-300 font-mono"
    >
      <div className="bg-stone-50/90 dark:bg-slate-950/85 backdrop-blur-md border border-slate-300/80 dark:border-cyan-500/30 rounded-none shadow-2xl p-3.5 max-w-xs text-xs text-slate-800 dark:text-slate-200">
        <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-700 dark:text-cyan-400">
              Mesh_Telemetry
            </span>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
            aria-label={isMinimized ? "Expand telemetry" : "Minimize telemetry"}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!isMinimized ? (
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-gray-400">Resumes Scanned:</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {resumesScanned.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-gray-400">Proofs Cryptographically Issued:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {proofsIssued.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-gray-400">Active Node Channels:</span>
              <span className="font-bold text-blue-600 dark:text-cyan-400 tabular-nums">
                48 / 48 (42ms)
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-gray-800/80 text-[10px]">
              <span className="text-slate-500 dark:text-gray-500">Hash Throughput:</span>
              <span className="text-slate-700 dark:text-cyan-300 font-semibold tabular-nums">
                {opsPerSec} ops/sec
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-gray-400">
            <span>48 NODES</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {resumesScanned.toLocaleString()} SCANNED
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

/**
 * Interactive WebGL 3D Globe Background
 */
const InteractiveGlobeBackground = () => {
  const mountRef = useRef(null);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.z = 270;

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
    // Default subtle tilt
    globeGroup.rotation.x = 0.25;
    scene.add(globeGroup);

    // Dynamic theme colors
    const isDark = theme === "dark";
    const primaryColor = isDark ? 0x22d3ee : 0x0284c7; // Cyan vs Slate Sky
    const secondaryColor = isDark ? 0x6366f1 : 0x3b82f6; // Indigo vs Blue
    const wireframeOpacity = isDark ? 0.08 : 0.06;
    const particleOpacity = isDark ? 0.45 : 0.35;

    // 2. Cryptographic Dot Matrix Sphere
    const dotsCount = 1800;
    const dotPositions = new Float32Array(dotsCount * 3);
    const dotSizes = new Float32Array(dotsCount);

    for (let i = 0; i < dotsCount; i++) {
      // Golden spiral distribution across sphere surface
      const y = 1 - (i / (dotsCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = i * 2.399963229728653; // Golden angle

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      dotPositions[i * 3] = x * RADIUS;
      dotPositions[i * 3 + 1] = y * RADIUS;
      dotPositions[i * 3 + 2] = z * RADIUS;

      dotSizes[i] = Math.random() * 1.5 + 1.0;
    }

    const dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute("position", new THREE.BufferAttribute(dotPositions, 3));
    dotGeometry.setAttribute("size", new THREE.BufferAttribute(dotSizes, 1));

    const dotMaterial = new THREE.PointsMaterial({
      color: primaryColor,
      size: 1.8,
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
      const ringGeo = new THREE.RingGeometry(1.2, 2.2, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: primaryColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isDark ? 0.7 : 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);
      hubGroup.add(ringMesh);

      // Inner glowing core
      const coreGeo = new THREE.SphereGeometry(1.2, 8, 8);
      const coreMat = new THREE.MeshBasicMaterial({
        color: isDark ? 0xffffff : primaryColor,
        transparent: true,
        opacity: 0.9,
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

      // Midpoint lifted above sphere based on distance
      const distance = p1.distanceTo(p2);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const lift = Math.min(distance * 0.35, 35);
      const control = mid.clone().normalize().multiplyScalar(RADIUS + lift);

      const curve = new THREE.QuadraticBezierCurve3(p1, control, p2);
      curves.push(curve);

      // Arc Line
      const points = curve.getPoints(36);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: isDark ? 0.35 : 0.25,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(line);

      // Animated traveling data packet
      const packetGeo = new THREE.SphereGeometry(1.4, 6, 6);
      const packetMat = new THREE.MeshBasicMaterial({
        color: isDark ? 0xffffff : secondaryColor,
        transparent: true,
        opacity: 0.95,
      });
      const packet = new THREE.Mesh(packetGeo, packetMat);
      packet.userData = {
        curveIdx: connIdx,
        progress: (connIdx * 0.15) % 1,
        speed: 0.003 + (connIdx % 3) * 0.0015,
      };
      packetMeshes.push(packet);
      globeGroup.add(packet);
    });

    // 6. Atmospheric Glow Ring
    const haloGeo = new THREE.RingGeometry(RADIUS * 1.02, RADIUS * 1.15, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isDark ? 0.15 : 0.08,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    scene.add(haloMesh);

    // 7. Interactive Drag & Mouse Inertia Handling
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationX = 0.25;
    let targetRotationY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      prevMouseY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      targetRotationY += deltaX * 0.006;
      targetRotationX += deltaY * 0.006;

      // Clamp X rotation to prevent flipping upside down
      targetRotationX = Math.max(-0.9, Math.min(0.9, targetRotationX));

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // 8. Responsive Resize Listener
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // 9. Animation Loop
    let animationFrameId;
    const baseRotationSpeed = shouldReduceMotion ? 0 : 0.0018;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto rotation + interactive inertia
      if (!isDragging && !shouldReduceMotion) {
        targetRotationY += baseRotationSpeed;
      }
      globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.08;

      // Keep halo oriented facing the camera
      haloMesh.lookAt(camera.position);

      // Animate flowing verification data packets along Bézier arcs
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

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", handleResize);

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
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-auto opacity-50 dark:opacity-60 transition-opacity duration-700 overflow-hidden"
      style={{
        maskImage:
          "radial-gradient(circle at 60% 45%, black 40%, rgba(0,0,0,0.4) 75%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(circle at 60% 45%, black 40%, rgba(0,0,0,0.4) 75%, transparent 100%)",
      }}
    />
  );
};

export default InteractiveGlobeBackground;
