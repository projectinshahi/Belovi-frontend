"use client";

/**
 * The BELOVI wordmark.
 *
 * Two tones, because the supplied artwork only works on dark surfaces:
 *
 * - `ivory` (default) — the brand PNG. Its wordmark is white and it carries a
 *   solid black plate, so it belongs on the footer, the hero and anywhere else
 *   dark. On a light surface it renders as a black box.
 * - `ink` — the wordmark set in the brand serif, for light surfaces such as the
 *   ivory navbar. There is no dark version of the logo file in `public/images`
 *   (the two "ink" assets there are leftovers from the template and read
 *   "GENESIS BY PREETHY"), so type stands in for it.
 *
 * When BELOVA supplies a dark PNG, swap the `ink` branch for an <img> and every
 * light-surface usage picks it up.
 */
export default function Logo({
  className = "",
  priority = false,
  tone = "ivory",
}: {
  className?: string;
  priority?: boolean;
  /** `ink` for light surfaces, `ivory` (default) for dark ones. */
  tone?: "ivory" | "ink";
}) {
  if (tone === "ink") {
    return (
      // inline-flex so the same height utilities the image version is given
      // still size the box — the wordmark stays vertically centred in it and
      // the header's layout does not shift between tones.
      <span className={`inline-flex items-center ${className}`}>
        <span className="font-display font-light leading-none tracking-[0.3em] text-[clamp(1.05rem,2.2vw,1.35rem)] text-current">
          BELOVI
        </span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo-alt.png"
      alt="BELOVI"
      fetchPriority={priority ? "high" : "auto"}
      className={`object-contain ${className}`}
    />
  );
}
