import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { signInWithGoogle, handleRedirectResult } from "../config/firebase";
import {
  clearUserSession,
  getStoredUser,
  persistUserSession,
} from "../utils/authStorage";

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
  const [isExiting, setIsExiting] = useState(false);
  const logoutTimerRef = useRef(null);

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

  // Check for completed OAuth redirect on initial page load
  useEffect(() => {
    const processRedirect = async () => {
      try {
        const result = await handleRedirectResult();
        if (result && result.idToken) {
          setAuthLoading(true);
          setOauthError("");

          let role = "student";
          let inviteCode = "";
          const pendingStr = sessionStorage.getItem("veriproof_auth_pending");
          if (pendingStr) {
            try {
              const pending = JSON.parse(pendingStr);
              role = pending.role || "student";
              inviteCode = pending.inviteCode || "";
            } catch (e) {
              // ignore json parse error
            }
            sessionStorage.removeItem("veriproof_auth_pending");
          }

          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${result.idToken}`,
            },
          };

          const { data } = await api.post(
            "/api/users/firebase-auth",
            { role, inviteCode, idToken: result.idToken },
            config
          );

          updateCurrentUser(data);
          scheduleLogout(ONE_HOUR);
        }
      } catch (err) {
        console.error("[Firebase OAuth Redirect Process Error]:", err);
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to verify Google account with backend. Please check backend server.";
        setOauthError(msg);
      } finally {
        setAuthLoading(false);
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

  const logout = () => {
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
