"use client";

import Link from "next/link";
import Reveal from "../../../components/ui/Reveal";
import { cldOptimize } from "../../../lib/image";
import { useCategories } from "../../../lib/categories";

/**
 * The uniform category grid on /the-edit.
 *
 * This page used to hardcode the same four "life modes" as the home page, with
 * no photography at all — every tile rendered the placeholder gradient. It now
 * reads the studio's live categories, so the two surfaces can't disagree.
 *
 * A client component because the rest of the storefront fetches from the API in
 * the browser; the page around it stays a server component.
 */
export default function CategoryTiles() {
  const categories = useCategories();

  if (categories !== null && categories.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {categories === null
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="img-placeholder h-[320px] lg:h-[380px] w-full" />
          ))
        : categories.map((category, i) => (
            <Reveal key={category.id} delay={(i % 4) * 0.08} scaleFrom={0.96}>
              <Link
                href={`/products?category=${category.id}`}
                aria-label={`Shop ${category.name}`}
                className="group relative block h-[320px] lg:h-[380px] overflow-hidden bg-sand"
              >
                {category.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cldOptimize(category.image, 900)}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="absolute inset-0 img-placeholder transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-ink/5 to-transparent transition-opacity duration-500 group-hover:from-ink/55" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-7">
                  <span className="eyebrow text-ivory/80 mb-2">Life Mode</span>
                  <span className="font-display text-2xl lg:text-3xl text-ivory">
                    {category.name}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
    </div>
  );
}
