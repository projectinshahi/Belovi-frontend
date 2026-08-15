"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Breadcrumb trail, derived automatically from the current path.
 *
 * Standardises the three hand-rolled breadcrumbs the site had (product page,
 * bag, checkout) into one component, and extends the pattern everywhere. The
 * trail always opens with Home, so a visitor deep in the site has a route back.
 *
 * Design matches the product page's original: tracked 11px Inter, `faint`
 * links that darken on hover with the centre-out underline, a `muted` current
 * page. It wraps rather than overflowing on narrow screens.
 */

/**
 * Readable names for path segments. A segment not listed here is title-cased
 * from its slug (`size-guide` → "Size Guide"), so a new route still reads
 * sensibly without a code change; add an entry only to override that.
 */
const LABELS: Record<string, string> = {
  // "Collections" — matching the nav item and the Figma trail. The route stays
  // /products; only the name shown to the shopper changes.
  products: "Collections",
  "the-edit": "The Edit",
  "the-moment": "The Moment",
  about: "About Us",
  cart: "Bag",
  checkout: "Checkout",
  profile: "Account",
  "sign-in": "Sign In",
  register: "Register",
  "track-order": "Track Order",
  "size-guide": "Size Guide",
  "order-success": "Order Confirmed",
  "order-failure": "Order Failed",
  "terms-and-conditions": "Terms & Conditions",
  "privacy-policy": "Privacy Policy",
  "refund-cancellation": "Refund & Cancellation",
  "returns-exchanges": "Returns & Exchanges",
  "shipping-information": "Shipping Information",
  "shipping-policy": "Shipping Policy",
  within: "Within",
  beyond: "Beyond",
  "furniture": "BELOVI Man",
  archive: "Archive",
};

/**
 * Logical ancestors for routes whose URL is flat but whose place in the flow
 * has a parent. `/checkout` sits under the bag in the purchase funnel even
 * though its URL isn't `/cart/checkout`, so the trail reads Home / Bag /
 * Checkout. Keyed by the full pathname.
 */
const EXTRA_ANCESTORS: Record<string, { href: string; label: string }[]> = {
  "/checkout": [{ href: "/cart", label: "Bag" }],
};

function labelForSegment(segment: string): string {
  return (
    LABELS[segment] ??
    segment
      .split("-")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ")
  );
}

const linkClass =
  "link-underline transition-colors duration-300 hover:text-ink whitespace-nowrap";

export default function Breadcrumbs({
  /**
   * Overrides the last crumb's label — used where the slug isn't the display
   * name, e.g. a product page passing the product's name in place of its id.
   */
  currentLabel,
  className = "",
}: {
  currentLabel?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Home is the root; it's the crumb, not a page that needs one.
  if (segments.length === 0) return null;

  const derived = segments.map((segment, i) => ({
    href: "/" + segments.slice(0, i + 1).join("/"),
    label: labelForSegment(segment),
  }));

  // Prepend any logical ancestors (e.g. Bag before Checkout).
  const crumbs = [...(EXTRA_ANCESTORS[pathname] ?? []), ...derived].map(
    (crumb, i, all) => ({ ...crumb, isLast: i === all.length - 1 })
  );

  if (currentLabel) crumbs[crumbs.length - 1].label = currentLabel;

  // Figma sets the trail at body scale with a chevron separator and the current
  // page picked out in brand red — not the tracked 11px caps this used to be.
  // The red is the only colour on the row, so it reads as "you are here" rather
  // than as a link.
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-2 font-sans text-[14px] text-faint ${className}`}
    >
      <Link href="/" className={linkClass}>
        Home
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex min-w-0 items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="h-3 w-3 shrink-0 text-faint"
          >
            <path d="m9 5 7 7-7 7" />
          </svg>
          {crumb.isLast ? (
            <span
              aria-current="page"
              className="max-w-[60vw] truncate text-brand sm:max-w-none"
            >
              {crumb.label}
            </span>
          ) : (
            <Link href={crumb.href} className={linkClass}>
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
