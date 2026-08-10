"use client";

import Link from "next/link";
// lucide dropped its brand logos in v1, so the Instagram row uses the handle
// mark (@) rather than shipping a one-off SVG for it.
import { AtSign, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import Reveal from "../../components/ui/Reveal";
import { ButtonLink } from "../../components/ui/Button";
import { useSettings } from "../../context/SettingsContext";
import { COMPANY } from "../../lib/contact";
import type { AboutPage } from "../../lib/about";

/**
 * Contact — the direct channels, plus the showroom when one is published.
 *
 * Deliberately channel-based rather than a message form: every route here is a
 * conversation the studio already monitors (WhatsApp, email, telephone), so
 * nothing lands in an inbox nobody owns and there is no unattended form to spam.
 * Channels come from Studio → Settings; the showroom from Studio → About Page.
 */
export default function ContactClient({ about }: { about: AboutPage | null }) {
  const { whatsappNumber, contactEmail, contactPhone, addressLine, instagramUrl } = useSettings();
  const a = about ?? {};

  const channels = [
    whatsappNumber && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Message the studio",
      hint: "Fastest reply, 7 days a week",
      href: `https://wa.me/${whatsappNumber}`,
    },
    contactEmail && {
      icon: Mail,
      label: "Email",
      value: contactEmail,
      hint: "For orders, returns and enquiries",
      href: `mailto:${contactEmail}`,
    },
    contactPhone && {
      icon: Phone,
      label: "Telephone",
      value: contactPhone,
      hint: "During showroom hours",
      href: `tel:${contactPhone.replace(/[^\d+]/g, "")}`,
    },
    instagramUrl && {
      icon: AtSign,
      label: "Instagram",
      value: "@belovi.in",
      hint: "New pieces and studio notes",
      href: instagramUrl,
    },
  ].filter(Boolean) as {
    icon: typeof Mail;
    label: string;
    value: string;
    hint: string;
    href: string;
  }[];

  // The showroom's own address wins; the site-wide one-liner is the fallback.
  const address = a.showroomAddress || addressLine;

  return (
    <main className="bg-ivory min-h-screen">
      <div className="pt-[92px] lg:pt-[116px]">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
          <Breadcrumbs />
        </div>

        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pt-5 sm:pt-8 pb-16 sm:pb-24">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-bronze-deep">Contact</p>
            <h1 className="font-display font-light leading-[1.1] text-[clamp(1.9rem,4.5vw,3.1rem)] text-ink mt-4">
              Speak to the house.
            </h1>
            <p className="font-sans text-[15px] leading-[1.85] text-muted mt-5">
              Questions about a piece, a bespoke request, or an order already placed — we
              answer personally.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {channels.map((c, i) => (
                <Reveal key={c.label} delay={(i % 2) * 0.08}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group block h-full border border-line p-6 hover:border-ink/40 transition-colors duration-300"
                  >
                    <c.icon size={18} aria-hidden className="text-bronze" />
                    <p className="eyebrow text-faint mt-4 mb-1.5">{c.label}</p>
                    <p className="font-sans text-[15px] text-ink break-words group-hover:text-bronze-deep transition-colors">
                      {c.value}
                    </p>
                    <p className="font-sans text-[13px] text-muted mt-1.5">{c.hint}</p>
                  </a>
                </Reveal>
              ))}
            </div>

            {/* Showroom / registered office */}
            <Reveal delay={0.1} className="border-t lg:border-t-0 lg:border-l border-line pt-8 lg:pt-0 lg:pl-12">
              {address && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} aria-hidden className="text-bronze" />
                    <p className="eyebrow text-faint">
                      {a.showroomAddress ? "Showroom" : "Address"}
                    </p>
                  </div>
                  <p className="font-sans text-[15px] leading-[1.8] text-ink whitespace-pre-line">
                    {address}
                  </p>
                  {a.showroomHours && (
                    <p className="font-sans text-[14px] leading-[1.8] text-muted mt-3 whitespace-pre-line">
                      {a.showroomHours}
                    </p>
                  )}
                  {a.showroomAddress && (
                    <div className="mt-5">
                      <Link
                        href="/about#showroom"
                        className="eyebrow text-ink border-b border-ink pb-1 hover:text-bronze-deep hover:border-bronze-deep transition-colors"
                      >
                        Visit the showroom
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-line pt-8">
                <p className="eyebrow text-faint mb-3">Registered entity</p>
                <p className="font-sans text-[13px] leading-[1.9] text-muted">
                  {COMPANY.legalName}
                  <br />
                  CIN {COMPANY.cin}
                  <br />
                  {COMPANY.registeredOffice}
                </p>
                <p className="font-sans text-[13px] leading-[1.9] text-muted mt-4">
                  Grievance officer enquiries:{" "}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-ink link-underline hover:text-bronze-deep transition-colors"
                  >
                    {contactEmail}
                  </a>
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <ButtonLink href="/track-order" variant="outline" size="sm" arrow={false}>
                  Track an Order
                </ButtonLink>
                <ButtonLink href="/products" variant="outline" size="sm" arrow={false}>
                  Browse the Collection
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}
