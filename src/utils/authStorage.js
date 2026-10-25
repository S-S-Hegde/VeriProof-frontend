export const USER_INFO_KEY = "userInfo";
export const LOGIN_TIMESTAMP_KEY = "loginTimestamp";

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);

    if (!raw || raw === "undefined" || raw === "null") {
      return null;
    }

    const parsed = JSON.parse(raw);
    // Validate object and ensure critical authentication token exists
    if (!parsed || typeof parsed !== "object" || !parsed.token) {
      clearUserSession();
      return null;
    }

    return parsed;
  } catch {
    clearUserSession();
    return null;
  }
};

export const getStoredToken = () => getStoredUser()?.token || "";

export const persistUserSession = (user) => {
  if (!user || typeof user !== "object") return;
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
    localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString());
    sessionStorage.setItem("vp-session-intro-seen", "true");
  } catch (_) {}
};

export const clearUserSession = () => {
  try {
    localStorage.removeItem(USER_INFO_KEY);
    localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
    localStorage.removeItem("token");
    localStorage.clear();
    sessionStorage.clear();
  } catch (_) {}
};
