"use client";

import Reveal from "../ui/Reveal";
import MagneticCta from "../ui/MagneticCta";
import type { FeaturedCollection } from "../../lib/featured";
import type { CollectionSection } from "../../lib/collection";
import { cldOptimize } from "../../lib/image";

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
 * CONTENT. The heading, description, main image and the scrolling images come
 * from the studio's Collection Section (Admin → Collection Section), its own
 * document, so edits elsewhere cannot rewrite this band. The Featured Collection
 * document still only decides whether the section shows at all.
 */

/** The white plate every scrolling image stands on. */
const PLATE = "/images/Rectangle%208%20(2).png";

export default function CollectionStrip({
  data,
  content,
}: {
  data: FeaturedCollection | null;
  content: CollectionSection;
}) {
  if (data && !data.isVisible) return null;

  return (
    <section className="surface-light overflow-hidden bg-tan section-pad section-x">
      <div className="section-inner grid grid-cols-1 items-start gap-10 lg:grid-cols-[42fr_58fr] lg:gap-[clamp(40px,4vw,80px)]">
        {/* Lifestyle plate */}
        <Reveal scaleFrom={0.96} className="w-full">
          <div className="sheen group relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-sand sm:aspect-[645/746] sm:rounded-[clamp(24px,2.5vw,48px)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cldOptimize(content.mainImage, 1300)}
              alt={content.heading}
              loading="lazy"
              className="h-full w-full object-cover object-bottom transition-transform duration-[900ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.03]"
            />
          </div>
        </Reveal>

        {/* Content stack */}
        <div className="flex min-w-0 flex-col gap-9 lg:gap-12">
          <Reveal>
            <h2 className="display-section text-ink">{content.heading}</h2>
            <p className="mt-5 max-w-[560px] whitespace-pre-line text-body leading-[1.7] text-muted">
              {content.description}
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
                    {content.images.map((c, i) => (
                      <Colourway key={`${copy}-${c._id ?? i}`} src={c.image} label={c.alt} />
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
 * One scrolling image: the product cut-out standing on the shared white plate.
 *
 * The plate is drawn HERE, from the one supplied asset, so an image uploaded in
 * the admin needs no background of its own and every item matches. The
 * geometry was measured off the original artwork, where the plate was baked
 * into each file: the product spans about 1.2× the plate's width, centred on it,
 * with its base a little above the plate's foot. As one box, that is a 1.7:1
 * frame with the plate across the bottom 83% of its width (centred) and the
 * product fitted (`object-contain`, so never cropped) into the full width above
 * an 11% foot.
 *
 * The frame is bottom-aligned in the same slot sizes as before, so the marquee's
 * rhythm and speed are unchanged.
 */
function Colourway({ src, label }: { src: string; label: string }) {
  return (
    <div className="flex h-[160px] w-[260px] shrink-0 items-end sm:h-[200px] sm:w-[330px] lg:h-[230px] lg:w-[390px]">
      <div className="relative aspect-[1.7] w-full select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PLATE}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute bottom-0 left-[8.33%] w-[83.33%]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cldOptimize(src, 800)}
          alt={label}
          loading="lazy"
          draggable={false}
          className="absolute inset-x-0 top-0 h-[88.9%] w-full object-contain object-bottom"
        />
      </div>
    </div>
  );
}
