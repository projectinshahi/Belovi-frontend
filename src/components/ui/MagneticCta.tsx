"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * The CTA that leans toward the cursor, in the design's two forms:
 *
 *   `pill`   — the hero's filled coral pill with a white arrow bubble.
 *   `inline` — the Collection band's bare label beside a coral arrow circle.
 *
 * Magnetism lives here rather than in the shared `Button` because it is a
 * feature-section flourish: folding it into the primitive would attach pointer
 * tracking to every button on the site to serve two of them.
 *
 * The transform rides on a wrapper, not the anchor, so the link stays a plain
 * next/link and keeps client-side navigation and prefetching.
 */
export default function MagneticCta({
  href,
  label,
  variant = "pill",
  disabled = false,
  className = "",
}: {
  href: string;
  label: string;
  variant?: "pill" | "inline";
  /** True under prefers-reduced-motion — the pull is dropped, the link isn't. */
  disabled?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 150, damping: 15, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 150, damping: 15, mass: 0.4 });

  const track = (e: React.PointerEvent) => {
    if (disabled) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Capped, so it leans toward the cursor rather than chasing it off-centre.
    x.set(Math.max(-14, Math.min(14, (e.clientX - cx) * 0.25)));
    y.set(Math.max(-10, Math.min(10, (e.clientY - cy) * 0.25)));
  };

  const release = () => { x.set(0); y.set(0); };

  const isPill = variant === "pill";

  return (
    <motion.div
      ref={ref}
      style={disabled ? undefined : { x, y }}
      onPointerMove={track}
      onPointerLeave={release}
      className={`inline-block ${className}`}
    >
      <Link
        href={href}
        /* The pill is set wide and low: the bubble sets its height, so the
           height comes down by shrinking that and the vertical padding, and the
           width goes up on the left padding and the gap. Both move together —
           taking height out alone would leave a stub, not a horizontal button. */
        className={`group inline-flex items-center gap-4 font-sans font-medium
          transition-[background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isPill
              ? "rounded-full bg-brand py-1.5 pl-10 pr-1.5 text-[16px] text-white hover:bg-[#FF6659] hover:shadow-[0_8px_32px_rgba(229,57,53,0.4)] sm:pl-12 sm:text-[18px]"
              : "text-[16px] text-ink"
          }`}
      >
        <span className="whitespace-nowrap">{label}</span>
        <span
          aria-hidden
          className={`grid shrink-0 place-items-center rounded-full
            transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            group-hover:rotate-45 ${
              isPill
                ? "h-10 w-10 bg-white text-brand group-hover:scale-110 sm:h-[48px] sm:w-[48px]"
                : "h-11 w-11 bg-brand text-white group-hover:scale-[1.08] group-hover:shadow-[0_4px_16px_rgba(229,57,53,0.3)]"
            }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[45%] w-[45%]"
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </span>
      </Link>
    </motion.div>
  );
}
