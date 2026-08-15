"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";

/**
 * Loading / empty / error surfaces, in the card language of the rest of the
 * design so a section that is waiting or has nothing to show still looks like
 * part of the page rather than a gap in it.
 *
 * All three inherit `ink`/`muted`/`sand` from whichever band they land in, so
 * one component covers the black and light sections both.
 */

/** A single shimmering placeholder block. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-[16px] ${className}`} />;
}

/**
 * Product-card-shaped skeleton. `imageRatio` mirrors ProductCard's own prop so
 * the placeholder is the height of the card that replaces it — otherwise the
 * grid jumps the moment the request lands.
 */
export function SkeletonCard({
  className = "",
  imageRatio = "aspect-square",
}: {
  className?: string;
  imageRatio?: string;
}) {
  return (
    <div className={`surface-light rounded-[24px] bg-cream p-4 ${className}`}>
      <Skeleton className={`w-full ${imageRatio}`} />
      <Skeleton className="mt-10 h-4 w-3/4" />
      <Skeleton className="mt-3 h-5 w-1/3" />
    </div>
  );
}

export function SkeletonGrid({
  count = 4,
  className = "",
  imageRatio,
}: {
  count?: number;
  className?: string;
  imageRatio?: string;
}) {
  return (
    <div
      aria-hidden
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} imageRatio={imageRatio} />
      ))}
    </div>
  );
}

/**
 * Nothing to show. Not an error — the studio simply hasn't published anything
 * here yet, and the copy says so rather than implying a fault.
 */
export function EmptyState({
  title,
  message,
  icon,
  action,
  className = "",
}: {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[24px] border border-dashed
        border-line px-6 py-16 text-center ${className}`}
    >
      {icon && <div className="mb-4 text-faint">{icon}</div>}
      <p className="display-card text-ink">{title}</p>
      {message && <p className="mt-2 max-w-[46ch] text-body text-muted">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/**
 * Something failed. Always offers the retry, because the most common cause is a
 * cold backend and a second attempt usually succeeds.
 */
export function ErrorState({
  title = "That didn’t load",
  message = "We couldn’t reach the studio just now. Please try again.",
  onRetry,
  className = "",
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-[24px] border border-line
        bg-cream/60 px-6 py-16 text-center ${className}`}
    >
      <span
        aria-hidden
        className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand/10 text-brand"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="h-6 w-6"
        >
          <path d="M12 8v5M12 16.5v.5" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </span>
      <p className="display-card text-ink">{title}</p>
      <p className="mt-2 max-w-[46ch] text-body text-muted">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="outline" size="sm" onClick={onRetry} arrow={false}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
