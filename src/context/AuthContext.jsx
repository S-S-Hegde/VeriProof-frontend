import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../utils/api";
import {
  auth,
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  resolveRedirectResult,
  firebaseSignOut,
} from "../config/firebase";
import { clearUserSession, getStoredUser, persistUserSession } from "../utils/authStorage";
import useServerKeepAlive from "../hooks/useServerKeepAlive";

const AuthContext = createContext();
const ONE_HOUR = 3600000;

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // ── Session Initialisation ────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    const userInfo = getStoredUser();
    const loginTimestamp = localStorage.getItem("loginTimestamp");
    if (!userInfo || !loginTimestamp) {
      clearUserSession();
      return null;
    }
    const elapsed = Date.now() - parseInt(loginTimestamp, 10);
    if (elapsed >= ONE_HOUR) {
      clearUserSession();
      return null;
    }
    return userInfo;
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [redirectProcessing, setRedirectProcessing] = useState(
    // Only show loading overlay if we actually have a pending redirect
    () => Boolean(localStorage.getItem("veriproof_auth_pending"))
  );
  const [oauthError, setOauthError] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const logoutTimerRef = useRef(null);

  useServerKeepAlive(Boolean(user));

  // ── Internal helpers ──────────────────────────────────────────────────────
  const updateCurrentUser = (val) => {
    setUser((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      if (next) persistUserSession(next);
      else clearUserSession();
      return next;
    });
  };

  const scheduleLogout = (ms) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => updateCurrentUser(null), ms);
  };

  /**
   * Exchange a Firebase idToken with our backend and get a VeriProof session.
   * Retries on transient backend cold-start errors (502/503/504).
   */
  const exchangeFirebaseToken = async (idToken, role, inviteCode) => {
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
            timeout: 55000,
          }
        );
        return res.data;
      } catch (err) {
        const retryable = !err.response || [502, 503, 504].includes(err.response?.status);
        if (!retryable || attempt === 2) throw err;
        await new Promise((r) => setTimeout(r, (attempt + 1) * 3000));
      }
    }
  };

  // ── Redirect result handler — runs ONCE on mount ──────────────────────────
  // This ONLY runs when veriproof_auth_pending is set (i.e. a redirect was initiated).
  useEffect(() => {
    const pendingStr = localStorage.getItem("veriproof_auth_pending");
    if (!pendingStr) {
      // No redirect was initiated — nothing to do, ensure overlay is hidden
      setRedirectProcessing(false);
      return;
    }

    // Consume the pending flag IMMEDIATELY before any async work
    // This prevents any re-mount from re-processing
    localStorage.removeItem("veriproof_auth_pending");

    let role = "student";
    let inviteCode = "";
    try {
      const pending = JSON.parse(pendingStr);
      const age = Date.now() - (pending.timestamp || 0);
      if (age < 15 * 60 * 1000) {
        role = pending.role || "student";
        inviteCode = pending.inviteCode || "";
      }
    } catch (e) {}

    const handleRedirect = async () => {
      setRedirectProcessing(true);
      setOauthError("");

      try {
        const result = await resolveRedirectResult();

        if (!result?.idToken) {
          // Firebase redirect returned nothing — user may have cancelled
          setOauthError("Google Sign-In was not completed. Please try again.");
          return;
        }

        const data = await exchangeFirebaseToken(result.idToken, role, inviteCode);

        if (data) {
          updateCurrentUser(data);
          scheduleLogout(ONE_HOUR);
          // Navigate to dashboard — use React Router navigate if available, else window
          // We use window.location.replace here because we're in a provider (no navigate hook)
          // This is a ONE-TIME navigation after a legitimate redirect login
          const dest = data.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard";
          if (window.location.pathname !== dest) {
            window.location.replace(dest);
          }
        }
      } catch (err) {
        console.error("[AuthContext] Google redirect processing error:", err);
        setOauthError(
          err.response?.data?.message ||
            err.message ||
            "Google Sign-In failed. Please try again."
        );
      } finally {
        setRedirectProcessing(false);
      }
    };

    handleRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Session expiry watchdog ───────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      return;
    }
    const loginTimestamp = localStorage.getItem("loginTimestamp");
    if (!loginTimestamp) {
      clearUserSession();
      setUser(null);
      return;
    }
    const elapsed = Date.now() - parseInt(loginTimestamp, 10);
    scheduleLogout(Math.max(ONE_HOUR - elapsed, 0));
    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Public API ────────────────────────────────────────────────────────────

  /** Email/password login */
  const login = async (email, password) => {
    const { data } = await api.post(
      "/api/users/login",
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    updateCurrentUser(data);
    scheduleLogout(ONE_HOUR);
    return data;
  };

  /**
   * Google sign-in — PRIMARY method. Uses popup.
   * Falls back to redirect only if popup is definitively blocked.
   *
   * Returns VeriProof user data on popup success.
   * Returns null if redirect was initiated (page will navigate away).
   * Throws on any other error.
   */
  const loginWithGoogle = async (role = "student", inviteCode = "") => {
    setAuthLoading(true);
    setOauthError("");

    try {
      let idToken;

      try {
        // Primary: popup — instant, works on all modern browsers when not blocked
        const result = await signInWithGooglePopup();
        idToken = result.idToken;
      } catch (popupErr) {
        // Fall back to redirect ONLY on explicit popup block/close/cancel
        const isPopupIssue =
          popupErr.code === "auth/popup-blocked" ||
          popupErr.code === "auth/popup-closed-by-user" ||
          popupErr.code === "auth/cancelled-popup-request";

        if (isPopupIssue) {
          // Initiate redirect — page will navigate away, nothing returns here
          await signInWithGoogleRedirect(role, inviteCode);
          return null; // unreachable but TypeScript-friendly
        }

        throw popupErr;
      }

      // We have an idToken from the popup — exchange with backend
      const data = await exchangeFirebaseToken(idToken, role, inviteCode);
      updateCurrentUser(data);
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

  /** Logout — clears session locally and signs out of Firebase */
  const logout = () => {
    try { api.post("/api/keep-alive/release").catch(() => {}); } catch (e) {}
    firebaseSignOut(); // clears Firebase IndexedDB session
    updateCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        logout,
        loading: authLoading,
        authLoading,
        redirectProcessing,
        oauthError,
        setOauthError,
        setUser: updateCurrentUser,
        isExiting,
        setIsExiting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
