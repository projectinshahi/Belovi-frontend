"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Reveal from "../ui/Reveal";
import { useCategories } from "../../lib/categories";

/**
 * Homepage search.
 *
 * The header already carries a search affordance, but it is a toggled drawer —
 * discoverable only if you know to look for the icon. This is the standing one:
 * a visitor who lands on the homepage knowing what they want can type it without
 * hunting. Both submit to the same `/products?search=` the header uses, so there
 * is one search surface with two entrances.
 *
 * The category shortcuts underneath come from the shop's fixed taxonomy, so they
 * cannot drift from the Shop menu or the shop's filters.
 *
 * Colours are back on the tokens. They were written as literals while
 * `--color-ink` still equalled `--color-ivory` (#F8F7F5), which made `text-ink`
 * on this `bg-ivory` section white-on-white; that palette is now light-first, so
 * `ink`/`muted`/`line-strong` resolve to the same values the literals spelled
 * out — 18.4:1, 6.2:1 and a 3.4:1 field underline — and this section tracks any
 * future palette change instead of pinning its own copy of it.
 */
export default function SearchBar() {
  const [query, setQuery] = useState("");
  /** The studio's categories. Empty until one is saved — the Browse row then
   *  hides rather than leaving a stranded label with no chips beside it. */
  const shopCategories = useCategories() ?? [];
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <section className="bg-ivory">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="eyebrow text-bronze-deep mb-4">Search</p>
          <h2 className="font-display font-light leading-[1.1] text-[clamp(1.7rem,3.5vw,2.6rem)] text-ink">
            Find your piece.
          </h2>

          <form onSubmit={submit} role="search" className="mt-8 sm:mt-10">
            <div className="flex items-center gap-3 border-b border-line-strong focus-within:border-ink transition-colors duration-300">
              <Search size={18} aria-hidden className="text-muted shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, collections…"
                aria-label="Search products"
                /* min-w-0 lets the field shrink below its intrinsic width so the
                   row can never force the page wider on a narrow phone.
                   16px keeps iOS from zooming the viewport on focus. */
                className="flex-1 min-w-0 bg-transparent py-3.5 font-sans text-[16px] text-ink placeholder:text-muted focus:outline-none"
              />
              <button
                type="submit"
                className="eyebrow text-ink py-3.5 shrink-0 whitespace-nowrap hover:text-bronze-deep transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          <div
            className={`mt-6 flex-wrap items-center justify-center gap-x-3 gap-y-2 ${
              shopCategories.length > 0 ? "flex" : "hidden"
            }`}
          >
            <span className="font-sans text-[12px] text-muted">Browse</span>
            {shopCategories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className="font-sans text-[12px] text-ink border border-line-strong px-3.5 py-1.5 hover:border-ink hover:bg-ink/[0.04] transition-colors duration-300"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
