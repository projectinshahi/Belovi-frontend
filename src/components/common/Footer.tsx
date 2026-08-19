"use client";

import Link from "next/link";
import Logo from "../ui/Logo";
import Reveal from "../ui/Reveal";
import { useSettings } from "../../context/SettingsContext";

/**
 * The Figma footer: a #0D0D0D plate holding a contact column and two link
 * columns, the wordmark set large beneath them, then a hairline and the
 * statutory row.
 *
 * Contact details come from SiteSettings (the studio edits them in the admin),
 * so nothing here is hardcoded except the labels. A detail the studio hasn't
 * filled in is omitted rather than rendered as an empty row.
 *
 * `surface-dark` re-points the type scale for the whole subtree — without it
 * `text-ink` still resolves to the page's near-black and the footer goes blank.
 */

const Ic = {
  phone: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  ),
  mail: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2" y="4" width="20" height="16" rx="3" /><path d="m3 7 9 6 9-6" />
    </svg>
  ),
  pin: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 10.5c0 5.4-8 12-8 12s-8-6.6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10.5" r="3" />
    </svg>
  ),
  instagram: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14.5 8.5H17V5.2h-2.6c-2.2 0-3.6 1.5-3.6 3.8v1.6H8.5v3.3h2.3V21h3.4v-7.1h2.4l.4-3.3h-2.8V9.4c0-.6.3-.9.8-.9Z" />
    </svg>
  ),
  x: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 4l7 8.5M4 20l6.8-7.6M20 4l-7 8.1M20 20l-9-11.4" />
    </svg>
  ),
};

/**
 * PLACEHOLDER CONTACT DETAILS — not the studio's real address, inbox or number.
 *
 * They are hardcoded rather than read from the settings document because the
 * admin's Settings screen was removed, so there is nothing left to edit them
 * with. Swap these three strings (and the social URLs below) for the real ones
 * before launch; they are all in this one block so it is a single edit.
 */
const CONTACT = {
  address: "2nd Floor, Emerald Arcade, MG Road, Kochi, Kerala 682035",
  email: "hello@belovi.in",
  phone: "+91 98470 12345",
};

/** Instagram is the studio's live account; the other two are placeholders. */
const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/belovi.in/", icon: Ic.instagram },
  { label: "Facebook", href: "https://www.facebook.com/belovi.in", icon: Ic.facebook },
  { label: "X", href: "https://x.com/belovi_in", icon: Ic.x },
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/products" },
  { label: "About Us", href: "/about" },
];

const linkClass =
  "font-sans text-[15px] text-white/85 transition-colors duration-300 hover:text-brand sm:text-[17px]";

export default function Footer() {
  const { whatsappNumber, contactEmail, contactPhone, addressLine } = useSettings();

  const contactRows = [
    contactPhone && {
      icon: <Ic.phone width={22} height={22} />,
      label: contactPhone,
      href: `tel:${contactPhone.replace(/[^\d+]/g, "")}`,
    },
    contactEmail && {
      icon: <Ic.mail width={22} height={22} />,
      label: contactEmail,
      href: `mailto:${contactEmail}`,
      underline: true,
    },
    addressLine && { icon: <Ic.pin width={22} height={22} />, label: addressLine },
  ].filter(Boolean) as {
    icon: React.ReactNode;
    label: string;
    href?: string;
    underline?: boolean;
  }[];

  return (
    <footer className="surface-dark w-full bg-onyx-soft text-ink">
      <div className="section-x section-pad">
        <div className="section-inner">
          <Reveal className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
            {/* Contact */}
            <div className="flex flex-col gap-4">
              {contactRows.map((row) => {
                const body = (
                  <>
                    <span className="shrink-0 text-brand" aria-hidden>{row.icon}</span>
                    <span className={row.underline ? "underline underline-offset-4" : ""}>
                      {row.label}
                    </span>
                  </>
                );
                return row.href ? (
                  <a key={row.label} href={row.href} className={`flex items-center gap-3 ${linkClass}`}>
                    {body}
                  </a>
                ) : (
                  <p key={row.label} className="flex items-center gap-3 font-sans text-[15px] text-white/85 sm:text-[17px]">
                    {body}
                  </p>
                );
              })}
            </div>

            {/* Site, then WhatsApp beneath it — occupying the space the three
                customer-care links used to fill.

                The grid still declares THREE tracks even though two cells are
                now filled: that keeps this column at exactly the width and
                position it already had, which is what makes the change read as
                the links moving into the vacated space rather than the whole
                footer being re-proportioned. The third track is left as the
                trailing whitespace the large wordmark below sits against.

                `gap-3` inside and out, so the four items are evenly spaced and
                WhatsApp sits on the same rhythm as the links above it. It stays
                outside the `<nav>` because it is not site navigation — it opens
                a conversation — while remaining in the same column. */}
            <div className="flex flex-col gap-3">
              <nav aria-label="Site" className="flex flex-col gap-3">
                {NAV_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                ))}
              </nav>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Whatsapp
              </a>
            </div>

            {/* Reach us — the third column, previously the trailing whitespace.
                Same icon-beside-text rows as the contact column on the left, so
                the two read as one system rather than two treatments of the same
                kind of information.

                The address is a `<p>`, not a link: there is nowhere for it to go.
                Email and phone are `mailto:`/`tel:`, with the phone stripped to
                digits because a dialler cannot parse spaces. */}
            <div className="flex flex-col gap-4">
              <p className="flex items-start gap-3 font-sans text-[15px] text-white/85 sm:text-[17px]">
                <span className="mt-0.5 shrink-0 text-brand" aria-hidden>
                  <Ic.pin width={22} height={22} />
                </span>
                <span>{CONTACT.address}</span>
              </p>

              <a
                href={`mailto:${CONTACT.email}`}
                className={`flex items-center gap-3 ${linkClass}`}
              >
                <span className="shrink-0 text-brand" aria-hidden>
                  <Ic.mail width={22} height={22} />
                </span>
                <span className="underline underline-offset-4">{CONTACT.email}</span>
              </a>

              <a
                href={`tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`}
                className={`flex items-center gap-3 ${linkClass}`}
              >
                <span className="shrink-0 text-brand" aria-hidden>
                  <Ic.phone width={22} height={22} />
                </span>
                <span>{CONTACT.phone}</span>
              </a>

              {/* Icon-only, so each carries its own accessible name. */}
              <div className="mt-1 flex items-center gap-4">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="text-white/70 transition-colors duration-300 hover:text-brand"
                  >
                    <s.icon width={22} height={22} />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Wordmark, set large — the footer's closing gesture in the design. */}
          <Reveal delay={0.1} className="mt-14 sm:mt-20">
            <Link href="/" aria-label="BELOVI — home" className="block">
              <Logo className="h-[42px] w-auto sm:h-[64px] lg:h-[80px]" />
            </Link>
          </Reveal>

          {/* The statutory row now carries the copyright alone — the four policy
              links and the `|` separators between them are gone. `justify-between`
              is kept so the line still sits against the same rule and baseline;
              with one child it simply reads left-aligned. */}
          <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-sans text-[14px] text-white/70 sm:text-[15px]">
              © {new Date().getFullYear()} Belovi. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
