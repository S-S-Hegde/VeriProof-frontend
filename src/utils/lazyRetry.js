import React from "react";

/**
 * Wraps dynamic React.lazy imports with automated error recovery.
 * If a chunk fails to load due to newly deployed/rehashed asset hashes,
 * it attempts a single hard page reload to fetch the latest deployment chunks.
 *
 * @param {Function} componentImport Dynamic import function, e.g. () => import('./pages/Dashboard')
 * @returns {React.LazyExoticComponent}
 */
export const lazyRetry = (componentImport) =>
  React.lazy(async () => {
    try {
      const component = await componentImport();
      // Clear the reload flag on successful chunk load so future deployments can retry
      sessionStorage.removeItem("retry_chunk_reload");
      return component;
    } catch (error) {
      // If chunk load fails, force a hard reload to get the latest assets
      const isStale = sessionStorage.getItem("retry_chunk_reload");
      if (!isStale) {
        sessionStorage.setItem("retry_chunk_reload", "true");
        window.location.reload();
        // Return a never-resolving promise to hold React rendering while the window reloads
        return new Promise(() => {});
      } else {
        // If already retried once and still failing, clear guard and propagate error to ErrorBoundary
        sessionStorage.removeItem("retry_chunk_reload");
        throw error;
      }
    }
  });

export default lazyRetry;
