import React, { useEffect, useRef } from "react";

const AsteroidsBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Handle Resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    const asteroids = [];
    const numAsteroids = 80;

    for (let i = 0; i < numAsteroids; i++) {
      asteroids.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        radius: Math.random() * 2 + 0.5,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 3 + 1,
        tailLength: Math.random() * 20 + 10,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    let animationFrameId;

    const render = () => {
      // Clear with slight trailing effect for motion blur
      ctx.fillStyle = "rgba(10, 10, 10, 0.4)";
      ctx.fillRect(0, 0, width, height);

      // Draw asteroids
      for (let i = 0; i < asteroids.length; i++) {
        const a = asteroids[i];
        
        // Move asteroid
        a.x += a.speedX;
        a.y += a.speedY;

        // Reset if it goes off screen
        if (a.y > height + 50 || a.x < -50 || a.x > width + 50) {
          a.y = -50;
          a.x = Math.random() * width;
          a.speedY = Math.random() * 3 + 1;
        }

        // Draw fiery tail
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x - a.speedX * a.tailLength, a.y - a.speedY * a.tailLength);
        
        const gradient = ctx.createLinearGradient(
          a.x, a.y, 
          a.x - a.speedX * a.tailLength, a.y - a.speedY * a.tailLength
        );
        gradient.addColorStop(0, `rgba(255, 100, 0, ${a.opacity})`);
        gradient.addColorStop(0.5, `rgba(255, 50, 0, ${a.opacity * 0.5})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = a.radius * 1.5;
        ctx.lineCap = "round";
        ctx.stroke();

        // Draw asteroid core
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 150, ${a.opacity + 0.3})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ backgroundColor: "#050505" }} // Deep space background
    />
  );
};

export default AsteroidsBackground;
