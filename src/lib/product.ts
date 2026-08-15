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

// ─── Collection-page facets ──────────────────────────────────────────────────

/**
 * The colourways a piece is offered in, deduplicated.
 *
 * Colour lives on the variant, not the product — a piece in three colourways is
 * one product with three variants — so the collection page's Color filter reads
 * from here rather than from a product-level field. No backend change was needed
 * for it; the data was already being stored.
 */
export function productColors(p: Product): string[] {
  const seen = new Set<string>();
  for (const v of p.variants || []) {
    const c = (v.color || "").trim();
    if (c) seen.add(c.toLowerCase());
  }
  return [...seen];
}

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
export const PRICE_BANDS: PriceBand[] = [
  { id: "0-2000", label: "0 - 2000", min: 0, max: 2000 },
  { id: "2000-4000", label: "2000 - 4000", min: 2000, max: 4000 },
  { id: "4000-8000", label: "4000 - 8000", min: 4000, max: 8000 },
  { id: "8000-10000", label: "8000 - 10,000", min: 8000, max: 10000 },
  { id: "10000-plus", label: "10,000+", min: 10000, max: Infinity },
];

export function inPriceBand(price: number, band: PriceBand): boolean {
  return price >= band.min && price < band.max;
}

/**
 * The Material and Color options Figma lists, as a fixed baseline.
 *
 * The panel unions these with whatever the catalogue actually carries, so the
 * page matches the design on day one AND a fabric the studio types into a new
 * product still becomes a filter with no code change. An option nothing matches
 * renders disabled rather than hidden — the design shows a full panel, and a
 * checkbox that silently returns nothing is worse than one that says so.
 */
export const FIGMA_MATERIALS = [
  "Leather",
  "Velvet",
  "Faux Leather",
  "Microfiber",
  "Piping",
];

/**
 * Figma lists "Red" twice — once with a red swatch and once with a black one.
 * The second is Black; the duplicated label is a slip in the file, and shipping
 * two identical checkboxes that filter differently would be a bug on the page.
 */
export const FIGMA_COLORS: { name: string; swatch: string }[] = [
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
  const known = FIGMA_COLORS.find((c) => c.name.toLowerCase() === name.toLowerCase());
  return known ? known.swatch : name.toLowerCase();
}

/**
 * The design's own product photography, in the order BELOVA supplied it.
 *
 * These OVERRIDE the studio's uploads on the collection grid — the catalogue
 * currently holds stock interiors rather than Belovi's own pieces, and the grid
 * is the page that has to sell them. Assigned by card POSITION, not per product,
 * so the grid never repeats a shot until it has run through all seven. Spaces
 * are percent-encoded so the src needs no browser fixup.
 *
 * ponytail: a hardcoded override, and it is a trap by design — once real product
 * photography is uploaded in Studio → Products, these will still win and the new
 * uploads will never appear. Delete this array and the `imageOverride` prop
 * passed in ProductBrowser at that point; nothing else references it.
 */
export const COLLECTION_IMAGES = [
  "/images/img%203.png",
  "/images/img%202.png",
  "/images/img%201.png",
  "/images/Component%204.png",
  "/images/Component%203.png",
  "/images/Component%202.png",
  "/images/Component%201.png",
];

export function collectionImage(index: number): string {
  return COLLECTION_IMAGES[index % COLLECTION_IMAGES.length];
}
