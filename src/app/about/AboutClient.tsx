"use client";

import Breadcrumbs from "../../components/common/Breadcrumbs";
import StorySectionView from "../../components/story/StorySectionView";
import EditorialImage from "../../components/ui/EditorialImage";
import Reveal from "../../components/ui/Reveal";
import { ButtonLink } from "../../components/ui/Button";
import { renderRichText, type StorySection } from "../../lib/story";
import type { AboutPage } from "../../lib/about";

/**
 * About Us — company profile, vision, story, showroom.
 *
 * Every block renders only when it has content, so the page shortens rather
 * than showing a heading over nothing while the studio fills it in. Nothing
 * here is authored in code: the copy and photography come from the About
 * singleton (Studio → About Page), and any published StorySection records
 * render between vision and showroom.
 */

/**
 * The map is only drawn for something that can actually load in an iframe.
 *
 * `showroomMapUrl` is a free-text field, so it collects things like the word
 * "google map" or a share link rather than an embed URL. Feeding that to an
 * iframe renders a broken frame the size of the map, which looks far worse than
 * omitting it — so anything that isn't an http(s) URL is treated as not set.
 */
function embeddableMapUrl(raw?: string): string | null {
  const s = (raw || "").trim();
  return /^https?:\/\/.+/i.test(s) ? s : null;
}

