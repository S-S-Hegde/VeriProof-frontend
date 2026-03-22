import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  let logoutTimer;

  const performLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("loginTimestamp");
    setUser(null);
    if (logoutTimer) clearTimeout(logoutTimer);
    if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      window.location.href = "/login";
    }
  };

  const scheduleLogout = (timeRemaining) => {
    if (logoutTimer) clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      console.log("[VeriProof] Session expired (1 Hour limit reached). Auto-logging out.");
      performLogout();
    }, timeRemaining);
  };

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    const loginTimestamp = localStorage.getItem("loginTimestamp");

    if (userInfo && loginTimestamp) {
      const timeElapsed = Date.now() - parseInt(loginTimestamp, 10);
      const oneHour = 3600000;

      if (timeElapsed >= oneHour) {
        // Session already expired
        performLogout();
      } else {
        // Session active, schedule the remaining time
        setUser(JSON.parse(userInfo));
        scheduleLogout(oneHour - timeElapsed);
      }
    } else if (userInfo) {
      // Legacy session without timestamp -> force re-login to ensure security rule 
      performLogout();
    }
    setLoading(false);

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          performLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const { data } = await axios.post(
        "/api/users/login",
        { email, password },
        config,
      );
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      localStorage.setItem("loginTimestamp", Date.now().toString());
      scheduleLogout(3600000); // 1 Hour
      return data;
    } catch (error) {
      throw error; 
    }
  };

  const logout = () => {
    performLogout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
