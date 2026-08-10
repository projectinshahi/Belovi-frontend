"use client";

import Link from "next/link";
import Reveal from "../ui/Reveal";
import Logo from "../ui/Logo";
import { COMPANY } from "../../lib/contact";
import { SHOP_CATEGORY_LINKS } from "../../lib/categories";
import { useSettings } from "../../context/SettingsContext";

export default function Footer() {
  const { whatsappNumber, instagramUrl } = useSettings();

  const COLUMNS = [
    {
      title: "Collections",
      // Built from the fixed category list, so the footer, the Shop menu and the
      // shop's filters are the same set of links by construction. These used to
      // be hand-written `?collection=` URLs, which filtered on a different field
      // and quietly matched nothing. "All Products" is one of the five, so no
      // extra row is appended — "Browse the shop" below is the unfiltered link.
      links: [
        ...SHOP_CATEGORY_LINKS.map((c) => ({
          label: c.name,
          href: `/products?category=${c.id}`,
        })),
        { label: "Browse the Shop", href: "/products" },
      ],
    },
    {
      title: "Customer Care",
      links: [
        { label: "Track Your Order", href: "/track-order" },
        { label: "Shipping Information", href: "/shipping-information" },
        { label: "Returns & Exchanges", href: "/returns-exchanges" },
        { label: "Contact Us", href: "/contact" },
        { label: "WhatsApp", href: `https://wa.me/${whatsappNumber}`, external: true },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms & Conditions", href: "/terms-and-conditions" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Refund & Cancellation", href: "/refund-cancellation" },
        { label: "Shipping Policy", href: "/shipping-policy" },
        { label: "Cookie Preferences", href: "/privacy-policy#cookies" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Instagram", href: instagramUrl, external: true },
        { label: "About Us", href: "/about" },
        { label: "Showroom", href: "/about#showroom" },
        { label: "Brochures", href: "/#brochures" },
      ],
    },
  ];

  return (
    /* Solid black, the same `bg-black` (#000) as the Featured Collection band
       and ProvenanceStrip — the page's dark surfaces are one value, not three
       near-misses.

       `surface-dark` is what makes the content survive the change: it re-points
       the type scale for the whole subtree, so the tagline, the four link
       columns, their `bronze-deep` headings and the statutory block all invert
       to their light values. Without it `text-ink` and `text-muted` would still
       resolve to the page's near-black type and the footer would go blank.
       Ratios are documented on the class in globals.css. */
    <footer className="bg-black surface-dark text-ink w-full">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pt-10 sm:pt-14 pb-8">
        {/* Tagline */}
        <Reveal className="text-center max-w-3xl mx-auto">
          <p className="font-display text-[15px] sm:text-[17px] lg:text-[19px] leading-relaxed text-ink/75">
            BELOVI — premium luxury wellness & intimacy lifestyle. Made for moments together.
          </p>
        </Reveal>

        {/* Columns */}
        <div className="mt-9 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8 border-t border-ink/12 pt-9">
          {COLUMNS.map((col, i) => (
            <Reveal key={col.title} delay={i * 0.08}>
              <h3 className="eyebrow text-bronze-deep mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-[13px] text-muted hover:text-ink transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-sans text-[13px] text-muted hover:text-ink transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-9 pt-9 border-t border-ink/12 flex justify-center">
          <Link href="/" aria-label="BELOVI — home">
            {/* `ink` tone: the footer band is warm light, and the brand PNG
                carries a solid black plate that would sit on it as a box. */}
            <Logo tone="ink" className="h-[40px] sm:h-[52px]" />
          </Link>
        </Reveal>

        {/* Statutory identity */}
        <div className="mt-8 space-y-2 text-center">
          <p className="font-sans text-[11px] leading-relaxed tracking-wide text-faint">
            {COMPANY.legalName} · CIN {COMPANY.cin}
          </p>
          <p className="font-sans text-[11px] leading-relaxed tracking-wide text-faint">
            Registered office: {COMPANY.registeredOffice}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-x-3 gap-y-1">
            <p className="font-sans text-[11px] tracking-wide text-faint">
              © {COMPANY.legalName}. All rights reserved.
            </p>
            <span className="hidden sm:inline text-faint/50">·</span>
            <p className="font-sans text-[11px] tracking-wide text-faint">
              Prices in ₹ INR, inclusive of GST. Shipping within India only.
            </p>
            <span className="hidden sm:inline text-faint/50">·</span>
            <p className="font-sans text-[11px] tracking-wide text-faint">
              Subject to the jurisdiction of the courts at {COMPANY.jurisdiction}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
