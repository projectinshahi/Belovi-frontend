"use client";

import Reveal from "../ui/Reveal";
import EditorialImage from "../ui/EditorialImage";
import { ButtonLink } from "../ui/Button";

export default function StorySection() {
  return (
    <section id="about" className="bg-ivory">
      {/* About — image + narrative */}
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <Reveal scaleFrom={0.97} className="group">
            <EditorialImage
              src="/products/test-1.jpg"
              placeholderLabel="The Craft"
              alt="BELOVI — luxury wellness craftsmanship"
              ratio="aspect-[4/5]"
            />
          </Reveal>

          <Reveal delay={0.1}>
            <p className="eyebrow text-bronze-deep mb-6">The Story · BELOVI</p>
            <h2 className="font-display font-light leading-[1.08] text-[clamp(2rem,4.2vw,3.4rem)] text-ink mb-7">
              Where luxury meets intimacy — crafted for the moments that matter most.
            </h2>
            <div className="space-y-5 max-w-xl">
              <p className="font-sans text-[15px] leading-[1.85] text-muted">
                BELOVI was born from a simple belief: that the most intimate moments of
                life deserve the same thoughtful design as the finest things we own.
                Every product is a bridge between luxury and connection — engineered for
                comfort, sculpted for elegance.
              </p>
              <p className="font-sans text-[15px] leading-[1.85] text-muted">
                From luxury tantra furniture to couple wellness essentials, every piece
                is crafted with precision and care — designed to transform ordinary
                spaces into sanctuaries of togetherness.
              </p>
            </div>
            <div className="mt-9">
              <ButtonLink href="/products" variant="outline" size="md">
                Explore Collections
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Pull quote */}
      <div className="bg-tan">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 section-pad text-center">
          <Reveal>
            <p className="font-display font-light italic leading-[1.2] text-[clamp(1.7rem,3.8vw,2.8rem)] text-ink">
              &ldquo;We don&rsquo;t just make products. We create the conditions for
              deeper connection — where comfort becomes luxury, and togetherness
              becomes art.&rdquo;
            </p>
            <p className="eyebrow text-bronze-deep mt-8">BELOVI · Founder</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
