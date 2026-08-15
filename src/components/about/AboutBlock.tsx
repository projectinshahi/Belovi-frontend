"use client";

import Reveal from "../ui/Reveal";
import MediaPlate from "../ui/MediaPlate";
import { renderRichText } from "../../lib/story";

/**
 * One row of the About page: a heading and body opposite a framed photograph.
 *
 * Figma draws four of these, alternating which side the photograph sits on, and
 * splits the row 746/635 rather than in half — so the columns are `1.18fr / 1fr`
 * with the wider one always holding the copy, and `imageLeft` swaps which grid
 * column each lands in.
 *
 * The copy stays FIRST in the DOM on every row regardless of which side it is
 * drawn on: the reading order should be heading-then-photograph four times over,
 * not alternate with the layout. `order` handles the visual swap, and only from
 * `lg` up — below that the rows stack photograph-first, which is where the
 * design's rhythm reads on a phone.
 *
 * The photograph reveals a beat after the copy, so the row assembles rather than
 * arriving as one slab.
 */
export default function AboutBlock({
  title,
  body,
  image,
  imageLeft = false,
  priority = false,
}: {
  title?: string;
  body?: string;
  image?: string | null;
  imageLeft?: boolean;
  priority?: boolean;
}) {
  // A row with neither copy nor a photograph is not a row.
  if (!title && !body && !image) return null;

  return (
    <section className="section-x relative z-10">
      <div
        className={`section-inner grid items-center gap-10 sm:gap-12 lg:gap-[clamp(3rem,7.3vw,7.875rem)] ${
          imageLeft ? "lg:grid-cols-[1fr_1.18fr]" : "lg:grid-cols-[1.18fr_1fr]"
        }`}
      >
        <Reveal className={`order-2 lg:order-none ${imageLeft ? "lg:col-start-2" : ""}`}>
          {title && <h2 className="display-section font-medium text-brand">{title}</h2>}
          {body && (
            <div className="mt-5 space-y-5 lg:mt-6">
              {renderRichText(body, "font-sans text-lead text-muted")}
            </div>
          )}
        </Reveal>

        <Reveal
          delay={0.12}
          scaleFrom={0.96}
          className={`order-1 lg:order-none ${
            imageLeft ? "lg:col-start-1 lg:row-start-1" : ""
          }`}
        >
          <MediaPlate
            src={image}
            alt={title || "BELOVI"}
            label={title}
            priority={priority}
          />
        </Reveal>
      </div>
    </section>
  );
}
