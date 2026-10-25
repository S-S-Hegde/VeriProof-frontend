import React, { useEffect, useRef } from "react";

export default function CryptographicNodeMesh({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse position
    const mouse = {
      x: null,
      y: null,
      radius: 180,
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    // Node class representing Git commits & cryptographic blocks
    class CommitNode {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() > 0.85 ? 3.5 : 2;
        this.isKeyNode = Math.random() > 0.8;
        this.hash = Math.random().toString(16).substring(2, 8);
        this.pulse = Math.random() * Math.PI;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += 0.03;

        // Bounce off edges gently
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Cursor interaction (gentle magnet attraction / link)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            // Gentle drift toward mouse
            this.x += Math.cos(angle) * force * 0.8;
            this.y += Math.sin(angle) * force * 0.8;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isKeyNode ? "#22d3ee" : "#06b6d4";
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = this.isKeyNode ? 10 : 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // For key nodes, draw subtle pulse ring & hash watermark
        if (this.isKeyNode) {
          const pulseR = this.radius + Math.sin(this.pulse) * 3 + 4;
          ctx.beginPath();
          ctx.arc(this.x, this.y, Math.max(pulseR, this.radius + 1), 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Occasional hash tag
          ctx.font = "9px JetBrains Mono, monospace";
          ctx.fillStyle = "rgba(100, 116, 139, 0.4)";
          ctx.fillText(`0x${this.hash}`, this.x + 8, this.y + 3);
        }
      }
    }

    let nodes = [];
    const initNodes = () => {
      nodes = [];
      // Dynamic count based on screen size (1 node per ~14000px)
      const count = Math.min(Math.floor((width * height) / 14000), 90);
      for (let i = 0; i < count; i++) {
        nodes.push(
          new CommitNode(Math.random() * width, Math.random() * height)
        );
      }
    };

    initNodes();

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect nodes
      const maxDist = 135;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            const opacity = 1 - dist / maxDist;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(51, 65, 85, ${opacity * 0.45})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Connect to mouse cursor if nearby
      if (mouse.x !== null && mouse.y !== null) {
        for (let i = 0; i < nodes.length; i++) {
          const dx = mouse.x - nodes[i].x;
          const dy = mouse.y - nodes[i].y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const opacity = (1 - dist / mouse.radius) * 0.7;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }

        // Mouse pointer anchor
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#38bdf8";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Update & draw nodes
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].update();
        nodes[i].draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 z-0 opacity-40 pointer-events-auto bg-slate-950 ${className}`}
    />
  );
}
