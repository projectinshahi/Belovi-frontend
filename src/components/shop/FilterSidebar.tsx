"use client";

import Checkbox from "../ui/Checkbox";
import { formatINR, type PriceLimits, type PriceRange } from "../../lib/product";

/**
 * The collection page's filter card — white, r24, hairline border, one titled
 * group per facet.
 *
 * One definition serves both placements: the sticky desktop rail and the mobile
 * drawer render this same component, so the two can never drift. The card's own
 * chrome is optional (`bare`) because inside the drawer it is already on a white
 * sheet and a second card edge reads as a box in a box.
 */

export interface Facet {
  id: string;
  label: string;
  count: number;
  /** Colour rows only. */
  swatch?: string;
}

export interface FilterGroupSpec {
  key: string;
  title: string;
  options: Facet[];
  selected: string[];
  onToggle: (id: string) => void;
}

function Group({ title, options, selected, onToggle }: FilterGroupSpec) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <p className="font-sans text-[16px] font-medium leading-none text-ink">{title}</p>
      <div className="flex w-full flex-col gap-2.5">
        {options.map((opt) => (
          <Checkbox
            key={opt.id}
            label={opt.label}
            count={opt.count}
            swatch={opt.swatch}
            checked={selected.includes(opt.id)}
            /* A filter that matches nothing stays visible — the design shows a
               full panel — but cannot be ticked, because doing so would empty
               the grid with no way for the shopper to see why. Already-selected
               options stay live so they can always be turned back off. */
            disabled={opt.count === 0 && !selected.includes(opt.id)}
            onChange={() => onToggle(opt.id)}
          />
        ))}
      </div>
    </div>
  );
}

export interface PriceFilterSpec {
  /** Null once loaded means no piece has a price. */
  limits: PriceLimits | null;
  /** What the handles show: the selection, or the full limits when unset. */
  value: PriceRange;
  onChange: (range: PriceRange) => void;
}

/* Thumbs are the only part of each input that takes the pointer, so the two
   inputs can be stacked over one track and each handle stays draggable.
   Styled for WebKit/Blink and Gecko separately; neither reads the other's
   pseudo-element. 20px thumb, so the fill below is inset by half of it (10px)
   to line up with the thumb centres at both ends. */
const RANGE_INPUT = `pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent outline-none
  [&::-webkit-slider-runnable-track]:h-5
  [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:box-border
  [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-grab
  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-cream
  active:[&::-webkit-slider-thumb]:cursor-grabbing
  focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-brand/30
  disabled:[&::-webkit-slider-thumb]:cursor-not-allowed
  [&::-moz-range-track]:bg-transparent
  [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:box-border
  [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-grab
  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2
  [&::-moz-range-thumb]:border-brand [&::-moz-range-thumb]:bg-cream
  active:[&::-moz-range-thumb]:cursor-grabbing
  focus-visible:[&::-moz-range-thumb]:ring-2 focus-visible:[&::-moz-range-thumb]:ring-brand/30
  disabled:[&::-moz-range-thumb]:cursor-not-allowed`;

/**
 * Two native `<input type="range">` on one track: keyboard (arrows ₹1,
 * PageUp/PageDown 10%, Home/End to the ends), touch and screen-reader support
 * come from the platform. The handles cannot cross: each is clamped to the
 * other's value.
 */
function PriceSlider({ limits, value, onChange }: PriceFilterSpec) {
  const title = <p className="font-sans text-[16px] font-medium leading-none text-ink">Price</p>;

  if (!limits) {
    return (
      <div className="flex flex-col gap-4">
        {title}
        <p className="font-sans text-[14px] text-muted">No prices to filter by yet.</p>
      </div>
    );
  }

  const { min, max } = limits;
  const [lo, hi] = value;
  const span = max - min;
  /** Every piece at one price: nothing to narrow, so the handles stay put. */
  const fixed = span === 0;
  const pct = (n: number) => (fixed ? 0 : ((n - min) / span) * 100);

  return (
    <div className="flex flex-col gap-4">
      {title}

      <div className={`relative h-5 ${fixed ? "opacity-45" : ""}`}>
        <div aria-hidden className="absolute inset-x-2.5 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line">
          <div
            className="absolute inset-y-0 rounded-full bg-brand"
            style={{ left: `${pct(lo)}%`, right: `${fixed ? 0 : 100 - pct(hi)}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={lo}
          disabled={fixed}
          aria-label="Minimum price"
          aria-valuetext={formatINR(lo)}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
          /* Raised once it is in the upper half, so when both handles meet at
             the top end the one that can still move (this one, leftwards) is
             the one under the pointer. */
          style={{ zIndex: lo > min + span / 2 ? 3 : 1 }}
          className={RANGE_INPUT}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={hi}
          disabled={fixed}
          aria-label="Maximum price"
          aria-valuetext={formatINR(hi)}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
          style={{ zIndex: 2 }}
          className={RANGE_INPUT}
        />
      </div>

      <div className="flex justify-between gap-4 font-sans tabular-nums">
        <p className="flex flex-col gap-1">
          <span className="text-[13px] text-faint">Minimum</span>
          <span className="text-[15px] text-ink sm:text-[17px]">{formatINR(lo)}</span>
        </p>
        <p className="flex flex-col gap-1 text-right">
          <span className="text-[13px] text-faint">Maximum</span>
          <span className="text-[15px] text-ink sm:text-[17px]">{formatINR(hi)}</span>
        </p>
      </div>
    </div>
  );
}

export default function FilterSidebar({
  groups,
  price,
  bare = false,
  className = "",
}: {
  groups: FilterGroupSpec[];
  /** Omitted while the catalogue is loading. */
  price?: PriceFilterSpec;
  /** Drop the card chrome — used inside the mobile drawer. */
  bare?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`surface-light flex w-full flex-col gap-6 ${
        bare ? "" : "rounded-[24px] border border-line bg-cream p-6"
      } ${className}`}
    >
      {!bare && (
        <div className="flex items-center border-b border-line pb-6">
          <p className="font-sans text-[20px] font-medium leading-none text-ink sm:text-[24px]">
            Filter Options
          </p>
        </div>
      )}

      {groups.map((g) => (
        <Group
          key={g.key}
          /* Spelled out rather than spread: `FilterGroupSpec.key` is also the
             React key, and spreading it sets the prop twice. */
          title={g.title}
          options={g.options}
          selected={g.selected}
          onToggle={g.onToggle}
        />
      ))}

      {price && <PriceSlider {...price} />}
    </div>
  );
}
