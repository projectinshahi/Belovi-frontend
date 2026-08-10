// Shared product shape + helpers for the storefront.

export interface Variant {
  volume?: string;
  price: number;
  oldPrice?: number;
  color?: string;
  images?: string[];
  stock?: number;
  sku?: string;
}

/**
 * One row of a product's size chart. Measurements are CENTIMETRES, always —
 * the admin enters cm and nothing else, and `SizeChart` derives inches at
 * render time so the two units cannot drift apart.
 */
export interface SizeChartRow {
  size: string;
  bust?: number;
  waist?: number;
  hip?: number;
  length?: number;
}

export interface Product {
  _id: string;
  name: string;
  category?: string;
  garmentType?: string;
  collectionName?: string; // seasonal drop, e.g. "Onam" (backend field is `collectionName`)
  season?: string;
  lifeMode?: string;
  editSection?: string; // "Within" | "Beyond" | "BELOVI Men" | "Archive"
  limited?: boolean;    // renders the "LIMITED PIECE" tag
  materials?: string[]; // fabrics, e.g. ["Cotton", "Linen"] — drives the shop's Material filter
  sizeChart?: SizeChartRow[]; // per-piece body measurements, in cm
  description?: string;
  keyFeatures?: string;
  variants?: Variant[];
  images?: string[];
  offerText?: string;
  starRating?: number;
  reviewsCount?: number;
  status?: string;
  showOnLandingPage?: boolean;
  createdAt?: string;
}

/**
 * The fixed category that files a piece into The Moment. Mirrors
 * `MOMENT_CATEGORY` in the admin's products/_components/types.ts — the studio
 * picks it from the Category dropdown, and this string is the contract between
 * that dropdown and every Moment surface here.
 */
export const MOMENT_CATEGORY = "The Moment";

/** A piece the studio filed under The Moment. */
export function isMoment(p: Product): boolean {
  return p.category === MOMENT_CATEGORY;
}

/**
 * One product by id, fetched server-side. Returns null on a 404, a bad id, or
 * an unreachable backend — every caller renders a fallback rather than an
 * error page, because a missing size chart should never take a page down.
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  const origin = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
    /\/api\/?$/,
    ""
  );
  try {
    // Studio edits must show up immediately; this page is never prerendered.
    const res = await fetch(`${origin}/api/v1/products/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success && json.data ? (json.data as Product) : null;
  } catch {
    return null;
  }
}

/** Lowest variant price (what a shopper pays "from"). */
export function fromPrice(p: Product): number {
  const prices = (p.variants || []).map((v) => v.price).filter((n) => typeof n === "number");
  if (prices.length) return Math.min(...prices);
  return 0;
}

/** Original/struck price if the cheapest variant has one. */
export function fromOldPrice(p: Product): number | undefined {
  const cheapest = (p.variants || [])
    .slice()
    .sort((a, b) => a.price - b.price)[0];
  return cheapest?.oldPrice && cheapest.oldPrice > cheapest.price ? cheapest.oldPrice : undefined;
}

/**
 * Could this string ever load as an image?
 *
 * The studio's "Or provide Image URLs" field is free text, so entries like
 * `GOOGLE.COM` end up stored alongside real uploads — and being first in the
 * array, they became the product's thumbnail. A reference is only usable if
 * it's an absolute http(s) URL, a rooted path the app can serve, or a blob
 * preview. Anything else can't resolve and is dropped here rather than rendered
 * as a broken tile.
 *
 * Note this is a shape check, not a liveness check: `https://image1.jpg` is a
 * well-formed URL that simply doesn't exist. Callers still need to handle a
 * load failure — see `pickImage` in ProductCard.
 */
export function isUsableImageRef(url?: string | null): boolean {
  if (!url) return false;
  const s = url.trim();
  if (!s) return false;
  if (s.startsWith("blob:") || s.startsWith("data:")) return true;
  if (s.startsWith("/")) return true;
  return /^https?:\/\/.+/i.test(s);
}

/**
 * Every image worth trying, best-first: product-level images, then each
 * variant's. Unusable references are filtered out.
 */
export function productImagePool(p: Product): string[] {
  return [
    ...(p.images || []),
    ...(p.variants || []).flatMap((v) => v.images || []),
  ].filter(isUsableImageRef);
}

/** Primary and secondary (hover) images. */
export function productImages(p: Product): { primary?: string; secondary?: string } {
  const pool = productImagePool(p);
  return { primary: pool[0], secondary: pool[1] };
}

/** Garment descriptor shown under the name (e.g. "Lace-Trim Kurta Set"). */
export function garmentLabel(p: Product): string {
  return p.garmentType || p.category || "";
}

export interface ProductTag {
  label: string;
  /** Limited tags render in the warm-brown "LIMITED PIECE" style. */
  limited?: boolean;
}

/**
 * Card tags: the piece's `offerText`, then a "LIMITED PIECE" tag when flagged.
 *
 * Life mode is deliberately NOT a card tag. It is a detail-page attribute only —
 * the listing must carry no visible indication of it — so the AT-HOME /
 * AMBITION / OCCASION / CASUAL-OUT badge this used to emit (and the label map
 * behind it) is gone. The detail page renders its own "Life Mode · …" pill.
 */
export function productTags(p: Product): ProductTag[] {
  const tags: ProductTag[] = [];
  if (p.offerText) tags.push({ label: p.offerText });
  if (p.limited) tags.push({ label: "LIMITED PIECE", limited: true });
  return tags;
}

/** Indian rupee formatting: ₹18,500 */
export function formatINR(amount: number): string {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}
