import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, req, res) => {
            if (err.code === "ECONNREFUSED") {
              if (res && !res.headersSent) {
                res.writeHead(503, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Backend server starting..." }));
              }
            }
          });
        },
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, req, res) => {
            if (err.code === "ECONNREFUSED" && res && !res.headersSent) {
              res.writeHead(503);
              res.end();
            }
          });
        },
      },
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Core React runtime
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router/") ||
              id.includes("/react-router-dom/") ||
              id.includes("/scheduler/")
            ) {
              return "vendor-react";
            }
            // Firebase client SDK
            if (id.includes("/firebase/") || id.includes("/@firebase/")) {
              return "vendor-firebase";
            }
            // 3D & Graphics libraries
            if (
              id.includes("/three/") ||
              id.includes("/@react-three/") ||
              id.includes("/@splinetool/")
            ) {
              return "vendor-three";
            }
            // Syntax Highlighting (Prism/Refractor)
            if (
              id.includes("/react-syntax-highlighter/") ||
              id.includes("/refractor/") ||
              id.includes("/prismjs/")
            ) {
              return "vendor-syntax";
            }
            // Charts & Data Visualization
            if (
              id.includes("/chart.js/") ||
              id.includes("/react-chartjs-2/") ||
              id.includes("/d3-hierarchy/")
            ) {
              return "vendor-charts";
            }
            // Animation & Motion
            if (
              id.includes("/framer-motion/") ||
              id.includes("/gsap/") ||
              id.includes("/animejs/") ||
              id.includes("/lenis/") ||
              id.includes("/aos/")
            ) {
              return "vendor-animation";
            }
            // Lucide Icons & Drag-and-drop UI
            if (
              id.includes("/lucide-react/") ||
              id.includes("/@dnd-kit/") ||
              id.includes("/sweetalert2/")
            ) {
              return "vendor-ui";
            }
            // General utilities
            if (id.includes("/axios/") || id.includes("/luxon/")) {
              return "vendor-utils";
            }
          }
        },
      },
    },
  },
});
