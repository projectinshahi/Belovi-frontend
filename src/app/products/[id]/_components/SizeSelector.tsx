"use client";

import { useId, useRef } from "react";
import Link from "next/link";

export interface SizeOption {
  /**
   * The size label (M / L / XL). It lives on the variant's `volume` field —
   * a cosmetics-era name the cart and historical orders still key off, so it is
   * carried through as-is and only *labelled* "Size" in the UI.
   */
  volume: string;
}

interface SizeSelectorProps {
  options: SizeOption[];
  /** Index into `options`, or null when the shopper hasn't chosen yet. */
  selected: number | null;
  onSelect: (index: number) => void;
  modelNote?: string;
  /** Carried to /size-guide so it shows this piece's chart, not a generic one. */
  productId?: string;
}

/**
 * Size chooser. A proper radiogroup: arrow keys move and select, and a roving
 * tabindex means the whole group is a single tab stop.
 */
export default function SizeSelector({
  options,
  selected,
  onSelect,
  modelNote,
  productId,
}: SizeSelectorProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const labelId = useId();

  const move = (from: number, dir: 1 | -1) => {
    const next = (from + dir + options.length) % options.length;
    onSelect(next);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        move(i, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        move(i, -1);
        break;
      case "Home":
        e.preventDefault();
        onSelect(0);
        refs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        onSelect(options.length - 1);
        refs.current[options.length - 1]?.focus();
        break;
      default:
        break;
    }
  };

  // Derived from the variants themselves, so the stated run can never drift from
  // what's actually buyable. Deduped: variants may repeat a size across colours.
  const sizeRun = Array.from(
    new Set(options.map((o) => o.volume).filter(Boolean))
  ).join(" / ");

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <span className="eyebrow text-faint" id={labelId}>
          Size
        </span>
        <Link
          href={productId ? `/size-guide?product=${encodeURIComponent(productId)}` : "/size-guide"}
          className="link-underline font-sans text-[11px] tracking-[0.12em] text-muted transition-colors duration-300 hover:text-ink"
        >
          Find your size
        </Link>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="flex flex-wrap gap-2.5"
      >
        {options.map((option, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={`${option.volume}-${i}`}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              // Roving tabindex: the checked option is the tab stop, or the
              // first one while nothing is chosen yet.
              tabIndex={isSelected || (selected === null && i === 0) ? 0 : -1}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`h-12 min-w-12 cursor-pointer border px-3 font-sans text-[13px] tracking-[0.08em] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isSelected
                  ? "border-ink bg-ink text-ivory"
                  : "border-line text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {option.volume}
            </button>
          );
        })}
      </div>

      {modelNote && (
        <p className="mt-4 font-sans text-[13px] leading-relaxed text-muted">{modelNote}</p>
      )}
      {sizeRun && (
        <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-faint">
          Size run: {sizeRun}.
        </p>
      )}
    </div>
  );
}
