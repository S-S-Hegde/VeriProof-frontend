import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import api from "../utils/api";
import { signInWithGooglePopup, firebaseSignOut } from "../config/firebase";
import { clearUserSession, getStoredUser, persistUserSession } from "../utils/authStorage";
import useServerKeepAlive from "../hooks/useServerKeepAlive";

// ---------------------------------------------------------------------------
// Context Definition
// ---------------------------------------------------------------------------
const AuthContext = createContext();
const ONE_HOUR = 3_600_000; // ms

export const useAuth = () => useContext(AuthContext);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const AuthProvider = ({ children }) => {
  // Synchronous session initialization from localStorage.
  // AuthContext NEVER calls Firebase APIs directly for OAuth — that is
  // AuthCallback.jsx's sole responsibility. This prevents the race condition
  // where both AuthContext and AuthCallback called getRedirectResult()
  // simultaneously, consuming the one-time redirect result unpredictably.
  const [user, setUserState] = useState(() => {
    const stored = getStoredUser();
    const ts = localStorage.getItem("loginTimestamp");
    if (!stored || !ts) return null;
    const elapsed = Date.now() - parseInt(ts, 10);
    if (elapsed >= ONE_HOUR) {
      clearUserSession();
      return null;
    }
    return stored;
  });

  const [authLoading, setAuthLoading]   = useState(false);
  const [oauthError, setOauthError]     = useState("");
  const [isExiting, setIsExiting]       = useState(false);
  const logoutTimerRef                  = useRef(null);

  // authInitialized: true immediately — we read synchronously from localStorage.
  // No async work needed. RoleBasedRouter can render on the first paint.
  const authInitialized = true;

  // redirectProcessing: only true while the page is mid-redirect to Google
  // (set by loginWithGoogle below). Cleared as soon as the redirect launches.
  // On return from Google, AuthCallback handles everything — AuthContext state
  // starts fresh from localStorage (already written by AuthCallback).
  const [redirectProcessing, setRedirectProcessing] = useState(false);

  useServerKeepAlive(Boolean(user));

  // ------------------------------------------------------------------
  // Helper: Persist and update user atomically (stable reference)
  // ------------------------------------------------------------------
  const setUser = useCallback((val) => {
    setUserState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      if (next) persistUserSession(next);
      else clearUserSession();
      return next;
    });
  }, []);

  const scheduleLogout = useCallback((ms) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => setUser(null), Math.max(ms, 0));
  }, [setUser]);

  // ------------------------------------------------------------------
  // Session watchdog — reschedules logout timer based on stored timestamp
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!user) {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      return;
    }
    const ts = localStorage.getItem("loginTimestamp");
    if (!ts) {
      clearUserSession();
      setUserState(null);
      return;
    }
    const elapsed = Date.now() - parseInt(ts, 10);
    scheduleLogout(ONE_HOUR - elapsed);
    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [user, scheduleLogout]);

  // ------------------------------------------------------------------
  // Public Auth API (memoized)
  // ------------------------------------------------------------------
  const login = useCallback(async (email, password) => {
    const { data } = await api.post(
      "/api/users/login",
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    setUser(data);
    scheduleLogout(ONE_HOUR);
    return data;
  }, [setUser, scheduleLogout]);

  const loginWithGoogle = useCallback(async (role = "student", inviteCode = "") => {
    setOauthError("");
    setRedirectProcessing(true);
    try {
      const { idToken } = await signInWithGooglePopup();
      
      const res = await api.post(
        "/api/users/firebase-auth",
        { role, inviteCode, idToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          timeout: 55000,
        }
      );
      
      const data = res.data;
      if (!data) throw new Error("Failed to obtain user session from backend.");
      
      setUser(data);
      scheduleLogout(ONE_HOUR);
      setRedirectProcessing(false);
      return data;
    } catch (err) {
      setRedirectProcessing(false);
      console.error("[Auth] Google Popup Error:", err);
      setOauthError(err.response?.data?.message || err.message || "Could not complete Google authentication.");
      throw err;
    }
  }, [setUser, scheduleLogout]);

  const logout = useCallback(() => {
    try {
      api.post("/api/keep-alive/release").catch(() => {});
    } catch (_) {}
    firebaseSignOut();
    setUser(null);
  }, [setUser]);

  const contextValue = useMemo(() => ({
    user,
    setUser,
    login,
    loginWithGoogle,
    logout,
    loading: authLoading,
    authLoading,
    authInitialized,       // Always true — sync init from localStorage
    redirectProcessing,
    oauthError,
    setOauthError,
    isExiting,
    setIsExiting,
  }), [
    user,
    setUser,
    login,
    loginWithGoogle,
    logout,
    authLoading,
    redirectProcessing,
    oauthError,
    isExiting,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
