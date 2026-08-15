"use client";

import { Minus, Plus } from "lucide-react";

/**
 * The bordered pill quantity control: minus, a ruled centre cell, plus.
 *
 * The centre is a REAL `<input type="number">`, not a readout. Keyboard and
 * screen-reader users get the native contract — arrow keys, direct entry, the
 * announced role — which a styled span can only imitate badly. The spinners are
 * stripped because the two buttons already are the spinner.
 *
 * Direct entry is clamped on change rather than rejected: someone typing "50"
 * lands on the ceiling instead of watching their keystrokes vanish. An empty
 * field is left alone mid-edit and settles to the minimum on blur, so clearing
 * it to retype doesn't snap a "1" under the cursor.
 */
export default function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled = false,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const btn =
    "grid h-full w-[48px] shrink-0 place-items-center bg-transparent text-[#9E9E9E] transition-[background-color,color,transform] " +
    "duration-200 hover:bg-[#F5F5F5] hover:text-[#1A1A1A] active:scale-95 " +
    "disabled:pointer-events-none disabled:opacity-40";

  return (
    <div
      className={`inline-flex h-[48px] sm:h-[52px] items-stretch overflow-hidden rounded-full border border-[#E0E0E0]
        ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className={btn}
      >
        <Minus size={18} strokeWidth={1.8} aria-hidden />
      </button>

      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        aria-label="Quantity"
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return;
          const n = Number(raw);
          if (Number.isFinite(n)) onChange(clamp(Math.trunc(n)));
        }}
        onBlur={(e) => {
          if (e.target.value === "") onChange(min);
        }}
        className="w-[48px] border-x border-[#E0E0E0] bg-transparent text-center font-sans text-[15px] sm:text-[16px] font-medium
          tabular-nums text-[#1A1A1A] outline-none
          [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={btn}
      >
        <Plus size={18} strokeWidth={1.8} aria-hidden />
      </button>
    </div>
  );
}
