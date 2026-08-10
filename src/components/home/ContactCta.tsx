"use client";

import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Reveal from "../ui/Reveal";
import { ButtonLink } from "../ui/Button";
import { useSettings } from "../../context/SettingsContext";

/**
 * Closing contact band — the homepage's one direct line to the house.
 *
 * Every channel is admin-editable (Studio → Settings), so a changed number or
 * address updates here, on /contact and in the footer at once. A channel with no
 * value is omitted rather than rendered empty, which is why the studio can fill
 * these in as BELOVA supplies them without the section ever looking unfinished.
 */
export default function ContactCta() {
  const { whatsappNumber, contactEmail, contactPhone, addressLine } = useSettings();

  const channels = [
    whatsappNumber && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Message the studio",
      href: `https://wa.me/${whatsappNumber}`,
      external: true,
    },
    contactEmail && {
      icon: Mail,
      label: "Email",
      value: contactEmail,
      href: `mailto:${contactEmail}`,
      external: true,
    },
    contactPhone && {
      icon: Phone,
      label: "Telephone",
      value: contactPhone,
      // tel: wants digits and a leading +, not the display spacing.
      href: `tel:${contactPhone.replace(/[^\d+]/g, "")}`,
      external: true,
    },
    addressLine && {
      icon: MapPin,
      label: "Showroom",
      value: addressLine,
      href: "/about#showroom",
      external: false,
    },
  ].filter(Boolean) as {
    icon: typeof Mail;
    label: string;
    value: string;
    href: string;
    external: boolean;
  }[];

  return (
    <section id="contact" className="bg-beige">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          <Reveal>
            <p className="eyebrow text-bronze-deep mb-4">Get in touch</p>
            <h2 className="font-display font-light leading-[1.1] text-[clamp(1.9rem,4vw,3rem)] text-ink">
              Speak to the house.
            </h2>
            <p className="font-sans text-[15px] leading-[1.85] text-muted max-w-md mt-5">
              Questions about a piece, a bespoke request, or an order already placed —
              we answer personally.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <ButtonLink href="/contact" variant="outline" size="md">
                Contact Us
              </ButtonLink>
              <ButtonLink href="/products" variant="outline" size="md" arrow={false}>
                Browse the Collection
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="divide-y divide-line border-y border-line">
              {channels.map((c) => {
                const inner = (
                  <>
                    <c.icon size={18} aria-hidden className="text-bronze shrink-0 mt-0.5" />
                    <span className="min-w-0">
                      <span className="block eyebrow text-faint mb-1.5">{c.label}</span>
                      <span className="block font-sans text-[15px] text-ink break-words">
                        {c.value}
                      </span>
                    </span>
                  </>
                );
                const className =
                  "flex items-start gap-4 py-5 group hover:text-bronze-deep transition-colors duration-300";
                return (
                  <li key={c.label}>
                    {c.external ? (
                      <a
                        href={c.href}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className={className}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link href={c.href} className={className}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
