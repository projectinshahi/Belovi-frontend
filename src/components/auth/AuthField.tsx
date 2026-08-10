"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * One labelled field for the auth pages.
 *
 * Both pages need the same thing — tracked uppercase label, hairline-bordered
 * input, inline error, and an eye toggle on the password fields — so it lives
 * once here rather than twice in markup. Styling follows the storefront's own
 * form idiom (the checkout and profile inputs): `bg-cream`, `border-line-strong`
 * hairline, `focus:border-ink`, square corners.
 */
export default function AuthField({
  label,
  value,
  onChange,
  type = "text",
  error,
  hint,
  placeholder,
  autoComplete,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** `password` adds the visibility toggle. */
  type?: "text" | "email" | "password";
  error?: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-sans text-[11px] uppercase tracking-[0.14em] text-muted mb-2"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          // Toggling the type is what reveals the value; the field keeps its
          // identity so autofill and password managers still recognise it.
          type={isPassword && revealed ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          /* 16px so iOS doesn't zoom the viewport on focus. `pr-12` leaves room
             for the toggle so a long value never runs under it. */
          className={`w-full bg-cream border px-4 py-3.5 font-sans text-[16px] text-ink placeholder:text-faint transition-colors focus:outline-none focus:border-ink disabled:opacity-60 ${
            isPassword ? "pr-12" : ""
          } ${error ? "border-forest" : "border-line-strong"}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            // The label says what pressing it will do, and the state is on the
            // button, so a screen reader isn't left guessing which mode it's in.
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted transition-colors hover:text-ink focus:outline-none focus-visible:text-ink"
          >
            {revealed ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
          </button>
        )}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-2 font-sans text-[12px] text-forest">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="mt-2 font-sans text-[12px] leading-relaxed text-faint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
