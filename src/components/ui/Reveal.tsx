"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Stagger delay in seconds */
  delay?: number;
  /** Vertical travel distance in px (default 30) */
  y?: number;
  /** Scale from (e.g. 0.95 for image tiles). Omit for none. */
  scaleFrom?: number;
  /** Fire every time it enters view instead of once */
  repeat?: boolean;
  className?: string;
}

/**
 * Scroll-reveal wrapper used site-wide: fade + slight upward translate (and an
 * optional subtle scale for image tiles). Honours prefers-reduced-motion.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 30,
  scaleFrom,
  repeat = false,
  className,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    /* `style` here is not decoration — it is the whole fix.
     *
     * There is no matchMedia on the server, so `useReducedMotion()` is false
     * during SSR and the markup React hydrates ALWAYS carries the motion
     * branch's initial state: `style="opacity:0;transform:translateY(30px)"`.
     * When the client then decides reduced motion is on and returns a plain
     * <div> with no `style` prop, React has nothing to reconcile against that
     * attribute and leaves it exactly as the server wrote it. The result: every
     * Reveal on the page stays permanently invisible — for precisely the users
     * who asked for less motion. Declaring the style hands the property back to
     * React, which then clears it. */
    return (
      <div className={className} style={{ opacity: 1, transform: "none" }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      /* `reveal` is a hook for the reduced-motion rule in globals.css. The
         server always renders this branch (no matchMedia server-side), so the
         inline `opacity:0` below ships in the HTML; if the client then decides
         reduced motion is on, that inline style can outlive the swap and leave
         the section invisible for good. The stylesheet overrides it with
         `!important`, which works before hydration and regardless of what the
         hook resolves to. */
      className={`reveal ${className ?? ""}`}
      initial={{ opacity: 0, y, scale: scaleFrom ?? 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: !repeat, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
