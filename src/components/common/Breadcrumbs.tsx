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
  products: "The Edit",
  "the-edit": "The Edit",
  "the-moment": "The Moment",
  about: "About Us",
  contact: "Contact",
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

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-x-2 gap-y-1 font-sans text-[11px] tracking-[0.12em] text-faint ${className}`}
    >
      <Link href="/" className={linkClass}>
        Home
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-2 min-w-0">
          <span aria-hidden className="text-faint/60">
            /
          </span>
          {crumb.isLast ? (
            <span aria-current="page" className="text-muted truncate max-w-[60vw] sm:max-w-none">
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
