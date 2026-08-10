"use client";

import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes } from "react";

type Variant = "outline" | "solid" | "solid-ivory";
type Size = "sm" | "md";

const base =
  "group inline-flex items-center justify-center gap-2.5 font-sans uppercase tracking-[0.18em] " +
  "transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none";

const sizes: Record<Size, string> = {
  sm: "text-[10px] px-6 py-3",
  md: "text-[11px] px-8 py-4",
};

const variants: Record<Variant, string> = {
  // Bordered / outline — the primary editorial CTA
  outline:
    "border border-ink/70 text-ink hover:bg-ink hover:text-background",
  // Solid soft-black on ivory
  solid: "bg-ink text-background hover:bg-[#33432f]",
  // Cream button used over dark imagery (hero)
  "solid-ivory": "bg-ivory text-black hover:bg-neutral-200",
};

function Arrow() {
  return (
    <span
      aria-hidden
      className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
    >
      →
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

/** Link-styled CTA */
export function ButtonLink({
  href,
  children,
  variant = "outline",
  size = "md",
  arrow = true,
  className = "",
  ...rest
}: CommonProps & { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link
      href={href}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

/** Native button CTA */
export function Button({
  children,
  variant = "outline",
  size = "md",
  arrow = false,
  className = "",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
