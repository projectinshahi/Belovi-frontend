"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { VolumeX, X } from "lucide-react";
import Reveal from "../ui/Reveal";
import RailButton from "../ui/RailButton";
import { formatINR } from "../../lib/product";
import {
  POSTER_SIZES,
  fetchVideos,
  isShort,
  loadYouTubeApi,
  videoPrices,
  youtubeEmbed,
  youtubeThumb,
  type Video,
  type YTPlayer,
} from "../../lib/videos";

/**
 * Video Showcase — the studio's YouTube videos as tall cards on a black panel
 * that matches Categories, drifting sideways on their own and opening in a full
 * player.
 *
 * THE RAIL IS A NATIVE SCROLL CONTAINER, NOT A TRANSFORM MARQUEE. A CSS marquee
 * cannot be swiped, so a phone user could never go back to a video that had
 * drifted past. Here requestAnimationFrame nudges `scrollLeft`, and touch,
 * trackpad, keyboard and the arrows all still work because it is ordinary
 * scrolling underneath.
 *
 * It only moves when the videos overflow the panel. The list is then drawn twice
 * and the position jumps back one copy's length at the seam, which is invisible
 * because both copies are identical. Too few videos to overflow sit still in a
 * row, since looping two cards across a wide screen would show each one twice
 * side by side.
 *
 * It pauses while a mouse is over the rail, while a card has keyboard focus,
 * for a few seconds after a touch or an arrow press, while the player is open
 * and while the rail is off screen. Reduced motion turns the drift off entirely.
 *
 * THE ACTIVE CARD PLAYS. The left-most card that is fully inside the rail plays
 * a muted, chrome-less preview in place; when it drifts out of that position its
 * preview pauses and the next card's starts. Previews use YouTube's IFrame
 * Player API so they can really pause. A player is only created for the active
 * card and the one after it (pre-warmed, so the hand-over is quick), and is
 * destroyed once its card leaves the screen, so at most a few exist at once.
 * Reduced motion and data-saver keep every card on its poster.
 */

/** Drift speed, in pixels per second. Slow enough to read every name. */
const SPEED = 40;

/** How long a touch or an arrow press holds the drift, in ms. */
const HOLD_MS = 4000;

/** Gap between cards, shared by the layout and the arrow step. */
const GAP = 20;

/** Matches the Categories panel, so the rail and heading line up with it. */
const PAD_X = "px-5 sm:px-10 lg:px-[clamp(2.5rem,5vw,5rem)]";

/** Tall 9:16 cards: about 1.4 on a phone, three on a tablet, four on a laptop. */
const CARD_W = "w-[64vw] max-w-[300px] shrink-0 sm:w-[clamp(230px,22vw,320px)] sm:max-w-none";

/** Distance from one copy of the list to the next — one full loop. */
const loopLength = (group: HTMLElement) =>
  ((group.nextElementSibling as HTMLElement | null)?.offsetLeft ?? group.offsetLeft) -
  group.offsetLeft;

/** The visitor asked their browser to save data. */
const saveData = () =>
  typeof navigator !== "undefined" &&
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

