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
              /* THE WIDTH IS ANIMATED ON `flex-basis`, NOT `flex-grow`, and that
                 is what removes the snap.

                 Flexbox hands each item `grow_i / Σgrow` of the free space. With
                 every sibling at `grow-0`, the hovered card is the only non-zero
                 grower, so that ratio is 1 no matter how large its factor is —
                 0.001 and 1 both claim the entire remainder. Animating
                 `grow: 0 → 1` is therefore a STEP: the width jumps the moment the
                 factor leaves zero, and no duration or curve can smooth it,
                 because nothing is actually being interpolated.

                 `flex-basis` is a length, so it interpolates properly and the
                 width moves continuously across every frame. Siblings still give
                 way — `shrink` is left at its default, so they compress to make
                 room and the row's total width never changes. It also keeps a
                 lone card from spanning the whole section, which is what the
                 `max-w` cap was previously for. */
              className="lg:grow-0 lg:basis-[clamp(216px,17vw,248px)]
                lg:transition-[flex-basis] lg:duration-[var(--brochure-dur)]
                lg:ease-[var(--brochure-ease)] lg:hover:basis-[640px]"
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
        /* `translate`, not `transform` — the lift below is `-translate-y-1.5`,
           which Tailwind v4 compiles to the standalone `translate` property. */
        transition-[translate,box-shadow] duration-[var(--brochure-dur)] ease-[var(--brochure-ease)]
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
          `sm:` below restores the size the tablet and desktop already had.

          THE TRANSITION LISTS `translate`, NOT `transform`. Tailwind v4 compiles
          `-translate-y-*` to the standalone `translate` property, so the old
          `transition-[opacity,transform]` covered the fade and nothing else —
          the button's movement was never animated at all, it simply appeared at
          its final position while the opacity eased. That is the snap.

          From `lg` it starts a full height plus its inset ABOVE the card, so it
          is outside the photograph entirely (the card clips it) and slides down
          into place.

          NO ENTER DELAY. It briefly carried `group-hover:delay-150` so it would
          follow the card in — but a delay written on the hover state applies
          only on the way IN, which made entering and leaving different lengths.
          Every timing on this card is now declared on the base state, so the
          browser uses the identical duration and curve in both directions and
          the whole card opens and closes as one movement. */}
      <span
        aria-hidden
        className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-brand
          py-1 pl-4 pr-1 font-sans text-[13px] font-medium text-white
          shadow-[0_4px_16px_rgba(0,0,0,0.25)]
          transition-[opacity,translate] duration-[var(--brochure-dur)] ease-[var(--brochure-ease)]
          sm:right-5 sm:top-5 sm:gap-2 sm:py-1.5 sm:pl-5 sm:pr-1.5 sm:text-[15px]
          lg:-translate-y-[calc(100%+2rem)] lg:opacity-0
          lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
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
