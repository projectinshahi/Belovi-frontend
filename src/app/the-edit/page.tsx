import Link from "next/link";
import Reveal from "../../components/ui/Reveal";
import EditorialImage from "../../components/ui/EditorialImage";
import { ButtonLink } from "../../components/ui/Button";
import CategoryTiles from "./_components/CategoryTiles";
import Breadcrumbs from "../../components/common/Breadcrumbs";

const COLLECTIONS = [
  {
    name: "Within",
    href: "/the-edit/within",
    label: "At-Home Identity",
    note: "The private self, dressed with the same care as the public one.",
  },
  {
    name: "Beyond",
    href: "/the-edit/beyond",
    label: "Occasion & Outward",
    note: "For the moments that face the room and the evening.",
  },
  {
    name: "BELOVI Man",
    href: "/the-edit/furniture",
    label: "Menswear",
    note: "Considered shirting and easy tailoring for the tropics.",
  },
  {
    name: "Archive",
    href: "/the-edit/archive",
    label: "Past Seasons",
    note: "Limited pieces from earlier runs, kept a while longer.",
  },
];

export default function TheEditPage() {
  return (
    <main className="bg-ivory">
      {/* Intro */}
      <section className="pt-[108px] lg:pt-[150px] pb-14 lg:pb-20">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
          <Breadcrumbs className="mb-8 sm:mb-10" />
          <Reveal>
            <p className="eyebrow text-bronze-deep mb-6">The Edit</p>
            <h1 className="font-display font-light leading-[1.05] text-[clamp(2.5rem,6vw,5rem)] text-ink max-w-4xl">
              Everything, in one place.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="font-sans text-[15px] leading-[1.9] text-muted max-w-xl mt-8">
              Every piece the studio is making right now, and the collections that
              gather them. Begin wherever you actually are.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Categories — live from the studio */}
      <section className="bg-ivory">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pb-16 lg:pb-24">
          <Reveal>
            <p className="eyebrow text-bronze-deep mb-8">Shop by Category</p>
          </Reveal>
          <CategoryTiles />
        </div>
      </section>

      {/* Collections */}
      <section className="bg-tan">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
          <Reveal>
            <p className="eyebrow text-bronze-deep mb-8">The Collections</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {COLLECTIONS.map((c, i) => (
              <Reveal key={c.href} delay={(i % 2) * 0.1} scaleFrom={0.97}>
                <Link href={c.href} className="group block">
                  <EditorialImage
                    placeholderLabel={c.name}
                    alt={`${c.name} — ${c.label}`}
                    ratio="aspect-[16/10]"
                  />
                  <div className="pt-5">
                    <p className="eyebrow text-bronze-deep mb-2">{c.label}</p>
                    <h3 className="font-display font-light text-3xl lg:text-4xl text-ink leading-tight group-hover:text-bronze-deep transition-colors">
                      {c.name}
                    </h3>
                    <p className="font-sans text-[14px] leading-[1.8] text-muted mt-3 max-w-md">
                      {c.note}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Shop all */}
      <section className="bg-ivory">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 section-pad text-center">
          <Reveal>
            <h2 className="font-display font-light leading-[1.12] text-[clamp(1.9rem,4vw,3.1rem)] text-ink mb-9">
              Or see everything in one place.
            </h2>
            <ButtonLink href="/products" variant="outline" size="md">
              Shop All
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
