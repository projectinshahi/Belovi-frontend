"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionProps {
  title: string;
  children: ReactNode;
  /** Open on first paint. Mobile spec wants everything collapsed, so default false. */
  defaultOpen?: boolean;
}

/**
 * One accordion row: hairline-ruled, chevron rotates 180° on open.
 *
 * The height transition is the 0fr→1fr grid trick rather than max-height, so the
 * panel animates to its true content height with no magic number to outgrow.
 * prefers-reduced-motion is honoured globally in globals.css, which flattens
 * transition-duration to ~0 — so this collapses instantly rather than sliding.
 */
export default function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
        >
          <span className="eyebrow text-[#1a1a1a]">{title}</span>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            aria-hidden
            className={`shrink-0 text-[#1a1a1a]/60 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-[#1a1a1a] ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className={`pb-7 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
