"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ButtonLink } from "../ui/Button";
import { cldOptimize } from "../../lib/image";
import { fetchActiveBanners, type StoreBanner } from "../../lib/banners";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Shown until banners load, and kept as the floor if the studio has none
 * published or the request fails — the hero is the whole first screen, so it
 * must never be empty.
 */
const HERO_IMAGE = "/images/image.png";
const HERO_FALLBACK = "/hero-bg.png";

/** Below this, phones get the banner's tall crop. Matches Tailwind's `md`. */
const MOBILE_BREAKPOINT = "(max-width: 767px)";

/** Auto-advance interval between banners. */
const SLIDE_MS = 6000;

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // All ACTIVE banners, newest first. More than one → auto-scrolling carousel.
  const [banners, setBanners] = useState<StoreBanner[]>([]);
  const [index, setIndex] = useState(0);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchActiveBanners()
      .then((list) => {
        if (!cancelled) setBanners(list);
      })
      .catch((err) => console.error("Failed to load hero banners", err))
      .finally(() => {
        // Resolved either way: a failed request still shows the fallback rather
        // than leaving the first screen empty.
        if (!cancelled) setResolved(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-advance. Paused for a single banner and under reduced-motion (an
  // auto-moving carousel is exactly what that setting asks us not to do).
  useEffect(() => {
    if (reduce || banners.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [reduce, banners.length]);

  const current = banners[index] ?? null;

  // Copy comes from the current banner, image failure notwithstanding.
  const heroEyebrow = current?.eyebrow || "BELOVI · Made for Moments Together";
  const heroTitle =
    current?.title ||
    "Premium luxury wellness & intimacy. Crafted for connection, comfort, and elegance.";
  const ctaLabel = current?.ctaLabel || "Explore Collections";
  const ctaHref = current?.ctaHref || "/products";

  // Layers to paint: real banners, or a single bundled fallback when none.
  const layers = banners.length > 0 ? banners : [null];

  // Subtle parallax: the background drifts slower than the scroll.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "16%"]);

  return (
    <section
      ref={ref}
      className="relative h-[70svh] min-h-[450px] sm:h-[100svh] sm:min-h-[600px] w-full overflow-hidden bg-sand"
    >
      {/* Background carousel (parallax) — stacked layers crossfade on advance. */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        {resolved &&
          layers.map((b, i) => {
            const active = i === index;
            const desktop = b ? cldOptimize(b.image, 1920) : HERO_IMAGE;
            const mobile = b ? cldOptimize(b.mobileImage || b.image, 1080) : HERO_IMAGE;
            return (
              <div
                key={b?.id ?? "fallback"}
                aria-hidden={!active}
                className={`absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              >
                {/*
                  <picture> so a phone downloads only the tall crop. Only the
                  first banner is high-priority (it's the LCP); the rest lazy so
                  they don't compete with it.
                */}
                <picture>
                  <source media={MOBILE_BREAKPOINT} srcSet={mobile} />
                  <img
                    src={desktop}
                    alt={b?.title || "BELOVI — premium luxury wellness"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    loading={i === 0 ? "eager" : "lazy"}
                    onError={(e) => {
                      // Dead banner URL → bundled photo, once.
                      if (!e.currentTarget.src.endsWith(HERO_FALLBACK)) {
                        e.currentTarget.src = HERO_FALLBACK;
                      }
                    }}
                    className="h-[116%] w-full object-cover object-center"
                  />
                </picture>
              </div>
            );
          })}
      </motion.div>

      {/* Legibility scrim (darkens the left where the text sits) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

      {/* Text — re-keyed per slide so the copy transitions with the image. */}
      <div className="relative z-10 h-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 flex items-end pb-20 sm:items-center sm:pb-0">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="max-w-2xl"
        >
          <p className="eyebrow mb-6 text-ivory/85">{heroEyebrow}</p>
          <h1 className="font-display font-light leading-[1.06] text-[clamp(2.4rem,6vw,4.6rem)] text-ivory">
            {heroTitle}
          </h1>
          <div className="mt-10">
            <ButtonLink href={ctaHref} variant="solid-ivory">
              {ctaLabel}
            </ButtonLink>
          </div>
        </motion.div>
      </div>

      {/* Slide indicators — only with more than one banner. */}
      {banners.length > 1 && (
        <div className="absolute z-10 bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setIndex(i)}
              aria-label={`Show banner ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-6 bg-ivory" : "w-1.5 bg-ivory/50 hover:bg-ivory/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