export default function AboutClient({
  about,
  story,
}: {
  about: AboutPage | null;
  story: StorySection[];
}) {
  const a = about ?? {};

  const hasProfile = Boolean(a.profileTitle || a.profileBody || a.profileImage);
  const points = (a.visionPoints || []).filter((p) => p.label || p.text);
  const hasVision = Boolean(a.visionTitle || a.visionBody || points.length);
  const showroomImages = (a.showroomImages || []).filter(Boolean);
  const mapUrl = embeddableMapUrl(a.showroomMapUrl);
  const hasShowroom = Boolean(
    a.showroomTitle ||
      a.showroomBody ||
      a.showroomAddress ||
      a.showroomHours ||
      mapUrl ||
      showroomImages.length
  );

  return (
    <main className="bg-ivory flex-1">
      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <div className="pt-[92px] lg:pt-[116px]">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
          <Breadcrumbs />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center pt-5 sm:pt-8 pb-4 sm:pb-6">
          {a.introEyebrow && (
            <p className="eyebrow text-bronze-deep">{a.introEyebrow}</p>
          )}
          {a.introTitle && (
            <h1 className="font-display font-light leading-[1.1] text-[clamp(1.9rem,4.5vw,3.1rem)] text-ink mt-4">
              {a.introTitle}
            </h1>
          )}
          {a.introBody && (
            <div className="mt-5 space-y-4 max-w-xl mx-auto">
              {renderRichText(a.introBody)}
            </div>
          )}
        </div>

        {a.introImage && (
          <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pt-6 sm:pt-8">
            <Reveal>
              <EditorialImage
                src={a.introImage}
                alt={a.introTitle || "BELOVI"}
                ratio="aspect-[16/9]"
                className="rounded-2xl"
                priority
              />
            </Reveal>
          </div>
        )}
      </div>

      {/* ── Company profile ───────────────────────────────────────────────── */}
      {hasProfile && (
        <section className="bg-ivory">
          <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-20 items-center">
              <Reveal className="order-2 lg:order-1 lg:pr-8 xl:pr-12">
                {a.profileEyebrow && (
                  <p className="eyebrow text-bronze-deep mb-4">{a.profileEyebrow}</p>
                )}
                {a.profileTitle && (
                  <h2 className="font-display font-light leading-[1.12] text-[clamp(1.75rem,3.4vw,2.5rem)] text-ink mb-5">
                    {a.profileTitle}
                  </h2>
                )}
                {a.profileBody && (
                  <div className="space-y-4 max-w-[460px]">
                    {renderRichText(a.profileBody)}
                  </div>
                )}
              </Reveal>
              <Reveal delay={0.1} className="order-1 lg:order-2 group">
                <EditorialImage
                  src={a.profileImage}
                  alt={a.profileTitle || "BELOVI"}
                  placeholderLabel={a.profileEyebrow || "BELOVI"}
                  ratio="aspect-[1/1]"
                  className="rounded-2xl"
                />
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ── Vision ────────────────────────────────────────────────────────── */}
      {hasVision && (
        <section className="bg-tan">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
            <Reveal className="max-w-2xl">
              {a.visionEyebrow && (
                <p className="eyebrow text-bronze-deep mb-4">{a.visionEyebrow}</p>
              )}
              {a.visionTitle && (
                <h2 className="font-display font-light leading-[1.12] text-[clamp(1.75rem,3.4vw,2.5rem)] text-ink">
                  {a.visionTitle}
                </h2>
              )}
              {a.visionBody && (
                <div className="space-y-4 mt-5">{renderRichText(a.visionBody)}</div>
              )}
            </Reveal>

            {points.length > 0 && (
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {points.map((p, i) => (
                  <Reveal key={`${p.label}-${i}`} delay={(i % 3) * 0.08}>
                    {p.label && (
                      <p className="font-display font-light text-[22px] leading-snug text-ink capitalize">
                        {p.label}
                      </p>
                    )}
                    {p.text && (
                      <p className="font-sans text-[14px] leading-[1.8] text-muted mt-3">
                        {p.text}
                      </p>
                    )}
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Story ─────────────────────────────────────────────────────────────
          Published StorySection records, if any. No fallback copy: an empty
          feed simply contributes nothing rather than inventing editorial. */}
      {story.map((s) => (
        <StorySectionView key={s._id} section={s} />
      ))}

      {/* ── Showroom ──────────────────────────────────────────────────────── */}
      {hasShowroom && (
        <section id="showroom" className="bg-ivory scroll-mt-24">
          <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad border-t border-line">
            <Reveal className="max-w-2xl">
              {a.showroomEyebrow && (
                <p className="eyebrow text-bronze-deep mb-4">{a.showroomEyebrow}</p>
              )}
              {a.showroomTitle && (
                <h2 className="font-display font-light leading-[1.12] text-[clamp(1.75rem,3.4vw,2.5rem)] text-ink">
                  {a.showroomTitle}
                </h2>
              )}
              {a.showroomBody && (
                <div className="space-y-4 mt-5">{renderRichText(a.showroomBody)}</div>
              )}
            </Reveal>

            {(a.showroomAddress || a.showroomHours) && (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
                {a.showroomAddress && (
                  <Reveal>
                    <p className="eyebrow text-faint mb-2">Address</p>
                    <p className="font-sans text-[15px] leading-[1.8] text-ink whitespace-pre-line">
                      {a.showroomAddress}
                    </p>
                  </Reveal>
                )}
                {a.showroomHours && (
                  <Reveal delay={0.08}>
                    <p className="eyebrow text-faint mb-2">Visiting Hours</p>
                    <p className="font-sans text-[15px] leading-[1.8] text-ink whitespace-pre-line">
                      {a.showroomHours}
                    </p>
                  </Reveal>
                )}
              </div>
            )}

            {showroomImages.length > 0 && (
              <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {showroomImages.map((img, i) => (
                  <Reveal key={img} delay={(i % 3) * 0.08} className="group">
                    <EditorialImage
                      src={img}
                      alt={a.showroomTitle || "BELOVI showroom"}
                      placeholderLabel="Showroom"
                      ratio="aspect-[4/5]"
                      className="rounded-2xl"
                    />
                  </Reveal>
                ))}
              </div>
            )}

            {mapUrl && (
              <Reveal className="mt-12">
                {/* Lazy so the map never competes with the page's own content for
                    bandwidth, and never blocks the LCP on a phone. */}
                <iframe
                  src={mapUrl}
                  title="BELOVI showroom location"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-[320px] sm:h-[420px] rounded-2xl border border-line grayscale-[0.2]"
                />
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ── Closing CTA ───────────────────────────────────────────────────── */}
      <section className="bg-beige">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 py-14 sm:py-20 text-center">
          <Reveal>
            <p className="eyebrow text-bronze-deep mb-4">Visit or enquire</p>
            <h2 className="font-display font-light leading-[1.12] text-[clamp(1.6rem,3vw,2.3rem)] text-ink max-w-2xl mx-auto">
              We would be glad to hear from you.
            </h2>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <ButtonLink href="/contact" variant="outline" size="md">
                Contact Us
              </ButtonLink>
              <ButtonLink href="/products" variant="outline" size="md" arrow={false}>
                Browse the Collection
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
