import type { ReactNode } from "react";

/**
 * The page's band primitive. Every home section is one of these.
 *
 * Figma pads sections 72px vertically and 110px horizontally inside a 1728
 * frame, capping content at 1508 — `.section-pad` / `.section-x` /
 * `.section-inner` in globals.css hold those as clamps so the same rhythm
 * survives down to 360px.
 *
 * `tone` also sets the surface class, so a dark band's children resolve their
 * own type colours without being passed a prop.
 */
export function Section({
  id,
  tone = "light",
  rounded = false,
  className = "",
  innerClassName = "",
  children,
}: {
  id?: string;
  tone?: "light" | "dark" | "band" | "none";
  /** The big r48 inset panel Figma uses for Categories and Brochures. */
  rounded?: boolean;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  const tones = {
    light: "bg-ivory surface-light",
    band: "bg-tan surface-light",
    dark: "bg-onyx surface-dark",
    none: "",
  }[tone];

  return (
    <section
      id={id}
      className={`${tones} ${rounded ? "rounded-[28px] sm:rounded-[48px]" : ""} section-pad section-x ${className}`}
    >
      <div className={`section-inner ${innerClassName}`}>{children}</div>
    </section>
  );
}

/**
 * Heading + supporting line, at the section scale (Montserrat 500/56px over
 * body copy). `align="between"` is the Figma variant where a control sits
 * opposite the heading — the Featured band's carousel arrows.
 */
export function SectionHeading({
  title,
  description,
  action,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className="max-w-[62ch]">
        <h2 className="display-section text-ink">{title}</h2>
        {description && <p className="mt-2 text-body text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * The closing row Figma repeats under Collection, Categories and Featured: a
 * line of copy on the left, a pill CTA on the right.
 */
export function SectionFooterRow({
  note,
  action,
  className = "",
}: {
  note: string;
  action: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="text-lead text-muted">{note}</p>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
