import HeroSection from "../components/home/HeroSection";
import CollectionStrip from "../components/home/CollectionStrip";
import CategoryGrid from "../components/home/CategoryGrid";
import FeaturedCarousel from "../components/home/FeaturedCarousel";
import BrochureStrip from "../components/home/BrochureStrip";
import { fetchFeaturedCollection } from "../lib/featured";

export const dynamic = "force-dynamic";

/**
 * Home, rebuilt to the Figma frame (node 35:1113). Section order and their
 * surfaces, which alternate deliberately — every light band is framed by black:
 *
 *   1. Hero                (admin banners, bundled fallback)   · onyx
 *   2. Collection          (featured-collection)               · tan
 *   3. Categories          (catalogue, filtered client-side)   · onyx panel
 *   4. Featured collection (featured-collection)               · ivory
 *   5. Brochures           (published brochures)               · white panel on onyx
 *   6. Footer (global, app/layout.tsx)                          · onyx-soft
 *
 * The Collection band and the Featured rail read the same admin document, so it
 * is fetched once here on the server and handed to both. Two client components
 * each opening their own request for the same document is the thing this avoids;
 * everything else on the page loads itself, because each of those sections must
 * be able to fail alone without taking the page with it.
 */
export default async function Home() {
  const featured = await fetchFeaturedCollection();

  return (
    <main className="bg-ivory">
      <HeroSection />
      <CollectionStrip data={featured} />
      <CategoryGrid />
      <FeaturedCarousel data={featured} />
      <BrochureStrip />
    </main>
  );
}
