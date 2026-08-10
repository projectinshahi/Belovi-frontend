import HeroSection from "../components/home/HeroSection";
import ProvenanceStrip from "../components/home/ProvenanceStrip";
import CategoryGrid from "../components/home/CategoryGrid";
import ProductArchive from "../components/home/ProductArchive";
import SearchBar from "../components/home/SearchBar";
import BrochureStrip from "../components/home/BrochureStrip";
import FoundersNote from "../components/home/FoundersNote";
import ContactCta from "../components/home/ContactCta";

export const dynamic = "force-dynamic";

/**
 * Single-page site. Home section order:
 *   1. Hero                 (HeroSection,    admin banners, bundled fallback)
 *   2. Provenance Strip     (service promises)                        · bg-black
 *   3. Category Nav         (CategoryGrid,   id="the-edit")           · bg-ivory
 *   4. Featured Collection  (ProductArchive, id="featured-collection")· bg-black
 *   5. Search               (SearchBar)                               · bg-ivory
 *   6. Brochures            (BrochureStrip,  id="brochures")          · bg-tan
 *   7. Founder's Note       (FoundersNote)                            · bg-ivory
 *   8. Contact / CTA        (ContactCta,     id="contact")            · bg-beige
 *   9. Footer (global, app/layout.tsx)
 *
 * Categories then Featured is the deliberate order: the grid poses the question
 * ("find your way in"), the carousel answers it with actual pieces. It also
 * keeps the bands alternating — Categories and Search are both ivory, so with
 * Featured between them each section still reads as its own band rather than one
 * long field of ivory with doubled padding in the middle.
 *
 * Featured is solid `bg-black`, the same value as ProvenanceStrip, so the page's
 * two black bands match exactly. It is not adjacent to the header: the navbar is
 * a floating ivory pill and Featured sits fourth, between two ivory sections.
 *
 * The Founder's Note sits between Brochures and Contact. It is the only place it
 * renders: its previous mount was the Story page, which is now a redirect to
 * /about, and that page no longer carries it — so the block the studio edits
 * under Founder's Note was live nowhere on the site. It also keeps the bands
 * alternating (tan · ivory · beige) rather than butting ivory against ivory,
 * and it reads well there — the house introduces itself, then invites contact.
 *
 * Nav (Shop · About) links out to /products and /about; the in-page anchors
 * (#the-edit, #featured-collection, #brochures, #contact) stay available.
 */
export default async function Home() {
  return (
    <main className="bg-ivory">
      <HeroSection />
      <ProvenanceStrip />
      <CategoryGrid />
      <ProductArchive />
      <SearchBar />
      <BrochureStrip />
      <FoundersNote />
      <ContactCta />
    </main>
  );
}
