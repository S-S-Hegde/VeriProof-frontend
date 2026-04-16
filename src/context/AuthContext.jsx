/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../utils/api";
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
  const [loading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const logoutTimerRef = useRef(null);

  const performLogout = () => {
    clearUserSession();
    setUser(null);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
  };

  const scheduleLogout = (timeRemaining) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => {
      console.log("[VeriProof] Session expired (1 Hour limit reached). Auto-logging out.");
      performLogout();
    }, timeRemaining);
  };

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
    setUser(data);
    persistUserSession(data);
    scheduleLogout(ONE_HOUR);
    return data;
  };

  const logout = () => {
    performLogout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser, isExiting, setIsExiting }}>
      {children}
    </AuthContext.Provider>
  );
};
