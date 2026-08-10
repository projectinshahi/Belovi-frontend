"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Reveal from "../ui/Reveal";
import { fetchStudioNote, type StudioNote } from "../../lib/studioNote";

// Fallback copy — shown until the studio's version loads, and if the fetch fails.
const DEFAULTS: StudioNote = {
  eyebrow: "Story · Craftsmanship Notes",
  heading: "Where engineering meets emotion.",
  description:
    "Every BELOVI product is shaped through three principles: does it elevate the experience of intimacy, does it embody uncompromising comfort, and does it reflect the elegance our customers expect. Premium materials, precision engineering, and thoughtful design — crafted for the moments that define connection.",
  ctaLabel: "Explore Collections",
  ctaHref: "/products",
};

export default function StudioNotes() {
  const [note, setNote] = useState<StudioNote>(DEFAULTS);
  useEffect(() => {
    fetchStudioNote().then((n) => n && setNote(n));
  }, []);

  return (
    <section id="story" className="bg-ivory">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 section-pad text-center">
        <Reveal>
          <p className="eyebrow text-bronze-deep mb-6">{note.eyebrow}</p>
          <h2 className="font-display font-light leading-[1.12] text-[clamp(1.9rem,4vw,3.1rem)] text-ink mb-8">
            {note.heading}
          </h2>
          {note.description && (
            <p className="font-sans text-[15px] leading-[1.9] text-muted max-w-2xl mx-auto mb-10">
              {note.description}
            </p>
          )}
          {note.ctaLabel && note.ctaHref && (
            <Link href={note.ctaHref} className="eyebrow text-ink link-underline">
              {note.ctaLabel}
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
