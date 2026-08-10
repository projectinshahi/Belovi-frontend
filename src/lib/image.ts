// Backend origin (strip a trailing /api) — where locally-uploaded /uploads/* live.
const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  ""
);

/**
 * Resolve any stored image reference to a browser-loadable URL.
 *
 * Product/banner images can be one of:
 *   - a Cloudinary/absolute URL (`https://…`)           → used as-is
 *   - a local storefront asset (`/images/…`, `/products/…`) → served by Next
 *   - a backend upload path (`/uploads/…`)              → served by the API origin
 *
 * The `/uploads/*` case is the important one: those files live on the backend
 * (`:5000/uploads/…`), not the Next app, so a bare `/uploads/…` src would 404
 * against the frontend origin. We prefix it with the backend origin here.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_ORIGIN}${url}`;
  return url;
}

/**
 * Cloudinary URL helper.
 *
 * Our banner/product images are uploaded as full-resolution PNGs (often 1.5–2 MB),
 * which are far too heavy for mobile. Cloudinary can resize and re-encode on the fly
 * via URL transforms, so we inject `f_auto,q_auto,w_<width>` right after `/upload/`:
 *   - f_auto      → serves AVIF/WebP when the browser supports it
 *   - q_auto:good → high-quality auto compression (no visible quality loss)
 *   - w_<n>       → caps the delivered width to what the layout actually needs
 *                   (sized for high-DPI screens so the result stays crisp)
 *
 * A 1.9 MB PNG becomes ~165 KB WebP this way with no perceptible quality drop.
 * Backend-relative uploads are resolved first; non-Cloudinary URLs are otherwise
 * returned untouched.
 */
export function cldOptimize(url: string, width: number): string {
  const resolved = resolveImageUrl(url);
  if (!resolved || !resolved.includes("res.cloudinary.com") || !resolved.includes("/upload/")) {
    return resolved;
  }
  // Don't double-transform if a transform is already present.
  const [prefix, rest] = resolved.split("/upload/");
  if (/^(f_|q_|w_|c_|dpr_)/.test(rest)) {
    return resolved;
  }
  return `${prefix}/upload/f_auto,q_auto:good,w_${width}/${rest}`;
}
