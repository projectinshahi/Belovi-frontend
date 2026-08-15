"use client";

import AboutHero from "../../components/about/AboutHero";
import AboutBlock from "../../components/about/AboutBlock";
import type { AboutPage } from "../../lib/about";

/**
 * About Us — rebuilt to the Figma frame (node 58:1313).
 *
 * A black page lit by four red glows, a photographic banner, then four rows of
 * copy opposite a framed photograph, alternating sides. That is the whole page:
 * there is no CTA, no eyebrow, no map and no vision-point grid, because the
 * design has none.
 *
 * ── WHERE THE CONTENT COMES FROM ──────────────────────────────────────────
 * EVERYTHING is the studio's: the banner's heading, subheading and photograph,
 * and each block's heading, description and photograph, all from the About
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

/**
 * The four rows, in order. `image` is the design's own photograph — the floor
 * under the studio's upload, not a replacement for it. Spaces in the paths are
 * percent-encoded so the src needs no browser fixup.
 *
 * A blank line inside `body` is a paragraph break (the showroom's closing line
 * is its own paragraph, as Figma sets it).
 */
const BLOCKS = [
  {
    key: "profile" as const,
    /** The admin fields this block reads, in `<key>Title` / `<key>Body` form. */
    titleField: "profileTitle" as const,
    bodyField: "profileBody" as const,
    title: "About Us",
    body: "Belovi is a luxury furniture brand built around the belief that furniture should do more than fill a space — it should create an experience. We bring together distinctive forms, refined materials, exceptional comfort, and thoughtful craftsmanship to create pieces that become part of the spaces and moments people love.",
    image: "/images/image%2020.png",
  },
  {
    key: "story" as const,
    titleField: "storyTitle" as const,
    bodyField: "storyBody" as const,
    title: "Our Story",
    body: "Belovi began with a simple idea: beautiful spaces are built around meaningful moments. What started with a passion for distinctive furniture has grown into a collection of carefully selected pieces that balance artistic form with everyday comfort. Today, we continue to explore designs that bring people together and make spaces feel truly personal.",
    image: "/images/image%2022.png",
  },
  {
    key: "vision" as const,
    titleField: "visionTitle" as const,
    bodyField: "visionBody" as const,
    title: "Our Vision",
    body: "We believe furniture should be more than something you place in a room — it should shape how you experience it. Our vision is to create spaces that inspire comfort, connection, and individuality through exceptional design.",
    image: "/images/image%2024.png",
  },
  {
    key: "showroom" as const,
    titleField: "showroomTitle" as const,
    bodyField: "showroomBody" as const,
    title: "Visit Our Showroom",
    body: "Experience the Belovi collection beyond the screen. Step into our showroom to discover the textures, forms, materials, and comfort of our furniture in person. Our team is here to help you find pieces that perfectly complement your space and lifestyle.\n\nBelovi — Where every seat brings people closer.",
    image: "/images/image%2025.png",
  },
];

const BANNER_IMAGE = "/images/Rectangle%208%20(1).png";

export default function AboutClient({ about }: { about: AboutPage | null }) {
  /* `about` is null when the studio is unreachable. Nothing branches on it —
     every lookup below simply finds nothing and takes the bundled value, so an
     outage costs the page its custom content and not the page. */
  const studioImage: Record<string, string | undefined> = {
    profile: about?.profileImage,
    story: about?.storyImage,
    vision: about?.visionImage,
    // The design uses one photograph here; the rest of the studio's showroom
    // set has no place on this page.
    showroom: (about?.showroomImages || []).filter(Boolean)[0],
  };

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

      {/* Figma stacks the four rows almost flush (10px apart) inside a block
          padded 72px — the breathing room is the height of the photographs
          themselves, with the copy centred against them. Stacked on a phone
          that collapses to nothing, so the gap opens up below `lg`. */}
      <div className="section-pad space-y-16 sm:space-y-20 lg:space-y-[10px]">
        {BLOCKS.map((b, i) => (
          <AboutBlock
            key={b.key}
            title={copy(b.titleField, b.title)}
            body={copy(b.bodyField, b.body)}
            image={studioImage[b.key] || b.image}
            /* Alternating sides, per the design: copy left, copy right, repeat. */
            imageLeft={i % 2 === 1}
            /* The first row's photograph is often just below the fold on a
               laptop — worth fetching eagerly; the rest stay lazy. */
            priority={i === 0}
          />
        ))}
      </div>
    </main>
  );
}
