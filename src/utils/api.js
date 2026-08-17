import axios from "axios";
import { clearUserSession, getStoredToken } from "./authStorage";

const defaultBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://veriproof-backend.onrender.com" : "");

const api = axios.create({
  baseURL: defaultBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  // Only attach stored token if Authorization header is not already explicitly set
  if (token && !config.headers?.Authorization && !config.headers?.authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const RETRY_DELAYS_MS = [1000, 2000, 3000];
const MAX_COLD_START_RETRIES = 3;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const status = error.response?.status;

    // Handle genuine 401 unauthorized errors (Clear session ONLY on 401)
    if (status === 401) {
      clearUserSession();
      return Promise.reject(error);
    }

    // Determine if error is a transient cold-start failure (Network Error, Timeout, 502, 503, 504)
    const isNetworkError = !error.response;
    const isTimeout = error.code === "ECONNABORTED";
    const isTransientStatus = [502, 503, 504].includes(status);
    const isTransientError = isNetworkError || isTimeout || isTransientStatus;

    // Do NOT retry non-transient errors (400, 403, 404, validation errors) or missing config
    if (!isTransientError || !config) {
      return Promise.reject(error);
    }

    // Initialize retry counter on request config
    config._retryCount = config._retryCount || 0;

    if (config._retryCount < MAX_COLD_START_RETRIES) {
      const delay = RETRY_DELAYS_MS[config._retryCount] || 8000;
      config._retryCount += 1;

      console.warn(
        `[VeriProof Cold-Start] Transient error (${status || error.message}). Waking backend... Attempt ${config._retryCount}/${MAX_COLD_START_RETRIES} in ${delay / 1000}s`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
