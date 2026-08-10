"use client";

import { useState } from "react";
import type { SizeChartRow } from "../../lib/product";

type Measurement = Exclude<keyof SizeChartRow, "size">;

const COLUMNS: { key: Measurement; label: string }[] = [
  { key: "bust", label: "Bust" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "length", label: "Length" },
];

const UNITS = [
  { key: "in", label: "Inches" },
  { key: "cm", label: "CM" },
] as const;

type Unit = (typeof UNITS)[number]["key"];

const CM_PER_INCH = 2.54;

/**
 * Format one stored centimetre value for display.
 *
 * Both units round to one decimal and then drop a trailing `.0`, so a chart of
 * whole centimetres reads as "94 / 76" rather than "94.0 / 76.0" while a
 * converted inch value keeps the precision it needs ("37" but "29.9").
 */
function format(cm: number, unit: Unit): string {
  const value = unit === "cm" ? cm : cm / CM_PER_INCH;
  return String(Math.round(value * 10) / 10);
}

/**
 * The per-product size chart, with an Inches / CM segmented toggle.
 *
 * Columns are derived from the data: a measurement no row fills is dropped
 * entirely rather than rendered as a column of dashes, so a chart carrying only
 * bust and waist reads as a deliberate two-column table.
 */
export default function SizeChart({ rows }: { rows: SizeChartRow[] }) {
  const [unit, setUnit] = useState<Unit>("in");

  const columns = COLUMNS.filter((c) => rows.some((r) => typeof r[c.key] === "number"));
  if (rows.length === 0 || columns.length === 0) return null;

  return (
    <div>
      {/* Unit toggle. The indicator is a single element that slides, so the
          two states share one transition instead of cross-fading. No visible
          label: whatever names this chart — the PDP accordion's "Size Chart",
          the size guide's heading — already sits directly above it. */}
      <div className="mb-6 flex items-center justify-end">
        <div
          role="group"
          aria-label="Measurement unit"
          className="relative inline-flex shrink-0 border border-line bg-cream p-[3px]"
        >
          <span
            aria-hidden
            className={`absolute inset-y-[3px] left-[3px] w-[calc(50%-3px)] bg-ink transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              unit === "cm" ? "translate-x-full" : "translate-x-0"
            }`}
          />
          {UNITS.map((u) => (
            <button
              key={u.key}
              type="button"
              onClick={() => setUnit(u.key)}
              aria-pressed={unit === u.key}
              className={`relative z-10 w-[68px] cursor-pointer py-2 text-center font-sans text-[10px] uppercase tracking-[0.14em] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                unit === u.key ? "text-ivory" : "text-muted hover:text-ink"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Narrow phones get a horizontal scroll rather than a squeezed table. */}
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[280px] border-collapse">
          <thead>
            <tr>
              <th
                scope="col"
                className="border-b border-ink/20 py-3 pr-4 text-left font-sans text-[10px] uppercase tracking-[0.14em] text-bronze-deep"
              >
                Size
              </th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className="border-b border-ink/20 py-3 pr-4 text-left font-sans text-[10px] uppercase tracking-[0.14em] text-bronze-deep last:pr-0"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.size}-${i}`}>
                <th
                  scope="row"
                  className="border-b border-line py-3 pr-4 text-left font-sans text-[13px] font-normal text-ink"
                >
                  {row.size}
                </th>
                {columns.map((c) => {
                  const cm = row[c.key];
                  return (
                    <td
                      key={c.key}
                      className="border-b border-line py-3 pr-4 font-sans text-[13px] tabular-nums text-muted last:pr-0"
                    >
                      {typeof cm === "number" ? format(cm, unit) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Doubles as the screen-reader announcement for a unit change — the
          numbers themselves swap silently. */}
      <p aria-live="polite" className="mt-4 font-sans text-[12px] leading-relaxed text-faint">
        {unit === "in"
          ? "Measurements shown in inches, converted from centimetres."
          : "Measurements shown in centimetres."}{" "}
        These are body measurements, not garment measurements.
      </p>
    </div>
  );
}
