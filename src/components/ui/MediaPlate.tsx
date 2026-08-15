"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import EditorialImage from "./EditorialImage";

/**
 * A photograph as the About design draws it: unframed, corner-rounded, running
 * edge to edge inside its own corners.
 *
 * The corners and the hover bloom are `.plate` in globals.css (radius steps with
 * the viewport); this component adds the one thing that needs JavaScript — the
 * scroll parallax, and nothing else.
 *
 * `group` is on the outer element because EditorialImage's zoom is a
 * `group-hover:` rule — so the photograph scales inside a box that stays put,
 * which is the whole effect. That box clips it (`overflow: hidden`).
 *
 * The parallax is applied to a wrapper OUTSIDE the plate rather than to the
 * plate itself: framer writes an inline `transform`, and `.plate` would then be
 * transitioning a property something else owns, which makes the hover stutter.
 */
export default function MediaPlate({
  src,
  alt,
  label,
  ratio = "aspect-[6/7]",
  /** Total travel, in px, across the section's pass through the viewport. */
  parallax = 32,
  priority = false,
  width = 1200,
  className = "",
}: {
  src?: string | null;
  alt: string;
  label?: string;
  ratio?: string;
  parallax?: number;
  priority?: boolean;
  width?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Springed, or the plate snaps frame-to-frame on a trackpad's coarse deltas.
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [parallax, -parallax]), {
    stiffness: 60,
    damping: 20,
    mass: 0.4,
  });

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }}>
        <div className="group plate sheen">
          <EditorialImage
            src={src}
            alt={alt}
            placeholderLabel={label || "BELOVI"}
            ratio={ratio}
            width={width}
            priority={priority}
          />
        </div>
      </motion.div>
    </div>
  );
}
