"use client";

import { useEffect, useState } from "react";
import Reveal from "../ui/Reveal";
import { cldOptimize } from "../../lib/image";
import { brochureDownloadUrl, fetchBrochures, type Brochure } from "../../lib/brochures";

/**
 * Brochures — tall cards with the type set along their left edge like the spine
 * of a printed brochure, opening as the pointer crosses them.
 *
 * ONE CARD PER PUBLISHED BROCHURE, and every word on it is the studio's.
 *
 * This used to draw three hardcoded "editorial" cards and merely borrow a
 * published brochure's FILE for whichever card sat at its index — so creating a
 * brochure in the admin changed nothing visible: its title, its description and
 * its cover were all discarded, and it silently became the download behind
 * someone else's card. Publishing one now adds a card carrying its own
 * everything, and unpublishing removes it.
 */

interface Card {
  id: string;
  image: string;
  title: string;
  description: string;
  /** The file, asked for as an attachment. Every card has one — see below. */
  href: string;
}

export default function BrochureStrip() {
  /** `null` until the request settles, so an empty list is not mistaken for
   *  "none published" on the first frame and the section does not flash. */
  const [brochures, setBrochures] = useState<Brochure[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    // `fetchBrochures` never rejects — an unreachable backend resolves to [].
    fetchBrochures({ noStore: true }).then((list) => {
      if (!cancelled) setBrochures(list);
    });
    return () => { cancelled = true; };
  }, []);

  /* `fetchBrochures` already keeps only PUBLISHED entries that carry a file, so
     every card here has something to download — which is why the Download
     button is unconditional rather than something a card might lack. */
  const cards: Card[] = (brochures ?? []).map((b) => ({
    id: b._id,
    image: b.coverImage || "",
    title: b.title,
    description: b.description || "",
    href: brochureDownloadUrl(b.fileUrl, b.title),
  }));

  // Nothing published yet — a "Brochures" heading over an empty row reads as a
  // fault. `null` is still loading and must not trip this.
  if (brochures !== null && cards.length === 0) return null;

  return (
    <section id="brochures" className="surface-light bg-ivory section-pad section-x">
      <div className="section-inner">
        <Reveal>
          <h2 className="display-section text-ink">Brochures</h2>
          <p className="mt-3 max-w-[52ch] text-body text-muted">
            Explore our collection, crafted to inspire.
          </p>
        </Reveal>

        {/* A grid until `lg`, a flex ROW from there — the expansion is a flex
            one: each card grows from an equal share, and its siblings give back
            exactly what it takes, so the strip's total width never changes and
            nothing outside it moves. A grid cannot do that without animating
            `grid-template-columns`, which is far less widely smooth.
            `[&>*]:min-w-0` lets a card shrink below its content's width, without
            which the siblings would refuse to yield.

            `justify-start`: the closed cards are a NARROW column each and are
            not meant to fill the row — the reference leaves clear space to their
            right, and that space is what a card expands into. */}
        <div
          className="brochure-strip mt-10 grid max-w-[1100px] grid-cols-1 gap-5 sm:grid-cols-2
            lg:flex lg:justify-start lg:gap-6 lg:[&>*]:min-w-0"
        >
          {cards.map((card, i) => (
            <Reveal
              key={card.id}
              delay={i * 0.15}
              y={100}
              scaleFrom={0.97}
              /* Closed, a card is its own narrow width — NOT an equal share of
                 the row. It used to be `flex-1`, which made three cards look
                 right by accident and one card stretch across the full 1100px,
                 nothing like the reference. `grow-0` fixes the closed width;
                 hovering hands that card the row's free space, and `max-w` stops
                 a lone card from expanding to the full width of the section. */
              /* `shrink` is left at its default so a long row of brochures
                 compresses to fit rather than running off the container.

                 700ms on the same curve as the type inside, so the card opening
                 and the title swinging flat read as one movement rather than two
                 that happen to start together. The curve is a long, soft
                 deceleration — it leaves fast and settles slowly, which is what
                 stops the expansion feeling like a snap. */
              className="lg:max-w-[640px] lg:grow-0 lg:basis-[clamp(216px,17vw,248px)]
                lg:transition-[flex-grow] lg:duration-[var(--brochure-dur)]
                lg:ease-[var(--brochure-ease)] lg:hover:grow"
            >
              <BrochureCard card={card} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrochureCard({ card }: { card: Card }) {
  return (
    <a
      href={card.href}
      // Cloudinary already sends the file as an attachment, so this adds nothing
      // cross-origin — it is here for a self-hosted PDF, where it is the whole
      // mechanism. No `target`: a download that opens a tab flashes a blank one.
      download=""
      aria-label={`Download the ${card.title} brochure (PDF)`}
      className="brochure-card group relative block w-full overflow-hidden rounded-[24px]
        transition-[transform,box-shadow] duration-[var(--brochure-dur)] ease-[var(--brochure-ease)]
        hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.15)]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
        lg:rounded-[clamp(24px,2vw,32px)] lg:hover:translate-y-0"
    >
      {card.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cldOptimize(card.image, 1000)}
          alt=""
          aria-hidden
          loading="lazy"
          className="brochure-media absolute inset-0 h-full w-full object-cover
            transition-transform duration-[var(--brochure-dur)] ease-[var(--brochure-ease)]
            group-hover:scale-[1.06]"
        />
      ) : (
        <span aria-hidden className="img-placeholder absolute inset-0" />
      )}

      {/* The scrim follows the type. Below `lg` the caption lies across the foot
          of the card, so the gradient is weighted to the BOTTOM; from `lg` the
          type stands along the left edge and it runs left-to-right instead.
          A left-weighted scrim under a bottom-anchored caption would leave the
          end of every line sitting on bare photograph.

          This — plus the text-shadow on the type itself — is what keeps it
          readable over both the dark and the bright covers without resorting to
          a solid panel. */}
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.3)_35%,transparent_70%)]
          transition-opacity duration-[var(--brochure-dur)] ease-[var(--brochure-ease)] lg:group-hover:opacity-0
          lg:bg-[linear-gradient(to_right,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.2)_40%,transparent_70%)]"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.3)_40%,transparent_70%)]
          opacity-0 transition-opacity duration-[var(--brochure-dur)] ease-[var(--brochure-ease)] lg:group-hover:opacity-100"
      />

      {/* Download Brochure, top right. On EVERY card, because every card is a
          published brochure with a file behind it. Always visible where there is
          no hover to reveal it; on a pointer it fades in as the card opens.

          A `span`, not a button or a second link: the whole card is already the
          download, so this is the affordance for it rather than a rival control
          — which also keeps the markup valid, since an anchor cannot contain
          another. `aria-hidden` for the same reason: the anchor's own label
          already says what a click does, and a screen reader should hear it
          once. */}
      {/* Sized down on a phone, where it is permanently on screen and a shorter
          card leaves it competing with the caption for the same 240px. Every
          `sm:` below restores the size the tablet and desktop already had. */}
      <span
        aria-hidden
        className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-brand
          py-1 pl-4 pr-1 font-sans text-[13px] font-medium text-white
          shadow-[0_4px_16px_rgba(0,0,0,0.25)]
          transition-[opacity,transform] duration-[var(--brochure-dur)] ease-[var(--brochure-ease)]
          sm:right-5 sm:top-5 sm:gap-2 sm:py-1.5 sm:pl-5 sm:pr-1.5 sm:text-[15px]
          lg:-translate-y-1 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
      >
        <span className="whitespace-nowrap">Download Brochure</span>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-brand sm:h-9 sm:w-9">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[15px] w-[15px] sm:h-[18px] sm:w-[18px]"
          >
            <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        </span>
      </span>

      {/* The type, anchored to the card's bottom-left corner and PIVOTING about
          it: upright along the left edge while the card is closed, swinging flat
          along the bottom as it opens.

          A rotation, not `writing-mode`. The old vertical type was
          `writing-mode: vertical-rl`, which reads identically but cannot be
          animated — there is no interpolation between two writing modes, so the
          text would have snapped from one orientation to the other halfway
          through the card's expansion. A transform interpolates, runs on the
          compositor, and takes no part in layout, so the swing costs nothing and
          cannot shift anything around it.

          `-rotate-90` about `origin-bottom-left` sends the block UP from that
          corner, so the type reads bottom-to-top — and because the block stacks
          title above description, the rotation lands the title to the LEFT of
          its description, which is the order the reference shows. */}
      {/* `brochure-spine` sets the width against the card's HEIGHT, since that
          is the axis the block occupies once upright. It was a guessed 340px,
          which is why a long title ran past the top of a short card — the
          studio's titles are its own and can be any length, so the box has to
          follow the card rather than a number someone picked.

          Insets match the reference: seated in from the bottom-left corner, the
          title against the edge and the description as a second line beside it. */}
      {/* FLAT BELOW `lg`, STANDING FROM `lg`.

          A phone and a tablet have no hover, so a card there never opens — type
          left standing on its edge would simply never come down, and the reader
          would be asked to tilt their head at a caption that had no reason to be
          vertical. Below `lg` it lies across the foot of the card, pinned to
          both side insets so it is bounded by the card's own width.

          From `lg` the rotation applies and the hover swings it flat.

          THE TRANSFORM IS `rotate(-90deg) translateY(100%)`, IN THAT ORDER, and
          the order is the whole reason it sits inside the card. Rotating -90°
          about the bottom-left corner sends the block up AND LEFT — left by its
          own thickness, because the stack's height becomes a horizontal extent
          once it is on its side. That pushed the title and description off the
          card's left edge, where `overflow-hidden` clipped them. Translating the
          block down by its own height FIRST (the translate is written second,
          and transforms apply right to left) puts that thickness on the right of
          the anchor instead.

          Written as one `transform` rather than Tailwind's `rotate-*` and
          `translate-*` utilities: those compile to the separate `rotate` and
          `translate` properties, which the spec composes translate-after-rotate
          — the opposite order, and the broken one. */}
      <div
        className="brochure-spine absolute bottom-4 left-4 right-4 z-[5] flex origin-bottom-left
          flex-col items-start gap-1
          transition-transform duration-[var(--brochure-dur)] ease-[var(--brochure-ease)]
          sm:bottom-6 sm:left-6 sm:right-6 sm:gap-1.5
          lg:bottom-10 lg:left-8 lg:right-auto lg:gap-4
          lg:[transform:rotate(-90deg)_translateY(100%)]
          lg:group-hover:[transform:rotate(0deg)_translateY(0%)]"
      >
        {/* One line, always. A title broken across two stops reading as a title;
            `truncate` is the guard for one longer than the card, and does
            nothing at all to the lengths the reference shows. */}
        <h3
          className="w-full truncate font-sans text-[17px] font-semibold tracking-[0.02em]
            text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)]
            sm:text-[21px] lg:text-[clamp(20px,2vw,28px)]"
        >
          {card.title}
        </h3>
        {card.description && (
          /* Two lines, as the reference sets it. The description is free text
             from the admin, and an unbounded one would rotate into a block deep
             enough to cover the photograph it is supposed to sit on. */
          <p
            className="line-clamp-2 font-sans text-[13px] leading-[1.6] text-white/75 lg:text-[14px]
              [text-shadow:0_2px_12px_rgba(0,0,0,0.45)]"
          >
            {card.description}
          </p>
        )}
      </div>
    </a>
  );
}
