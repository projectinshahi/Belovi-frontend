"use client";

/**
 * The collection grid's pager: 32px circular page buttons with a chevron either
 * side, the current page filled brand red.
 *
 * Long result sets get an ellipsis window rather than one button per page —
 * Figma draws four pages because its mock has four, not because four is the
 * limit, and 200 buttons would wrap into a paragraph.
 *
 * Rendered as a `<nav>` of real buttons: each is focusable and announces its
 * page number, and the current one carries `aria-current="page"` so it is not
 * merely a different colour.
 */

/** Page numbers to draw, with `null` marking a gap. Always shows first, last,
 *  current and its neighbours — at most 7 slots, so the row never wraps. */
function windowed(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const out: (number | null)[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push(null);
    out.push(p);
    prev = p;
  }
  return out;
}

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4"
    >
      <path d={dir === "prev" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

const arrowClass =
  "grid h-8 w-8 place-items-center rounded-full text-ink transition-[background-color,color,transform] " +
  "duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-ink hover:text-white " +
  "disabled:pointer-events-none disabled:opacity-30";

export default function Pagination({
  page,
  totalPages,
  onChange,
  className = "",
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  // One page is not a choice, so there is nothing to render.
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={arrowClass}
      >
        <Chevron dir="prev" />
      </button>

      {windowed(page, totalPages).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 font-sans text-[14px] text-faint">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={`grid h-8 w-8 place-items-center rounded-full font-sans text-[14px] tabular-nums
              transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${
                p === page
                  ? "scale-105 bg-brand text-white"
                  : "text-muted hover:bg-ink/5 hover:text-ink"
              }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={arrowClass}
      >
        <Chevron dir="next" />
      </button>
    </nav>
  );
}