export default function VideoShowcase() {
  /** `null` until the request settles, so the section does not flash. */
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [playing, setPlaying] = useState<Video | null>(null);
  /** The list overflows the panel, so it is doubled and drifts. */
  const [loop, setLoop] = useState(false);
  /** Index (across both copies) of the card whose preview plays; -1 for none. */
  const [active, setActive] = useState(-1);
  /** Cards holding a preview player: the active one, the next, and any still on screen. */
  const [warm, setWarm] = useState<number[]>([]);
  const [sectionVisible, setSectionVisible] = useState(false);
  const reduce = useReducedMotion();
  const previews = !reduce && !saveData();

  const railRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const inView = useRef(false);
  const playerOpen = useRef(false);
  const holdUntil = useRef(0);

  useEffect(() => {
    let cancelled = false;
    // `fetchVideos` never rejects; an unreachable backend resolves to [].
    fetchVideos().then((list) => {
      if (!cancelled) setVideos(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Overflow and visibility. The observers call back asynchronously, so no
  // state is set synchronously inside the effect.
  useEffect(() => {
    const rail = railRef.current;
    const group = groupRef.current;
    if (!rail || !group) return;

    const ro = new ResizeObserver(() => setLoop(group.offsetWidth > rail.clientWidth));
    ro.observe(rail);
    ro.observe(group);

    const io = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      setSectionVisible(entry.isIntersecting);
    });
    io.observe(rail);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [videos]);

  // The drift.
  useEffect(() => {
    const rail = railRef.current;
    const group = groupRef.current;
    if (!loop || !rail || !group) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* A float of our own, because browsers may round `scrollLeft` to whole
       pixels and 40px/s is under one pixel a frame. */
    let pos = rail.scrollLeft;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      const idle =
        !hovered.current &&
        !focused.current &&
        !playerOpen.current &&
        inView.current &&
        now > holdUntil.current;

      if (idle) {
        // Someone scrolled it by hand since the last frame: carry on from there.
        if (Math.abs(rail.scrollLeft - pos) > 2) pos = rail.scrollLeft;
        pos += SPEED * dt;
        const start = group.offsetLeft;
        const length = loopLength(group);
        if (pos >= start + length) pos -= length;
        rail.scrollLeft = pos;
      } else {
        pos = rail.scrollLeft;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loop]);

  /* Which card is active, and which cards keep a player. Re-measured at most
     once a frame, on scroll (the drift scrolls too) and on resize. State only
     changes when a card crosses a boundary, so the drift itself re-renders
     nothing. */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !videos?.length) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const box = rail.getBoundingClientRect();
      const style = getComputedStyle(rail);
      // The padding is where the edge fade sits; a card entering it is leaving.
      const left = box.left + parseFloat(style.paddingLeft) - 2;
      const right = box.right - parseFloat(style.paddingRight) + 2;
      const onScreen = new Set<number>();
      let next = -1;
      rail.querySelectorAll<HTMLElement>("[data-card]").forEach((card, i) => {
        const r = card.getBoundingClientRect();
        if (r.right > box.left && r.left < box.right) onScreen.add(i);
        if (next < 0 && r.left >= left && r.right <= right) next = i;
      });

      setActive(next);
      setWarm((prev) => {
        const keep = prev.filter((i) => onScreen.has(i));
        for (const i of [next, next + 1]) {
          if (i >= 0 && onScreen.has(i) && !keep.includes(i)) keep.push(i);
        }
        return keep.length === prev.length && keep.every((i) => prev.includes(i)) ? prev : keep;
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    rail.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      rail.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [videos, loop]);

  const hold = () => {
    holdUntil.current = performance.now() + HOLD_MS;
  };

  /** One card plus its gap, measured, and wrapped so the arrows never hit an end. */
  const nudge = (dir: 1 | -1) => {
    const rail = railRef.current;
    const group = groupRef.current;
    if (!rail || !group) return;
    hold();
    const card = group.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + GAP : rail.clientWidth * 0.8;
    const start = group.offsetLeft;
    const length = loopLength(group);
    if (rail.scrollLeft >= start + length) rail.scrollLeft -= length;
    if (dir < 0 && rail.scrollLeft - step < start) rail.scrollLeft += length;
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const open = (video: Video) => {
    playerOpen.current = true;
    setPlaying(video);
  };

  const close = () => {
    playerOpen.current = false;
    hold();
    setPlaying(null);
  };

  // Nothing added yet: no heading over an empty panel. `null` is still loading.
  if (videos !== null && videos.length === 0) return null;

  const card = (v: Video, index: number, copy: boolean) => (
    <VideoCard
      key={`${copy ? "b" : "a"}-${v._id}`}
      video={v}
      copy={copy}
      onPlay={() => open(v)}
      preview={previews && warm.includes(index)}
      active={index === active && !playing && sectionVisible}
    />
  );

  return (
    <section id="videos" className="bg-ivory py-3 sm:py-6">
      <div className="surface-dark w-full overflow-hidden rounded-[24px] bg-onyx py-10 sm:rounded-[48px] sm:py-12 lg:py-[56px]">
        <div className="mx-auto max-w-[1720px]">
          <div className={`flex items-end justify-between gap-6 ${PAD_X}`}>
            <Reveal>
              <h2 className="display-section text-ink">Video Showcase</h2>
              <p className="mt-3 max-w-[52ch] text-body text-muted">
                See the collection in motion.
              </p>
            </Reveal>
            {loop && (
              <Reveal delay={0.2} className="hidden shrink-0 sm:block">
                <div className="flex gap-3">
                  <RailButton
                    label="Previous video"
                    onClick={() => nudge(-1)}
                    disabled={false}
                    direction="left"
                    tone="dark"
                  />
                  <RailButton
                    label="Next video"
                    onClick={() => nudge(1)}
                    disabled={false}
                    direction="right"
                    filled
                  />
                </div>
              </Reveal>
            )}
          </div>

          <Reveal delay={0.1}>
            <div
              ref={railRef}
              aria-label="Videos"
              role="region"
              className={`hide-scrollbar relative mt-8 overflow-x-auto sm:mt-10 ${PAD_X} ${
                loop ? "video-rail-fade" : ""
              }`}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") hovered.current = true;
              }}
              onPointerLeave={() => {
                hovered.current = false;
              }}
              onTouchStart={() => {
                holdUntil.current = Infinity;
              }}
              onTouchEnd={hold}
              onTouchCancel={hold}
              onFocus={() => {
                focused.current = true;
              }}
              onBlur={() => {
                focused.current = false;
              }}
            >
              <div className="flex w-max gap-5">
                {videos === null ? (
                  <div className="flex gap-5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`aspect-[9/16] animate-pulse rounded-[20px] bg-sand sm:rounded-[24px] ${CARD_W}`}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <div ref={groupRef} className="flex gap-5">
                      {videos.map((v, i) => card(v, i, false))}
                    </div>
                    {/* The second copy exists only to hide the seam. It stays
                        clickable (not `inert`) because half the visible cards can
                        be copies mid-loop, but it is out of the tab order and
                        hidden from screen readers so the list is announced once. */}
                    {loop && (
                      <div className="flex gap-5" aria-hidden>
                        {videos.map((v, i) => card(v, videos.length + i, true))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {playing && <Player video={playing} onClose={close} />}
    </section>
  );
}

function VideoCard({
  video,
  onPlay,
  copy,
  preview,
  active,
}: {
  video: Video;
  onPlay: () => void;
  /** A card in the seam-hiding second copy. */
  copy: boolean;
  /** Hold a preview player for this card. */
  preview: boolean;
  /** This card's preview should be playing. */
  active: boolean;
}) {
  const { now, was } = videoPrices(video);
  // The product, when the studio named one; otherwise the video's own name.
  const title = video.productName || video.name;

  return (
    /* `group-has-[[data-on=true]]` reads the preview's own "playing" flag, so the
       play button and the muted hint follow it without lifting any state. */
    <div
      data-card
      className={`group relative aspect-[9/16] overflow-hidden rounded-[20px] bg-sand
        transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(0,0,0,0.5)] sm:rounded-[24px] ${CARD_W}`}
    >
      <span className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
        <Poster id={video.youtubeId} />
        {preview && <Preview id={video.youtubeId} active={active} />}
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]
          bg-[linear-gradient(to_top,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.5)_40%,transparent_100%)]"
      />

      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2
          place-items-center rounded-full bg-brand text-white shadow-[0_8px_28px_rgba(211,47,47,0.45)]
          transition-[scale,opacity,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          group-hover:scale-110 group-hover:bg-brand-hover group-has-[[data-on=true]]:opacity-0
          sm:h-16 sm:w-16"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-6 w-6 sm:h-7 sm:w-7">
          <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.24-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
        </svg>
      </span>

      {/* The preview is muted; this says so, and that a tap brings the sound. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full
          bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity duration-500
          group-has-[[data-on=true]]:opacity-100 sm:right-4 sm:top-4"
      >
        <VolumeX size={15} />
      </span>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="line-clamp-2 font-sans text-[13px] font-medium uppercase leading-[1.45] tracking-[0.08em] text-white sm:text-[14px]">
          {title}
        </p>
        {now !== null && (
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            {/* Red only when it is a sale price, as the reference sets it. */}
            <span
              className={`font-sans text-[20px] font-semibold leading-none sm:text-[22px] ${
                was !== null ? "text-brand-hover" : "text-white"
              }`}
            >
              {formatINR(now)}
            </span>
            {was !== null && (
              <span className="font-sans text-[13px] leading-none text-white/55 line-through sm:text-[14px]">
                {formatINR(was)}
              </span>
            )}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onPlay}
        tabIndex={copy ? -1 : undefined}
        aria-label={`Play video: ${video.name}${video.productName ? ` — ${video.productName}` : ""}`}
        className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
      />
    </div>
  );
}

/**
 * The best thumbnail the video has. A missing size is either a 404 or, for
 * `maxresdefault`, a 120px grey placeholder served as a success — so its width
 * is checked too. `hqdefault` is 4:3 with letterbox bars; the zoom crops them.
 */
function Poster({ id }: { id: string }) {
  const [step, setStep] = useState(0);
  const size = POSTER_SIZES[step];
  const next = () => setStep((s) => Math.min(s + 1, POSTER_SIZES.length - 1));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={youtubeThumb(id, size)}
      alt=""
      loading="lazy"
      draggable={false}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth <= 120) next();
      }}
      onError={next}
      className={`absolute inset-0 h-full w-full object-cover ${size === "hqdefault" ? "scale-[1.34]" : ""}`}
    />
  );
}

/**
 * A muted, chrome-less YouTube player filling the card. It fades in only once
 * YouTube reports it PLAYING, so the poster never gives way to a black frame,
 * and it pauses (rather than unloading) when the card stops being active.
 *
 * The iframe is sized 16:9 at the card's full height and centred: a Short's
 * pillar-boxed frame then lands exactly on the 9:16 card, and a landscape video
 * is cropped to its middle, like `object-cover`.
 */
function Preview({ id, active }: { id: string; active: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const activeRef = useRef(active);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || !host) return;
      // The API replaces this node with its iframe, so React never owns it.
      const mount = document.createElement("div");
      host.appendChild(mount);
      playerRef.current = new YT.Player(mount, {
        videoId: id,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 0,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: 1,
          playlist: id,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: ({ target }) => {
            target.mute();
            const frame = target.getIframe();
            frame.tabIndex = -1;
            frame.setAttribute("aria-hidden", "true");
            if (activeRef.current) target.playVideo();
          },
          onStateChange: ({ data }) => setOn(data === YT.PlayerState.PLAYING),
        },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      host?.replaceChildren();
    };
  }, [id]);

  useEffect(() => {
    activeRef.current = active;
    const player = playerRef.current;
    // Before `onReady` the methods do not exist yet; `onReady` reads the ref.
    if (typeof player?.playVideo !== "function") return;
    if (active) player.playVideo();
    else player.pauseVideo();
  }, [active]);

  return (
    <div
      ref={hostRef}
      data-on={on && active}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-700
        data-[on=true]:opacity-100
        [&_iframe]:absolute [&_iframe]:left-1/2 [&_iframe]:top-0 [&_iframe]:aspect-video [&_iframe]:h-full
        [&_iframe]:w-auto [&_iframe]:max-w-none [&_iframe]:-translate-x-1/2"
    />
  );
}

/**
 * The player, in a native modal `<dialog>`: Escape, focus containment and the
 * top layer come from the browser. Closing it unmounts the iframe, which is
 * what stops playback.
 */
function Player({ video, onClose }: { video: Video; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const tall = isShort(video);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={video.name}
      onClose={onClose}
      // A click on the backdrop lands on the dialog itself; one inside does not.
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
      className={`video-dialog text-white ${tall ? "is-tall" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-4 sm:mb-4">
        <p className="min-w-0 truncate font-sans text-[15px] font-medium sm:text-[18px]">
          {video.name}
        </p>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Close video"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white
            transition-colors duration-300 hover:bg-brand focus-visible:outline-2 focus-visible:outline-white"
        >
          <X size={18} aria-hidden />
        </button>
      </div>
      <div
        className={`${tall ? "aspect-[9/16]" : "aspect-video"} w-full overflow-hidden rounded-[16px]
          bg-black shadow-[0_40px_120px_rgba(0,0,0,0.6)] sm:rounded-[24px]`}
      >
        <iframe
          src={youtubeEmbed(video.youtubeId)}
          title={video.name}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    </dialog>
  );
}
