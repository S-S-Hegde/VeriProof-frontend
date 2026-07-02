/**
 * cloudinaryImage.js
 * ─────────────────────────────────────────────────────────────────────
 * Injects Cloudinary's auto-format (f_auto) and auto-quality (q_auto)
 * transformations into any Cloudinary delivery URL.
 *
 * f_auto → serves WebP/AVIF automatically to browsers that support it
 * q_auto → Cloudinary picks the best quality vs file-size trade-off
 *
 * Usage:
 *   import { cldImg } from "../utils/cloudinaryImage";
 *   <img src={cldImg(user.profileImage)} />
 *
 * Non-Cloudinary URLs (local /uploads/..., blob:, data:, etc.)
 * are returned unchanged — safe to call on any image URL.
 * ─────────────────────────────────────────────────────────────────────
 */

const CLOUDINARY_PATTERN = /res\.cloudinary\.com/;

const resolveImageUrl = (url) => {
  if (!url?.startsWith("/uploads/")) return url || "";
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  return `${apiBaseUrl}${url}`;
};

/**
 * Appends f_auto,q_auto to Cloudinary URLs.
 * Optionally accepts a `width` to add c_limit,w_{width} for responsive sizing.
 *
 * @param {string|null|undefined} url       - Image URL from the database
 * @param {Object}                [opts]
 * @param {number}                [opts.w]  - Max width (e.g. 400 for avatars)
 * @returns {string}
 */
export function cldImg(url, { w } = {}) {
  const resolvedUrl = resolveImageUrl(url);
  // Passthrough for falsy, local, or non-Cloudinary URLs
  if (!resolvedUrl || !CLOUDINARY_PATTERN.test(resolvedUrl)) return resolvedUrl;

  // Build the transformation string
  const transforms = ["f_auto", "q_auto", ...(w ? [`c_limit,w_${w}`] : [])].join(",");

  // Insert transforms right after /upload/ or /fetch/
  // e.g. https://res.cloudinary.com/demo/image/upload/v1/sample.jpg
  //   →  https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/sample.jpg
  return resolvedUrl.replace(/\/(upload|fetch)\/(?!f_auto)/, `/$1/${transforms}/`);
}

/**
 * Convenience: 40×40 navbar avatar
 */
export const cldAvatar = (url) => cldImg(url, { w: 100 });

/**
 * Convenience: 300×300 settings profile photo
 */
export const cldProfilePhoto = (url) => cldImg(url, { w: 400 });
