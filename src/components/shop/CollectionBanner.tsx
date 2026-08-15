"use client";

import { cldOptimize } from "../../lib/image";

/**
 * The collection banner — a wide photograph with the title set over it, bottom
 * corners cut to the r58 hero radius so the light page slides out from under it.
 *
 * The same construction as the About banner, deliberately: the two pages invert
 * each other's surface (About is black, this one is #F6F6F6) but they open the
 * same way, which is what makes them read as one site rather than two.
 *
 * Entrances are CSS keyframes, not framer. This is the first screen — an element
 * animated by framer server-renders at `opacity: 0` and stays invisible until
 * hydration finishes, so a slow or failed bundle means a blank banner.
 */

/** The design's own banner art, and the floor if the studio publishes nothing. */
const BUNDLED = "/images/Rectangle%206.png";

export default function CollectionBanner({
  title,
  description,
  image,
}: {
  title: string;
  description?: string;
  image?: string | null;
}) {
  const src = image?.trim() || BUNDLED;

  /* The top padding is the navbar's height EXACTLY, because the banner is meant
     to start where the bar ends. It was 92px against a bar that is only 76px
     below `lg` — the 16px difference showed as a strip of the page's ivory
     between the two, which reads as a gap rather than as spacing. 106px from
     `lg` matches the taller bar there, which is why desktop never showed it.
     Both numbers track `h-[76px] lg:h-[106px]` in Navbar.tsx. */
  return (
    <section className="relative pt-[76px] lg:pt-[106px]">
      <div className="relative isolate h-[clamp(340px,39vw,672px)] overflow-hidden rounded-b-[28px] sm:rounded-b-[40px] lg:rounded-b-[58px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src.startsWith("/images/") ? src : cldOptimize(src, 2000)}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full animate-[heroPop_1.4s_cubic-bezier(0.16,1,0.3,1)_both] object-cover"
        />

        {/* Figma lays a second rectangle over the top 474px of the 672px photo —
            a scrim that darkens where the type sits and releases toward the
            bottom, so the furniture in the lower half of the shot stays visible.
            Both the 56px title and the 24px description count as large text,
            which needs 3:1; this holds it over a light crop. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,1,1,0.62)_0%,rgba(1,1,1,0.58)_45%,rgba(1,1,1,0.15)_100%)]"
        />

        <div className="section-x absolute inset-0 flex flex-col items-center justify-center text-center">
          <h1
            className="display-section max-w-[20ch] font-medium uppercase text-white animate-[heroRise_0.9s_cubic-bezier(0.16,1,0.3,1)_both]"
            style={{ animationDelay: "180ms" }}
          >
            {title}
          </h1>
          {description && (
            <p
              className="mt-4 max-w-[60ch] animate-[heroBlurIn_0.8s_ease-out_both] text-lead text-[#d5d0d0] lg:mt-[18px]"
              style={{ animationDelay: "380ms" }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
