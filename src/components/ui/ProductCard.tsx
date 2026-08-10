"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { cldOptimize } from "../../lib/image";
import {
  type Product,
  fromPrice,
  fromOldPrice,
  productImagePool,
  garmentLabel,
  formatINR,
  productTags,
} from "../../lib/product";

/**
 * A piece, as a card.
 *
 * The frame is a filled, rounded panel: photograph on top, details in a padded
 * block beneath, badges pinned to the image's top-left corner.
 *
 * `surface-light` is what lets one component serve both grids. The Featured
 * band is `bg-black` (`surface-dark`), which re-points `ink`/`muted` to their
 * light values for everything inside it — on a cream card that would be white
 * on white. Declaring `surface-light` restores the page scale for the card's
 * own subtree, so the card reads identically on the ivory shop grid and on the
 * black band without being told which one it is on.
 */
export default function ProductCard({
  product,
  className = "",
  imageRatio = "aspect-[3/4]",
}: {
  product: Product;
  className?: string;
  imageRatio?: string;
}) {
  const pool = productImagePool(product);
  const price = fromPrice(product);
  const oldPrice = fromOldPrice(product);
  const garment = garmentLabel(product);
  const tags = productTags(product);

  // Derived from the two prices the piece already carries — not new content.
  const discount =
    oldPrice && price > 0 ? Math.round((1 - price / oldPrice) * 100) : 0;

  // Only shown once a piece has actually been reviewed: five empty stars and a
  // "(0)" on every new piece reads as a broken widget, not as "no reviews yet".
  const reviews = product.reviewsCount ?? 0;
  const rating = Math.round(product.starRating ?? 0);

  // Walk the pool rather than trusting its first entry.
  //
  // A dead URL used to cost the card its photograph entirely: the studio's free
  // -text URL field lets a non-image (or a URL that simply 404s) sit at index 0,
  // ahead of every real upload, so a piece with four good photographs still
  // rendered the placeholder. Each failure now advances to the next candidate;
  // only a pool where everything fails falls back to the placeholder.
  const [failed, setFailed] = useState<string[]>([]);
  const live = pool.filter((src: string) => !failed.includes(src));
  const markFailed = (src: string) =>
    setFailed((prev) => (prev.includes(src) ? prev : [...prev, src]));

  const primary = live[0];
  const secondary = live[1];
  const hasPrimary = !!primary;
  const hasSecondary = !!secondary;

  return (
    <Link
      href={`/products/${product._id}`}
      className={`surface-light group flex h-full flex-col overflow-hidden rounded-2xl bg-cream transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)] ${className}`}
    >
      <div className={`relative overflow-hidden bg-sand ${imageRatio}`}>
        {hasPrimary ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cldOptimize(primary!, 800)}
              alt={product.name}
              loading="lazy"
              onError={() => markFailed(primary!)}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] ${
                hasSecondary ? "group-hover:opacity-0" : ""
              }`}
            />
            {hasSecondary && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cldOptimize(secondary!, 800)}
                alt=""
                aria-hidden
                loading="lazy"
                onError={() => markFailed(secondary!)}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="img-placeholder absolute inset-0 flex items-center justify-center">
            <span className="font-display uppercase tracking-[0.35em] text-xs text-ink/25 pl-[0.35em]">
              BELOVI
            </span>
          </div>
        )}

        {(discount > 0 || tags.length > 0) && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {discount > 0 && (
              <span className="rounded-full bg-forest px-2.5 py-1.5 font-sans text-[10px] uppercase leading-none tracking-[0.08em] text-ivory">
                −{discount}%
              </span>
            )}
            {tags.map((t, i) => (
              <span
                key={i}
                className={`rounded-full px-2.5 py-1.5 font-sans text-[10px] uppercase leading-none tracking-[0.08em] ${
                  t.limited ? "bg-[#8B7355] text-ivory" : "bg-ink text-cream"
                }`}
              >
                {t.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sized for a six-up row: at a 1500px container six cards are ~205px
          wide, so the details block runs a compact scale. `flex-1` keeps every
          card in a row ending at the same height when one name wraps to two
          lines and its neighbour does not. */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* bronze-deep, not bronze: the rose-gold detail tone is 3.6:1 on cream,
            below AA at this size. */}
        <h3 className="font-display text-[14px] sm:text-[15px] leading-snug text-ink transition-colors group-hover:text-bronze-deep">
          {product.name}
        </h3>
        {garment && (
          <p className="mt-0.5 font-sans text-[11px] text-muted truncate">{garment}</p>
        )}

        <p className="mt-1.5 flex items-baseline gap-1.5 font-sans text-[14px] font-medium text-ink">
          {price > 0 ? formatINR(price) : "Enquire"}
          {oldPrice && (
            <span className="text-[12px] font-normal text-muted line-through">
              {formatINR(oldPrice)}
            </span>
          )}
        </p>

        {reviews > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <span className="flex items-center gap-px" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={
                    i < rating ? "fill-bronze text-bronze" : "fill-none text-line-strong"
                  }
                />
              ))}
            </span>
            <span className="font-sans text-[11px] text-muted">
              ({reviews})
              <span className="sr-only"> — rated {rating} out of 5</span>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
