import Link from "next/link";
import Reveal from "../../components/ui/Reveal";
import EditorialImage from "../../components/ui/EditorialImage";
import { ButtonLink } from "../../components/ui/Button";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import MomentCollectionGrid from "../../components/collections/MomentCollectionGrid";

interface Moment {
  label: string;
  caption: string;
  alt: string;
  span: string;
  ratio: string;
  image: string;
}

const MOMENTS: Moment[] = [
  {
    label: "Studio Note · Cloth",
    caption: "A morning spent deciding how much a fabric may weigh before it stops breathing.",
    alt: "Fabric swatches laid out on a studio table in Kochi",
    span: "lg:col-span-7",
    ratio: "aspect-[4/3]",
    image: "/images/body-care.jpg",
  },
  {
    label: "Detail · The Line",
    caption: "Where a seam should fall so the eye reads calm, not effort.",
    alt: "Close study of a seam and drape",
    span: "lg:col-span-5",
    ratio: "aspect-[4/5]",
    image: "/products/test-2.jpg",
  },
  {
    label: "Lookbook · At Home",
    caption: "The private hours, dressed with the same care as the public ones.",
    alt: "At-home look from the Onam Collection",
    span: "lg:col-span-5",
    ratio: "aspect-[4/5]",
    image: "/images/skin-care.jpg",
  },
  {
    label: "Lookbook · The Onam Collection",
    caption: "Pieces named for flowers — Chethi, Thamara, Kaitha — for the season outside the window.",
    alt: "Onam Collection look photographed in daylight",
    span: "lg:col-span-7",
    ratio: "aspect-[4/3]",
    image: "/hero-bg.png",
  },
  {
    label: "Studio Note · Weather",
    caption: "Everything drawn against 32°C, humidity, and the long monsoon first.",
    alt: "Monsoon light across the studio floor",
    span: "lg:col-span-7",
    ratio: "aspect-[4/3]",
    image: "/images/lip-care.jpg",
  },
  {
    label: "Detail · Considered Making",
    caption: "Made in small runs, so the fit stays exact and the cut stays a little rarer.",
    alt: "Hands at work on a considered production run",
    span: "lg:col-span-5",
    ratio: "aspect-[4/5]",
    image: "/products/suncream-2.jpg",
  },
];

export default function TheMomentPage() {
  return (
    <main className="bg-ivory">
      {/* Intro */}
      <section className="pt-[108px] lg:pt-[150px] pb-14 lg:pb-20">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
          <Breadcrumbs className="mb-8 sm:mb-10" />
          <Reveal>
            <p className="eyebrow text-bronze-deep mb-6">The Moment · Studio Notes</p>
            <h1 className="font-display font-light leading-[1.05] text-[clamp(2.5rem,6vw,5rem)] text-ink max-w-4xl">
              The line begins where weather, body and proportion meet.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="font-sans text-[15px] leading-[1.9] text-muted max-w-xl mt-8">
              Notes from the studio in Kochi — the questions behind a cut, the details we
              return to, and the looks as they come together. A quieter view of how a
              BELOVI piece is actually arrived at.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Editorial grid */}
      <section className="pb-4">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {MOMENTS.map((m, i) => (
              <Reveal
                key={m.label}
                delay={(i % 2) * 0.1}
                scaleFrom={0.97}
                className={m.span}
              >
                <figure className="group">
                  <EditorialImage
                    src={m.image}
                    placeholderLabel={m.label.split("·")[0].trim()}
                    alt={m.alt}
                    ratio={m.ratio}
                  />
                  <figcaption className="pt-5">
                    <p className="eyebrow text-bronze-deep mb-3">{m.label}</p>
                    <p className="font-display font-light leading-[1.2] text-[clamp(1.25rem,2vw,1.65rem)] text-ink max-w-md">
                      {m.caption}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The Moment's pieces — same set as the homepage carousel */}
      <MomentCollectionGrid />

      {/* Closing links */}
      <section className="bg-ivory">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 section-pad text-center">
          <Reveal>
            <p className="eyebrow text-bronze-deep mb-6">Continue</p>
            <h2 className="font-display font-light leading-[1.12] text-[clamp(1.9rem,4vw,3.1rem)] text-ink mb-9">
              From the notes to the pieces themselves.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <ButtonLink href="/the-edit" variant="outline" size="md">
                Explore The Edit
              </ButtonLink>
              <Link href="/products" className="eyebrow text-ink link-underline">
                Shop All →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
