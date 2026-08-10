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
    return (
      <div className={className}>{children}</div>
    );
  }

  return (
    <motion.div
      className={className}
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
