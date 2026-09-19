import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../utils/api";
import {
  signInWithGoogle,
  signInWithGoogleRedirect,
  handleRedirectResult,
} from "../config/firebase";
import {
  clearUserSession,
  getStoredUser,
  persistUserSession,
} from "../utils/authStorage";
import useServerKeepAlive from "../hooks/useServerKeepAlive";

const AuthContext = createContext();
const ONE_HOUR = 3600000;

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userInfo = getStoredUser();
    const loginTimestamp = localStorage.getItem("loginTimestamp");

    if (!userInfo) {
      return null;
    }

    if (!loginTimestamp) {
      clearUserSession();
      return null;
    }

    const timeElapsed = Date.now() - parseInt(loginTimestamp, 10);

    if (timeElapsed >= ONE_HOUR) {
      clearUserSession();
      return null;
    }

    return userInfo;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [oauthError, setOauthError] = useState("");
  // True while getRedirectResult + backend call is in flight after a Google redirect.
  // UI should show a loading overlay instead of the login form during this time.
  const [redirectProcessing, setRedirectProcessing] = useState(
    () => Boolean(localStorage.getItem("veriproof_auth_pending"))
  );
  const [isExiting, setIsExiting] = useState(false);
  const logoutTimerRef = useRef(null);

  // Keep both Node.js Backend & Python AI Engine warm while user is logged in
  useServerKeepAlive(Boolean(user));

  const updateCurrentUser = (val) => {
    setUser((prev) => {
      const nextUser = typeof val === "function" ? val(prev) : val;
      if (nextUser) {
        persistUserSession(nextUser);
      } else {
        clearUserSession();
      }
      return nextUser;
    });
  };

  const scheduleLogout = (timeRemaining) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => {
      console.log("[VeriProof] Session expired (1 Hour limit reached). Auto-logging out.");
      updateCurrentUser(null);
    }, timeRemaining);
  };

  // Check for completed OAuth redirect on initial page load & purge any poisoned popup pref
  useEffect(() => {
    // Purge any poisoned "redirect" preference so users default to standard working popups
    try {
      if (localStorage.getItem("veriproof_popup_pref") === "redirect") {
        localStorage.removeItem("veriproof_popup_pref");
      }
    } catch (e) {}

    const processRedirect = async () => {
      try {
        const pendingStr = localStorage.getItem("veriproof_auth_pending");
        const result = await handleRedirectResult();

        if (result && result.idToken) {
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
            } catch (e) {
              // ignore json parse error
            }
            localStorage.removeItem("veriproof_auth_pending");
          }

          // Render backend can take 25-50s to wake from cold start.
          let data = null;
          const REDIRECT_TIMEOUT = 55000;
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
                  timeout: REDIRECT_TIMEOUT,
                }
              );
              data = res.data;
              break;
            } catch (err) {
              const isRetryable =
                !err.response || [502, 503, 504].includes(err.response?.status);
              if (!isRetryable || attempt === 2) throw err;
              await new Promise((r) => setTimeout(r, (attempt + 1) * 3000));
            }
          }

          updateCurrentUser(data);
          scheduleLogout(ONE_HOUR);

          if (data && data.role) {
            const dashPath =
              data.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard";
            setTimeout(() => {
              window.location.replace(dashPath);
            }, 50);
          }
        } else {
          // If a redirect was initiated but returned null, storage was partitioned or user cancelled
          if (pendingStr) {
            localStorage.removeItem("veriproof_auth_pending");
            setOauthError(
              "Google Sign-In redirect could not complete because cross-origin cookies were blocked. Please click 'Continue with Google OAuth' and allow popups in your browser address bar."
            );
          }
          setRedirectProcessing(false);
        }
      } catch (err) {
        console.error("[Firebase OAuth Redirect Process Error]:", err);
        localStorage.removeItem("veriproof_auth_pending");
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Google Sign-In failed. The backend server may be waking up — please wait 30 seconds and try again.";
        setOauthError(msg);
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

    const timeElapsed = Date.now() - parseInt(loginTimestamp, 10);
    const timeRemaining = Math.max(ONE_HOUR - timeElapsed, 0);

    scheduleLogout(timeRemaining);

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [user]);

  const login = async (email, password) => {
    const config = { headers: { "Content-Type": "application/json" } };
    const { data } = await api.post(
      "/api/users/login",
      { email, password },
      config,
    );
    updateCurrentUser(data);
    scheduleLogout(ONE_HOUR);
    return data;
  };

  const loginWithGoogle = async (role = "student", inviteCode = "") => {
    const result = await signInWithGoogle(role, inviteCode);
    if (!result || !result.idToken) {
      // Redirect initiated or pending
      return null;
    }
    
    const { idToken } = result;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    };
    
    const { data } = await api.post(
      "/api/users/firebase-auth",
      { role, inviteCode, idToken },
      config
    );
    
    updateCurrentUser(data);
    scheduleLogout(ONE_HOUR);
    return data;
  };

  const loginWithGoogleRedirect = async (role = "student", inviteCode = "") => {
    setAuthLoading(true);
    setOauthError("");
    try {
      await signInWithGoogleRedirect(role, inviteCode);
    } catch (err) {
      setAuthLoading(false);
      setOauthError(err.message || "Failed to initiate Google Redirect.");
      throw err;
    }
  };

  const logout = () => {
    try {
      api.post("/api/keep-alive/release").catch(() => {});
    } catch (e) {}
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
