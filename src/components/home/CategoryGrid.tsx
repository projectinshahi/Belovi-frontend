"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "../ui/Reveal";
import { cldOptimize } from "../../lib/image";
import { useCategories, type StoreCategory } from "../../lib/categories";

/**
 * One card: a rounded image frame with the label panel inset over its foot.
 *
 * A single `aspect-[4/5]` at every breakpoint — the tile used to switch
 * square → 4:5 → square, so a card changed shape twice on the way down and the
 * row never read as one set. 4:5 is the ratio ProductCard already uses, so the
 * homepage and the shop crop their photography identically.
 */
function Tile({ category, index }: { category: StoreCategory; index: number }) {
  return (
    <Reveal delay={(index % 6) * 0.06} scaleFrom={0.96} className="col-span-1">
      <Link
        href={`/products?category=${category.id}`}
        aria-label={`Shop ${category.name}`}
        className="group block"
      >
        <div className="relative overflow-hidden rounded-2xl bg-sand aspect-[4/5]">
          {category.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cldOptimize(category.image, 800)}
              alt={category.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 img-placeholder transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />
          )}

          {/* Label panel, inset so the photograph frames it on all four sides.
              Opaque rather than tinted: over an unknown photograph a translucent
              panel cannot promise the 4.5:1 the type needs. */}
          <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 rounded-xl bg-cream px-3 py-2.5 sm:px-4 sm:py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="font-display text-[14px] sm:text-[16px] leading-tight text-ink truncate">
              {category.name}
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-muted">
                Shop Now
              </span>
              <ArrowRight
                size={14}
                aria-hidden
                className="shrink-0 text-ink transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
              />
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

/** Same frame and panel geometry as `Tile`, so nothing shifts when it resolves. */
function TileSkeleton() {
  return (
    <div className="col-span-1">
      <div className="relative overflow-hidden rounded-2xl img-placeholder aspect-[4/5] w-full">
        <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 rounded-xl bg-cream px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="h-3.5 w-2/3 bg-sand rounded" />
          <div className="mt-2 h-2.5 w-1/3 bg-sand rounded" />
        </div>
      </div>
    </div>
  );
}

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  ""
);

const SECTION_DEFAULTS = {
  eyebrow: "The Edit",
  heading: "Find your way in.",
  shopLabel: "Shop All",
  shopHref: "/products",
};

export default function CategoryGrid() {
  const categories = useCategories();
  const [section, setSection] = useState(SECTION_DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    // Editable section copy — falls back to the defaults on any failure.
    fetch(`${API_ORIGIN}/api/v1/category-section`)
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled && j?.data) setSection({ ...SECTION_DEFAULTS, ...j.data });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing published yet (or the request failed): drop the section rather than
  // leave a heading standing over an empty grid. The id stays mounted so the
  // "The Edit" nav link still has something to scroll to.
  if (categories !== null && categories.length === 0) {
    return <section id="the-edit" aria-hidden className="bg-ivory" />;
  }

  return (
    <section id="the-edit" className="bg-ivory">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow text-bronze-deep mb-4">{section.eyebrow}</p>
            <h2 className="font-display font-light leading-[1.08] text-[clamp(2rem,4.5vw,3.5rem)] text-black max-w-2xl">
              {section.heading}
            </h2>
          </div>
          <Link
            href={section.shopHref || "/products"}
            className="eyebrow text-black link-underline self-start sm:self-auto shrink-0"
          >
            {section.shopLabel} →
          </Link>
        </div>

        {/* One horizontal band of cards: 2 up on phones, 3 on tablets, 6 across
            on desktop. The gap is uniform in both axes, so a set that wraps (the
            studio can publish up to 8) keeps the same rhythm between rows as
            between columns rather than opening a wider trough. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {categories === null
            ? Array.from({ length: 6 }).map((_, i) => <TileSkeleton key={i} />)
            : categories.map((category, i) => (
                <Tile key={category.id} category={category} index={i} />
              ))}
        </div>
      </div>
    </section>
  );
}
