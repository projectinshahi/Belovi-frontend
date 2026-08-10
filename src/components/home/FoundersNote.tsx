"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import EditorialImage from "../ui/EditorialImage";
import { fetchFounderNote, type FounderNote } from "../../lib/founder";

const ease = [0.16, 1, 0.3, 1] as const;

// Fallback copy — shown until the studio's version loads, and if the fetch fails.
const DEFAULTS: FounderNote = {
  eyebrow: "Founder's Note · BELOVI",
  heading: "Every moment of intimacy deserves intention.",
  body1:
    "We believe that the spaces where couples connect — physically, emotionally, spiritually — deserve the same care and craftsmanship as the finest things in life. BELOVI exists because those moments should feel extraordinary.",
  body2:
    "From luxury tantra furniture to wellness essentials, every product we create is designed to elevate comfort into art — and transform connection into an experience worth remembering.",
  signature: "— BELOVI",
  image: "/images/saree-with-wome20.png",
};

export default function FoundersNote() {
  const reduce = useReducedMotion();
  const fromLeft = reduce ? {} : { initial: { opacity: 0, x: -40 }, whileInView: { opacity: 1, x: 0 } };
  const fromRight = reduce ? {} : { initial: { opacity: 0, x: 40 }, whileInView: { opacity: 1, x: 0 } };

  const [note, setNote] = useState<FounderNote>(DEFAULTS);
  useEffect(() => {
    fetchFounderNote().then((n) => n && setNote(n));
  }, []);

  return (
    <section className="bg-ivory">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Portrait */}
          <motion.div
            {...fromLeft}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 0.9, ease }}
            className="group"
          >
            {/* Capping the width on tablet (md) and desktop (lg) shortens the
                portrait proportionally — same 4:5 aspect ratio, no crop, no
                quality loss — and mx-auto keeps it balanced in its column.
                Mobile keeps the full-width portrait. */}
            <EditorialImage
              src={note.image}
              placeholderLabel="Founder Portrait"
              alt={note.heading}
              ratio="aspect-[4/5]"
              className="mx-auto md:max-w-[380px] lg:max-w-[460px]"
            />
          </motion.div>

          {/* Text */}
          <motion.div
            {...fromRight}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
          >
            <p className="eyebrow text-bronze-deep mb-6">{note.eyebrow}</p>
            <h2 className="font-display font-light leading-[1.1] text-[clamp(2rem,4vw,3.25rem)] text-ink mb-8">
              {note.heading}
            </h2>
            <div className="space-y-5 max-w-xl">
              {note.body1 && <p className="font-sans text-[15px] leading-[1.85] text-muted">{note.body1}</p>}
              {note.body2 && <p className="font-sans text-[15px] leading-[1.85] text-muted">{note.body2}</p>}
            </div>
            {note.signature && <p className="font-display italic text-2xl text-ink mt-8">{note.signature}</p>}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
