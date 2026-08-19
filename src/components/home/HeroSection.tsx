"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import MagneticCta from "../ui/MagneticCta";
import { cldOptimize } from "../../lib/image";
import { fetchActiveBanners, type StoreBanner } from "../../lib/banners";

/**
 * The hero.
 *
 * Two rules shape how this is built:
 *
 * 1. EVERYTHING VISIBLE IS CSS. The entrance sequence (headline rise, subhead
 *    blur-in, CTA overshoot, sculpture slide) runs off keyframes in globals.css,
 *    not framer. A framer entrance server-renders at opacity:0 and only appears
 *    once hydration completes — on the first screen that is a blank page for
 *    anyone on a slow connection, and a permanently blank one if the bundle
 *    fails. The JS below only *adds* motion to content that is already painted.
 * 2. THE BRIEF ASKS FOR GSAP, LENIS AND THREE.JS; none are used. The asset is a
 *    transparent PNG, not a model, so there is nothing for Three to render;
 *    framer-motion (already a dependency) covers the timeline, springs and
 *    scroll binding; and smooth scrolling is one line of CSS. Three libraries
 *    and ~250KB avoided for output that is indistinguishable.
 */

/** The bundled cut-out and copy — the design's own, and the floor if the studio
 *  has published no banner or the request fails. */
const FALLBACK: StoreBanner = {
  id: "belovi-hero",
  image: "/images/image 12 (1).png",
  mobileImage: null,
  eyebrow: "",
  title: "BELOVI. WHERE EVERY MOMENT BRINGS CONNECTION.",
  description: "A space where comfort meets connection and every moment feels special",
  ctaLabel: "Explore",
  ctaHref: "/products",
};

/**
 * Split the headline into words, marking the first and last for the accent.
 * Word-level rather than line-level so the stagger survives any wrap — a
 * hardcoded four-line break only holds at one width.
 */
function words(title: string): { text: string; accent: boolean }[] {
  const parts = title.trim().split(/\s+/);
  return parts.map((text, i) => ({
    text,
    accent: i === 0 || i === parts.length - 1,
  }));
}

