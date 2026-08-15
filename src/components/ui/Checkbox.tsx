"use client";

/**
 * The filter panel's checkbox: a 20px square, 2px radius, brand-red border.
 *
 * Built on a real `<input type="checkbox">` rather than a div with
 * `role="checkbox"`. The native control brings keyboard operation, the
 * space-to-toggle contract, form semantics and screen-reader announcement for
 * free; every hand-rolled version of this has to re-implement all four and
 * usually gets one wrong. The input is made transparent and the box is drawn
 * over it with `peer-checked:`, so what you see is entirely CSS and what the
 * browser operates is entirely standard.
 *
 * The tick DRAWS rather than appearing — a clipped stroke that wipes in from the
 * left. At this size a fade reads as a rendering glitch; the wipe reads as an
 * action.
 */
export default function Checkbox({
  checked,
  onChange,
  label,
  count,
  disabled = false,
  swatch,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  /** Matching pieces. `0` renders the row disabled. */
  count?: number;
  disabled?: boolean;
  /** Colour rows draw a dot at the far end of the row. */
  swatch?: string;
}) {
  return (
    <label
      className={`group flex w-full items-center gap-2 ${
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"
      }`}
    >
      <span className="relative grid h-5 w-5 shrink-0 place-items-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="peer absolute inset-0 h-full w-full cursor-[inherit] appearance-none rounded-[2px]
            border border-brand bg-transparent transition-colors duration-200
            checked:border-brand checked:bg-brand"
        />
        <svg
          viewBox="0 0 20 20"
          aria-hidden
          className="pointer-events-none relative h-3 w-3 text-white
            [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-300
            ease-[cubic-bezier(0.16,1,0.3,1)] peer-checked:[clip-path:inset(0_0_0_0)]"
        >
          <path
            d="M4 10.5 8 14.5 16 5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span
        className={`font-sans text-[15px] leading-tight transition-colors duration-300 sm:text-[17px] ${
          checked ? "text-ink" : "text-muted"
        } ${disabled ? "" : "group-hover:text-ink"}`}
      >
        {label}
        {typeof count === "number" && (
          <span className="ml-1.5 text-[13px] text-faint tabular-nums">({count})</span>
        )}
      </span>

      {swatch && (
        <span
          aria-hidden
          className="ml-auto h-6 w-6 shrink-0 rounded-full border border-line
            transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
          style={{ background: swatch }}
        />
      )}
    </label>
  );
}
