"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "../ui/Reveal";
import ProductCard from "../ui/ProductCard";
import { ButtonLink } from "../ui/Button";
import Breadcrumbs from "../common/Breadcrumbs";
import { type Product, fromPrice } from "../../lib/product";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  ""
);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
];

interface CollectionListingProps {
  title: string;
  eyebrow: string;
  blurb: string;
  /** THE EDIT page this listing represents, e.g. "within" | "beyond" | "furniture" | "archive". */
  editSectionSlug?: string;
  /** Legacy collection/season/garment slug still matched for back-compat. */
  collectionSlug?: string;
  /** One or more life-mode slugs a piece may carry (Beyond spans three). */
  modeSlugs?: string[];
  /** Convenience for a single mode. */
  modeSlug?: string;
}

export default function CollectionListing({
  title,
  eyebrow,
  blurb,
  editSectionSlug,
  collectionSlug,
  modeSlugs,
  modeSlug,
}: CollectionListingProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter + sort UI state
  const [sort, setSort] = useState<SortKey>("featured");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeModes, setActiveModes] = useState<string[]>([]); // applied
  const [maxPrice, setMaxPrice] = useState<number | null>(null); // applied
  const [draftModes, setDraftModes] = useState<string[]>([]); // in drawer
  const [draftMax, setDraftMax] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/v1/products`);
        const json = res.data;
        const list: Product[] = Array.isArray(json)
          ? json
          : json?.data || json?.products || [];
        if (active) setProducts(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Failed to load products:", error);
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Products that belong on this Edit page. Match order of preference:
  //   1) explicit `editSection` (the studio-assigned home for the piece)
  //   2) legacy `collectionName` matching the page slug (back-compat)
  //   3) `lifeMode` matching any of the page's modes (e.g. Beyond spans three)
  const belong = useMemo(() => {
    const wantedSections = [editSectionSlug, collectionSlug]
      .filter(Boolean)
      .map((s) => slugify(s!));
    const wantedModes = [...(modeSlugs || []), ...(modeSlug ? [modeSlug] : [])].map((s) =>
      slugify(s)
    );

    // Nothing to filter by → show everything (defensive; pages always pass a slug).
    if (wantedSections.length === 0 && wantedModes.length === 0) return products;

    return products.filter((p) => {
      if (p.editSection && wantedSections.includes(slugify(p.editSection))) return true;
      if (p.collectionName && wantedSections.includes(slugify(p.collectionName))) return true;
      if (p.lifeMode && wantedModes.includes(slugify(p.lifeMode))) return true;
      return false;
    });
  }, [products, editSectionSlug, collectionSlug, modeSlugs, modeSlug]);

  // Life modes present in this page's set — drives the filter drawer's options.
  const availableModes = useMemo(() => {
    const set = new Set<string>();
    belong.forEach((p) => p.lifeMode && set.add(p.lifeMode));
    return Array.from(set);
  }, [belong]);

  // Apply the drawer filters, then sort.
  const shown = useMemo(() => {
    let list = belong;
    if (activeModes.length > 0) {
      const wanted = activeModes.map(slugify);
      list = list.filter((p) => p.lifeMode && wanted.includes(slugify(p.lifeMode)));
    }
    if (maxPrice != null) {
      list = list.filter((p) => fromPrice(p) <= maxPrice);
    }
    const sorted = [...list];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        break;
      case "price-asc":
        sorted.sort((a, b) => fromPrice(a) - fromPrice(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => fromPrice(b) - fromPrice(a));
        break;
      default:
        break; // featured = natural order
    }
    return sorted;
  }, [belong, activeModes, maxPrice, sort]);

  const openDrawer = () => {
    setDraftModes(activeModes);
    setDraftMax(maxPrice);
    setDrawerOpen(true);
  };
  const applyFilters = () => {
    setActiveModes(draftModes);
    setMaxPrice(draftMax);
    setDrawerOpen(false);
  };
  const clearFilters = () => {
    setDraftModes([]);
    setDraftMax(null);
    setActiveModes([]);
    setMaxPrice(null);
  };
  const toggleDraftMode = (m: string) =>
    setDraftModes((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const activeFilterCount = activeModes.length + (maxPrice != null ? 1 : 0);
  const count = shown.length;

  return (
    <main className="bg-ivory min-h-screen">
      {/* Hero band */}
      <section className="pt-[108px] lg:pt-[140px] pb-10 lg:pb-14">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
          <Breadcrumbs className="mb-8 sm:mb-10" />
          <Reveal>
            <p className="eyebrow text-bronze-deep mb-5">{eyebrow}</p>
            <h1 className="font-display font-light leading-[1.05] text-[clamp(2.5rem,6vw,4.75rem)] text-ink mb-7">
              {title}
            </h1>
            <p className="font-sans text-[15px] leading-[1.9] text-muted max-w-xl">{blurb}</p>
          </Reveal>
        </div>
      </section>

      {/* Filter + sort bar */}
      <div className="border-y border-line">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 py-4 flex items-center justify-between gap-4">
          <button
            onClick={openDrawer}
            className="inline-flex items-center gap-2 border border-line hover:border-ink/50 transition-colors px-4 sm:px-5 py-2.5 eyebrow text-ink"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            {!loading && (
              <span className="font-sans text-[12px] text-faint whitespace-nowrap">
                {count} {count === 1 ? "piece" : "pieces"}
              </span>
            )}
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto hide-scrollbar">
              <span className="eyebrow text-faint hidden sm:inline">Sort</span>
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={`eyebrow whitespace-nowrap transition-colors ${
                    sort === s.key
                      ? "text-ink underline underline-offset-4 decoration-ink"
                      : "text-faint hover:text-ink"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="section-pad">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-sand" />
                  <div className="pt-4 flex flex-col gap-2">
                    <div className="h-4 w-2/3 bg-sand" />
                    <div className="h-3 w-1/3 bg-sand" />
                  </div>
                </div>
              ))}
            </div>
          ) : shown.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-12 lg:gap-y-16">
              {shown.map((product, i) => (
                <Reveal key={product._id} delay={(i % 3) * 0.06} scaleFrom={0.97}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center max-w-md mx-auto">
              <p className="font-display font-light text-[clamp(1.6rem,3vw,2.25rem)] text-ink leading-[1.15] mb-4">
                {activeFilterCount > 0 ? "No pieces match those filters." : "Nothing here just yet."}
              </p>
              <p className="font-sans text-[14px] leading-[1.85] text-muted mb-9">
                {activeFilterCount > 0
                  ? "Try loosening the filters, or clear them to see the full edit."
                  : "Pieces for this part of the edit are still being finished in the studio. In the meantime, the full collection is open to browse."}
              </p>
              {activeFilterCount > 0 ? (
                <button onClick={clearFilters} className="eyebrow text-ink link-underline">
                  Clear filters
                </button>
              ) : (
                <ButtonLink href="/products" variant="outline" size="md">
                  View the Collection
                </ButtonLink>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[86%] max-w-[380px] bg-ivory flex flex-col"
            >
              <div className="flex items-center justify-between h-[68px] px-6 border-b border-line shrink-0">
                <span className="eyebrow text-ink">Filter</span>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="text-ink">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {availableModes.length > 0 && (
                  <div>
                    <p className="eyebrow text-bronze-deep mb-4">Life Mode</p>
                    <div className="space-y-3">
                      {availableModes.map((m) => (
                        <label key={m} className="flex items-center gap-3 cursor-pointer group">
                          <span
                            className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                              draftModes.includes(m) ? "bg-ink border-ink" : "border-line group-hover:border-ink/50"
                            }`}
                          >
                            {draftModes.includes(m) && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f5f0e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            )}
                          </span>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={draftModes.includes(m)}
                            onChange={() => toggleDraftMode(m)}
                          />
                          <span className="font-sans text-[14px] text-ink">{m}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="eyebrow text-bronze-deep mb-4">Max Price</p>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[14px] text-muted">₹</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Any"
                      value={draftMax ?? ""}
                      onChange={(e) => setDraftMax(e.target.value ? Number(e.target.value) : null)}
                      className="flex-1 border-b border-ink/30 focus:border-ink bg-transparent py-2 font-sans text-[14px] text-ink placeholder:text-faint focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-line p-6 flex items-center gap-3 shrink-0">
                <button
                  onClick={clearFilters}
                  className="flex-1 border border-line hover:border-ink/50 transition-colors py-3 eyebrow text-ink"
                >
                  Clear
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-ink text-ivory hover:bg-forest transition-colors py-3 eyebrow"
                >
                  Apply
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
