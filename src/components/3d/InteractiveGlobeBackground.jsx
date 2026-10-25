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

// Converts latitude & longitude coordinates to 3D Cartesian Vector3 on sphere
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Global cache for GeoJSON to prevent redundant network requests across re-renders
let cachedLandGeoJSON = null;

async function fetchLandGeoJSON() {
  if (cachedLandGeoJSON) return cachedLandGeoJSON;
  try {
    const res = await fetch("/ne_110m_land.geojson");
    if (!res.ok) throw new Error("Failed to fetch land GeoJSON");
    cachedLandGeoJSON = await res.json();
    return cachedLandGeoJSON;
  } catch (err) {
    console.warn("Could not load /ne_110m_land.geojson, falling back to procedural:", err);
    return null;
  }
}

/**
 * Generates high-contrast equirectangular texture map of Earth's continental landmasses.
 * - Oceans are completely transparent (rgba(0,0,0,0)).
 * - Continents are filled with glowing cyan/slate (matching #06b6d4 theme).
 * - Layered with cyber hex/matrix dots over landmasses for high-tech aesthetic.
 */
function createContinentTexture(geojson, isDark) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const w = canvas.width;
  const h = canvas.height;

  // 1. Transparent ocean baseline
  ctx.clearRect(0, 0, w, h);

  if (geojson && geojson.features) {
    // 2. Render continental landmass polygons
    const landFill = isDark ? "rgba(6, 182, 212, 0.40)" : "rgba(2, 132, 199, 0.32)";
    const strokeColor = isDark ? "rgba(34, 211, 238, 0.90)" : "rgba(14, 165, 233, 0.85)";

    ctx.fillStyle = landFill;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;

    geojson.features.forEach((feature) => {
      if (!feature.geometry || !feature.geometry.coordinates) return;
      const rings = feature.geometry.coordinates;

      ctx.beginPath();
      rings.forEach((ring) => {
        for (let i = 0; i < ring.length; i++) {
          const [lng, lat] = ring[i];
          const x = ((lng + 180) / 360) * w;
          const y = ((90 - lat) / 180) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // 3. High-tech cyber hex / dot grid texture over landmasses only
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = isDark ? "rgba(34, 211, 238, 0.28)" : "rgba(2, 132, 199, 0.22)";
    const dotStep = 8;
    for (let y = 0; y < h; y += dotStep) {
      const offsetX = (Math.floor(y / dotStep) % 2) * (dotStep / 2);
      for (let x = offsetX; x < w; x += dotStep) {
        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates 3D vector lines for continental coastlines from GeoJSON coordinates.
 * Floats at radius 100.2 for razor-sharp, zero-aliasing boundaries at any angle.
 */
function createContinentCoastlineMesh(geojson, isDark) {
  if (!geojson || !geojson.features) return null;

  const linePositions = [];
  geojson.features.forEach((feature) => {
    if (!feature.geometry || !feature.geometry.coordinates) return;
    feature.geometry.coordinates.forEach((ring) => {
      for (let i = 0; i < ring.length - 1; i++) {
        const p1 = latLngToVector3(ring[i][1], ring[i][0], RADIUS * 1.002);
        const p2 = latLngToVector3(ring[i + 1][1], ring[i + 1][0], RADIUS * 1.002);
        linePositions.push(p1.x, p1.y, p1.z);
        linePositions.push(p2.x, p2.y, p2.z);
      }
    });
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3)
  );

  const material = new THREE.LineBasicMaterial({
    color: isDark ? 0x22d3ee : 0x0284c7, // Glowing cyan/slate
    transparent: true,
    opacity: isDark ? 0.85 : 0.7,
    blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
  });

  return new THREE.LineSegments(geometry, material);
}

/**
 * HeroInteractiveGlobe
 * The central attraction for the Landing Page Hero section.
 * - Smooth High-Fidelity 3D Earth with visible continents (GeoJSON data)
 * - Anti-aliased WebGL rendering with high-density 64x64 sphere geometry
 * - Delta-based frame physics independent of monitor refresh rate
 * - Atmosphere & Depth Glow with soft indigo (#6366f1) halo shader at altitude 0.15
 * - Interactive telemetry verification arcs & pulsing radar nodes
 */
export const HeroInteractiveGlobe = ({
  className = "relative w-full max-w-[540px] aspect-square mx-auto flex items-center justify-center select-none group bg-transparent border-0 shadow-none",
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

    // 1. WebGL Renderer with Anti-Aliasing & High Performance
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.z = 295; // Ample clearance to prevent frustum and canvas edge clipping

    const renderer = new THREE.WebGLRenderer({
      antialias: true, // Smooth anti-aliased edges
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.background = "transparent";
    renderer.domElement.style.outline = "none";
    renderer.domElement.style.border = "none";
    container.appendChild(renderer.domElement);

    // Root globe group
    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.22;
    globeGroup.rotation.y = -0.5;
    scene.add(globeGroup);

    const isDark = theme === "dark";
    const primaryColor = isDark ? 0x22d3ee : 0x0284c7; // Cyan vs Slate Sky
    const secondaryColor = isDark ? 0x6366f1 : 0x3b82f6; // Indigo vs Blue

    // 2. Base Spherical Body (High-Density 64x64 Geometry for perfect curvature)
    // Dark translucent sphere provides realistic occlusion and depth
    const baseSphereGeo = new THREE.SphereGeometry(RADIUS * 0.995, 64, 64);
    const baseSphereMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x030712 : 0xf8fafc,
      transparent: true,
      opacity: isDark ? 0.75 : 0.6,
    });
    const baseSphereMesh = new THREE.Mesh(baseSphereGeo, baseSphereMat);
    globeGroup.add(baseSphereMesh);

    // 3. Subtle Cryptographic Longitude/Latitude Wireframe Grid
    const gridGeo = new THREE.SphereGeometry(RADIUS * 0.998, 48, 24);
    const gridMat = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.08 : 0.06,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    globeGroup.add(gridMesh);

    // 4. Atmosphere & Depth Glow
    // Requirement: showAtmosphere=true, atmosphereColor="#6366f1" (indigo), atmosphereAltitude=0.15
    const atmosphereGeo = new THREE.SphereGeometry(RADIUS * 1.15, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 uColor;
        void main() {
          // Soft atmospheric limb halo on dark side and rim
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          intensity = clamp(intensity, 0.0, 1.0);
          gl_FragColor = vec4(uColor, intensity * 0.9);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color("#6366f1") }, // Indigo atmosphere
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // Inner Surface Fresnel Rim Glow (adds spherical 3D volume)
    const rimGeo = new THREE.SphereGeometry(RADIUS * 1.006, 64, 64);
    const rimMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 uColor;
        void main() {
          float intensity = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(uColor, intensity * 0.6);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(isDark ? "#22d3ee" : "#3b82f6") },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    globeGroup.add(rimMesh);

    // 5. Continents Mesh & Vector Coastlines
    let continentMesh = null;
    let coastlineMesh = null;
    let continentTexture = null;

    const setupContinents = (geojsonData) => {
      if (!geojsonData) return;

      // Continental surface texture map (high-contrast cyan continents, transparent oceans)
      continentTexture = createContinentTexture(geojsonData, isDark);
      if (continentTexture) {
        const landGeo = new THREE.SphereGeometry(RADIUS, 64, 64);
        const landMat = new THREE.MeshBasicMaterial({
          map: continentTexture,
          transparent: true,
          opacity: 0.96,
          side: THREE.DoubleSide,
          blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
          depthWrite: false,
        });
        continentMesh = new THREE.Mesh(landGeo, landMat);
        globeGroup.add(continentMesh);
      }

      // 3D vector coastlines for razor-sharp continental definition
      coastlineMesh = createContinentCoastlineMesh(geojsonData, isDark);
      if (coastlineMesh) {
        globeGroup.add(coastlineMesh);
      }
    };

    // Load GeoJSON data immediately from cache or public directory
    fetchLandGeoJSON().then((data) => {
      setupContinents(data);
    });

    // 6. Global Verification Hub Nodes
    const hubPoints = HUBS.map((hub) => latLngToVector3(hub.lat, hub.lng, RADIUS));
    const hubGroup = new THREE.Group();
    const pulsingRings = [];

    hubPoints.forEach((pos, idx) => {
      // Outer pulsating radar ring
      const ringGeo = new THREE.RingGeometry(1.2, 2.4, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: primaryColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isDark ? 0.85 : 0.7,
        blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);
      ringMesh.userData = { phase: (idx * 0.25) % Math.PI };
      pulsingRings.push(ringMesh);
      hubGroup.add(ringMesh);

      // Inner glowing core
      const coreGeo = new THREE.SphereGeometry(1.6, 16, 16);
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

    // 7. Sweeping Telemetry Verification Arcs & Flowing Data Packets
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

      // Sweeping Arc Line
      const points = curve.getPoints(48);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: isDark ? 0.55 : 0.4,
        blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(line);

      // Traveling cryptographic data packet
      const packetGeo = new THREE.SphereGeometry(1.9, 12, 12);
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

    // 8. Strictly Scoped Pointer Drag Interaction
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

    // 9. ResizeObserver for responsive sizing
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

    // 10. Frame-Delta Physics Animation Loop (Independent of screen refresh rate)
    let animationFrameId;
    const clock = new THREE.Clock();
    const autoRotateSpeed = 0.5; // per requirement

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);

      // Auto-rotation tied to frame delta
      if (!isDragging && !shouldReduceMotion) {
        targetRotationY += autoRotateSpeed * 0.35 * delta;
      }

      // Smooth lerp physics
      const lerpFactor = Math.min(1.0, delta * 9);
      globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * lerpFactor;
      globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * lerpFactor;

      // Animate pulsing radar rings at verification hubs
      pulsingRings.forEach((ring) => {
        ring.userData.phase += delta * 2.2;
        const scale = 1.0 + Math.sin(ring.userData.phase) * 0.35;
        ring.scale.set(scale, scale, 1);
        ring.material.opacity = (isDark ? 0.85 : 0.65) * (0.6 + 0.4 * Math.sin(ring.userData.phase));
      });

      // Animate traveling data packets
      packetMeshes.forEach((packet) => {
        const { curveIdx, speed } = packet.userData;
        const curve = curves[curveIdx];
        if (curve) {
          packet.userData.progress = (packet.userData.progress + speed * (delta * 60)) % 1;
          const pos = curve.getPoint(packet.userData.progress);
          packet.position.copy(pos);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup and resource disposal
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

      baseSphereGeo.dispose();
      baseSphereMat.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();

      if (continentTexture) continentTexture.dispose();
      if (continentMesh) {
        continentMesh.geometry.dispose();
        continentMesh.material.dispose();
      }
      if (coastlineMesh) {
        coastlineMesh.geometry.dispose();
        coastlineMesh.material.dispose();
      }
    };
  }, [theme, shouldReduceMotion]);

  return (
    <div className={className}>
      {/* Interactive WebGL Canvas Container with Seamless Radial Mask (The "No Boundaries" Fix) */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none pointer-events-auto relative z-10 bg-transparent border-0 shadow-none outline-none overflow-visible"
        title="Click and drag to rotate the high-fidelity verification globe"
        style={{
          WebkitMaskImage: "radial-gradient(circle at center, black 42%, rgba(0,0,0,0.85) 58%, transparent 74%)",
          maskImage: "radial-gradient(circle at center, black 42%, rgba(0,0,0,0.85) 58%, transparent 74%)",
        }}
      />

      {/* Atmospheric Radial Backlight */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl -z-10 scale-90 transform-gpu"
        aria-hidden="true"
      />

      {/* Top-Left Telemetry HUD Widget */}
      {showCornerHUD && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 pointer-events-none font-mono">
          <div className="bg-white/90 dark:bg-slate-950/85 backdrop-blur-md border border-slate-300/90 dark:border-cyan-500/30 p-2.5 sm:p-3 shadow-xl max-w-[200px] sm:max-w-[230px]">
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
                <span className="text-slate-600 dark:text-gray-400 font-medium">Verified:</span>
                <span className="font-bold text-slate-900 dark:text-cyan-300 tabular-nums">
                  {resumesScanned.toLocaleString()} RESUMES
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-gray-400 font-medium">Speed:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-300 tabular-nums">
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
          <div className="bg-white/90 dark:bg-slate-950/85 backdrop-blur-md border border-slate-300/90 dark:border-cyan-500/30 px-2.5 py-1 text-[9px] text-slate-700 dark:text-cyan-400/80 uppercase tracking-widest flex items-center gap-1.5 shadow-md">
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
