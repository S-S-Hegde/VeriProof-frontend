import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { signInWithGooglePopup, firebaseSignOut } from "../config/firebase";
import { clearUserSession, getStoredUser, persistUserSession } from "../utils/authStorage";
import useServerKeepAlive from "../hooks/useServerKeepAlive";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext();
const ONE_HOUR    = 3_600_000; // ms

export const useAuth = () => useContext(AuthContext);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const AuthProvider = ({ children }) => {

  // ------------------------------------------------------------------
  // Restore session from localStorage on first render (synchronous).
  // We purposely do NOT clear the session here if it is expired — we
  // let the session-expiry watchdog handle that so we have a single
  // source of truth.
  // ------------------------------------------------------------------
  const [user, setUserState] = useState(() => {
    const stored    = getStoredUser();
    const ts        = localStorage.getItem("loginTimestamp");
    if (!stored || !ts) return null;
    const elapsed = Date.now() - parseInt(ts, 10);
    if (elapsed >= ONE_HOUR) {
      clearUserSession();
      return null;
    }
    return stored;
  });

  // authLoading — true while an explicit login/google call is in-flight
  const [authLoading, setAuthLoading] = useState(false);

  // authInitialized — flips to true once AuthProvider has finished its
  // own startup work. Consumers (RoleBasedRouter) MUST wait on this
  // before making routing decisions.
  const [authInitialized, setAuthInitialized] = useState(false);

  const [oauthError, setOauthError] = useState("");
  const [isExiting, setIsExiting]   = useState(false);
  const logoutTimerRef              = useRef(null);

  useServerKeepAlive(Boolean(user));

  // ------------------------------------------------------------------
  // One-time init — mark initialized.
  // We have no redirect flow any more, so this is trivially instant.
  // ------------------------------------------------------------------
  useEffect(() => {
    // Nothing async to do on mount — session was restored synchronously above.
    // We set authInitialized on the next microtask so any children that mount
    // simultaneously still see the correct initial user state.
    setAuthInitialized(true);
  }, []);

  // ------------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------------

  /** Write user to state + localStorage atomically. */
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
   * Exchange a Firebase idToken with our backend and get a VeriProof session.
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
  // Session-expiry watchdog — re-arms whenever user changes
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
  // Public API
  // ------------------------------------------------------------------

  /** Email / password login */
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
   * Google sign-in via popup (ONLY method — no redirect fallback).
   *
   * Returns the VeriProof user object on success.
   * Throws on any error — caller is responsible for displaying it.
   */
  const loginWithGoogle = async (role = "student", inviteCode = "") => {
    setAuthLoading(true);
    setOauthError("");

    try {
      // 1. Open Google popup and get Firebase credential
      const { idToken } = await signInWithGooglePopup();

      // 2. Exchange with our backend for a VeriProof session
      const data = await exchangeFirebaseToken(idToken, role, inviteCode);

      // 3. Persist and expose session
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

  /** Logout — clears everything */
  const logout = () => {
    try { api.post("/api/keep-alive/release").catch(() => {}); } catch (_) {}
    firebaseSignOut();    // clears Firebase IndexedDB
    setUser(null);
  };

  // ------------------------------------------------------------------
  // Context value
  // ------------------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        loginWithGoogle,
        logout,
        loading:         authLoading,   // kept for back-compat
        authLoading,
        authInitialized,                // NEW — gate for route guards
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
