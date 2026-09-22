import { apiBase } from "./story";

/** A YouTube video in the homepage Video Showcase, as added in the studio. */
export interface Video {
  _id: string;
  name: string;
  /** The link as pasted in the studio. */
  url?: string;
  /** Derived by the backend from the pasted link — always a playable id. */
  youtubeId: string;
  /** Optional product shown over the card. Null when the studio left it blank. */
  productName?: string | null;
  actualPrice?: number | null;
  offerPrice?: number | null;
}

/**
 * Every showcase video, newest first.
 *
 * Never rejects: like the brochure strip, an unreachable backend collapses the
 * section rather than taking the homepage down with it.
 */
export async function fetchVideos(): Promise<Video[]> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/videos`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.data)) return [];
    return (json.data as Video[]).filter((v) => v.youtubeId && v.name);
  } catch {
    return [];
  }
}

/**
 * Thumbnail sizes, best first. `oar2` is the original aspect ratio (9:16 for
 * Shorts, 16:9 otherwise), so it fills a tall card; older uploads lack it.
 */
export const POSTER_SIZES = ["oar2", "maxresdefault", "hqdefault"] as const;

export const youtubeThumb = (id: string, size: (typeof POSTER_SIZES)[number]) =>
  `https://i.ytimg.com/vi/${id}/${size}.jpg`;

/** A Short is vertical, so it gets a tall player rather than a pillar-boxed 16:9 one. */
export const isShort = (v: Video) => /\/shorts\//i.test(v.url ?? "");

/** What the shopper pays now, and the struck-through figure when it is a real discount. */
export function videoPrices(v: Video): { now: number | null; was: number | null } {
  const actual = v.actualPrice ?? null;
  const offer = v.offerPrice ?? null;
  return {
    now: offer ?? actual,
    was: offer !== null && actual !== null && actual > offer ? actual : null,
  };
}

/** The slice of YouTube's IFrame Player API the card previews use. */
export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  destroy(): void;
  getIframe(): HTMLIFrameElement;
}

interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number }) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: { PLAYING: number };
}

let ytApi: Promise<YTNamespace> | null = null;

/**
 * Load the IFrame Player API once, on first use. If a blocker stops the script
 * the promise never settles, and the cards simply keep their posters.
 */
export function loadYouTubeApi(): Promise<YTNamespace> {
  ytApi ??= new Promise((resolve) => {
    const w = window as unknown as { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void };
    if (w.YT?.Player) return resolve(w.YT);
    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(w.YT!);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });
  return ytApi;
}

/**
 * YouTube's own player, which already carries every control the showcase needs:
 * play/pause, seek, mute, volume, captions and fullscreen. `youtube-nocookie`
 * sets no tracking cookies until the visitor presses play.
 */
export const youtubeEmbed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
