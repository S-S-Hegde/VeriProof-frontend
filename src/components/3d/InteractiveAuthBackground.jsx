import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "../../context/ThemeContext";

/**
 * InteractiveAuthBackground
 * Full-viewport interactive Three.js particle & lattice network.
 * Supports both:
 * 1. Dark Theme Base (Deep midnight slate #020617 with Cyber Cyan / Emerald)
 * 2. Luxury-Tech Light Theme (Multi-dimensional pearl platinum gradient with Deep Cyber Cyan)
 */
const InteractiveAuthBackground = ({ role = "student" }) => {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isRecruiter = role === "recruiter";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 32;

    // 2. WebGL Renderer with alpha: true
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("[InteractiveAuthBackground] WebGL initialization failed", e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0); // Transparent canvas
    container.appendChild(renderer.domElement);

    // Color palette based on Theme & Role
    const primaryHex = isDark
      ? isRecruiter
        ? 0x10b981 // Cyber Emerald (Dark)
        : 0x06b6d4 // Cyber Cyan (Dark)
      : isRecruiter
      ? 0x059669 // Deep Emerald (Light)
      : 0x0891b2; // Deep Cyber Cyan (Light)

    const secondaryHex = isDark
      ? isRecruiter
        ? 0x34d399
        : 0x38bdf8
      : isRecruiter
      ? 0x10b981
      : 0x0284c7;

    const lineHex = isDark
      ? isRecruiter
        ? 0x059669
        : 0x0284c7
      : isRecruiter
      ? 0x047857
      : 0x0891b2;

    // 3. Generate Cryptographic Lattice Nodes
    const nodeCount = 95;
    const nodes = [];
    const positions = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);

    const primaryColor = new THREE.Color(primaryHex);
    const secondaryColor = new THREE.Color(secondaryHex);

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 55;
      const y = (Math.random() - 0.5) * 36;
      const z = (Math.random() - 0.5) * 25;

      nodes.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        x,
        y,
        z,
        phase: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.01,
        amp: 0.5 + Math.random() * 1.5,
      });

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color distribution (70% primary, 30% secondary)
      const c = Math.random() > 0.3 ? primaryColor : secondaryColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    // Circular particle texture for glowing cryptographic nodes
    const createParticleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
      if (isDark) {
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.3, "rgba(34, 211, 238, 0.85)");
        grad.addColorStop(0.7, "rgba(6, 182, 212, 0.3)");
        grad.addColorStop(1, "rgba(6, 182, 212, 0)");
      } else {
        grad.addColorStop(0, "rgba(8, 145, 178, 1)");
        grad.addColorStop(0.4, "rgba(14, 116, 144, 0.75)");
        grad.addColorStop(0.7, "rgba(2, 132, 199, 0.25)");
        grad.addColorStop(1, "rgba(2, 132, 199, 0)");
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fill();

      return new THREE.CanvasTexture(canvas);
    };

    const particleTexture = createParticleTexture();

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: isDark ? 1.35 : 1.5,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: isDark ? 0.9 : 0.8,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    });

    const particleMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleMesh);

    // 4. Lattice Lines Dynamic Buffer
    const maxLines = (nodeCount * (nodeCount - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);

    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    linesGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const linesMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.45 : 0.25,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    });

    const linesMesh = new THREE.LineSegments(linesGeo, linesMat);
    scene.add(linesMesh);

    // 5. Interactive Mouse Parallax & Gravity
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // 6. Animation Loop
    let animId;
    let clock = new THREE.Clock();
    const distanceThreshold = 9.8;
    const baseLineColor = new THREE.Color(lineHex);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      camera.position.x = mouse.x * 4.5;
      camera.position.y = mouse.y * 3.5;
      camera.lookAt(0, 0, 0);

      // Subtle rotation
      scene.rotation.y = elapsedTime * 0.025;
      scene.rotation.x = Math.sin(elapsedTime * 0.015) * 0.08;

      const posArr = particlesGeo.attributes.position.array;
      let lineVertexIdx = 0;

      for (let i = 0; i < nodeCount; i++) {
        const n = nodes[i];

        n.phase += n.speed;
        n.x = n.baseX + Math.sin(n.phase) * n.amp;
        n.y = n.baseY + Math.cos(n.phase * 0.8) * n.amp;
        n.z = n.baseZ + Math.sin(n.phase * 1.2) * (n.amp * 0.6);

        const cursorWorldX = mouse.x * 22;
        const cursorWorldY = mouse.y * 14;
        const dx = cursorWorldX - n.x;
        const dy = cursorWorldY - n.y;
        const distToCursor = Math.hypot(dx, dy);

        if (distToCursor < 12) {
          const force = (12 - distToCursor) / 12;
          n.x -= (dx / distToCursor) * force * 1.2;
          n.y -= (dy / distToCursor) * force * 1.2;
        }

        posArr[i * 3] = n.x;
        posArr[i * 3 + 1] = n.y;
        posArr[i * 3 + 2] = n.z;
      }
      particlesGeo.attributes.position.needsUpdate = true;

      // Interconnect nodes
      for (let i = 0; i < nodeCount; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodeCount; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y, n1.z - n2.z);

          if (dist < distanceThreshold) {
            const alpha = 1 - dist / distanceThreshold;
            const r = baseLineColor.r * alpha;
            const g = baseLineColor.g * alpha;
            const b = baseLineColor.b * alpha;

            linePositions[lineVertexIdx * 3] = n1.x;
            linePositions[lineVertexIdx * 3 + 1] = n1.y;
            linePositions[lineVertexIdx * 3 + 2] = n1.z;

            lineColors[lineVertexIdx * 3] = r;
            lineColors[lineVertexIdx * 3 + 1] = g;
            lineColors[lineVertexIdx * 3 + 2] = b;
            lineVertexIdx++;

            linePositions[lineVertexIdx * 3] = n2.x;
            linePositions[lineVertexIdx * 3 + 1] = n2.y;
            linePositions[lineVertexIdx * 3 + 2] = n2.z;

            lineColors[lineVertexIdx * 3] = r;
            lineColors[lineVertexIdx * 3 + 1] = g;
            lineColors[lineVertexIdx * 3 + 2] = b;
            lineVertexIdx++;
          }
        }
      }

      linesGeo.setDrawRange(0, lineVertexIdx);
      linesGeo.attributes.position.needsUpdate = true;
      linesGeo.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      particlesGeo.dispose();
      particlesMat.dispose();
      particleTexture.dispose();
      linesGeo.dispose();
      linesMat.dispose();
      renderer.dispose();
    };
  }, [isDark, isRecruiter]);

  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-500 ${
        isDark
          ? "bg-slate-950"
          : "bg-gradient-to-br from-slate-50 via-zinc-50 to-amber-50/30"
      }`}
      aria-hidden="true"
    >
      {/* Interactive Three.js particle & lattice network canvas */}
      <div ref={containerRef} className="absolute inset-0 pointer-events-auto" />

      {/* Subtle Radial Vignette Gradient Layer for Crisp Typography Contrast */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: isDark
            ? "radial-gradient(circle at center, rgba(2, 6, 23, 0.6) 0%, rgba(2, 6, 23, 0.9) 100%)"
            : "radial-gradient(circle at center, rgba(248, 250, 252, 0.65) 0%, rgba(241, 245, 249, 0.92) 100%)",
        }}
      />
    </div>
  );
};

export default InteractiveAuthBackground;
