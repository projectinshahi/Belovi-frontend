/**
 * Fly a dot from the Add to Cart button to the header's bag icon.
 *
 * Deliberately NOT a React component: it lasts 700ms, renders nothing the app
 * ever needs to read back, and putting it in state would re-render the whole
 * purchase column to draw a circle. A detached node plus the Web Animations API
 * does the same job with no framer, no portal and no cleanup to forget — the
 * element removes itself when the animation finishes.
 *
 * Silently does nothing when the header bag isn't on screen (mobile drawer
 * closed, reduced motion, or a layout that has no bag at all). A flourish that
 * can't find its destination should be absent, not broken.
 */
export function flyToCart(from: HTMLElement | null, reduceMotion: boolean): void {
  if (reduceMotion || !from) return;

  const targets = document.querySelectorAll<HTMLElement>("[data-cart-target]");
  // The nav renders in both the bar and the drawer; only one is laid out.
  const target = [...targets].find((el) => el.getBoundingClientRect().width > 0);
  if (!target) return;

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();

  const dot = document.createElement("span");
  dot.setAttribute("aria-hidden", "true");
  Object.assign(dot.style, {
    position: "fixed",
    left: `${a.left + a.width / 2}px`,
    top: `${a.top + a.height / 2}px`,
    width: "14px",
    height: "14px",
    marginLeft: "-7px",
    marginTop: "-7px",
    borderRadius: "9999px",
    background: "#D32F2F",
    boxShadow: "0 4px 14px rgba(211,47,47,0.5)",
    pointerEvents: "none",
    zIndex: "9999",
  });
  document.body.appendChild(dot);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);

  dot
    .animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        // Arcs upward at the halfway point — a straight line reads as a glitch,
        // a curve reads as something being thrown.
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(1.25)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0 },
      ],
      { duration: 700, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
    )
    .addEventListener("finish", () => dot.remove());
}
