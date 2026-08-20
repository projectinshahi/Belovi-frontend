import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductBrowser from "../../../components/shop/ProductBrowser";
import { fetchFeaturedCollection, type FeaturedCard } from "../../../lib/featured";

/**
 * A Featured Collection's own listing.
 *
 * The homepage rail advertises the collections; this is where their pieces
 * actually live. The same <ProductBrowser> the shop and the four THE EDIT pages
 * use, scoped to the exact pieces the studio put in this card — so filtering,
 * sorting, pagination and the empty state all behave identically to the rest of
 * the catalogue rather than being reimplemented here.
 *
 * Keyed by the card's id rather than its position or title: the studio reorders
 * the rail and rewrites titles, and neither should break a link already shared.
 */

async function findCard(id: string): Promise<FeaturedCard | undefined> {
  const featured = await fetchFeaturedCollection();
  return (featured?.cards ?? []).find((c) => c._id === id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const card = await findCard(id);
  const title = card ? card.title || card.badge || "Collection" : "Collection";
  return {
    title: `${title} · BELOVI`,
    description: card?.subtitle || undefined,
  };
}

export default async function FeaturedCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await findCard(id);

  /* A deleted collection, a mistyped URL, or the studio being unreachable. The
     first two are by far the likeliest, and a 404 is honest about all three:
     this collection cannot be shown. */
  if (!card) notFound();

  return (
    <ProductBrowser
      scope={{
        sectionSlugs: [],
        modeSlugs: [],
        // The pieces the studio put in this card, in the order it put them.
        productIds: card.products.map((p) => p._id),
      }}
      heading={{
        eyebrow: card.badge || "Featured Collection",
        title: card.title || "Collection",
        description: card.subtitle || undefined,
      }}
      /* The URL ends in this card's id, so the trail would otherwise close on a
         raw ObjectId. Same fallback chain as the heading, so the crumb and the
         page title always agree. */
      breadcrumbLabel={card.title || card.badge || "Collection"}
    />
  );
}
