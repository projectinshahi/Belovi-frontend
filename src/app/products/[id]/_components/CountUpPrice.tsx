"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { formatINR } from "../../../../lib/product";

/**
 * The current price, counting up from zero on arrival.
 *
 * `tabular-nums` is doing real work here: proportional digits change width as
 * they tick, so the price box would jitter and shove the struck price beside it
 * around for the whole half-second. Tabular figures all occupy one width, so
 * only the glyphs change.
 *
 * The count runs ONCE, on mount. `shown` returns to null when it finishes, so
 * from then on the real value renders directly — picking a different colourway
 * updates the price instantly instead of replaying the count and turning a price
 * into a slot machine. Reduced motion skips it entirely.
 */
export default function CountUpPrice({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState<number | null>(null);

  // Read at mount without making `value` a dependency — a price change should
  // not restart the arrival animation.
  const target = useRef(value);
  target.current = value;

  useEffect(() => {
    const to = target.current;
    if (reduce || to <= 0) return;

    const DURATION = 500;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now: number) {
      const t = Math.min(1, (now - start) / DURATION);
      // ease-out cubic: fast off the mark, settling into the real figure.
      setShown(t < 1 ? Math.round(to * (1 - Math.pow(1 - t, 3))) : null);
      if (t < 1) frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  return <span className={`tabular-nums ${className}`}>{formatINR(shown ?? value)}</span>;
}
