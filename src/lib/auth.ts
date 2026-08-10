import axios from "axios";

/**
 * Customer auth, shared by the sign-in and registration pages.
 *
 * The session is whatever the backend's auth routes return — `{_id, name,
 * email, phone, role, token}` — stored under one key. Google auth already wrote
 * exactly this, so an account created with a password and one created with
 * Google are indistinguishable to the rest of the storefront: the same
 * `belovi_user` entry, read the same way by the navbar, cart, checkout and
 * profile. Nothing here introduces a second auth system.
 */

/** Where the session lives. Every reader of it already uses this key. */
export const AUTH_STORAGE_KEY = "belovi_user";

/** Backend origin, tolerating a NEXT_PUBLIC_API_URL that includes `/api`. */
export function authApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
}

export interface Session {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  token: string;
}

/** Persist the session exactly as the Google flow does. */
export function saveSession(session: Session): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

/** Is someone signed in? The one place that question is asked of storage. */
export function isSignedIn(): boolean {
  return typeof window !== "undefined" && Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
}

// ─── Returning to where you were ─────────────────────────────────────────────

/** Query parameter carrying the page to come back to after signing in. */
export const REDIRECT_PARAM = "redirect";

/**
 * Where to send someone after they authenticate.
 *
 * Only same-origin paths are honoured. Without this the sign-in page would be an
 * open redirect: `/sign-in?redirect=https://evil.example` is a link an attacker
 * can send, and it would carry a customer off-site immediately after they typed
 * their password — on a page they had every reason to trust. Anything that
 * isn't a plain absolute path falls back to the homepage.
 */
export function safeRedirect(raw: string | null | undefined, fallback = "/"): string {
  if (!raw) return fallback;
  const value = raw.trim();
  // Must be rooted here. Rejects `https://…`, `javascript:…` and bare words.
  if (!value.startsWith("/")) return fallback;
  // `//host` is protocol-relative — an off-site URL that begins with a slash.
  if (value.startsWith("//")) return fallback;
  // Browsers normalise backslashes to slashes, so `/\evil.example` escapes too;
  // control characters can be used to smuggle either past a naive check.
  if (/[\\]|[\u0000-\u001f]/.test(value)) return fallback;
  return value;
}

/** Link to sign-in that comes back to `returnTo` afterwards. */
export function signInHref(returnTo: string): string {
  const target = safeRedirect(returnTo, "");
  return target ? `/sign-in?${REDIRECT_PARAM}=${encodeURIComponent(target)}` : "/sign-in";
}

/**
 * The message to show the customer for a failed request.
 *
 * Prefers the backend's own message — those are deliberately non-specific
 * ("Invalid email or password" for both an unknown address and a wrong
 * password) — and falls back to something plain rather than leaking a stack or
 * an axios internal.
 */
export function authErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; errors?: { field: string; message: string }[] }
      | undefined;
    // Zod validation failures come back as a list; the first is the useful one.
    if (data?.errors?.length) return data.errors[0].message;
    if (data?.message) return data.message;
    if (!err.response) return "Could not reach the server. Check your connection.";
  }
  return fallback;
}

// ─── Field validation ────────────────────────────────────────────────────────
// Mirrors `schemas.register` on the backend, which is the real gate. Checking
// here too means a weak password is caught before a round trip, and the rules
// shown to the customer are the rules actually enforced.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The password rule, in the words shown under the field. */
export const PASSWORD_HINT =
  "At least 8 characters, with an uppercase and a lowercase letter, a number and a symbol.";

export function validatePassword(value: string): string | null {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(value)) return "Password needs an uppercase letter.";
  if (!/[a-z]/.test(value)) return "Password needs a lowercase letter.";
  if (!/[0-9]/.test(value)) return "Password needs a number.";
  if (!/[^A-Za-z0-9]/.test(value)) return "Password needs a symbol.";
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "Email address is required.";
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
  return null;
}

export function validateName(value: string): string | null {
  if (!value.trim()) return "Full name is required.";
  if (value.trim().length < 2) return "Name must be at least 2 characters.";
  return null;
}
