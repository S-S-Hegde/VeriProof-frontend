import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "../../context/ThemeContext";

const CryptographicCore3D = ({ role = "student" }) => {
  const mountRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isRecruiter = role === "recruiter";

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 200;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    // WebGL Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch (e) {
      console.warn("[Three.js WebGL init failed]", e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.appendChild(renderer.domElement);

    // Primary Colors
    const primaryHex = isRecruiter ? 0x10b981 : 0x06b6d4; // Emerald or Cyan
    const secondaryHex = isRecruiter ? 0x14b8a6 : 0x3b82f6; // Teal or Blue
    const particleHex = isDark ? 0x93c5fd : 0x0284c7;

    // 1. Central Cryptographic Polyhedron (Icosahedron Wireframe)
    const icoGeo = new THREE.IcosahedronGeometry(1.4, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: primaryHex,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.75 : 0.65,
    });
    const icosahedron = new THREE.Mesh(icoGeo, icoMat);
    scene.add(icosahedron);

    // 2. Inner Glowing Core
    const innerGeo = new THREE.OctahedronGeometry(0.7, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: secondaryHex,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.9 : 0.75,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerCore);

    // 3. Orbiting Cryptographic Ring
    const ringGeo = new THREE.RingGeometry(2.0, 2.05, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: primaryHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isDark ? 0.45 : 0.35,
    });
    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = Math.PI / 3;
    scene.add(orbitRing);

    // 4. Second Orbiting Ring (Cross angle)
    const ringGeo2 = new THREE.RingGeometry(1.8, 1.84, 40);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: secondaryHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isDark ? 0.35 : 0.25,
    });
    const orbitRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    orbitRing2.rotation.y = Math.PI / 4;
    scene.add(orbitRing2);

    // 5. Cloud of cryptographic verification nodes (Particles)
    const particleCount = 65;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 2.0 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = radius * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleMat = new THREE.PointsMaterial({
      color: particleHex,
      size: 0.05,
      transparent: true,
      opacity: isDark ? 0.8 : 0.6,
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    scene.add(particleCloud);

    // Mouse Parallax Interaction
    let targetRotX = 0;
    let targetRotY = 0;
    let curRotX = 0;
    let curRotY = 0;

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const normX = (clientX / rect.width) * 2 - 1;
      const normY = -(clientY / rect.height) * 2 + 1;

      targetRotY = normX * 0.8;
      targetRotX = -normY * 0.8;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 320;
      const newH = container.clientHeight || 200;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", onResize);

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation
      curRotX += (targetRotX - curRotX) * 0.05;
      curRotY += (targetRotY - curRotY) * 0.05;

      // Base rotation + interactive offset
      icosahedron.rotation.x = elapsed * 0.25 + curRotX;
      icosahedron.rotation.y = elapsed * 0.35 + curRotY;

      innerCore.rotation.x = -elapsed * 0.4 + curRotX * 0.5;
      innerCore.rotation.y = -elapsed * 0.5 + curRotY * 0.5;

      orbitRing.rotation.z = elapsed * 0.2;
      orbitRing2.rotation.z = -elapsed * 0.25;

      particleCloud.rotation.y = elapsed * 0.08 + curRotY * 0.2;

      // Breathing scale pulse
      const scale = 1 + Math.sin(elapsed * 1.5) * 0.04;
      icosahedron.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      icoGeo.dispose();
      icoMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [theme, role, isDark, isRecruiter]);

  return (
    <div className="relative w-full h-44 sm:h-52 my-3 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-cyan-500/20 bg-slate-100/40 dark:bg-black/20 backdrop-blur-md flex items-center justify-center">
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      <div className="absolute top-2.5 left-3 pointer-events-none flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-cyan-400 font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>THREE_JS_CRYPTOGRAPHIC_LATTICE</span>
      </div>
      <div className="absolute bottom-2 right-3 pointer-events-none font-mono text-[8px] uppercase tracking-widest text-slate-400 dark:text-gray-500">
        INTERACTIVE_3D_CORE
      </div>
    </div>
  );
};

export default CryptographicCore3D;
