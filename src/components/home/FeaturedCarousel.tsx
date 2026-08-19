"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "../ui/Reveal";
import Link from "next/link";
import { cldOptimize } from "../../lib/image";
import { featuredHref, type FeaturedCollection, type FeaturedCardProduct } from "../../lib/featured";

/**
 * Featured collections — an editorial rail of tall lifestyle cards, each with a
 * white info panel anchored across the foot of its photograph.
 *
 * The rail is a native scroll container with snap points rather than Embla or
 * Swiper. It costs no dependency and no state, keeps keyboard, trackpad and
 * touch behaviour for free, and degrades to a plain swipe list; the arrows
 * simply scroll it by one measured card. The right-edge bleed — the thing that
 * makes the fourth card peek — is the container's own padding, so it lines the
 * first card up with the heading while letting the last run off the page.
 *
 * EVERY CARD IS A GROUP OF PIECES, composed in the admin. The homepage shows the
 * cards and nothing else: clicking one goes to `/collections/<id>`, that
 * collection's own listing, where its pieces are shown with the shop's full
 * filtering and sorting. The pieces are deliberately NOT rendered here — the
 * rail is an index, and unrolling every collection beneath it would make the
 * homepage the listing page.
 *
 * This file used to hardcode three "signature" cards ahead of the admin's list.
 * The studio could not edit the three it actually saw. The rail is now exactly
 * the cards saved in the admin, in the order saved there.
 */

/** Gap between cards, shared by the layout and the arrow step. */
const RAIL_GAP = 20;

/**
 * How far the pointer must travel before a press counts as a drag rather than a
 * click. Small enough that deliberate dragging feels immediate, large enough to
 * absorb the couple of pixels a hand moves while pressing a mouse button — below
 * this, every click on a card would be read as a tiny drag and swallowed.
 */
const DRAG_SLOP = 6;

/** A piece's own photograph, else its first variant's. */
const firstImage = (p: FeaturedCardProduct) =>
  p.images?.[0] || p.variants?.[0]?.images?.[0] || "";

interface Card {
  id: string;
  href: string;
  image: string;
  name: string;
  type: string;
  badge?: string;
  /** Only for the "N pieces" line — the pieces themselves live on the listing. */
  count: number;
}

