import type { ReactNode } from "react";
import Reveal from "../ui/Reveal";
import Breadcrumbs from "./Breadcrumbs";

interface LegalPageProps {
  /** Small uppercase tracked label above the title */
  eyebrow?: string;
  /** Serif page title */
  title: string;
  /** Optional "Last updated" date, e.g. "16 July 2026" */
  updated?: string;
  children: ReactNode;
}

/**
 * Shared editorial shell for legal, policy and customer-care pages.
 * Renders a quiet header band (eyebrow · serif title · optional updated line)
 * and a max-w-3xl prose column with typographic defaults applied to the
 * child h2/h3/p/ul/li/a/table elements.
 */
export default function LegalPage({ eyebrow, title, updated, children }: LegalPageProps) {
  return (
    <main className="bg-ivory min-h-screen pt-[84px]">
      {/* Header band */}
      <section className="border-b border-line">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-16 sm:pb-20 lg:pb-24">
          <Breadcrumbs className="mb-8 sm:mb-10" />
          <Reveal>
            {eyebrow ? <p className="eyebrow text-bronze-deep mb-5">{eyebrow}</p> : null}
            <h1 className="font-display font-light text-ink leading-[1.08] text-[clamp(2.2rem,5vw,3.75rem)]">
              {title}
            </h1>
            {updated ? (
              <p className="mt-6 font-sans text-[12px] tracking-wide text-faint">
                Last updated · {updated}
              </p>
            ) : null}
          </Reveal>
        </div>
      </section>

      {/* Prose column */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 py-14 sm:py-20 lg:py-24">
        <Reveal delay={0.05}>
          <div
            className={[
              "max-w-3xl",
              // paragraphs
              "[&_p]:font-sans [&_p]:text-[15px] [&_p]:text-muted [&_p]:leading-[1.9] [&_p]:mb-6",
              // h2
              "[&_h2]:font-display [&_h2]:font-light [&_h2]:text-ink [&_h2]:leading-[1.15] [&_h2]:text-[clamp(1.5rem,3vw,2rem)] [&_h2]:mt-16 [&_h2]:mb-5 [&_h2]:first:mt-0",
              // h3
              "[&_h3]:font-display [&_h3]:font-normal [&_h3]:text-ink [&_h3]:leading-snug [&_h3]:text-[clamp(1.15rem,2vw,1.4rem)] [&_h3]:mt-10 [&_h3]:mb-4",
              // lists
              "[&_ul]:mb-6 [&_ul]:space-y-2.5 [&_ul]:pl-0",
              "[&_ul>li]:relative [&_ul>li]:pl-6 [&_ul>li]:font-sans [&_ul>li]:text-[15px] [&_ul>li]:text-muted [&_ul>li]:leading-[1.8]",
              "[&_ul>li]:before:content-[''] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.72em] [&_ul>li]:before:h-px [&_ul>li]:before:w-3 [&_ul>li]:before:bg-bronze/60",
              // links
              "[&_a]:text-ink [&_a]:underline [&_a]:decoration-line [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-bronze-deep",
              // strong
              "[&_strong]:text-ink [&_strong]:font-medium",
              // No table rules here on purpose. These were descendant selectors
              // ([&_th] matches at any depth), so they also styled the innards of
              // any self-styled component dropped into a legal page — and won,
              // being one specificity step above the component's own classes.
              // Nothing writes a bare <table> in a LegalPage any more; the size
              // guide's chart is a component that styles itself.
            ].join(" ")}
          >
            {children}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
