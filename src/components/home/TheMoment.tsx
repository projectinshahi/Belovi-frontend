"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Moment } from "../../lib/moment";

/* Bespoke dark palette for this section (per spec) */
const C = {
  bg: "#1C1814",
  primary: "#F5F0E8",
  secondary: "#C4B8A8",
  body: "#E8E0D4",
  btnHover: "#E8E0D4",
};

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * "The Moment" — a dark, immersive collection-launch announcement block.
 * Full-bleed warm near-black background, cream editorial typography, dual CTA.
 * Sits directly after the product carousel; nav "The Moment" anchors here.
 */
export default function TheMoment({ moment }: { moment?: Moment | null }) {
  const reduce = useReducedMotion();

  const eyebrow = moment?.eyebrow ?? "The Moment · A Considered Cadence";
  const title = moment?.title ?? "The Moment is here.";
  const paragraphs = (moment?.body ??
    "A small, named run — pieces drawn for Onam, live now. It closes on its own time, not when stock runs low.\n\nNothing here is discounted, and nothing is rushed. When this window closes, the pieces move — unchanged — into the Archive, and rest there, fully available to buy."
  ).split(/\n{2,}/);
  const shopLabel = moment?.shopLabel ?? "Shop the Onam Collection";
  // Normalise legacy hrefs that filtered on collection instead of category.
  const rawShopHref = moment?.shopHref ?? "/products?category=the-moment";
  const shopHref =
    rawShopHref === "/products" ||
    rawShopHref.startsWith("/products?collection=") ||
    rawShopHref.startsWith("/collections/")
      ? "/products?category=the-moment"
      : rawShopHref;

  // Staggered fade + upward translate; opacity-only when reduced motion is on.
  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.15, delayChildren: 0.05 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
  };

  // Smooth-scroll to the Edit section when already on the home page.
  const previewEdit = (e: React.MouseEvent) => {
    const el = typeof document !== "undefined" && document.getElementById("the-edit");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      history.replaceState(null, "", "/#the-edit");
    }
  };

  return (
    <section
      id="the-moment"
      aria-labelledby="moment-headline"
      className="w-full"
      style={{ backgroundColor: C.bg }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-[720px] mx-auto px-6 sm:px-10 text-center py-10 md:py-14 lg:py-20"
      >
        {/* Label */}
        <motion.p
          variants={item}
          className="font-sans uppercase text-[10px] sm:text-[11px] tracking-[0.28em] mb-4"
          style={{ color: C.secondary }}
        >
          {eyebrow}
        </motion.p>

        {/* Headline */}
        <motion.h2
          variants={item}
          id="moment-headline"
          className="font-display font-light leading-[1.1] text-[clamp(1.75rem,4.2vw,3.25rem)] mb-5"
          style={{ color: C.primary }}
        >
          {title}
        </motion.h2>

        {/* Body */}
        <div className="mx-auto" style={{ maxWidth: 640 }}>
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              variants={item}
              className="font-display text-[16px] sm:text-[17px] leading-[1.65] mb-4 last:mb-0"
              style={{ color: C.body }}
            >
              {p}
            </motion.p>
          ))}
        </div>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Link
            href={shopHref}
            className="w-full sm:w-auto text-center font-sans uppercase tracking-[0.16em] text-[12px] px-8 py-4 rounded-[2px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={
              {
                backgroundColor: C.primary,
                color: C.bg,
                // focus ring colors
                ["--tw-ring-color" as any]: C.primary,
                ["--tw-ring-offset-color" as any]: C.bg,
              } as React.CSSProperties
            }
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.btnHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.primary)}
          >
            {shopLabel}
          </Link>

          <Link
            href="/#the-edit"
            onClick={previewEdit}
            className="group w-full sm:w-auto text-center font-sans uppercase tracking-[0.16em] text-[12px] px-8 py-4 rounded-[2px] border transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={
              {
                borderColor: C.primary,
                color: C.primary,
                ["--tw-ring-color" as any]: C.primary,
                ["--tw-ring-offset-color" as any]: C.bg,
              } as React.CSSProperties
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = C.primary;
              e.currentTarget.style.color = C.bg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = C.primary;
            }}
          >
            Preview the Edit
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
