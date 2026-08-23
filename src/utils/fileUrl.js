/**
 * fileUrl.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Resolves relative static asset paths (like /uploads/recruiter-resumes/...)
 * to full backend API endpoints so they work across both local development
 * and Vercel production hosting.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const resolveFileUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  const apiBaseUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
      ? "https://veriproof-backend.onrender.com"
      : "http://localhost:5000")
  ).replace(/\/$/, "");

  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${apiBaseUrl}${cleanPath}`;
};
