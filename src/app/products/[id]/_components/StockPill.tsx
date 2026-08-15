"use client";

/**
 * The availability pill beside the product title.
 *
 * `status` is free text on the model with "In Stock" as the default, so this
 * treats anything that isn't recognisably in-stock as unavailable rather than
 * trying to enumerate every phrase the studio might type. Green is reserved for
 * the one case where the piece can actually be bought — everything else reads
 * as a warning, because the buttons are disabled alongside it.
 */

/** The single source of truth for "can this be bought", used by the page too. */
export function isInStock(status?: string): boolean {
  return /in\s*stock/i.test((status || "").trim());
}

export default function StockPill({ status }: { status?: string }) {
  const label = (status || "").trim() || "Unavailable";
  const inStock = isInStock(status);

  return (
    <span
      /* The pulse is an ambient "this is live" signal, not an alert — a slow
         2s ring on the shadow alone, so nothing moves and no layout shifts.
         `motion-safe:` drops it entirely under reduced motion. */
      className={`inline-flex shrink-0 items-center justify-center rounded-full px-3.5 py-1.5 font-sans
        text-[13px] font-medium leading-none ${
          inStock
            ? "bg-[#e8f5e9] text-[#2e7d32] motion-safe:animate-[stockPulse_2s_ease-out_infinite]"
            : "bg-sand text-muted"
        }`}
    >
      {label}
    </span>
  );
}
