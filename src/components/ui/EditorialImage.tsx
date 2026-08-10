"use client";

import { useState } from "react";
import { cldOptimize } from "../../lib/image";

interface EditorialImageProps {
  src?: string | null;
  alt: string;
  /** Optional caption shown centered on the placeholder tone */
  placeholderLabel?: string;
  /** Tailwind aspect ratio class, e.g. "aspect-[3/4]" */
  ratio?: string;
  /** Enable subtle zoom-on-hover (default true) */
  zoom?: boolean;
  className?: string;
  width?: number;
  priority?: boolean;
}

/**
 * Editorial image frame. Renders a real (Cloudinary-optimized) photo when a src
 * is available, otherwise a warm ivory/tan placeholder with an optional label —
 * so pages read as intentional before real photography is supplied.
 */
export default function EditorialImage({
  src,
  alt,
  placeholderLabel = "BELOVI",
  ratio = "aspect-[3/4]",
  zoom = true,
  className = "",
  width = 1000,
  priority = false,
}: EditorialImageProps) {
  const [errored, setErrored] = useState(false);
  const show = src && !errored;

  return (
    <div className={`relative overflow-hidden ${ratio} ${className}`}>
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cldOptimize(src!, width)}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onError={() => setErrored(true)}
          className={`h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            zoom ? "group-hover:scale-[1.04]" : ""
          }`}
        />
      ) : (
        <div className="img-placeholder h-full w-full flex items-center justify-center">
          {/* /40 rather than /25: at 25% of near-black over the warm placeholder
              this watermark sat at ~2.2:1 and read as a smudge. */}
          <span className="font-display uppercase tracking-[0.4em] text-sm text-ink/40 pl-[0.4em] select-none">
            {placeholderLabel}
          </span>
        </div>
      )}
    </div>
  );
}
