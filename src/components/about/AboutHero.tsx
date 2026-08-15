"use client";

import { cldOptimize } from "../../lib/image";

/**
 * The banner: a wide photograph with the page title set over it, its bottom
 * corners cut to the r58 hero radius so the black page appears to slide out from
 * under it.
 *
 * The navbar is fixed and the same near-black as the page, so the band starts
 * below it rather than under it — which is exactly how Figma draws it (banner
 * top = 106px = the navbar's height).
 *
 * EVERY ENTRANCE HERE IS A CSS KEYFRAME, not framer. This is the first screen:
 * an element animated by framer server-renders at `opacity: 0` and stays
 * invisible until hydration finishes, so a slow or failed bundle means a blank
 * banner. `heroRise` / `heroBlurIn` already exist in globals.css for the home
 * hero, and the reduced-motion block at the foot of that file collapses them.
 */
export default function AboutHero({
  title,
  tagline,
  image,
}: {
  title?: string;
  tagline?: string;
  image?: string | null;
}) {
  // Figma sets the first word in brand red and the remainder in white, on two
  // lines. Splitting on the first space keeps that rule content-driven — a
  // one-word heading simply renders red, with no empty second line.
  const [lead, ...rest] = (title || "").trim().split(/\s+/);
  const tail = rest.join(" ");

  return (
    <section className="relative z-10 pt-[92px] lg:pt-[106px]">
      <div className="relative isolate h-[clamp(360px,52vw,672px)] overflow-hidden rounded-b-[28px] sm:rounded-b-[40px] lg:rounded-b-[58px]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cldOptimize(image, 2000)}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full animate-[heroPop_1.4s_cubic-bezier(0.16,1,0.3,1)_both] object-cover"
          />
        ) : (
          <div className="img-placeholder absolute inset-0" />
        )}

        {/* The title is white over an uncontrolled photograph, so it carries its
            own contrast rather than trusting the crop — darkest through the
            middle band where the type actually sits. Both the heading and the
            24px tagline count as large text, which needs 3:1; this holds that
            even over a white-out interior shot, without flattening a dark one
            into a black rectangle. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,1,1,0.42)_0%,rgba(1,1,1,0.62)_45%,rgba(1,1,1,0.38)_100%)]"
        />

        {/* A centred COLUMN, not centred text. Figma stacks the two words in a
            545px box centred on the frame, sets them flush left inside it, and
            pushes the second word across with six leading spaces (≈1.55em in
            Montserrat) — so the pair reads as a stagger rather than as two
            centred lines. Centred text would collapse that back into a stack.
            The tagline is centred within the same box, which is why the two are
            aligned differently to each other by design.

            Below `lg` the stagger goes away: an indent that reads as poise at
            94px reads as a mistake at 36px on a phone. */}
        <div className="section-x absolute inset-0 flex flex-col items-center justify-center">
          {title && (
            <h1 className="display-hero text-center font-medium leading-[1.2] text-white lg:text-left">
              <span
                className="block animate-[heroRise_0.9s_cubic-bezier(0.16,1,0.3,1)_both] text-brand"
                style={{ animationDelay: "200ms" }}
              >
                {lead}
              </span>
              {tail && (
                <span
                  className="block animate-[heroRise_0.9s_cubic-bezier(0.16,1,0.3,1)_both] lg:pl-[1.55em]"
                  style={{ animationDelay: "320ms" }}
                >
                  {tail}
                </span>
              )}
            </h1>
          )}
          {tagline && (
            <p
              /* #D5D0D0 verbatim from Figma — a warm off-white that sits down
                 from the headline's pure white without going grey. 11:1 on the
                 scrimmed photograph. */
              className="mt-4 max-w-[34ch] animate-[heroBlurIn_0.8s_ease-out_both] text-center text-lead text-[#d5d0d0] lg:mt-[18px]"
              style={{ animationDelay: "520ms" }}
            >
              {tagline}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
