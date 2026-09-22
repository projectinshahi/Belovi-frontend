"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cldOptimize } from "../../lib/image";
import { useCart } from "../../context/CartContext";
import { isSignedIn, signInHref } from "../../lib/auth";
import {
  type Product,
  fromPrice,
  fromOldPrice,
  productImagePool,
  formatINR,
  productTags,
  isInStock,
} from "../../lib/product";

/**
 * A piece, as a card — the Categories grid card, reused by the shop and
 * collection grids so the catalogue reads as one system.
 *
 * STRUCTURE. The card is a plain element, not an anchor: it holds a real
 * <button> (add to bag), and a button inside an anchor is invalid HTML that
 * browsers resolve unpredictably. Instead the title carries the link and
 * stretches over the whole card via `after:absolute after:inset-0`, so the card
 * is entirely clickable while the cart button — raised on z-10 — stays its own
 * control.
 *
 * `surface-light` restores the page's type scale for the card's own subtree, so
 * one component reads correctly on the black Categories band and on the ivory
 * shop grid without being told which it is on.
 */
export default function ProductCard({
  product,
  className = "",
  imageRatio = "aspect-square",
  href,
}: {
  product: Product;
  className?: string;
  imageRatio?: string;
  /**
   * Overrides the detail-page link. Used by the homepage showcase cards, which
   * are art direction rather than catalogue rows and so have no detail page of
   * their own — they lead to the shop instead. Quick-add is disabled with it,
   * because there is no real piece behind the card to add.
   */
  href?: string;
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const reduce = useReducedMotion();

  const [failed, setFailed] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const own = productImagePool(product).filter((s) => !failed.includes(s));
  /* The piece's own photography, and nothing else. A card used to accept an
     `imageOverride` that REPLACED the pool — the collection grid passed one of
     the design's stock shots, so a studio upload was rendered invisible on that
     page no matter what was in the database. */
  const pool = own;
  const price = fromPrice(product);
  const oldPrice = fromOldPrice(product);
  const tags = productTags(product);
  const inStock = isInStock(product.status);
  const primary = pool[0];
  const secondary = pool[1];

  /**
   * Ratings render only when the piece actually carries one. Five hollow stars
   * and a "0" on every new product reads as a broken widget rather than as "not
   * yet reviewed", and inventing a number would put a fake rating in front of a
   * customer.
   */
  const rating = product.starRating ?? 0;
  const hasRating = rating > 0;

  const variants = product.variants || [];

  /**
   * Quick-add, but only when the piece has exactly one variant.
   *
   * With several, there is no way to know which size or colourway the customer
   * wants, and silently taking the first is how somebody receives the wrong one.
   * Those go to the detail page to choose — the same place the "Add to Cart"
   * there already lives. Sign-in is required either way, matching the detail
   * page rather than inventing a second rule for the same action.
   */
  const target = href ?? `/products/${product._id}`;
  const canQuickAdd = !href && variants.length === 1 && price > 0 && inStock;

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;

    if (!canQuickAdd) {
      router.push(target);
      return;
    }
    if (!isSignedIn()) {
      router.push(signInHref(target));
      return;
    }

    setAdding(true);
    try {
      await addToCart({
        id: product._id,
        name: product.name,
        image: primary ?? "",
        price,
        currency: "₹",
        size: variants[0]?.size,
        color: variants[0]?.color,
        quantity: 1,
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    } catch {
      // The bag is the source of truth and it rejected the line; the detail page
      // gives the customer somewhere to retry with full context.
      router.push(target);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className={`surface-light group relative flex h-full flex-col rounded-[20px] bg-cream p-3
        transition-[transform,box-shadow] duration-[350ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
        hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(0,0,0,0.18)] sm:rounded-[24px] sm:p-4 ${className}`}
    >
      {/* Image area. Figma insets the photograph inside the card rather than
          bleeding it to the edge — the white margin is what makes the piece read
          as mounted rather than cropped, and it is the single biggest difference
          between this card and the one it replaces. */}
      <div className={`relative overflow-hidden rounded-[12px] bg-ivory sm:rounded-[16px] ${imageRatio}`}>
        {primary ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cldOptimize(primary, 800)}
              alt={product.name}
              loading="lazy"
              onError={() => setFailed((p) => [...p, primary])}
              className={`absolute inset-0 h-full w-full object-cover transition-transform
                duration-[700ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105
                ${secondary ? "group-hover:opacity-0" : ""}`}
            />
            {secondary && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cldOptimize(secondary, 800)}
                alt=""
                aria-hidden
                loading="lazy"
                onError={() => setFailed((p) => [...p, secondary])}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[700ms] group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="img-placeholder absolute inset-0 grid place-items-center">
            <span className="font-display text-xs uppercase tracking-[0.35em] text-ink/25 pl-[0.35em]">
              BELOVI
            </span>
          </div>
        )}

        {/* Out of stock is flagged on the card, not just on the detail page —
            otherwise the first a shopper knows of it is a dead button after a
            click. Top-right so it never collides with the offer/limited chips. */}
        {!inStock && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 font-sans text-[11px] leading-tight text-white backdrop-blur-sm">
            Out of Stock
          </span>
        )}

        {tags.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {/* The studio's own status badge — whatever it typed into "Status
                Badge" in the admin — is green. `#2e7d32` is the green the In
                Stock pill already uses, so the site keeps one green rather than
                gaining a second; solid with white type, exactly the treatment
                the badge already had, because a pale fill at 11px does not hold
                up over an uncontrolled photograph.

                "LIMITED PIECE" keeps its own near-black treatment: it is not the
                status badge, it comes from the `limited` flag rather than from
                that field, and the two must stay tellable apart when a piece
                carries both. */}
            {tags.map((t, i) => (
              <span
                key={i}
                className={`rounded-full px-2.5 py-1 font-sans text-[11px] leading-tight ${
                  t.limited ? "bg-ink text-white" : "bg-[#2e7d32] text-white"
                }`}
              >
                {t.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Floating cart control, straddling the foot of the image tile. Figma
          overlaps it by 28px on a 518px card; `-mt-7` is that at this scale. No
          white ring — the card's own inset margin already separates it from the
          photograph, so the ring was doing a job that no longer exists. */}
      <div className="relative z-10 -mt-6 flex justify-center sm:-mt-7">
        <motion.button
          type="button"
          onClick={handleCartClick}
          whileTap={reduce ? undefined : { scale: 0.9 }}
          aria-label={
            canQuickAdd
              ? `Add ${product.name} to cart`
              : `Choose options for ${product.name}`
          }
          className="relative grid h-12 w-12 place-items-center rounded-full bg-ink text-white
            shadow-[0_6px_20px_rgba(0,0,0,0.28)]
            transition-[background-color,transform,box-shadow] duration-[250ms] ease-out
            hover:scale-110 hover:bg-brand hover:shadow-[0_8px_24px_rgba(211,47,47,0.45)] sm:h-[52px] sm:w-[52px]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <circle cx="9" cy="20" r="1.3" />
            <circle cx="18" cy="20" r="1.3" />
            <path d="M2 3h2.6l2.2 11.2a1.6 1.6 0 0 0 1.6 1.3h8.5a1.6 1.6 0 0 0 1.6-1.3L21 7H5.2" />
          </svg>

          {/* Confirmation, floating up and away. */}
          <AnimatePresence>
            {justAdded && (
              <motion.span
                initial={{ opacity: 0, y: 0, scale: 0.8 }}
                animate={{ opacity: 1, y: -26, scale: 1 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-none absolute font-sans text-[13px] font-semibold text-brand"
              >
                +1
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3.5">
        {/* The stretched link: covers the card without wrapping the button. */}
        <h3 className="min-h-[48px] font-sans text-[16px] font-medium leading-[1.35] text-muted transition-colors duration-300 group-hover:text-ink sm:text-[19px] lg:text-[22px]">
          <Link href={target} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>

        <div className="mt-3.5 flex items-center justify-between gap-3">
          <span className="font-sans text-[18px] font-medium text-ink sm:text-[21px] lg:text-[24px]">
            {price > 0 ? formatINR(price) : "Enquire"}
          </span>

          {hasRating ? (
            <span
              className="flex items-center gap-1.5"
              aria-label={`Rated ${rating} out of 5 stars`}
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-star text-star">
                <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2l-5-4.9 6.9-1z" />
              </svg>
              <span className="font-sans text-[14px] text-faint">{rating}</span>
            </span>
          ) : (
            oldPrice && (
              <span className="font-sans text-[14px] text-faint line-through">
                {formatINR(oldPrice)}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
