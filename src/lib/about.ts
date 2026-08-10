import { apiBase } from "./story";

/**
 * The About Us page content, as authored in the studio.
 *
 * One singleton, four blocks — intro, company profile, vision, showroom. The
 * *story* is deliberately absent: that stays the StorySection feed the About
 * page renders between vision and showroom, so it is written in one place.
 *
 * Every field is optional; each block on the page omits itself when its content
 * is missing, so an unfilled About renders shorter rather than broken. Content
 * is supplied by BELOVA — the storefront ships no invented copy.
 */

export interface VisionPoint {
  label: string;
  text: string;
}

export interface AboutPage {
  introEyebrow?: string;
  introTitle?: string;
  introBody?: string;
  introImage?: string;

  profileEyebrow?: string;
  profileTitle?: string;
  profileBody?: string;
  profileImage?: string;

  visionEyebrow?: string;
  visionTitle?: string;
  visionBody?: string;
  visionPoints?: VisionPoint[];

  showroomEyebrow?: string;
  showroomTitle?: string;
  showroomBody?: string;
  showroomAddress?: string;
  showroomHours?: string;
  /** Google Maps *embed* URL — rendered in a lazy iframe. */
  showroomMapUrl?: string;
  showroomImages?: string[];

  metaTitle?: string;
  metaDescription?: string;
}

/** Fetch the About singleton. Returns null on any failure (the page falls back). */
export async function fetchAbout(opts?: { noStore?: boolean }): Promise<AboutPage | null> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/about`, {
      cache: opts?.noStore ? "no-store" : "default",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success && json.data ? (json.data as AboutPage) : null;
  } catch {
    return null;
  }
}
