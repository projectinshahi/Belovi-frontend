"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Reveal from "../ui/Reveal";
import ProductCard from "../ui/ProductCard";
import { ButtonLink } from "../ui/Button";
import MagneticCta from "../ui/MagneticCta";
import { EmptyState, ErrorState, SkeletonGrid } from "../ui/States";
import { useCategories } from "../../lib/categories";
import type { Product } from "../../lib/product";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  ""
);

/**
 * Categories — the black showroom band, where white cards are spotlit against
 * the brand's own darkness.
 *
 * THE PILLS ARE THE STUDIO'S CATEGORIES, live from Category Management — not a
 * list in this file. They used to be hardcoded, which is why a category added in
 * the admin never showed up here: this section was reading a constant while the
 * admin was writing to the database. Adding, renaming, deactivating or deleting
 * one in the admin now changes this section on the next load, with no deploy.
 *
 * "All Products" is dropped when present: it is a filing option in the admin
 * rather than a browsing one, and offering it beside the real categories reads
 * as "everything" when it is actually its own bucket.
 *
 * Filtering is client-side over one catalogue request, so switching is instant
 * and costs no round trip. The grid shows four; the pills are a taster and the
 * catalogue CTA is the way through to the rest.
 */
const VISIBLE = 4;

/**
 * The design's own showcase pieces, in code rather than in the database.
 *
 * These four are art direction — they have to render on any machine and any
 * database, including a fresh one, which seeded products cannot promise. They
 * lead the Luxury Furniture pill and are shaped as `Product` so the same card
 * component draws them; `href` sends them to the shop, since there is no detail
 * page behind a card that is not a catalogue row.
 *
 * Only Luxury Furniture has a showcase. Repeating these chairs under Wellness or
 * Accessories would file them under categories they do not belong to.
 */
const SHOWCASE: Record<string, Product[]> = {
  "Luxury Furniture": [
    ["Premium Black Leather Tantra", "/images/Component 1.png", 100],
    ["Soft Couch with head pillow Tantra", "/images/Component 2.png", 200],
    ["Premium Convertible cushion Tantra", "/images/Component 3.png", 250],
    ["Red Tandra Chaise Premium Stylish Couch", "/images/Component 4.png", 100],
  ].map(([name, image, price]) => ({
    _id: `showcase-${image}`,
    name: name as string,
    category: "Luxury Furniture",
    images: [image as string],
    variants: [{ size: "Standard", price: price as number }],
    starRating: 3.5,
  })) as Product[],
};

