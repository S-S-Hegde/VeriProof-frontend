import React, { useEffect, useRef, useState } from "react";
import { useTheme, THEMES } from "../context/ThemeContext";

const ArchiveBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    // Layers for 3D parallax
    const layers = [
      { count: 40, size: 1, speed: 0.05, opacity: 0.3 }, // Far (Slow)
      { count: 30, size: 2, speed: 0.15, opacity: 0.5 }, // Mid
      { count: 15, size: 4, speed: 0.3, opacity: 0.7 },  // Near (Fast)
    ];

    const particles = layers.flatMap((layer, layerIdx) => 
      Array.from({ length: layer.count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * layer.size + 1,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        parallax: layer.speed,
        opacity: Math.random() * layer.opacity,
        layer: layerIdx
      }))
    );

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 1. BACKGROUND GRADIENTS
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      
      switch (theme) {
        case THEMES.LIGHT:
          grad.addColorStop(0, "#f5f7fa");
          grad.addColorStop(1, "#c3cfe2");
          break;
        case THEMES.DARK:
          grad.addColorStop(0, "#1e293b");
          grad.addColorStop(1, "#0f172a");
          break;
        case THEMES.STORYTELLER:
          grad.addColorStop(0, "#fdfcf9");
          grad.addColorStop(1, "#e5e5f7");
          break;
        case THEMES.IMMERSIVE:
          grad.addColorStop(0, "#0a0c14");
          grad.addColorStop(1, "#020617");
          break;
        default:
          grad.addColorStop(0, "#ffffff");
          grad.addColorStop(1, "#f1f5f9");
      }
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. THEME-SPECIFIC 3D ELEMENTS
      if (theme === THEMES.IMMERSIVE) {
        // Draw a glowing grid with parallax
        ctx.strokeStyle = "rgba(0, 243, 255, 0.05)";
        ctx.lineWidth = 1;
        const gridSize = 100;
        const gridOffset = (scrollY * 0.2) % gridSize;
        
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = -gridOffset; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // 3. PARTICLES (Dust/Sparks/Ink)
      particles.forEach((p) => {
        // Apply parallax based on scroll
        const drawY = (p.y - scrollY * p.parallax) % canvas.height;
        const finalY = drawY < 0 ? drawY + canvas.height : drawY;

        ctx.beginPath();
        ctx.arc(p.x, finalY, p.size, 0, Math.PI * 2);
        
        switch (theme) {
          case THEMES.LIGHT:
            ctx.fillStyle = `rgba(37, 99, 235, ${p.opacity * 0.4})`;
            break;
          case THEMES.DARK:
            ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`;
            break;
          case THEMES.STORYTELLER:
            ctx.fillStyle = `rgba(139, 69, 19, ${p.opacity * 0.3})`;
            break;
          case THEMES.IMMERSIVE:
            ctx.fillStyle = `rgba(0, 243, 255, ${p.opacity * 0.8})`;
            // Add bloom to immersive particles
            ctx.shadowBlur = 5;
            ctx.shadowColor = "rgba(0, 243, 255, 0.5)";
            break;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Animation movement
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;
      });

      // 4. VIGNETTE
      const vignette = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, canvas.width*0.3,
        canvas.width/2, canvas.height/2, canvas.width*0.9
      );
      
      if (theme === THEMES.IMMERSIVE || theme === THEMES.DARK) {
        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(1, "rgba(0,0,0,0.6)");
      } else {
        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(1, "rgba(0,0,0,0.1)");
      }
      
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, scrollY]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

export default ArchiveBackground;
