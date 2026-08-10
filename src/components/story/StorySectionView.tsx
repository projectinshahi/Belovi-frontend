"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import EditorialImage from "../ui/EditorialImage";
import { type StorySection, renderRichText } from "../../lib/story";

const ease = [0.16, 1, 0.3, 1] as const;

function CtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-block eyebrow text-ink border-b border-ink pb-1.5 hover:text-bronze-deep hover:border-bronze-deep transition-colors"
    >
      {children}
    </Link>
  );
}

/**
 * Alt text for a section's image. The admin no longer exposes an alt field, so
 * this falls back to the section's own headline or label — an editorial image
 * described by its headline reads far better to a screen reader than the `alt=""`
 * an empty field would otherwise leave behind. Sections saved with real alt text
 * still win.
 */
function sectionImageAlt(s: StorySection): string {
  return s.imageAlt || s.title || s.eyebrow || "";
}

/** Renders a single Story section by its type, in the storefront's editorial language. */
export default function StorySectionView({ section: s }: { section: StorySection }) {
  const reduce = useReducedMotion();
  const rise = reduce
    ? {}
    : { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 } };
  const viewport = { once: true, margin: "0px 0px -12% 0px" };
  const body = renderRichText(s.body);
  const hasCta = s.ctaLabel && s.ctaHref;

  // ── QUOTE ──────────────────────────────────────────────────────────────────
  if (s.type === "quote") {
    return (
      <section className="bg-tan">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 section-pad text-center">
          <motion.div {...rise} viewport={viewport} transition={{ duration: 0.8, ease }}>
            <p className="font-display font-light italic leading-[1.2] text-[clamp(1.7rem,4vw,2.9rem)] text-ink">
              {s.quote ? `“${s.quote}”` : s.title}
            </p>
            {s.quoteAuthor && <p className="eyebrow text-bronze-deep mt-8">{s.quoteAuthor}</p>}
          </motion.div>
        </div>
      </section>
    );
  }

  // ── CTA BANNER ──────────────────────────────────────────────────────────────
  if (s.type === "cta") {
    return (
      <section className="bg-ivory">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
          <motion.div
            {...rise}
            viewport={viewport}
            transition={{ duration: 0.8, ease }}
            className="bg-tan border border-line px-7 sm:px-10 lg:px-14 py-9 sm:py-11 lg:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-7 md:gap-10"
          >
            <div className="max-w-2xl">
              {s.eyebrow && <p className="eyebrow text-bronze-deep mb-4">{s.eyebrow}</p>}
              {s.title && (
                <h2 className="font-display font-light leading-[1.18] text-[clamp(1.4rem,2.8vw,1.9rem)] text-ink mb-3">
                  {s.title}
                </h2>
              )}
              {body.length > 0 && <div className="space-y-3">{body}</div>}
            </div>
            {hasCta && (
              <div className="shrink-0">
                <Link
                  href={s.ctaHref!}
                  className="inline-block w-full md:w-auto text-center bg-ink text-cream eyebrow px-7 py-4 hover:bg-[#33302a] transition-colors"
                >
                  {s.ctaLabel}
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  // ── TIMELINE ────────────────────────────────────────────────────────────────
  if (s.type === "timeline") {
    const items = s.timeline || [];
    return (
      <section className="bg-[#FAF8F5]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-14 sm:py-16 lg:py-20">
          {s.eyebrow && (
            <motion.p
              {...rise}
              viewport={viewport}
              transition={{ duration: 0.6, ease }}
              className="text-center eyebrow text-bronze-deep mb-12"
            >
              {s.eyebrow}
            </motion.p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-16">
            {items.map((it, i) => (
              <motion.div
                key={i}
                {...rise}
                viewport={viewport}
                transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.12 }}
                className="text-center"
              >
                <span className="font-display text-[32px] md:text-[38px] text-[#A08060] leading-[1.2] block mb-3">
                  {it.label}
                </span>
                <p className="font-sans text-[14px] md:text-[15px] leading-[1.75] text-[#7A6F64] max-w-[300px] mx-auto">
                  {it.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── GALLERY ─────────────────────────────────────────────────────────────────
  if (s.type === "gallery") {
    const images = (s.images || []).filter(Boolean);
    return (
      <section className="bg-ivory">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
          {(s.eyebrow || s.title) && (
            <motion.div {...rise} viewport={viewport} transition={{ duration: 0.7, ease }} className="mb-10">
              {s.eyebrow && <p className="eyebrow text-bronze-deep mb-4">{s.eyebrow}</p>}
              {s.title && (
                <h2 className="font-display font-light leading-[1.12] text-[clamp(1.6rem,3vw,2.4rem)] text-ink">
                  {s.title}
                </h2>
              )}
            </motion.div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {images.map((img, i) => (
              <motion.div
                key={i}
                {...rise}
                viewport={viewport}
                transition={{ duration: 0.7, ease, delay: (i % 3) * 0.08 }}
                className="group"
              >
                <EditorialImage src={img} placeholderLabel={s.title || "Gallery"} alt={sectionImageAlt(s)} ratio="aspect-[4/5]" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── FULL-WIDTH IMAGE ────────────────────────────────────────────────────────
  if (s.type === "image") {
    return (
      <section className="bg-ivory">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-16">
          <motion.div {...rise} viewport={viewport} transition={{ duration: 0.9, ease }} className="group">
            <EditorialImage src={s.image} placeholderLabel={s.title || "BELOVI"} alt={sectionImageAlt(s)} ratio="aspect-[16/9]" />
          </motion.div>
          {(s.title || body.length > 0) && (
            <div className="mt-6 max-w-2xl">
              {s.title && <h2 className="font-display font-light text-[clamp(1.4rem,2.6vw,2rem)] text-ink mb-3">{s.title}</h2>}
              {body.length > 0 && <div className="space-y-4">{body}</div>}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── TWO-COLUMN (text / founders-note / hero) ────────────────────────────────
  // Text left, image right by default; `imageLeft` swaps sides on desktop.
  const imageLeft = s.imageLeft;
  return (
    <section className="bg-ivory">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-20 items-center">
          {/* Text */}
          <motion.div
            {...rise}
            viewport={viewport}
            transition={{ duration: 0.8, ease, delay: 0.05 }}
            className={imageLeft ? "order-2 lg:order-2 lg:pl-8 xl:pl-12" : "order-2 lg:order-1 lg:pr-8 xl:pr-12"}
          >
            {s.eyebrow && <p className="eyebrow text-bronze-deep mb-4">{s.eyebrow}</p>}
            {s.title && (
              <h2 className="font-display font-light leading-[1.12] text-[clamp(1.75rem,3.4vw,2.5rem)] text-ink mb-5">
                {s.title}
              </h2>
            )}
            {body.length > 0 && <div className="space-y-4 max-w-[460px]">{body}</div>}
            {s.tagline && (
              <p className="font-display italic text-[15px] leading-[1.6] text-[#7A6F64] max-w-[440px] mt-5">
                {s.tagline}
              </p>
            )}
            {hasCta && (
              <div className="mt-8">
                <CtaLink href={s.ctaHref!}>{s.ctaLabel}</CtaLink>
              </div>
            )}
          </motion.div>

          {/* Image */}
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 30 }}
            whileInView={reduce ? {} : { opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.9, ease, delay: 0.1 }}
            className={`group ${imageLeft ? "order-1 lg:order-1" : "order-1 lg:order-2"}`}
          >
            <EditorialImage
              src={s.image}
              placeholderLabel={s.eyebrow || s.title || "BELOVI"}
              alt={sectionImageAlt(s)}
              // Square rather than 4:5 portrait. At half of a 1500px page these
              // frames ran ~800px tall, so the text sat centred against a lot of
              // empty column; this takes ~20% off the height.
              ratio="aspect-[1/1]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
