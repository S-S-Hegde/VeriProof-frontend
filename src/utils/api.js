import axios from "axios";
import { clearUserSession, getStoredToken } from "./authStorage";

const defaultBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://veriproof-backend.onrender.com" : "");

const api = axios.create({
  baseURL: defaultBaseUrl,
});

// ── In-Memory Fast Cache Store ──
const memoryCache = new Map();
const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds fresh
const MAX_STALE_MS = 5 * 60 * 1000; // 5 minutes max stale

const getCacheKey = (config) => {
  const url = config.url || "";
  const params = config.params ? JSON.stringify(config.params) : "";
  return `${config.method?.toUpperCase() || "GET"}:${url}:${params}`;
};

export const clearApiCache = (pattern) => {
  if (!pattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
};

api.clearCache = clearApiCache;

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token && !config.headers?.Authorization && !config.headers?.authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Invalidate cache on mutations
  const method = config.method?.toUpperCase() || "GET";
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const url = config.url || "";
    if (url.includes("/certificates")) {
      clearApiCache("/api/certificates");
      clearApiCache("/api/users/profile");
    } else if (url.includes("/projects")) {
      clearApiCache("/api/projects");
      clearApiCache("/api/users/profile");
    } else if (url.includes("/verify") || url.includes("/applicants")) {
      clearApiCache("/api/verify");
    } else if (url.includes("/users/profile")) {
      clearApiCache("/api/users/profile");
    } else if (url.includes("/exams")) {
      clearApiCache("/api/exams");
      clearApiCache("/api/users/profile");
    }
  }

  return config;
});

const RETRY_DELAYS_MS = [1000, 2000, 3000];
const MAX_COLD_START_RETRIES = 3;

api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    const config = response.config;
    if (config.method?.toLowerCase() === "get" && config.useCache !== false) {
      const key = getCacheKey(config);
      memoryCache.set(key, {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    const status = error.response?.status;

    if (status === 401) {
      clearUserSession();
      clearApiCache();
      return Promise.reject(error);
    }

    const isNetworkError = !error.response;
    const isTimeout = error.code === "ECONNABORTED";
    const isTransientStatus = [502, 503, 504].includes(status);
    const isTransientError = isNetworkError || isTimeout || isTransientStatus;

    if (!isTransientError || !config) {
      return Promise.reject(error);
    }

    config._retryCount = config._retryCount || 0;

    if (config._retryCount < MAX_COLD_START_RETRIES) {
      const delay = RETRY_DELAYS_MS[config._retryCount] || 2000;
      config._retryCount += 1;

      console.warn(
        `[VeriProof Auto-Retry] Transient error (${status || error.message}). Attempt ${config._retryCount}/${MAX_COLD_START_RETRIES} in ${delay / 1000}s`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

// ── Smart Cache-First SWR Fetch Wrapper ──
api.cachedGet = async (url, config = {}) => {
  const reqConfig = { ...config, method: "GET", url };
  const key = getCacheKey(reqConfig);
  const cached = memoryCache.get(key);

  const now = Date.now();
  if (cached && now - cached.timestamp < MAX_STALE_MS) {
    // If cache is fresh, return immediately without network call
    if (now - cached.timestamp < DEFAULT_TTL_MS) {
      return { data: cached.data, status: cached.status, cached: true };
    }

    // If cache is slightly stale, trigger background revalidation and return stale data instantly
    api.get(url, { ...config, useCache: true }).catch(() => {});
    return { data: cached.data, status: cached.status, cached: true, isStale: true };
  }

  // No valid cache, make network call
  return api.get(url, { ...config, useCache: true });
};

export default api;