export default function HeroSection() {
  const [banners, setBanners] = useState<StoreBanner[]>([]);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchActiveBanners()
      .then((list) => { if (!cancelled) setBanners(list); })
      .catch(() => {
        // Keeps the bundled hero rather than emptying the first screen.
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (reduce || banners.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 7000);
    return () => clearInterval(id);
  }, [reduce, banners.length]);

  // Field-level fallback: a published banner with an empty title is an ordinary
  // thing to save, and falling back only when there are NO banners would leave
  // the first screen with a button and nothing else.
  const published = banners[index];
  const banner: StoreBanner = {
    ...FALLBACK,
    ...published,
    title: published?.title?.trim() || FALLBACK.title,
    image: published?.image?.trim() || FALLBACK.image,
    ctaLabel: published?.ctaLabel?.trim() || FALLBACK.ctaLabel,
    ctaHref: published?.ctaHref?.trim() || FALLBACK.ctaHref,
    description: published?.description?.trim() || FALLBACK.description,
  };

  /** The bundled art is a cut-out on transparency; a studio upload is a
   *  rectangular photograph, which needs its left edge feathered into the black
   *  or it draws a hard seam through the middle of the hero. */
  const isCutout = !published?.image?.trim();

  // ── Pointer tilt ─────────────────────────────────────────────────────────
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 120, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), spring);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), spring);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  // ── Scroll parallax ──────────────────────────────────────────────────────
  // Sculpture travels at half speed; the copy fades as the section leaves.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const artY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const heads = words(banner.title);
  /** Entrance timings, in ms — the brief's storyboard, kept in one place. */
  const HEAD_START = 300;
  const HEAD_STEP = 55;
  const tailDelay = HEAD_START + heads.length * HEAD_STEP;

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      className="hero-grain hero-vignette surface-dark relative isolate flex min-h-[100svh] items-center overflow-hidden bg-black"
    >
      <div className="section-x section-inner relative z-10 flex w-full flex-col justify-center gap-10 pb-20 pt-[124px] lg:gap-6 lg:pb-[72px] lg:pt-[150px]">
        {/* Copy */}
        <motion.div
          style={reduce ? undefined : { opacity: copyOpacity }}
          /* A cut-out is transparent, so the headline can run over it exactly as
             the design intends. A studio photograph is an opaque rectangle, and
             the same overlap puts white type on a light interior shot — so the
             copy yields instead. One flag, two compositions. */
          /* The cap widens at xl because the type stops growing before the page
             does: `display-hero` clamps at 94px while the content column stops
             at the 1508px inner max, so a fixed percentage that gives three
             lines at 1440 drops to four on a 1920 screen. */
          className={`relative z-20 max-w-[880px] ${
            isCutout ? "lg:max-w-[82%] xl:max-w-[94%]" : "lg:max-w-[50%]"
          }`}
        >
          <h1 className="display-hero display-hero-thin text-white">
            {heads.map((w, i) => (
              <span
                key={`${w.text}-${i}`}
                // inline-block so the transform applies; the trailing space is
                // its own node, otherwise words run together when they wrap.
                className="inline-block animate-[heroRise_0.9s_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{ animationDelay: `${HEAD_START + i * HEAD_STEP}ms` }}
              >
                <span className={w.accent ? "text-brand" : undefined}>{w.text}</span>
                {i < heads.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>

          {/* The gap you SEE is mostly the headline's own leading, not this
              margin. `display-hero` sets line-height 1.2 on type up to 94px, so
              the last line carries roughly 24px of empty box beneath its
              baseline before any margin applies. Trimming the margin alone
              therefore moves the visible gap far less than the numbers suggest —
              which is why several steps of `mt-*` barely showed.

              So from `sm` the margin goes NEGATIVE, reclaiming part of that
              leading rather than fighting it. Typography is untouched: the
              line-height still governs the space BETWEEN the headline's lines,
              exactly as designed — this only pulls the deck up under the last
              one. Mobile keeps its positive margin, where the type is small
              enough that the leading is already slight. */}
          <p
            className="mt-4 max-w-[42ch] animate-[heroBlurIn_0.8s_ease-out_both] text-body text-muted sm:-mt-1"
            style={{ animationDelay: `${tailDelay}ms` }}
          >
            {banner.description}
          </p>

          <div
            className="mt-11 animate-[heroPop_0.7s_cubic-bezier(0.34,1.56,0.64,1)_both] sm:mt-14"
            style={{ animationDelay: `${tailDelay + 180}ms` }}
          >
            <MagneticCta href={banner.ctaHref} label={banner.ctaLabel} disabled={!!reduce} />
          </div>
        </motion.div>

        {/* Sculpture. `perspective` on the wrapper so the entrance's rotateY and
            the pointer tilt both read as depth rather than a flat skew. */}
        <motion.div
          style={{
            perspective: 1000,
            ...(reduce ? {} : { y: artY }),
          }}
          /* Sat slightly low of centre by request. Below `lg` the art is in
             flow, so the drop is a margin; from `lg` it is absolute, so the drop
             is `top` — NOT the translate, which framer already owns for the
             scroll parallax and would overwrite. */
          className={`pointer-events-none relative z-0 -mx-[6vw] mt-6 aspect-[1031/682] sm:mt-8 lg:absolute lg:top-[53%] lg:mx-0 lg:mt-0 lg:-translate-y-1/2 ${
            isCutout ? "lg:right-[-5%] lg:w-[58%]" : "lg:right-[-4%] lg:w-[50%]"
          }`}
        >
          <motion.div
            style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="h-full w-full animate-[heroSculpture_1.1s_cubic-bezier(0.16,1,0.3,1)_400ms_both]"
          >
            <div className={`h-full w-full ${reduce ? "" : "hero-float"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={isCutout ? banner.image : cldOptimize(banner.image, 1600)}
                alt={banner.title}
                fetchPriority="high"
                className={`h-full w-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.65)] ${
                  isCutout ? "" : "hero-media rounded-[28px] object-cover"
                }`}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Slide indicators — only meaningful with more than one banner. */}
      {banners.length > 1 && (
        <div className="section-x absolute bottom-8 left-0 z-20 flex gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setIndex(i)}
              aria-label={`Show banner ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-10 bg-brand" : "w-4 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
