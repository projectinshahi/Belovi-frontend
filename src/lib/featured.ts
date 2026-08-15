import { apiBase } from "./story";

/**
 * The studio's Featured Collection block, as published from the admin.
 *
 * Two home sections read it — the Collection editorial band and the Featured
 * carousel — so it is fetched once on the server in `app/page.tsx` and passed
 * down, rather than each section opening its own request for the same document.
 *
 * The block is CATEGORY-based: each card is a doorway into one category's
 * listing, not a product. See `FeaturedCard`.
 */
/**
 * One card in the rail — a named group of pieces the studio composed by hand.
 *
 * Selecting a card shows its `products` together beneath the rail. They arrive
 * populated and in the studio's chosen order.
 *
 * `image`, `title` and `subtitle` are per-card overrides; left empty each falls
 * back to the FIRST piece's photograph, name and category. `badge` is the
 * studio's own label for the group and is never derived from a category.
 */
export interface FeaturedCardProduct {
  _id: string;
  name: string;
  category: string;
  images: string[];
  variants?: { size?: string; price?: number; oldPrice?: number; images?: string[] }[];
}

export interface FeaturedCard {
  /** Stable across reordering and retitling — this card's listing page. */
  _id: string;
  products: FeaturedCardProduct[];
  image: string;
  badge: string;
  title: string;
  subtitle: string;
}

/** Where a card's listing lives. One definition, so the rail and the page agree. */
export const featuredHref = (cardId: string) => `/collections/${cardId}`;

export interface FeaturedCollection {
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  isVisible: boolean;
  cards: FeaturedCard[];
}

export const FEATURED_FALLBACK: FeaturedCollection = {
  eyebrow: "Featured",
  heading: "Featured collections",
  description:
    "Discover our signature pieces, thoughtfully selected to bring comfort, character, and luxury to your space.",
  ctaLabel: "View full catalog",
  ctaHref: "/products",
  isVisible: true,
  cards: [],
};

/**
 * Never rejects. A homepage band is an enhancement: an unreachable backend
 * should collapse the section, not take the page down with it. `null` means the
 * request failed — distinct from a document with no products, which is an empty
 * state the sections render deliberately.
 */
export async function fetchFeaturedCollection(): Promise<FeaturedCollection | null> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/featured-collection`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json.data) return null;
    return { ...FEATURED_FALLBACK, ...json.data } as FeaturedCollection;
  } catch {
    return null;
  }
}
