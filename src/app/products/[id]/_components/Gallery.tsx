"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cldOptimize } from "../../../../lib/image";

/**
 * The product gallery — a soft grey plate with the piece floating inside it,
 * and a row of thumbnails beneath.
 *
 * `object-contain` inside generous padding, NOT `object-cover`. The catalogue is
 * studio renders on a light ground: cropping one to fill a square cuts the legs
 * off a chaise. Containing it lets the object breathe in its plate, which is
 * what makes the page read as a gallery rather than a marketplace listing.
 *
 * Frames CROSS-FADE rather than swap. A hard swap on a large photograph reads
 * as a flash; the fade reads as the same object turning.
 *
 * A frame that fails to load is dropped from the set rather than left as a
 * broken tile — studio image URLs are free text, so dead references reach here
 * routinely. If every frame fails the placeholder shows, which is why the
 * thumbnail row guards on `usable.length > 1` and not on `images.length`.
 */
export default function Gallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const reduce = useReducedMotion();

  const usable = images.filter(Boolean).filter((s) => !failed.includes(s));
  // The active index can outrun the set when a frame drops out mid-view.
  const current = usable[Math.min(active, usable.length - 1)];

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div
        className="group relative aspect-[4/5] w-full overflow-hidden rounded-[clamp(24px,2vw,32px)] bg-[#F0F0F0]
          p-[40px] sm:p-[50px] lg:p-[60px]"
      >
        {current ? (
          <>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={current}
                src={cldOptimize(current, 1200)}
                alt={name}
                fetchPriority="high"
                onError={() => setFailed((p) => [...p, current])}
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 h-full w-full object-contain p-[inherit]
                  transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                  motion-safe:group-hover:scale-[1.02]"
              />
            </AnimatePresence>
            {/* Grounds the object — without it a contained render floats with no
                weight, which is the tell of a cut-out pasted on a panel. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.03),transparent_20%)]"
            />
          </>
        ) : (
          <div className="img-placeholder absolute inset-0 grid place-items-center">
            <span className="font-display text-sm uppercase tracking-[0.4em] text-ink/25 pl-[0.4em]">
              BELOVI
            </span>
          </div>
        )}
      </div>

      {/* One frame is not a choice, so there is nothing to pick between.

          THREE COLUMNS filling the gallery's own width, not a fixed pixel size:
          in the reference the thumbnail row is exactly as wide as the plate
          above it, and the tiles are ~30% of its width. A fixed 100px tile holds
          that ratio at one viewport only — the grid holds it at every one, and a
          fourth image simply starts a second row. */}
      {usable.length > 1 && (
        <div className="mt-6 flex flex-row gap-4">
          {usable.slice(0, 3).map((src, i) => {
            const isActive = src === current;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1} of ${usable.length}`}
                aria-current={isActive}
                className={`relative aspect-square w-[80px] sm:w-[90px] lg:w-[100px] overflow-hidden rounded-[16px] bg-[#F0F0F0] p-[12px]
                  transition-[border-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                  sm:rounded-[20px] lg:rounded-[20px]
                  ${
                    isActive
                      ? "border-[1.5px] border-[#D32F2F] hover:-translate-y-[2px] hover:border-[#FF6659]"
                      : "border-[1.5px] border-[#E0E0E0] hover:-translate-y-[2px] hover:border-[#BDBDBD]"
                  }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cldOptimize(src, 400)}
                  alt=""
                  loading="lazy"
                  onError={() => setFailed((p) => [...p, src])}
                  className="h-full w-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
