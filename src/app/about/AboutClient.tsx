
"use client";

import AboutHero from "../../components/about/AboutHero";
import AboutBlock from "../../components/about/AboutBlock";
import type { AboutPage } from "../../lib/about";

/*******
 * About Us — rebuilt to the Figma frame (node 58:1313).
 *
 * A black page lit by red glows, a photographic banner, then one row of copy
 * opposite a framed photograph. Figma drew four rows; Our Story (titled "Our
 * mission" in the studio), Our Vision and Visit Our Showroom were removed on
 * request. Their copy stays in the About singleton — nothing here reads it.
 *
 * ── WHERE THE CONTENT COMES FROM ──────────────────────────────────────────
 * EVERYTHING is the studio's: the banner's heading, subheading and photograph,
 * and the block's heading, description and photograph, all from the About
 * singleton (Studio → About Page).
 *
 * The constants below are the FLOOR, not the content. Every lookup is
 * `about.x?.trim() || <the design's own>`, so a field the studio has not filled
 * — or an unreachable API — renders the page exactly as it shipped rather than
 * as a gap. `?.trim()` and not `??`: a field cleared to whitespace in the admin
 * means "put the original back", which is the only sane reading of an empty box.
 *
 * So this page cannot be empty and cannot fail: with the API down it renders
 * complete, on bundled copy and bundled photography. That is why there is no
 * empty state and no error state here — there is no condition either could
 * describe. `loading.tsx` remains, because the fetch is still awaited.
 */

const BANNER = {
  title: "About Belovi",
  tagline: "Where every seat brings people closer.",
};

/** The design's own copy and photograph — the floor under the studio's. */
const PROFILE = {
  title: "About Us",
  body: "Belovi is a luxury furniture brand built around the belief that furniture should do more than fill a space — it should create an experience. We bring together distinctive forms, refined materials, exceptional comfort, and thoughtful craftsmanship to create pieces that become part of the spaces and moments people love.",
  image: "/images/image%2020.png",
};

const BANNER_IMAGE = "/images/Rectangle%208%20(1).png";

export default function AboutClient({ about }: { about: AboutPage | null }) {
  /* `about` is null when the studio is unreachable. Nothing branches on it —
     every lookup below simply finds nothing and takes the bundled value, so an
     outage costs the page its custom content and not the page. */

  /** The studio's word for this field, or the design's own. */
  const copy = (field: keyof AboutPage, fallback: string) =>
    (about?.[field] as string | undefined)?.trim() || fallback;

  return (
    <main className="surface-dark glow-field flex-1 bg-onyx">
      <AboutHero
        title={copy("introTitle", BANNER.title)}
        tagline={copy("introBody", BANNER.tagline)}
        image={about?.introImage || BANNER_IMAGE}
      />

      <div className="section-pad">
        <AboutBlock
          title={copy("profileTitle", PROFILE.title)}
          body={copy("profileBody", PROFILE.body)}
          image={about?.profileImage || PROFILE.image}
          /* Often just below the fold on a laptop — worth fetching eagerly. */
          priority
        />
      </div>
    </main>
  );
}
