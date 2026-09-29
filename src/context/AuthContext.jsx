import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { signInWithGoogleRedirect, firebaseSignOut } from "../config/firebase";
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
  // Helper: Persist and update user atomically
  // ------------------------------------------------------------------
  const setUser = (val) => {
    setUserState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      if (next) persistUserSession(next);
      else clearUserSession();
      return next;
    });
  };

  const scheduleLogout = (ms) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => setUser(null), Math.max(ms, 0));
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ------------------------------------------------------------------
  // Public Auth API
  // ------------------------------------------------------------------
  const login = async (email, password) => {
    const { data } = await api.post(
      "/api/users/login",
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    setUser(data);
    scheduleLogout(ONE_HOUR);
    return data;
  };

  /**
   * Google Sign-In — redirect-only flow.
   *
   * Routes through Firebase's own firebaseapp.com domain (always authorized),
   * so it works on ALL Vercel preview URLs and custom domains without any
   * Firebase console domain whitelist configuration.
   *
   * On return from Google, AuthCallback.jsx handles the token exchange and
   * writes the session to localStorage. AuthContext then reads it on its
   * next mount (synchronously, via the useState initializer above).
   */
  const loginWithGoogle = async (role = "student", inviteCode = "") => {
    setOauthError("");
    setRedirectProcessing(true);
    try {
      await signInWithGoogleRedirect(role, inviteCode);
      // Browser navigates away — nothing executes after this.
      return null;
    } catch (err) {
      console.error("[Auth] Failed to initiate Google redirect:", err);
      setRedirectProcessing(false);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Could not start Google authentication. Please try again.";
      setOauthError(msg);
      throw err;
    }
  };

  const logout = () => {
    try {
      api.post("/api/keep-alive/release").catch(() => {});
    } catch (_) {}
    firebaseSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
