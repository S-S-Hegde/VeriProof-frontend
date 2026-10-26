import React from "react";

/**
 * Wraps dynamic React.lazy imports with automated error recovery.
 * If a chunk fails to load due to newly deployed/rehashed asset hashes,
 * it attempts a single hard page reload to fetch the latest deployment chunks.
 *
 * @param {Function} componentImport Dynamic import function, e.g. () => import('./pages/Dashboard')
 * @returns {React.LazyExoticComponent}
 */
export const lazyRetry = (componentImport, timeoutMs = 1500) =>
  React.lazy(async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Dynamic chunk import timeout")), timeoutMs)
      );
      const component = await Promise.race([componentImport(), timeoutPromise]);
      // Clear the reload flag on successful chunk load so future deployments can retry
      sessionStorage.removeItem("retry_chunk_reload");
      sessionStorage.removeItem("vp_loading_fallback_triggered");
      return component;
    } catch (error) {
      // If chunk load fails or stalls beyond 1.5s, force a hard reload once to get the latest assets
      const isStale = sessionStorage.getItem("retry_chunk_reload");
      if (!isStale) {
        sessionStorage.setItem("retry_chunk_reload", "true");
        window.location.reload();
        // Return a never-resolving promise to hold React rendering while the window reloads
        return new Promise(() => {});
      } else {
        // If already retried once and still failing, attempt direct import without race timeout
        sessionStorage.removeItem("retry_chunk_reload");
        try {
          return await componentImport();
        } catch (finalErr) {
          throw finalErr;
        }
      }
    }
  });

export default lazyRetry;
