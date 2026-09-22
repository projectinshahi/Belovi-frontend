import { Skeleton } from "../../components/ui/States";

/**
 * The About page is `force-dynamic`, so the studio fetch happens on every
 * request and there is a real wait before anything paints. This is that wait,
 * drawn in the page's own shape — banner, then the single copy/photo row — so the
 * layout does not jump when the content lands.
 *
 * `surface-dark` re-points the skeleton's `sand`/`line` tones to their dark
 * values, so the shimmer reads as black-on-black rather than as grey
 * slabs on the finished page's near-black.
 */
export default function Loading() {
  return (
    <main className="surface-dark glow-field flex-1 bg-onyx" aria-busy>
      <span className="sr-only">Loading the About page…</span>

      <div className="pt-[92px] lg:pt-[106px]">
        <Skeleton className="h-[clamp(360px,52vw,672px)] w-full rounded-none rounded-b-[28px] sm:rounded-b-[40px] lg:rounded-b-[58px]" />
      </div>

      <div className="section-pad">
        <div className="section-x">
          <div className="section-inner grid items-center gap-10 sm:gap-12 lg:grid-cols-[1.18fr_1fr] lg:gap-[clamp(3rem,7.3vw,7.875rem)]">
            <div className="order-2 lg:order-none">
              <Skeleton className="h-10 w-[55%] sm:h-14" />
              <div className="mt-6 space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-[92%]" />
                <Skeleton className="h-5 w-[70%]" />
              </div>
            </div>
            <Skeleton className="order-1 aspect-[6/7] w-full rounded-[28px] sm:rounded-[40px] lg:order-none lg:rounded-[58px]" />
          </div>
        </div>
      </div>
    </main>
  );
}
