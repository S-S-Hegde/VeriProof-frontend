export const USER_INFO_KEY = "userInfo";
export const LOGIN_TIMESTAMP_KEY = "loginTimestamp";

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_INFO_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_INFO_KEY);
    return null;
  }
};

export const getStoredToken = () => getStoredUser()?.token || "";

export const persistUserSession = (user) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
  localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString());
};

export const clearUserSession = () => {
  localStorage.removeItem(USER_INFO_KEY);
  localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
};
