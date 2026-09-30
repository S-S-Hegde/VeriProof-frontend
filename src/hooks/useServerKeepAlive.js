import { useEffect, useRef, useState } from "react";
import api from "../utils/api";

const PYTHON_ENGINE_HEALTH_URL = "https://python-engine-adw8.onrender.com/health";
const PING_INTERVAL_MS = 3.5 * 60 * 1000; // 3.5 minutes (Keeps Render awake before 15-min cooldown)
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity cuts off keep-alive

export const useServerKeepAlive = (isAuthenticated) => {
  const intervalRef = useRef(null);
  const lastPingRef = useRef(0);
  const lastActivityRef = useRef(Date.now());
  const [isIdle, setIsIdle] = useState(false);

  const [isExamActive, setIsExamActive] = useState(() => localStorage.getItem("veriproof_active_exam") === "true");

  useEffect(() => {
    const handleStorage = () => {
      setIsExamActive(localStorage.getItem("veriproof_active_exam") === "true");
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("veriproof_exam_state_change", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("veriproof_exam_state_change", handleStorage);
    };
  }, []);

  // Track user activity to determine idle state
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (isIdle) setIsIdle(false);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, handleActivity));

    const checkIdleInterval = setInterval(() => {
      // Only count as idle if NOT in an active exam
      if (Date.now() - lastActivityRef.current > IDLE_TIMEOUT_MS) {
        setIsIdle(true);
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      clearInterval(checkIdleInterval);
    };
  }, [isAuthenticated, isIdle]);

  const pingServers = async () => {
    // If idle AND not in an active exam, do not ping
    if (isIdle && !isExamActive) return;

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
    if (!isAuthenticated || (isIdle && !isExamActive)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 1. Initial immediate warmup pulse
    pingServers();

    // 2. Continuous Keep-Alive heartbeat while session is active and not idle
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
  }, [isAuthenticated, isIdle, isExamActive]); // Re-run when idle or exam state changes
};

export default useServerKeepAlive;
