import { apiBase } from "./story";

/** The homepage Collection band (directly below the hero), as saved in the studio. */
export interface CollectionSection {
  heading: string;
  description: string;
  /** The lifestyle image on the left. */
  mainImage: string;
  /**
   * The scrolling row. Each is a product cut-out; the band adds the white plate.
   * `product` is the linked piece (null when unlinked, or once it is deleted).
   */
  images: {
    _id?: string;
    image: string;
    alt: string;
    product?: { _id: string; name: string } | null;
  }[];
}

/**
 * What the band shows if the studio cannot be reached. Mirrors
 * `COLLECTION_DEFAULTS` in the backend, which is what the API itself returns
 * until the section is first saved.
 */
export const COLLECTION_FALLBACK: CollectionSection = {
  heading: "Collection",
  description:
    "Tantra Chair a sculptural statement piece designed to bring comfort, elegance, and versatility into your space. Its distinctive curves provide a supportive, relaxing form while adding a bold contemporary touch to any interior. Crafted for both visual appeal and everyday comfort, the Tantra Chair turns every moment of sitting into a refined experience.",
  mainImage: "/images/Component 6.png",
  images: [
    { image: "/images/collection/tantra-off-white.png", alt: "Tantra Chair in off-white" },
    { image: "/images/collection/tantra-magenta.png", alt: "Tantra Chair in magenta" },
    { image: "/images/collection/tantra-tangerine.png", alt: "Tantra Chair in tangerine" },
  ],
};

/** Never rejects: an unreachable backend falls back to the shipped content. */
export async function fetchCollectionSection(): Promise<CollectionSection> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/collection-section`, { cache: "no-store" });
    if (!res.ok) return COLLECTION_FALLBACK;
    const json = await res.json();
    const d = json?.success ? json.data : null;
    if (!d?.heading || !d?.mainImage || !Array.isArray(d.images) || d.images.length === 0) {
      return COLLECTION_FALLBACK;
    }
    return d as CollectionSection;
  } catch {
    return COLLECTION_FALLBACK;
  }
}
