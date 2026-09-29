import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../utils/api";
import {
  signInWithGoogleRedirect,
  resolveRedirectResult,
  firebaseSignOut,
} from "../config/firebase";
import { clearUserSession, getStoredUser, persistUserSession } from "../utils/authStorage";
import useServerKeepAlive from "../hooks/useServerKeepAlive";

// ---------------------------------------------------------------------------
// Context Definition
// ---------------------------------------------------------------------------
const AuthContext = createContext();
const ONE_HOUR    = 3_600_000; // ms

export const useAuth = () => useContext(AuthContext);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const AuthProvider = ({ children }) => {
  // Synchronous session initialization from localStorage
  const [user, setUserState] = useState(() => {
    const stored = getStoredUser();
    const ts     = localStorage.getItem("loginTimestamp");
    if (!stored || !ts) return null;
    const elapsed = Date.now() - parseInt(ts, 10);
    if (elapsed >= ONE_HOUR) {
      clearUserSession();
      return null;
    }
    return stored;
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [redirectProcessing, setRedirectProcessing] = useState(
    () => Boolean(localStorage.getItem("veriproof_auth_pending"))
  );
  const [authInitialized, setAuthInitialized] = useState(false);
  const [oauthError, setOauthError] = useState("");
  const [isExiting, setIsExiting]   = useState(false);
  const logoutTimerRef              = useRef(null);

  useServerKeepAlive(Boolean(user));

  // ------------------------------------------------------------------
  // Helper: Persist and update user atomically
  // ------------------------------------------------------------------
  const setUser = (val) => {
    setUserState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      if (next) persistUserSession(next);
      else       clearUserSession();
      return next;
    });
  };

  const scheduleLogout = (ms) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => setUser(null), Math.max(ms, 0));
  };

  /**
   * Exchange Firebase ID token with our backend.
   * Retries on transient cold-start errors (502/503/504).
   */
  const exchangeFirebaseToken = async (idToken, role = "student", inviteCode = "") => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await api.post(
          "/api/users/firebase-auth",
          { role, inviteCode, idToken },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            timeout: 55_000,
          }
        );
        return res.data;
      } catch (err) {
        const retryable = !err.response || [502, 503, 504].includes(err.response?.status);
        if (!retryable || attempt === 2) throw err;
        await new Promise((r) => setTimeout(r, (attempt + 1) * 3_000));
      }
    }
  };

  // ------------------------------------------------------------------
  // Redirect return handler — runs once on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    const pendingStr = localStorage.getItem("veriproof_auth_pending");
    if (!pendingStr) {
      setRedirectProcessing(false);
      setAuthInitialized(true);
      return;
    }

    // Immediately remove pending item to ensure no loop can ever happen
    localStorage.removeItem("veriproof_auth_pending");

    let role = "student";
    let inviteCode = "";
    try {
      const parsed = JSON.parse(pendingStr);
      const age = Date.now() - (parsed.timestamp || 0);
      if (age < 15 * 60 * 1000) {
        role = parsed.role || "student";
        inviteCode = parsed.inviteCode || "";
      }
    } catch (_) {}

    const handleRedirect = async () => {
      setRedirectProcessing(true);
      setOauthError("");

      try {
        const result = await resolveRedirectResult();
        if (result?.idToken) {
          const data = await exchangeFirebaseToken(result.idToken, role, inviteCode);
          if (data) {
            persistUserSession(data); // Synchronous to storage
            setUserState(data);
            scheduleLogout(ONE_HOUR);
          }
        }
      } catch (err) {
        console.error("[AuthContext] Redirect login failed:", err);
        setOauthError(
          err.response?.data?.message ||
          err.message ||
          "Google authentication failed. Please try again."
        );
      } finally {
        setRedirectProcessing(false);
        setAuthInitialized(true);
      }
    };

    handleRedirect();
  }, []);

  // ------------------------------------------------------------------
  // Session watchdog
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
   * Google Sign-In using REDIRECT flow only.
   * This is the safest strategy — it routes through Firebase's own
   * firebaseapp.com domain (always authorized), so it works on ALL
   * Vercel preview URLs, custom domains, and localhost without any
   * Firebase console domain whitelist configuration.
   */
  const loginWithGoogle = async (role = "student", inviteCode = "") => {
    setOauthError("");
    setRedirectProcessing(true);
    try {
      await signInWithGoogleRedirect(role, inviteCode);
      // Page navigates away to Google — nothing more to do here.
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
    try { api.post("/api/keep-alive/release").catch(() => {}); } catch (_) {}
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
        authInitialized,
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
