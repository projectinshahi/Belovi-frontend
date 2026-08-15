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
};

const CARE_LINKS = [
  { label: "Track your Order", href: "/track-order" },
  { label: "Shipping information", href: "/shipping-information" },
  { label: "Returns & Exchanges", href: "/returns-exchanges" },
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/products" },
  { label: "About Us", href: "/about" },
];

/** Kept in the statutory row rather than dropped — every one of these is a live
 *  route, and de-linking them orphans the page entirely. */
const LEGAL_LINKS = [
  { label: "Terms of Service", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund & Cancellation", href: "/refund-cancellation" },
  { label: "Shipping Policy", href: "/shipping-policy" },
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

            {/* Customer care */}
            <nav aria-label="Customer care" className="flex flex-col gap-3">
              {CARE_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              ))}
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Whatsapp
              </a>
            </nav>

            {/* Site */}
            <nav aria-label="Site" className="flex flex-col gap-3">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </Reveal>

          {/* Wordmark, set large — the footer's closing gesture in the design. */}
          <Reveal delay={0.1} className="mt-14 sm:mt-20">
            <Link href="/" aria-label="BELOVI — home" className="block">
              <Logo className="h-[42px] w-auto sm:h-[64px] lg:h-[80px]" />
            </Link>
          </Reveal>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-sans text-[14px] text-white/70 sm:text-[15px]">
              © {new Date().getFullYear()} Belovi. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {LEGAL_LINKS.map((l, i) => (
                <span key={l.href} className="flex items-center gap-3">
                  {i > 0 && <span aria-hidden className="text-white/30">|</span>}
                  <Link
                    href={l.href}
                    className="font-sans text-[14px] text-white/70 transition-colors duration-300 hover:text-brand sm:text-[15px]"
                  >
                    {l.label}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
