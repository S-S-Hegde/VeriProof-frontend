import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FieryCursor = () => {
  const [clicks, setClicks] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const newClick = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      
      setClicks((prev) => [...prev, newClick]);

      // Remove the blast after animation completes
      setTimeout(() => {
        setClicks((prev) => prev.filter((c) => c.id !== newClick.id));
      }, 800);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {clicks.map((click) => (
          <Burst key={click.id} x={click.x} y={click.y} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const Burst = ({ x, y }) => {
  // Generate random particles for the fiery blast
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    angle: (i * 30 * Math.PI) / 180,
    distance: Math.random() * 40 + 20,
    size: Math.random() * 8 + 4,
    duration: Math.random() * 0.4 + 0.4
  }));

  return (
    <div 
      className="absolute"
      style={{ left: x, top: y }}
    >
      {/* Central Explosion Core */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute -left-4 -top-4 w-8 h-8 rounded-full bg-orange-500 blur-md mix-blend-screen"
      />
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 4, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="absolute -left-6 -top-6 w-12 h-12 rounded-full bg-red-600 blur-xl mix-blend-screen"
      />
      
      {/* Fiery Shrapnel Particles */}
      {particles.map((p, index) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ 
            x: Math.cos(p.angle) * p.distance, 
            y: Math.sin(p.angle) * p.distance,
            scale: 0,
            opacity: 0
          }}
          transition={{ duration: p.duration, ease: "easeOut" }}
          className="absolute rounded-full mix-blend-screen"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: index % 2 === 0 ? "#FF4500" : "#FFD700", // OrangeRed / Gold
            boxShadow: `0 0 ${p.size * 2}px ${index % 2 === 0 ? "#FF0000" : "#FFA500"}`
          }}
        />
      ))}
    </div>
  );
};

export default FieryCursor;
