import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { signInWithGoogle, signInWithGoogleRedirect, handleRedirectResult } from "../config/firebase";
import { clearUserSession, getStoredUser, persistUserSession } from "../utils/authStorage";
import useServerKeepAlive from "../hooks/useServerKeepAlive";

const AuthContext = createContext();
const ONE_HOUR = 3600000;

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
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
  const [oauthError, setOauthError] = useState("");
  const [redirectProcessing, setRedirectProcessing] = useState(
    () => Boolean(localStorage.getItem("veriproof_auth_pending"))
  );
  const [isExiting, setIsExiting] = useState(false);
  const logoutTimerRef = useRef(null);

  useServerKeepAlive(Boolean(user));

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

  // On every page load: check if Google OAuth redirect just returned
  useEffect(() => {
    const processRedirect = async () => {
      const pendingStr = localStorage.getItem("veriproof_auth_pending");

      try {
        const result = await handleRedirectResult();

        if (result?.idToken) {
          setRedirectProcessing(true);
          setAuthLoading(true);
          setOauthError("");

          let role = "student";
          let inviteCode = "";

          if (pendingStr) {
            try {
              const pending = JSON.parse(pendingStr);
              const age = Date.now() - (pending.timestamp || 0);
              if (age < 15 * 60 * 1000) {
                role = pending.role || "student";
                inviteCode = pending.inviteCode || "";
              }
            } catch (e) {}
            localStorage.removeItem("veriproof_auth_pending");
          }

          let data = null;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const res = await api.post(
                "/api/users/firebase-auth",
                { role, inviteCode, idToken: result.idToken },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${result.idToken}`,
                  },
                  timeout: 55000,
                }
              );
              data = res.data;
              break;
            } catch (err) {
              const retryable = !err.response || [502, 503, 504].includes(err.response?.status);
              if (!retryable || attempt === 2) throw err;
              await new Promise((r) => setTimeout(r, (attempt + 1) * 3000));
            }
          }

          updateCurrentUser(data);
          scheduleLogout(ONE_HOUR);

          if (data?.role) {
            const dest = data.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard";
            setTimeout(() => window.location.replace(dest), 50);
          }
        } else {
          // No redirect result — clear stale pending flag silently
          if (pendingStr) localStorage.removeItem("veriproof_auth_pending");
          setRedirectProcessing(false);
        }
      } catch (err) {
        console.error("[AuthContext] Redirect processing error:", err);
        localStorage.removeItem("veriproof_auth_pending");
        setOauthError(
          err.response?.data?.message ||
            err.message ||
            "Google Sign-In failed. Please try again."
        );
        setRedirectProcessing(false);
      } finally {
        setAuthLoading(false);
        setRedirectProcessing(false);
      }
    };

    processRedirect();
  }, []);

  useEffect(() => {
    if (!user) {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      return;
    }
    const loginTimestamp = localStorage.getItem("loginTimestamp");
    if (!loginTimestamp) {
      clearUserSession();
      return;
    }
    const elapsed = Date.now() - parseInt(loginTimestamp, 10);
    scheduleLogout(Math.max(ONE_HOUR - elapsed, 0));
    return () => { if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current); };
  }, [user]);

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
   * Sign in with Google. Tries popup first; falls back to full-page redirect automatically.
   * Returns user data on popup success, or null if redirect was initiated.
   */
  const loginWithGoogle = async (role = "student", inviteCode = "") => {
    setAuthLoading(true);
    setOauthError("");
    try {
      const result = await signInWithGoogle(role, inviteCode);
      if (!result) {
        // Redirect was initiated — page will navigate away, return null
        return null;
      }
      const res = await api.post(
        "/api/users/firebase-auth",
        { role, inviteCode, idToken: result.idToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${result.idToken}`,
          },
          timeout: 55000,
        }
      );
      updateCurrentUser(res.data);
      scheduleLogout(ONE_HOUR);
      return res.data;
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithGoogleRedirect = async (role = "student", inviteCode = "") => {
    setAuthLoading(true);
    setOauthError("");
    try {
      await signInWithGoogleRedirect(role, inviteCode);
    } catch (err) {
      setAuthLoading(false);
      setOauthError(err.message || "Failed to initiate Google Sign-In.");
      throw err;
    }
  };

  const logout = () => {
    try { api.post("/api/keep-alive/release").catch(() => {}); } catch (e) {}
    updateCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        loginWithGoogleRedirect,
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
