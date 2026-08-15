"use client";

import axios from "axios";
import { useEffect, useState } from "react";

/**
 * Categories, as the storefront consumes them.
 *
 * THERE IS NO LIST IN THIS FILE. Every category the storefront shows — the Shop
 * dropdown, the homepage Category Section, the search chips, /the-edit's tiles,
 * the shop's Category filter — is a document the studio created in the admin's
 * Category Management. Create one and it appears everywhere; deactivate or
 * delete it and it leaves. No deploy either way.
 *
 * This file used to also carry a hardcoded list of five names that the menus
 * rendered directly. That was the bug behind "categories added in the admin
 * don't show up": the storefront read the constant while the admin wrote to the
 * database, and the two had no reason to agree. The constant is gone, so there
 * is exactly one source of truth and it is the database.
 *
 * The consequence is deliberate and worth stating: with no categories saved, the
 * storefront shows no categories. Each surface below hides its own section
 * rather than rendering an empty shell.
 */

/** Backend origin, tolerating a NEXT_PUBLIC_API_URL that includes `/api`. */
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  ""
);

/**
 * Lowercase; collapse spaces, ampersands and slashes to single hyphens.
 *
 * The products page filters on this exact form, so anything that links to
 * `?category=` must slugify identically — hence one shared implementation
 * rather than a copy per page.
 */
export const slugify = (s?: string) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[\s&/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export interface StoreCategory {
  /** Slug used in `/products?category=…`. */
  id: string;
  name: string;
  /** Stored reference; pass through `cldOptimize` before rendering. */
  image: string;
}

/** A category document as the API returns it. */
interface ApiCategory {
  name?: string;
  image?: string;
  status?: string;
}

/**
 * Shared across every component that asks, so a page carrying both the homepage
 * Category Section and the navbar makes one request, not two. Cleared on failure
 * so a transient outage doesn't cache an empty list for the session.
 */
let inFlight: Promise<ApiCategory[]> | null = null;

/**
 * Never rejects: an unreachable backend yields an empty list, and every caller
 * hides its section rather than showing an error for that case.
 */
function fetchCategories(): Promise<ApiCategory[]> {
  inFlight ??= axios
    .get(`${API_ORIGIN}/api/v1/categories`)
    .then((res) => (Array.isArray(res.data?.data) ? (res.data.data as ApiCategory[]) : []))
    .catch(() => {
      inFlight = null;
      return [];
    });
  return inFlight;
}

/**
 * The studio's active categories, in the order the API returns them — which is
 * the order the admin's own Categories table shows, so the two never disagree.
 * Nothing is re-sorted here: ordering is the admin's to decide, not this file's.
 *
 * `null` while loading, so a caller can tell "not yet" from "none created" and
 * show a skeleton instead of collapsing its section on the first frame.
 */
export function useCategories(): StoreCategory[] | null {
  const [docs, setDocs] = useState<ApiCategory[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCategories().then((list) => {
      if (!cancelled) setDocs(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (docs === null) return null;
  return docs
    .filter((c) => c.name && c.status !== "INACTIVE")
    .map((c) => ({
      id: slugify(c.name),
      name: (c.name || "").trim(),
      image: c.image || "",
    }));
}
