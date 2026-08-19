"use client";

import Reveal from "../ui/Reveal";
import MagneticCta from "../ui/MagneticCta";
import type { FeaturedCollection } from "../../lib/featured";

/**
 * The Collection band — the gallery-light break after the black hero.
 *
 * A lifestyle plate on the left, the flagship's story on the right, and beneath
 * it a marquee of colourways that scrolls on forever.
 *
 * THE LOOP. The track holds the set twice and translates exactly -50%, so the
 * moment it completes, copy two sits precisely where copy one began and the
 * restart is invisible. That is the whole trick — anything that animates to a
 * pixel offset instead has to snap back, and the snap is always visible. The
 * seam is only seamless while the gap between the two copies matches the gap
 * inside them, which is why one `gap` value is set on the track and inherited.
 *
 * It is a CSS animation on a transform, so it runs on the compositor and costs
 * the scroll thread nothing. It pauses on hover, and prefers-reduced-motion
 * stops it outright (globals.css) — leaving a legible static row rather than a
 * half-empty one.
 *
 * FIXED CONTENT. Both the imagery and the copy are brand art direction rather
 * than catalogue data — one lifestyle plate, three colourways of a single piece,
 * and the flagship's own story. The Featured Collection document used to supply
 * the heading and body, which meant an unrelated edit there rewrote this band;
 * it now only decides whether the section shows at all.
 */

const HEADING = "Collection";
const BODY =
  "Tantra Chair a sculptural statement piece designed to bring comfort, elegance, and versatility into your space. Its distinctive curves provide a supportive, relaxing form while adding a bold contemporary touch to any interior. Crafted for both visual appeal and everyday comfort, the Tantra Chair turns every moment of sitting into a refined experience.";

/** The design's own art, always rendered. */
const LIFESTYLE = "/images/Component 6.png";
const COLOURWAYS = [
  { src: "/images/Group 4.png", label: "Tantra Chair in off-white" },
  { src: "/images/Group 2.png", label: "Tantra Chair in magenta" },
  { src: "/images/Group 2 (1).png", label: "Tantra Chair in tangerine" },
];

export default function CollectionStrip({ data }: { data: FeaturedCollection | null }) {
  if (data && !data.isVisible) return null;

  return (
    <section className="surface-light overflow-hidden bg-tan section-pad section-x">
      <div className="section-inner grid grid-cols-1 items-start gap-10 lg:grid-cols-[42fr_58fr] lg:gap-[clamp(40px,4vw,80px)]">
        {/* Lifestyle plate */}
        <Reveal scaleFrom={0.96} className="w-full">
          <div className="sheen group relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-sand sm:aspect-[645/746] sm:rounded-[clamp(24px,2.5vw,48px)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LIFESTYLE}
              alt="The BELOVI collection"
              loading="lazy"
              className="h-full w-full object-cover object-bottom transition-transform duration-[900ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.03]"
            />
          </div>
        </Reveal>

        {/* Content stack */}
        <div className="flex min-w-0 flex-col gap-9 lg:gap-12">
          <Reveal>
            <h2 className="display-section text-ink">{HEADING}</h2>
            <p className="mt-5 max-w-[560px] text-body leading-[1.7] text-muted">
              {BODY}
            </p>
          </Reveal>

          {/* Colourway marquee. Bleeds past the section's right edge so the row
              reads as continuing rather than ending. */}
          <Reveal delay={0.12}>
            <div className="marquee relative -mr-[6vw] overflow-hidden lg:-mr-[clamp(1.25rem,6.4vw,6.875rem)]">
              <div
                className="marquee-track flex w-max items-center gap-6 sm:gap-8"
                style={{ ["--marquee-duration" as string]: "32s" }}
              >
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    // The duplicate is decoration: it must not be announced or
                    // reachable, or every piece is read out twice.
                    aria-hidden={copy === 1}
                    className="flex shrink-0 items-center gap-6 sm:gap-8"
                  >
                    {COLOURWAYS.map((c) => (
                      <Colourway key={`${copy}-${c.src}`} src={c.src} label={c.label} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Closing row */}
          <Reveal delay={0.18}>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-sans text-[15px] text-faint sm:text-[16px]">
                We embrace quality, comfort and connection.
              </p>
              <MagneticCta
                href="/products"
                label="Explore"
                variant="inline"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * One colourway, drawn exactly as supplied.
 *
 * NOTHING IS RENDERED BEHIND THE IMAGE. This used to lay a cream plinth under
 * each one — a rounded `bg-cream` rectangle the piece appeared to rest on — but
 * the supplied artwork carries its own white ground, so the plinth showed as a
 * second, differently-toned panel stacked behind it.
 *
 * `object-contain` is kept, which is what guarantees the file is never cropped:
 * the whole image is fitted inside the box and its aspect ratio preserved.
 */
function Colourway({ src, label }: { src: string; label: string }) {
  return (
    <div className="h-[160px] w-[260px] shrink-0 sm:h-[200px] sm:w-[330px] lg:h-[230px] lg:w-[390px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={label}
        loading="lazy"
        draggable={false}
        className="h-full w-full select-none object-contain"
      />
    </div>
  );
}
