import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Automatically reload page if a deployment updates chunk hashes, but prevent reload loop
window.addEventListener("vite:preloadError", () => {
  const hasReloaded = sessionStorage.getItem("vite_preload_reloaded");
  if (!hasReloaded) {
    sessionStorage.setItem("vite_preload_reloaded", "true");
    window.location.reload();
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
