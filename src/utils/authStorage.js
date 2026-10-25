export const USER_INFO_KEY = "userInfo";
export const LOGIN_TIMESTAMP_KEY = "loginTimestamp";

export const getStoredToken = () => {
  try {
    // 1. Direct standard token item
    const directToken = localStorage.getItem("token");
    if (directToken && directToken !== "undefined" && directToken !== "null") {
      return directToken;
    }

    // 2. Token inside user session object
    const rawUser = localStorage.getItem(USER_INFO_KEY);
    if (rawUser && rawUser !== "undefined" && rawUser !== "null") {
      const parsed = JSON.parse(rawUser);
      if (parsed?.token) return parsed.token;
    }

    // 3. Fallback to auth_token or sessionStorage
    const alt = localStorage.getItem("auth_token") || sessionStorage.getItem("token");
    if (alt && alt !== "undefined" && alt !== "null") {
      return alt;
    }
  } catch (_) {}
  return "";
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);

    if (!raw || raw === "undefined" || raw === "null") {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      clearUserSession();
      return null;
    }

    // Ensure token is mirrored in both locations
    if (parsed.token) {
      localStorage.setItem("token", parsed.token);
    } else {
      const directToken = localStorage.getItem("token");
      if (directToken) parsed.token = directToken;
    }

    return parsed;
  } catch {
    clearUserSession();
    return null;
  }
};

export const persistUserSession = (user) => {
  if (!user || typeof user !== "object") return;
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
    if (user.token) {
      localStorage.setItem("token", user.token);
    }
    localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString());
    sessionStorage.setItem("vp-session-intro-seen", "true");
  } catch (_) {}
};

export const clearUserSession = () => {
  try {
    localStorage.removeItem(USER_INFO_KEY);
    localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.clear();
    sessionStorage.clear();
  } catch (_) {}
};
