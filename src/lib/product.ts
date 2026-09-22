// Shared product shape + helpers for the storefront.

export interface Variant {
  /**
   * What the API actually returns — the backend's Product model calls this
   * `size` and always has. `volume` below is a storefront-only name that no
   * payload ever carries; it is left in place because CartContext and
   * SizeSelector still read it, and correcting those is a separate change from
   * this type telling the truth.
   */
  size?: string;
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
  collectionName?: string; // named drop, e.g. "Signature" (backend field is `collectionName`)
  season?: string;
  lifeMode?: string;
  editSection?: string; // "Within" | "Beyond" | "BELOVI Men" | "Archive"
  limited?: boolean;    // renders the "LIMITED PIECE" tag
  materials?: string[]; // e.g. ["Leather", "Wood"] — shown on the detail page, not a shop filter
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

/**
 * Can this piece be bought?
 *
 * `status` is free text on the model with "In Stock" as the default, so anything
 * not recognisably in-stock counts as unavailable rather than trying to
 * enumerate every phrase the studio might type.
 */
export function isInStock(status?: string): boolean {
  return /in\s*stock/i.test((status || "").trim());
}

/** Indian rupee formatting: ₹18,500 */
export function formatINR(amount: number): string {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

// ─── Collection-page facets ──────────────────────────────────────────────────

export interface PriceBand {
  id: string;
  label: string;
  min: number;
  /** Exclusive. `Infinity` for the open-ended top band. */
  max: number;
}

/**
 * The price bands exactly as Figma draws them.
 *
 * Ranges are half-open — `min <= price < max` — so a piece at exactly ₹2,000
 * lands in "2000 - 4000" and never in two bands at once. The labels overlap at
 * the boundaries because the design writes them that way; the arithmetic does
 * not.
 *
 * ponytail: fixed bands, not derived from the catalogue's own spread. Today's
 * range is ₹500–₹100,000, so nearly everything sits in the top band; revisit
 * with quantile-derived bands once the catalogue is broad enough for that to
 * mean anything.
 */
/**
 * Price bands DERIVED from the catalogue, rather than a fixed ladder.
 *
 * The five hardcoded bands here ran 0–10,000+, which is the wrong shape for a
 * furniture catalogue priced in the hundreds: every piece landed in the first
 * band and the other four were dead checkboxes. Bands are now cut to the prices
 * that actually exist, so they re-scale on their own as the studio's pricing
 * changes.
 *
 * The step is rounded to 1, 2 or 5 × a power of ten so the labels read as prices
 * a shopper would recognise rather than as arithmetic (`250 - 500`, not
 * `237 - 474`). The last band is open-ended because `inPriceBand` is
 * half-open — without it the single most expensive piece matches nothing.
 *
 * Returns `[]` when there is nothing to divide: fewer than two priced pieces, or
 * every piece at one price. The caller drops the filter entirely in that case.
 */
export function priceBandsFor(prices: number[]): PriceBand[] {
  const valid = prices.filter((n) => Number.isFinite(n) && n > 0);
  if (valid.length < 2) return [];

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  if (max <= min) return [];

  const TARGET_BANDS = 4;
  const rough = (max - min) / TARGET_BANDS;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const step =
    [1, 2, 5, 10].map((m) => m * magnitude).find((s) => (max - min) / s <= TARGET_BANDS) ??
    magnitude * 10;

  const money = (n: number) => Math.round(n).toLocaleString("en-IN");

  const bands: PriceBand[] = [];
  for (let lo = Math.floor(min / step) * step; lo < max; lo += step) {
    bands.push({
      id: `${lo}-${lo + step}`,
      label: `${money(lo)} - ${money(lo + step)}`,
      min: lo,
      max: lo + step,
    });
  }

  // Open the top band so the dearest piece is inside it.
  const last = bands[bands.length - 1];
  if (last) {
    last.id = `${last.min}-plus`;
    last.label = `${money(last.min)}+`;
    last.max = Infinity;
  }

  return bands;
}

export function inPriceBand(price: number, band: PriceBand): boolean {
  return price >= band.min && price < band.max;
}

/**
 * Swatch tones for colour names the design specifies — rendering only. Supplies
 * an exact tone for names the design pinned down; anything else falls through
 * to the CSS colour keyword. Used by the detail page's variant chips and Color.
 */
export const SWATCH_TONES: { name: string; swatch: string }[] = [
  { name: "Red", swatch: "#D32F2F" },
  { name: "Black", swatch: "#010101" },
  { name: "Grey", swatch: "#9A9A9A" },
  { name: "Orange", swatch: "#F26722" },
  { name: "Pink", swatch: "#FF2D7E" },
  { name: "Maroon", swatch: "#7B1113" },
];

/**
 * A drawable swatch for a colour name. The design's six get their exact tone;
 * anything the studio types falls through to the CSS colour keyword, which
 * covers the values actually in the catalogue (blue, ivory, red, yellow) and
 * quietly renders nothing for a name CSS doesn't know.
 */
export function colorSwatch(name: string): string {
  const known = SWATCH_TONES.find((c) => c.name.toLowerCase() === name.toLowerCase());
  return known ? known.swatch : name.toLowerCase();
}

