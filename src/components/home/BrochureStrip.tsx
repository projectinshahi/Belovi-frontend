"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import Reveal from "../ui/Reveal";
import EditorialImage from "../ui/EditorialImage";
import { fetchBrochures, formatFileSize, type Brochure } from "../../lib/brochures";

/**
 * Downloadable brochures / lookbooks.
 *
 * Renders nothing at all until the studio publishes one — same rule as the
 * category grid: an empty heading over an empty row reads as a broken page, so
 * the section removes itself instead. Content (the PDFs) is supplied by BELOVA.
 */
export default function BrochureStrip() {
  const [brochures, setBrochures] = useState<Brochure[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchBrochures().then((list) => {
      if (!cancelled) setBrochures(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Loading (null) and empty both render nothing — a brochure strip is not worth
  // a skeleton, and a placeholder for content that may not exist is noise.
  if (!brochures || brochures.length === 0) return null;

  return (
    <section id="brochures" className="bg-tan">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        <Reveal className="mb-10 sm:mb-12 max-w-2xl">
          <p className="eyebrow text-bronze-deep mb-4">Brochures</p>
          <h2 className="font-display font-light leading-[1.1] text-[clamp(1.8rem,3.8vw,2.8rem)] text-ink">
            The collection, on paper.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {brochures.map((b, i) => {
            const size = formatFileSize(b.fileSize);
            return (
              <Reveal key={b._id} delay={(i % 3) * 0.08}>
                <a
                  href={b.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  // `download` asks the browser to save rather than navigate; a
                  // cross-origin (Cloudinary) URL may still open in a tab, which
                  // is why the link also opens safely in one.
                  download
                  aria-label={`Download ${b.title}${size ? ` — PDF, ${size}` : " — PDF"}`}
                  className="group block h-full border border-line bg-ivory hover:border-ink/40 transition-colors duration-300"
                >
                  <EditorialImage
                    src={b.coverImage}
                    alt={b.title}
                    placeholderLabel={b.title}
                    ratio="aspect-[4/3]"
                  />
                  <div className="p-6 sm:p-7 flex flex-col">
                    <h3 className="font-display font-light text-[19px] leading-snug text-ink">
                      {b.title}
                    </h3>
                    {b.description && (
                      <p className="font-sans text-[14px] leading-[1.75] text-muted mt-2.5 line-clamp-3">
                        {b.description}
                      </p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-2 eyebrow text-ink group-hover:text-bronze-deep transition-colors">
                      <Download size={13} aria-hidden />
                      Download PDF
                      {size && <span className="text-faint normal-case tracking-normal">· {size}</span>}
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
