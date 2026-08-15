"use client";

import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes } from "react";

/**
 * The Figma CTA: a pill (r36) with the label on the left and a white circular
 * badge on the right holding a ↗ arrow. Three fills appear in the home frame —
 * brand red on black and on light, and white-on-light for the secondary action
 * in the Collection band.
 *
 * The variant NAMES are inherited from the previous button so the ~30 call
 * sites across the storefront keep working while the rest of the site is
 * rebuilt; only what they render has changed.
 *   solid       → brand red   (was near-black)
 *   outline     → hairline pill, fills on hover
 *   solid-ivory → white pill  (over dark imagery)
 */
type Variant = "outline" | "solid" | "solid-ivory";
type Size = "sm" | "md";

const base =
  "group inline-flex items-center justify-center rounded-full font-sans font-medium " +
  "transition-[background-color,color,border-color,transform] duration-300 " +
  "ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none " +
  "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

/** With an arrow badge the right padding collapses — the badge is the padding. */
const sizes: Record<Size, { plain: string; withArrow: string; badge: string; text: string }> = {
  sm: {
    plain: "px-6 py-3",
    withArrow: "pl-6 pr-1.5 py-1.5",
    badge: "w-10 h-10",
    text: "text-[15px]",
  },
  md: {
    plain: "px-8 py-4",
    withArrow: "pl-7 pr-2 py-2 sm:pl-8 sm:pr-2 sm:py-2",
    badge: "w-12 h-12 sm:w-[52px] sm:h-[52px]",
    text: "text-[16px] sm:text-[18px]",
  },
};

const variants: Record<Variant, { pill: string; badge: string }> = {
  solid: {
    pill: "bg-brand text-brand-tint hover:bg-forest",
    badge: "bg-white text-brand",
  },
  outline: {
    pill: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-background",
    badge: "bg-brand text-white",
  },
  "solid-ivory": {
    pill: "bg-white text-ink hover:bg-ivory",
    badge: "bg-brand text-white",
  },
};

/** ↗ — the Figma badge glyph. Nudges out on hover. */
function ArrowBadge({ size, tone }: { size: Size; tone: string }) {
  const s = sizes[size];
  return (
    <span
      aria-hidden
      className={`${s.badge} ${tone} ml-3 shrink-0 grid place-items-center rounded-full
        transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        group-hover:rotate-45`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[45%] h-[45%]"
      >
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </span>
  );
}

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
}

function classesFor(variant: Variant, size: Size, arrow: boolean, className: string) {
  const s = sizes[size];
  const v = variants[variant];
  return `${base} ${s.text} ${arrow ? s.withArrow : s.plain} ${v.pill} ${className}`;
}

/** Link-styled CTA */
export function ButtonLink({
  href,
  children,
  variant = "solid",
  size = "md",
  arrow = true,
  className = "",
  ...rest
}: CommonProps & { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link href={href} className={classesFor(variant, size, arrow, className)} {...rest}>
      <span className="whitespace-nowrap">{children}</span>
      {arrow && <ArrowBadge size={size} tone={variants[variant].badge} />}
    </Link>
  );
}

/** Native button CTA */
export function Button({
  children,
  variant = "solid",
  size = "md",
  arrow = false,
  className = "",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classesFor(variant, size, arrow, className)} {...rest}>
      <span className="whitespace-nowrap">{children}</span>
      {arrow && <ArrowBadge size={size} tone={variants[variant].badge} />}
    </button>
  );
}
