"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Reveal from "../ui/Reveal";
import { ButtonLink } from "../ui/Button";
import ProductCard from "../ui/ProductCard";
import { type Product } from "../../lib/product";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

interface FeaturedCollectionData {
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  isVisible: boolean;
  products: Product[];
  images: string[];
}

const FALLBACK: FeaturedCollectionData = {
  eyebrow: "Featured",
  heading: "Featured Collection",
  description: "",
  ctaLabel: "View All Pieces",
  ctaHref: "/products",
  isVisible: true,
  products: [],
  images: [],
};

/** 6 across × 2 rows — one page of the grid on desktop. */
const PAGE_SIZE = 12;

export default function ProductArchive() {
  const [products, setProducts] = useState<Product[]>([]);
  const [seasonal, setSeasonal] = useState<FeaturedCollectionData>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    axios.get(`${API_BASE}/api/v1/featured-collection`)
      .then((r) => {
        const data = r.data?.data as FeaturedCollectionData;
        if (data) {
          setSeasonal(data);
          setProducts(data.products || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // The band is a fixed 2 × 6 grid rather than a scroller, so the arrows page
  // through the collection 12 at a time instead of nudging a scroll offset —
  // the studio can still feature more than twelve pieces and all of them stay
  // reachable. With 12 or fewer there is nothing to page to, so they're hidden.
  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = products.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  if (!seasonal.isVisible && !loading) return null;

  return (
    /* Solid black — the same `bg-black` (#000) as ProvenanceStrip, so the two
       dark bands are byte-identical rather than near-misses. Was `bg-tan`
       (#2D2D2D).

       `surface-dark` re-points the type scale for everything inside: the
       heading, the description, the arrows and each ProductCard's own title and
       tags all invert to their light values without knowing they are on black.
       Ratios are documented on the class in globals.css. */
    <section id="featured-collection" className="bg-black surface-dark">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <Reveal>
            {/* Reads `bronze-deep` like every other eyebrow on the site;
                `surface-dark` resolves it to the rose-gold (5.5:1 here) because
                the brand red is only 3.4:1 on black. */}
            <p className="eyebrow text-bronze-deep mb-4">{seasonal.eyebrow}</p>
            <h2 className="font-display font-light leading-[1.08] text-[clamp(2rem,4.5vw,3.5rem)] text-ink max-w-2xl">
              {seasonal.heading}
            </h2>
            {seasonal.description && (
              <p className="font-sans text-[15px] leading-[1.85] text-muted max-w-xl mt-5">
                {seasonal.description}
              </p>
            )}
          </Reveal>
          {/* `border-ink/25` was 2.0:1 on black — under the 3:1 a control
              boundary needs; /45 is 4.2:1. The hover was `bg-ink text-ivory`,
              i.e. #F8F7F5 on #F8F7F5 — the glyph vanished on hover. It now
              inverts to `text-background`, which `surface-dark` flips to #000,
              so the arrow goes black-on-ivory. Same idiom as the outline Button. */}
          <div className="flex items-center gap-6 shrink-0">
            {pageCount > 1 && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  aria-label="Previous pieces"
                  className="w-11 h-11 border border-ink/45 flex items-center justify-center text-ink transition-colors hover:bg-ink hover:text-background disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink"
                >
                  ←
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={currentPage >= pageCount - 1}
                  aria-label="More pieces"
                  className="w-11 h-11 border border-ink/45 flex items-center justify-center text-ink transition-colors hover:bg-ink hover:text-background disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink"
                >
                  →
                </button>
              </div>
            )}
            <ButtonLink href={seasonal.ctaHref || "/products"} variant="outline" size="sm" arrow={false}>
              {seasonal.ctaLabel || "View All Pieces"}
            </ButtonLink>
          </div>
        </div>

        {/* 2 × 6 grid.
            6 across from `lg`, so a full page is two rows. Narrower viewports
            keep the same cards and gap and simply take fewer per row — 2 up on
            phones, 3 on tablets, 4 on small laptops — so a page of twelve stays
            whole at every width instead of being clipped by a scroller. */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              // Mirrors the card's frame — filled, rounded, `surface-light` — so
              // the grid doesn't change shape when the pieces arrive.
              <div
                key={i}
                className="surface-light overflow-hidden rounded-2xl bg-cream"
              >
                <div className="aspect-[3/4] img-placeholder animate-pulse" />
                <div className="p-3 sm:p-4">
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-sand" />
                  <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-sand" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="font-sans text-muted text-sm">
            Pieces from the collection will appear here soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {visible.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