export default function FeaturedCarousel({ data }: { data: FeaturedCollection | null }) {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    /** A press has happened; this may still turn out to be a click. */
    armed: false,
    /** The pointer travelled past `DRAG_SLOP` — it is a drag, not a click. */
    dragging: false,
    startX: 0,
    startScroll: 0,
    pointerId: -1,
  });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /* A group whose pieces have all been deleted populates to nothing — there is
     no photograph, no name and nothing to show when it is selected, so it is
     dropped rather than drawn empty. Each field falls back to the FIRST piece,
     so a card the studio composed by picking pieces and typing nothing still
     reads correctly. */
  const cards: Card[] = (data?.cards ?? [])
    .map((c) => ({ ...c, products: (c.products ?? []).filter(Boolean) }))
    .filter((c) => c.products.length > 0)
    .map((c) => {
      const lead = c.products[0];
      return {
        id: c._id,
        href: featuredHref(c._id),
        image: c.image || firstImage(lead),
        name: c.title || lead.name,
        type: c.subtitle || lead.category || "",
        badge: c.badge || undefined,
        count: c.products.length,
      };
    });

  const syncEdges = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    syncEdges();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener("scroll", syncEdges, { passive: true });
    window.addEventListener("resize", syncEdges);
    return () => {
      el.removeEventListener("scroll", syncEdges);
      window.removeEventListener("resize", syncEdges);
    };
  }, [syncEdges, cards.length]);

  /** One card plus its gap — measured, so it stays right at every breakpoint. */
  const nudge = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + RAIL_GAP : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  /**
   * Click-and-drag for mice; touch and trackpad already scroll natively.
   *
   * THE CAPTURE IS DEFERRED UNTIL THE POINTER ACTUALLY MOVES, and that is the
   * whole point. Capturing on pointerdown — which this did — makes the browser
   * dispatch the following `click` at the CAPTURING element, so the rail
   * swallowed it and the card's anchor never navigated. Touch returned early
   * before reaching the capture, which is why the rail worked on a phone and
   * only ever failed on a mouse.
   *
   * So: a press arms a drag but captures nothing, and a click behaves like a
   * click on any ordinary link. Only once the pointer has travelled past
   * `DRAG_SLOP` does this become a drag and take the capture — at which point
   * suppressing the click is what we want anyway, since dragging the rail to
   * one side should not also open whatever was under the cursor.
   */
  const onPointerDown = (e: React.PointerEvent) => {
    const el = railRef.current;
    // Primary button only: a right- or middle-click is not a drag, and middle
    // click must stay free to open the card in a new tab.
    if (!el || e.pointerType === "touch" || e.button !== 0) return;
    drag.current = {
      armed: true,
      dragging: false,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      pointerId: e.pointerId,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = railRef.current;
    const d = drag.current;
    if (!el || !d.armed) return;

    // A pointerup that landed outside the rail before the drag began never came
    // back to us, so the button state is the only honest signal that it ended.
    if (e.buttons === 0) {
      d.armed = false;
      return;
    }

    const dx = e.clientX - d.startX;
    if (!d.dragging) {
      if (Math.abs(dx) < DRAG_SLOP) return;
      d.dragging = true;
      // Now that it is a drag, capture so the pointer can leave the rail and
      // still steer it — and so pointerup comes back here to end it.
      el.setPointerCapture(d.pointerId);
    }
    el.scrollLeft = d.startScroll - dx;
  };

  const endDrag = (e: React.PointerEvent) => {
    const el = railRef.current;
    if (el?.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    drag.current.armed = false;
    // `dragging` is deliberately left set: the click that follows this pointerup
    // is the one to suppress, and the handler below clears the flag.
  };

  /**
   * Swallows the click that ends a drag, so releasing the mouse after shoving
   * the rail sideways does not also open the card underneath. Capture phase, so
   * it runs before the anchor's own default action.
   */
  const onClickCapture = (e: React.MouseEvent) => {
    if (!drag.current.dragging) return;
    drag.current.dragging = false;
    e.preventDefault();
    e.stopPropagation();
  };

  /* Hidden by the studio, or nothing saved to show — either way the band is a
     heading with an empty rail under it, which is worse than no band. */
  if ((data && !data.isVisible) || cards.length === 0) return null;

  return (
    <section id="featured-collection" className="surface-light overflow-hidden bg-ivory section-pad">
      <div className="section-x">
        <div className="section-inner flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <Reveal className="max-w-[640px]">
            <h2 className="display-section text-ink">
              {data?.heading || "Featured collections"}
            </h2>
            <p className="mt-3 text-body leading-[1.6] text-muted">
              {data?.description ||
                "Discover our signature pieces, thoughtfully selected to bring comfort, character, and luxury to your space."}
            </p>
          </Reveal>

          {/* Hidden when the rail cannot scroll at all. A pair of controls that
              can never do anything is noise, and the filled one greyed out
              reads as broken rather than as unavailable. */}
          <Reveal delay={0.2} className={`shrink-0 ${atStart && atEnd ? "hidden" : ""}`}>
            <div className="flex gap-3">
              <RailButton
                label="Previous collection"
                onClick={() => nudge(-1)}
                disabled={atStart}
                direction="left"
              />
              <RailButton
                label="Next collection"
                onClick={() => nudge(1)}
                disabled={atEnd}
                direction="right"
                filled
              />
            </div>
          </Reveal>
        </div>
      </div>

      <div
          ref={railRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured collections"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); nudge(1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); nudge(-1); }
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          /* `pb-14`, not `pb-4`: `overflow-x-auto` makes the vertical axis
             clip too, so the info panel hanging below each card would be cut
             off. The padding is the room it hangs into. */
          className="rail-grab hide-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-14
            [padding-inline:clamp(1.25rem,6.4vw,6.875rem)] [scroll-padding-inline:clamp(1.25rem,6.4vw,6.875rem)]"
        >
          {cards.map((card) => (
            <FeatureCard key={card.id} card={card} />
          ))}
      </div>
    </section>
  );
}

function RailButton({
  label,
  onClick,
  disabled,
  direction,
  filled = false,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  direction: "left" | "right";
  /** The next control is filled, the previous outlined — the design's hierarchy. */
  filled?: boolean;
}) {
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
            : "border-[1.5px] border-ink/80 text-ink enabled:hover:scale-105 enabled:hover:border-ink enabled:hover:bg-ink/[0.04]"
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

function FeatureCard({ card }: { card: Card }) {
  return (
    /* A real link, so the collection is shareable, opens in a new tab and gets
       prefetched — none of which a click handler would give. */
    <Link
      data-card
      href={card.href}
      draggable={false}
      aria-label={`${card.name} — ${card.count} ${card.count === 1 ? "piece" : "pieces"}`}
      /* NO `overflow-hidden` here any more — the info panel has to escape this
         box to hang below the photograph. The clipping moved inward, onto the
         image wrapper, which is the only thing that actually needs it (to keep
         the photograph inside the rounded corners). */
      className="group relative block w-[76vw] shrink-0 snap-start
        transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
        hover:-translate-y-1.5 sm:w-[44vw] md:w-[30vw] lg:w-[clamp(220px,19vw,290px)]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-sand sm:rounded-[28px]">
        {/* `bg-sand` shows through when a card has no photograph yet, rather
            than a broken-image glyph. */}
        {card.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cldOptimize(card.image, 1000)}
            alt=""
            loading="lazy"
            draggable={false}
            className="h-full w-full select-none object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
          />
        )}
        {/* Keeps the badge legible over whatever the photograph does up there. */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/15 to-transparent"
        />

        {card.badge && (
          <span className="absolute right-3.5 top-3.5 z-10 flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 font-sans text-[12px] font-medium text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] sm:text-[13px]">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-white group-hover:animate-[dotPulse_0.6s_ease-in-out_infinite]"
            />
            {card.badge}
          </span>
        )}

      </div>

      {/* The signature element: a white panel that OVERLAPS the foot of the
          photograph and hangs past it.

          It sits outside the image wrapper now, as a sibling, so the wrapper's
          `overflow-hidden` cannot clip it — that clipping is what previously
          pinned it flush inside the bottom edge. Positioned against the card
          itself and pushed down 38% of its own height, which is roughly the
          40/60 split of outside-to-inside the reference draws, and stays right
          at any panel height because it is a percentage of the panel rather
          than a fixed offset.

          All four corners are rounded now: it is a free-floating card, not a
          shape butted against the bottom of another. */}
      <div
        className="panel-breathe absolute bottom-0 left-1/2 z-[5] w-[92%] -translate-x-1/2
          translate-y-[38%] rounded-[16px] bg-cream px-4 py-4 text-center
          transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          group-hover:translate-y-[34%] sm:rounded-[20px] sm:px-5"
      >
        <h3 className="font-sans text-[15px] font-medium leading-snug text-muted sm:text-[17px]">
          {card.name}
        </h3>
        {card.type && (
          <p className="mt-1 font-sans text-[16px] text-brand">{card.type}</p>
        )}
      </div>
    </Link>
  );
}
