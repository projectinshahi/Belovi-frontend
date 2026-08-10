"use client";

import axios from "axios";
import { useEffect, useState } from "react";

/**
 * Categories, as the storefront consumes them. There are two sets, deliberately
 * independent of each other:
 *
 * 1. `SHOP_CATEGORIES` — the Shop menu's fixed list. Drives the Shop dropdown,
 *    the footer's Collections column, the homepage search chips and the shop's
 *    Category filter. Closed: it lives here and nowhere else, and nothing in the
 *    admin can change it.
 *
 * 2. `useCategories()` — the categories the studio creates in the admin's
 *    Category Management. They illustrate the homepage grid and /the-edit, and
 *    they are what a product is actually filed under (the admin's product form
 *    reads the same set, and the backend's Product model enforces it).
 *
 * NOTE: because a piece carries a category from set 2 while the Shop menu links
 * to set 1, a Shop menu link only lands on pieces when the same name exists in
 * both — i.e. when the studio has created a category named "Wellness" et al. in
 * Category Management. Names that exist in only one set filter to nothing.
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

// ─── 1. The Shop menu's fixed list ───────────────────────────────────────────

/**
 * The five fixed categories, in menu order. A piece is filed under exactly one
 * of these; mirrored by `SHOP_CATEGORIES` in the backend's Product model (the
 * enum that enforces it) and in the admin's products/_components/types.ts, which
 * drives the product form's dropdown. `check-categories.mjs` asserts the three
 * copies agree.
 *
 * "All Products" is one of the five because the studio asked for it as a filing
 * option. Note it is a category like any other here: `?category=all-products`
 * shows the pieces filed under that name, not the whole catalogue. The
 * unfiltered shop is the "Shop" nav item itself, which links to `/products`.
 */
export const SHOP_CATEGORIES = [
  "Luxury Furniture",
  "Positioning",
  "Wellness",
  "Accessories",
  "All Products",
];

/** The same four as `{ id, name }`, ready to link and filter on. */
export const SHOP_CATEGORY_LINKS = SHOP_CATEGORIES.map((name) => ({
  id: slugify(name),
  name,
}));

// ─── 2. The studio's categories, from Category Management ────────────────────

export interface StoreCategory {
  /** Slug used in `/products?category=…`. */
  id: string;
  name: string;
  /** Stored reference; pass through `cldOptimize` before rendering. */
  image: string;
}

interface ApiCategory {
  name?: string;
  image?: string;
  status?: string;
}

/**
 * Shared across every component that asks, so a page carrying both the homepage
 * grid and /the-edit tiles makes one request, not two. Cleared on failure so a
 * transient outage doesn't cache an empty grid.
 */
let inFlight: Promise<StoreCategory[]> | null = null;

/**
 * The studio's active categories, each with the photograph uploaded for it.
 * Never rejects: an unreachable backend yields an empty list, and both callers
 * already render nothing rather than an error for that case.
 */
function fetchCategories(): Promise<StoreCategory[]> {
  inFlight ??= axios
    .get(`${API_ORIGIN}/api/v1/categories`)
    .then((res) => {
      const docs: ApiCategory[] = Array.isArray(res.data?.data) ? res.data.data : [];
      return docs
        .filter((c) => c.name && c.status !== "INACTIVE")
        .map((c) => ({ id: slugify(c.name), name: c.name as string, image: c.image || "" }));
    })
    .catch(() => {
      inFlight = null;
      return [];
    });
  return inFlight;
}

/**
 * `null` while loading, so a caller can tell "not yet" from "none published"
 * and show a skeleton instead of collapsing its section.
 */
export function useCategories(): StoreCategory[] | null {
  const [categories, setCategories] = useState<StoreCategory[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCategories().then((list) => {
      if (!cancelled) setCategories(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return categories;
}
