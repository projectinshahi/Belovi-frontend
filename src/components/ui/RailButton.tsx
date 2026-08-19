"use client";

/**
 * The circular arrow that steps a horizontal rail.
 *
 * Shared by the Featured Collection rail and the Categories rail. It lived
 * inside FeaturedCarousel until the second rail needed one — two copies of a
 * control this distinctive is how they drift apart on the next design change.
 *
 * `tone` exists because the two rails sit on opposite surfaces: Featured is on
 * ivory, Categories on the onyx panel, and an ink-coloured outline is invisible
 * against black. The filled variant is brand red on both, so it needs no
 * variant — only the outline does.
 */
export default function RailButton({
  label,
  onClick,
  disabled,
  direction,
  filled = false,
  tone = "light",
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  direction: "left" | "right";
  /** The next control is filled, the previous outlined — the design's hierarchy. */
  filled?: boolean;
  /** `dark` for the outline on a dark surface. Filled is identical either way. */
  tone?: "light" | "dark";
}) {
  const outline =
    tone === "dark"
      ? "border-[1.5px] border-white/60 text-white enabled:hover:scale-105 enabled:hover:border-white enabled:hover:bg-white/10"
      : "border-[1.5px] border-ink/80 text-ink enabled:hover:scale-105 enabled:hover:border-ink enabled:hover:bg-ink/[0.04]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`group grid h-12 w-12 place-items-center rounded-full transition-all duration-300
        ease-[cubic-bezier(0.16,1,0.3,1)] disabled:cursor-not-allowed disabled:opacity-35 ${
          filled
            ? "bg-brand text-white enabled:hover:scale-105 enabled:hover:bg-brand-hover enabled:hover:shadow-[0_4px_16px_rgba(211,40,40,0.3)]"
            : outline
        }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-5 w-5 transition-transform duration-300 ${
          direction === "left"
            ? "rotate-180 group-enabled:group-hover:-translate-x-0.5"
            : "group-enabled:group-hover:translate-x-0.5"
        }`}
      >
        <path d="m9 5 7 7-7 7" />
      </svg>
    </button>
  );
}
