import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../utils/api";
import {
  signInWithGooglePopup,
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
   * Google Sign-In with Automatic Seamless Fallback:
   * 1. Attempts popup first (instant for desktop users).
   * 2. If popup is blocked by Chrome/browser settings:
   *    Automatically and seamlessly switches to redirect flow (no technical config required from user).
   */
  const loginWithGoogle = async (role = "student", inviteCode = "") => {
    setAuthLoading(true);
    setOauthError("");

    try {
      let idToken;
      try {
        const result = await signInWithGooglePopup();
        idToken = result.idToken;
      } catch (popupErr) {
        const isPopupBlocked =
          popupErr.code === "auth/popup-blocked" ||
          popupErr.code === "auth/cancelled-popup-request";

        if (isPopupBlocked) {
          console.info("[Auth] Popup blocked by browser policy. Automatically initiating redirect flow...");
          setRedirectProcessing(true);
          await signInWithGoogleRedirect(role, inviteCode);
          return null; // Page is redirecting to Google
        }

        if (popupErr.code === "auth/popup-closed-by-user") {
          throw new Error("Sign-in popup was closed before completing.");
        }

        throw popupErr;
      }

      // Popup succeeded
      const data = await exchangeFirebaseToken(idToken, role, inviteCode);
      persistUserSession(data);
      setUser(data);
      scheduleLogout(ONE_HOUR);
      return data;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Google authentication failed. Please try again.";
      setOauthError(msg);
      throw err;
    } finally {
      setAuthLoading(false);
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
