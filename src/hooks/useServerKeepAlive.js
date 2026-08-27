import { useEffect, useRef } from "react";
import api from "../utils/api";

const PYTHON_ENGINE_HEALTH_URL = "https://python-engine-adw8.onrender.com/health";
const PING_INTERVAL_MS = 3.5 * 60 * 1000; // 3.5 minutes (Keeps Render awake before 15-min cooldown)

export const useServerKeepAlive = (isAuthenticated) => {
  const intervalRef = useRef(null);
  const lastPingRef = useRef(0);

  const pingServers = async () => {
    const now = Date.now();
    // Debounce to at most once per 30 seconds
    if (now - lastPingRef.current < 30000) return;
    lastPingRef.current = now;

    try {
      // 1. Ping Node.js Backend
      api.get("/api/keep-alive").catch(() => {});

      // 2. Direct ping to Python AI Engine
      fetch(PYTHON_ENGINE_HEALTH_URL, { mode: "no-cors" }).catch(() => {});
    } catch (e) {
      // Silent catch
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 1. Initial immediate warmup pulse
    pingServers();

    // 2. Continuous 3.5-minute Keep-Alive heartbeat while session is active
    intervalRef.current = setInterval(() => {
      pingServers();
    }, PING_INTERVAL_MS);

    // 3. Keep-alive on tab focus
    const handleFocus = () => {
      pingServers();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthenticated]);
};

export default useServerKeepAlive;
