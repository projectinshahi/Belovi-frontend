"use client";

import Checkbox from "../ui/Checkbox";

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

export default function FilterSidebar({
  groups,
  bare = false,
  className = "",
}: {
  groups: FilterGroupSpec[];
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
    </div>
  );
}
