"use client";

import Reveal from "../ui/Reveal";
import { Truck, ShieldCheck, Package, MessageCircleQuestion } from "lucide-react";

/**
 * Service promises. These must agree with the published policy pages — the
 * strip previously advertised "Free Shipping Over $50" (dollars, on a store that
 * prices and ships only in ₹) and a 14-day return window, where
 * /shipping-information states free shipping above ₹2,499 and
 * /returns-exchanges states seven days. A promise on the homepage that the
 * policy page contradicts is the kind a customer holds you to.
 */
const ITEMS = [
  {
    icon: Truck,
    title: "Complimentary Shipping Over ₹2,499",
  },
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
  },
  {
    icon: Package,
    title: "7-Day Returns",
  },
  {
    icon: MessageCircleQuestion,
    title: "Studio Support on WhatsApp",
  },
];

export default function ProvenanceStrip() {
  return (
    <section className="bg-black text-white border-b border-stone-800">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:justify-between gap-8 sm:gap-y-12 lg:gap-0 lg:divide-x divide-stone-800">
          {ITEMS.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 0.12}
              className="flex items-center justify-center lg:justify-center lg:flex-1 gap-5 px-4 first:lg:pl-0 last:lg:pr-0"
            >
              <item.icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.25] text-white shrink-0" />
              <span className="font-display text-[15px] sm:text-[16px] tracking-wide text-stone-200 font-light">
                {item.title}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