export default function CategoryGrid() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [failed, setFailed] = useState(false);
  /** `null` until a pill is clicked — the first live category leads until then,
   *  so there is no state to reconcile when the categories arrive. */
  const [picked, setPicked] = useState<string | null>(null);
  const reduce = useReducedMotion();

  /* The studio's categories, live. `null` while loading — distinct from "none
     created", which hides the section entirely further down. */
  const categories = useCategories();
  const pills = (categories ?? []).map((c) => c.name);

  /* A pill the studio has since removed must not keep the grid pointed at a
     category that no longer exists. */
  const active = picked && pills.includes(picked) ? picked : pills[0];

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const res = await fetch(`${API_BASE}/api/v1/products`, { cache: "no-store" });
      const json = await res.json();
      if (!json?.success || !Array.isArray(json.data)) throw new Error("bad payload");
      setProducts(json.data as Product[]);
    } catch {
      setFailed(true);
      setProducts(null);
    }
  }, []);

  useEffect(() => {
    // Fetching on mount is the external-system sync effects exist for; the
    // compiler can't see that every setState in `load` lands after an await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Showcase first, then whatever the studio has filed under this category.
  // `active` is undefined until the categories land, which matches nothing.
  // Plain derivation: the React Compiler memoises this, and a manual useMemo
  // over a value derived from the fetched list is one it has to bail out on.
  const shown = active
    ? [
        ...(SHOWCASE[active] ?? []),
        ...(products ?? []).filter((p) => p.category === active),
      ].slice(0, VISIBLE)
    : [];

  // Only a genuinely empty grid waits. The showcase is local, so a category it
  // covers paints immediately instead of flashing skeletons for a request whose
  // result it does not need.
  const loading = (categories === null || products === null) && !failed && shown.length === 0;

  /* No categories saved means no section — a black band headed "Categories"
     with an empty rail under it is worse than no band at all. `null` is still
     loading and must not trip this. Same rule /the-edit's tiles follow. */
  if (categories !== null && pills.length === 0) return null;

  return (
    /* Full-bleed: the panel runs to both viewport edges rather than sitting in
       an ivory gutter, so the black reads as the page rather than as a card on
       it. The radius stays on all four corners — the thin ivory band above and
       below is what lets the curve show. Losing the outer inset also hands the
       grid ~180px of width back, which is where the roomier cards come from. */
    <section id="categories" className="bg-ivory py-3 sm:py-6">
      <div className="surface-dark w-full rounded-[24px] bg-onyx px-5 py-10 sm:rounded-[48px] sm:px-10 sm:py-12 lg:px-[clamp(2.5rem,5vw,5rem)] lg:py-[56px]">
        <div className="mx-auto max-w-[1720px]">
        <Reveal>
          <h2 className="display-section text-ink">Categories</h2>
          <p className="mt-3 max-w-[52ch] text-body text-muted">
            Explore comfort designed for every kind of moment.
          </p>
        </Reveal>

        {/* Filter bar. Scrolls horizontally on narrow screens rather than
            wrapping to a second row, which would shift the grid down. */}
        <Reveal delay={0.08}>
          <div
            role="tablist"
            aria-label="Product categories"
            className="hide-scrollbar mt-6 -mr-5 flex gap-3 overflow-x-auto pb-1 pr-5 sm:mt-8 sm:flex-wrap sm:gap-4 sm:overflow-visible sm:pr-0"
          >
            {pills.map((pill) => {
              const isActive = pill === active;
              return (
                <button
                  key={pill}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setPicked(pill)}
                  className={`relative shrink-0 rounded-full px-6 py-3.5 font-sans text-[15px] font-medium
                    transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-7 sm:text-[16px] ${
                      isActive
                        ? "text-white"
                        : "border border-white/35 text-white hover:border-white/70 hover:bg-white/5"
                    }`}
                >
                  {/* The coral fill is one shared element that flies between
                      pills — framer matches it by layoutId and interpolates the
                      box, which is the morph the brief describes.

                      Layered with z-0/z-10 rather than a negative index: the
                      surrounding Reveal is a transformed element, so it opens a
                      stacking context and a `-z-10` child disappears behind it
                      entirely. */}
                  {isActive && (
                    <motion.span
                      layoutId="category-pill"
                      aria-hidden
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 34 }
                      }
                      className="absolute inset-0 z-0 rounded-full bg-brand"
                    />
                  )}
                  <span className="relative z-10">{pill}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-6 sm:mt-8">
          {loading ? (
            <SkeletonGrid count={VISIBLE} imageRatio="aspect-[16/10] sm:aspect-[4/3]" />
          ) : failed ? (
            <ErrorState message="We couldn’t load the collection just now." onRetry={load} />
          ) : shown.length === 0 ? (
            <EmptyState
              title="Nothing here yet"
              message={`No pieces are filed under ${active} at the moment. Try another category, or browse the full catalogue.`}
              action={
                <ButtonLink href="/products" variant="solid" size="sm">
                  Browse everything
                </ButtonLink>
              }
            />
          ) : (
            /* CSS entrance rather than framer: a motion element server-renders
               at opacity:0 and stays invisible until hydration, which blanked
               this whole grid during development. The keyframe is neutralised by
               the reduced-motion query in globals.css, and `key` on the wrapper
               restarts the cascade when the category changes. */
            /* A horizontal RAIL, not a grid. The grid stacked one card per row
               below 420px and two below `lg`, so a phone met the category as a
               tall column it had to scroll past. The pieces now sit on one line
               and scroll sideways at every width.

               Native `overflow-x-auto` with scroll-snap does the work: it keeps
               momentum, touch dragging, trackpad gestures and keyboard scrolling
               for free, and costs no dependency and no state. `hide-scrollbar`
               is the same class the Featured rail uses, so the two read alike.

               Card widths are set so the row lands on whole cards — a peek of
               the next one on a phone, which is what signals it scrolls — and so
               four fill the row exactly at `lg`, preserving the four-up look the
               section already had. */
            <div
              key={active}
              role="region"
              aria-label={`${active} pieces`}
              tabIndex={0}
              className="hide-scrollbar -mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto
                scroll-smooth px-1 pb-2 lg:gap-6"
            >
              {shown.map((p, i) => (
                <div
                  key={p._id}
                  className="w-[78vw] shrink-0 snap-start animate-[heroRise_0.7s_cubic-bezier(0.16,1,0.3,1)_both]
                    min-[420px]:w-[46vw] sm:w-[44vw] md:w-[30vw]
                    lg:w-[calc((100%-4.5rem)/4)]"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <ProductCard
                    product={p}
                    imageRatio="aspect-[16/10] sm:aspect-[4/3]"
                    href={p._id.startsWith("showcase-") ? "/products" : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <Reveal delay={0.12}>
          <div className="mt-9 flex flex-col items-center gap-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center font-sans text-[16px] text-muted sm:text-left">
              Explore 1,000+ pieces crafted for timeless luxury.
            </p>
            <MagneticCta
              href="/products"
              label="View full catalog"
              variant="pill"
              disabled={!!reduce}
              className="w-full sm:w-auto"
            />
          </div>
        </Reveal>
        </div>
      </div>
    </section>
  );
}
