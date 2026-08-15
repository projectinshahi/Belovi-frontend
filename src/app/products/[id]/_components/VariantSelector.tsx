"use client";

import { formatINR } from "../../../../lib/product";
import { colorSwatch } from "../../../../lib/product";

/**
 * Colourway / size chooser, as pill chips.
 *
 * NOT IN THE FIGMA, and deliberately invisible whenever the design is right:
 * it renders only when a piece has more than one variant. Every product in the
 * catalogue today has exactly one, so the page matches the frame precisely —
 * this appears the moment the studio adds a second, which is the moment its
 * absence would become a bug (Add to Cart would silently take the first, and a
 * customer wanting the blue one could never buy it).
 *
 * A chip shows its own price only when the variants actually differ in price;
 * repeating the same figure across every chip is noise.
 */

export interface VariantOption {
  size?: string;
  color?: string;
  material?: string;
  price: number;
}

/** What distinguishes one variant from another, in the order it reads best. */
function chipLabel(v: VariantOption): string {
  return [v.color, v.size, v.material].map((s) => (s || "").trim()).filter(Boolean).join(" · ");
}

export default function VariantSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: VariantOption[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  if (variants.length <= 1) return null;

  const prices = new Set(variants.map((v) => v.price));
  const showPrices = prices.size > 1;

  return (
    <div>
      <p id="variant-label" className="font-sans text-[15px] text-muted sm:text-[18px]">
        Choose an option
      </p>
      <div
        role="radiogroup"
        aria-labelledby="variant-label"
        className="mt-3 flex flex-wrap gap-2.5 sm:gap-3"
      >
        {variants.map((v, i) => {
          const isSelected = i === selected;
          const label = chipLabel(v) || `Option ${i + 1}`;
          const swatch = v.color?.trim() ? colorSwatch(v.color) : null;

          return (
            <button
              key={`${label}-${i}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(i)}
              className={`inline-flex items-center gap-2.5 rounded-[37px] border px-4 py-2.5 font-sans
                text-[14px] transition-[border-color,background-color,color,transform] duration-300
                ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-5 sm:text-[16px] ${
                  isSelected
                    ? "border-ink bg-ink text-white"
                    : "border-line-strong text-muted hover:-translate-y-0.5 hover:border-ink hover:text-ink"
                }`}
            >
              {swatch && (
                <span
                  aria-hidden
                  className={`h-4 w-4 shrink-0 rounded-full border ${
                    isSelected ? "border-white/40" : "border-line"
                  }`}
                  style={{ background: swatch }}
                />
              )}
              <span className="capitalize">{label}</span>
              {showPrices && v.price > 0 && (
                <span className={isSelected ? "text-white/70" : "text-faint"}>
                  {formatINR(v.price)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
