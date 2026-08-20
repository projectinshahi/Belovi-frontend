"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "../ui/ProductCard";
import Pagination from "../ui/Pagination";
import Reveal from "../ui/Reveal";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/States";
import Breadcrumbs from "../common/Breadcrumbs";
import CollectionBanner from "./CollectionBanner";
import FilterSidebar, { type Facet, type FilterGroupSpec } from "./FilterSidebar";
import {
  type Product,
  fromPrice,
  productColors,
  colorSwatch,
  inPriceBand,
  priceBandsFor,
} from "../../lib/product";
import { slugify } from "../../lib/categories";

/**
 * The collection page — rebuilt to the Figma frame (node 58:1183).
 *
 * A photographic banner over a light body: a sticky white filter card on the
 * left, and on the right a toolbar, the active-filter pills, a three-up grid of
 * product cards and a pager. It inverts the About page's surface deliberately —
 * both pages open with the same banner construction and use the same tokens, so
 * black and light read as one system rather than two.
 *
 * The four THE EDIT pages render this same component scoped to their section, so
 * everything below has to behave with `scope` set as well as without it.
 */

// ─── Config ──────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { id: "popularity", label: "Default Sorting" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "newest", label: "Newest First" },
];

/** Figma lays out four rows of three. */
const PAGE_SIZE = 12;

const prettify = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/**
 * Scope this browser to one THE EDIT page. A piece belongs when its explicit
 * `editSection` (or legacy `collectionName`) slug is in `sectionSlugs`, or its
 * `lifeMode` slug is in `modeSlugs` (Beyond spans three modes; BELOVI Men uses
 * none so women's pieces don't leak in).
 */
export interface BrowserScope {
  sectionSlugs: string[];
  modeSlugs: string[];
  /**
   * An explicit, hand-curated set of pieces — a Featured Collection card's own
   * list. When present it REPLACES the slug matching rather than adding to it:
   * the studio picked these by hand, so inferring extra members from a shared
   * category would put pieces in a collection nobody chose to put there.
   */
  productIds?: string[];
}

interface ProductBrowserProps {
  /** When set, only pieces belonging to this edit section are shown. */
  scope?: BrowserScope;
  /** Fixed header for edit pages; the shop derives its own. */
  heading?: { eyebrow: string; title: string; description?: string };
  /**
   * Replaces the last breadcrumb, for routes whose final segment is an id
   * rather than a name — a Featured Collection at `/collections/<id>` would
   * otherwise show the raw ObjectId to the shopper. Omitted elsewhere, so the
   * trail keeps deriving itself from the path as before.
   */
  breadcrumbLabel?: string;
}

/**
 * Build a filter's options from the CATALOGUE, and only from the catalogue.
 *
 * There used to be a fixed baseline here — the options the design drew — unioned
 * with whatever the products carried. That put permanent checkboxes on the panel
 * for materials and colours nothing was made of, and the ones that mattered were
 * whichever the design happened to anticipate. An option now exists because a
 * product has that value, so adding, editing or deleting a piece in the admin
 * reshapes the filters on the next load with no deploy.
 *
 * Values are grouped by slug, so "Faux Leather" and "faux leather" are one
 * option; the first spelling seen supplies the label. Sorted by frequency, then
 * alphabetically, so the most common values sit at the top of the list.
 */
function facetsFrom(
  values: string[],
  countFor: (id: string) => number,
  swatchFor?: (label: string) => string
): Facet[] {
  const byId = new Map<string, Facet>();

  for (const raw of values) {
    const label = (raw || "").trim();
    const id = slugify(label);
    if (!id || byId.has(id)) continue;
    byId.set(id, { id, label, count: countFor(id), swatch: swatchFor?.(label) });
  }

  return [...byId.values()]
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

// ─── Content ────────────────────────────────────────────────────────────────

function BrowserContent({ scope, heading, breadcrumbLabel }: ProductBrowserProps) {
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();

  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const modeParam = searchParams.get("mode") || "";
  const collectionParam = searchParams.get("collection") || "";
  const modeSlug = slugify(modeParam);
  const collectionSlug = slugify(collectionParam);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("popularity");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [editDesc, setEditDesc] = useState<string | null>(null);

  const apiOrigin = () =>
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

  /**
   * No state is written before the first `await` — `loading` already starts
   * true, so the mount path has nothing to set. That keeps the effect below
   * free of a synchronous setState, which would otherwise cascade a second
   * render before the request has even left.
   */
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${apiOrigin()}/api/v1/products`);
      const json = res.data;
      if (!json?.success || !Array.isArray(json.data)) throw new Error("bad payload");

      setProducts(
        json.data.map((p: Record<string, unknown>) => ({
          ...p,
          materials: Array.isArray(p.materials) ? p.materials : [],
          description: p.keyFeatures || p.description || "",
        })) as Product[]
      );
      setFailed(false);
    } catch {
      /* An unreachable studio is not an empty catalogue, and rendering it as one
         tells the shopper we sell nothing. The grid shows a retry instead. */
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  /** The retry path is the only one that has to put the grid back into loading. */
  const retry = () => {
    setLoading(true);
    void fetchProducts();
  };

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  // Fixed edit sections carry an admin-editable description, keyed by section
  // slug. An empty value hides the description (the header guards on it).
  useEffect(() => {
    if (!scope) return;
    const key = ["within", "beyond", "furniture", "archive"].find(
      (k) => k === scope.sectionSlugs[0]
    );
    if (!key) return;
    axios
      .get(`${apiOrigin()}/api/v1/edit-sections`)
      .then((r) => {
        if (r.data?.success) setEditDesc(r.data.data[key] ?? "");
      })
      .catch(() => {});
  }, [scope]);

  // Sync category/search from URL
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) setSelectedCategories([category]);
    const search = searchParams.get("search");
    setSearchTerm(search !== null ? search : "");
  }, [searchParams]);

  // Scope to this edit section (if any). Everything downstream — counts,
  // filtering, sort — runs over the scoped set, so an edit page behaves exactly
  // like the shop but over its own slice of the catalogue.
  const scoped = useMemo(() => {
    if (!scope) return products;

    /* A curated list keeps the studio's order rather than the catalogue's, so
       the listing opens arranged the way the collection was composed. The sort
       control still overrides it — this is only the order it arrives in. */
    if (scope.productIds) {
      const rank = new Map(scope.productIds.map((id, i) => [id, i]));
      return products
        .filter((p) => rank.has(p._id))
        .sort((a, b) => rank.get(a._id)! - rank.get(b._id)!);
    }

    const sections = scope.sectionSlugs.map(slugify);
    const modes = scope.modeSlugs.map(slugify);
    return products.filter((p) => {
      if (p.editSection && sections.includes(slugify(p.editSection))) return true;
      if (p.category && sections.includes(slugify(p.category))) return true;
      if (p.collectionName && sections.includes(slugify(p.collectionName))) return true;
      if (modes.length && p.lifeMode && modes.includes(slugify(p.lifeMode))) return true;
      return false;
    });
  }, [products, scope]);

  // ── Facets ────────────────────────────────────────────────────────────────

  /* Plain derivation, not a useMemo: `storeCategories` arrives from a fetch, and
     a dependency array that missed it would freeze the filter on the empty list
     it was built with. The React Compiler memoises this. */
  /* Only categories a piece is actually filed under. The studio's saved list
     used to seed this, which put a checkbox on the panel for every category
     even when nothing was filed there — a filter that always returned nothing.
     `facetsFrom` drops zero-count options, so this now tracks the catalogue. */
  const categoryFacets = facetsFrom(
    scoped.map((p) => p.category || ""),
    (id) => scoped.filter((p) => slugify(p.category) === id).length
  );

  /* Bands cut to the prices that exist, so they re-scale as pricing changes.
     Memoised once and used for BOTH the checkboxes and the filtering below —
     two derivations of the same bands could disagree about what a tick means. */
  const priceBands = useMemo(() => priceBandsFor(scoped.map(fromPrice)), [scoped]);

  const priceFacets = useMemo<Facet[]>(
    () =>
      priceBands
        .map((b) => ({
          id: b.id,
          label: b.label,
          count: scoped.filter((p) => inPriceBand(fromPrice(p), b)).length,
        }))
        .filter((f) => f.count > 0),
    [scoped, priceBands]
  );

  const materialFacets = useMemo(
    () =>
      facetsFrom(
        scoped.flatMap((p) => p.materials || []),
        (id) => scoped.filter((p) => (p.materials || []).some((m) => slugify(m) === id)).length
      ),
    [scoped]
  );

  const colorFacets = useMemo(
    () =>
      facetsFrom(
        scoped.flatMap(productColors),
        (id) => scoped.filter((p) => productColors(p).some((c) => slugify(c) === id)).length,
        colorSwatch
      ),
    [scoped]
  );

  // ── Filtering ─────────────────────────────────────────────────────────────

  const anyHasLifeMode = useMemo(() => scoped.some((p) => !!p.lifeMode), [scoped]);
  const anyHasCollection = useMemo(
    () => scoped.some((p) => !!(p.collectionName || p.season)),
    [scoped]
  );

  const filtered = useMemo(() => {
    const bands = priceBands.filter((b) => selectedPrices.includes(b.id));

    const result = scoped.filter((p) => {
      const catOk =
        selectedCategories.length === 0 || selectedCategories.includes(slugify(p.category));

      const priceOk = bands.length === 0 || bands.some((b) => inPriceBand(fromPrice(p), b));

      const materialOk =
        selectedMaterials.length === 0 ||
        (p.materials || []).some((m) => selectedMaterials.includes(slugify(m)));

      const colorOk =
        selectedColors.length === 0 ||
        productColors(p).some((c) => selectedColors.includes(slugify(c)));

      const searchOk =
        searchTerm === "" ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      // ?mode / ?collection only apply to the un-scoped shop.
      const modeOk = !!scope || !modeSlug || !anyHasLifeMode || slugify(p.lifeMode) === modeSlug;
      const collectionOk =
        !!scope ||
        !collectionSlug ||
        !anyHasCollection ||
        slugify(p.collectionName) === collectionSlug ||
        slugify(p.season) === collectionSlug;

      return catOk && priceOk && materialOk && colorOk && searchOk && modeOk && collectionOk;
    });

    switch (sortBy) {
      case "price-asc":
        return [...result].sort((a, b) => fromPrice(a) - fromPrice(b));
      case "price-desc":
        return [...result].sort((a, b) => fromPrice(b) - fromPrice(a));
      case "newest":
        return [...result].sort((a, b) =>
          (b.createdAt || "").localeCompare(a.createdAt || "")
        );
      default:
        return result;
    }
  }, [
    scoped,
    priceBands,
    selectedCategories,
    selectedPrices,
    selectedMaterials,
    selectedColors,
    searchTerm,
    sortBy,
    modeSlug,
    collectionSlug,
    anyHasLifeMode,
    anyHasCollection,
    scope,
  ]);

  // ── Paging ────────────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  /* Narrowing the results while on page 4 would otherwise leave the shopper on
     an empty page with no indication why. Clamped during RENDER rather than in
     an effect: an effect would paint the empty page first and correct it on the
     next frame, which is the flicker it is meant to prevent. */
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  // ── Active filters ────────────────────────────────────────────────────────

  const toggleIn =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) => {
      setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      setPage(1);
    };

  /* A group with no options is not rendered at all. That is the whole rule: a
     catalogue with no materials recorded shows no Material filter, and one with
     a single price shows no Price filter, rather than an empty panel section
     the shopper has to read past to find out it is empty. */
  const groups: FilterGroupSpec[] = ([
    {
      key: "category",
      title: "Categories",
      options: categoryFacets,
      selected: selectedCategories,
      onToggle: toggleIn(setSelectedCategories),
    },
    {
      key: "price",
      title: "Price",
      options: priceFacets,
      selected: selectedPrices,
      onToggle: toggleIn(setSelectedPrices),
    },
    {
      key: "material",
      title: "Material",
      options: materialFacets,
      selected: selectedMaterials,
      onToggle: toggleIn(setSelectedMaterials),
    },
    {
      key: "color",
      title: "Color",
      options: colorFacets,
      selected: selectedColors,
      onToggle: toggleIn(setSelectedColors),
    },
  ] as FilterGroupSpec[]).filter((g) => g.options.length > 0);

  /** Every ticked box, flattened into the pill row, each able to remove itself. */
  const activePills = groups.flatMap((g) =>
    g.selected.map((id) => ({
      key: `${g.key}:${id}`,
      label: g.options.find((o) => o.id === id)?.label ?? prettify(id),
      remove: () => g.onToggle(id),
    }))
  );

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedPrices([]);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setSearchTerm("");
    setPage(1);
  };

  // ── Chrome ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  /* Header: edit pages pass a fixed heading; the shop derives one from filters.
     Plain derivation for the same reason as `categoryFacets` above — it reads
     that value, which is now itself derived from a fetch. */
  const derived = (() => {
    if (searchTerm) return { eyebrow: "Search", title: searchTerm };
    if (modeSlug) return { eyebrow: "Life Mode", title: prettify(modeParam) };
    if (collectionSlug) return { eyebrow: "Collection", title: prettify(collectionParam) };
    if (selectedCategories.length === 1) {
      const cat = categoryFacets.find((c) => c.id === selectedCategories[0]);
      return { eyebrow: "Category", title: cat ? cat.label : prettify(selectedCategories[0]) };
    }
    return { eyebrow: "Collections", title: "Explore the Collection" };
  })();

  const { title } = heading ?? derived;
  const description =
    editDesc !== null
      ? editDesc
      : heading?.description ??
        "Discover thoughtfully curated furniture where timeless design, exceptional comfort, and modern luxury come together.";

  const showingLabel = loading
    ? "Loading the collection…"
    : filtered.length === 0
      ? "No results"
      : `Showing ${start + 1} - ${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length} results`;

  return (
    <main className="surface-light min-h-screen bg-ivory">
      <CollectionBanner title={title} description={description} />

      <div className="section-x section-inner pb-20 pt-8 sm:pt-10 lg:pb-28">
        <div className="flex gap-8 lg:gap-8">
          {/* ── Desktop rail ─────────────────────────────────────────────── */}
          <aside className="hidden shrink-0 lg:block lg:w-[290px] xl:w-[315px]">
            <div className="sticky top-[126px]">
              <FilterSidebar groups={groups} />
            </div>
          </aside>

          {/* ── Mobile drawer ────────────────────────────────────────────── */}
          <AnimatePresence>
            {drawerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
                  onClick={() => setDrawerOpen(false)}
                  aria-hidden
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  role="dialog"
                  aria-label="Filters"
                  className="surface-light fixed bottom-0 left-0 top-0 z-50 w-[85vw] max-w-[340px]
                    overflow-y-auto bg-cream shadow-2xl lg:hidden"
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-cream px-6 py-5">
                    <p className="font-sans text-[20px] font-medium text-ink">Filter Options</p>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      aria-label="Close filters"
                      className="-mr-2 rounded-full p-2 text-ink transition-colors hover:bg-ink/5"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <FilterSidebar groups={groups} bare className="px-6 py-6" />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Main column ──────────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            <Breadcrumbs currentLabel={breadcrumbLabel} />

            {/* Toolbar */}
            <div className="mt-6 flex flex-col gap-4 sm:mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p
                  aria-live="polite"
                  className="font-sans text-[15px] text-muted sm:text-[18px] lg:text-[22px]"
                >
                  {showingLabel}
                </p>

                <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="pill-control inline-flex items-center gap-2 text-ink lg:hidden"
                  >
                    <SlidersHorizontal size={15} aria-hidden />
                    Filters
                    {activePills.length > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 font-sans text-[11px] text-white tabular-nums">
                        {activePills.length}
                      </span>
                    )}
                  </button>

                  <label
                    htmlFor="sort"
                    className="hidden font-sans text-[18px] text-muted sm:inline lg:text-[22px]"
                  >
                    Sort By :
                  </label>
                  {/* A real <select>: the pill is chrome, the control underneath
                      is native, so keyboard use and the mobile picker are the
                      platform's rather than ours to rebuild. */}
                  <div className="pill-control relative inline-flex items-center gap-3 text-muted">
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                      className="peer cursor-pointer appearance-none bg-transparent pr-6 font-sans outline-none"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      className="pointer-events-none absolute right-5 h-4 w-4 transition-transform duration-300 peer-focus:rotate-180"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active filters */}
              {activePills.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <p className="font-sans text-[15px] text-muted sm:text-[18px] lg:text-[22px]">
                    Active Filters:
                  </p>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {activePills.map((pill) => (
                      <motion.button
                        key={pill.key}
                        layout
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        onClick={pill.remove}
                        aria-label={`Remove filter ${pill.label}`}
                        className="group inline-flex items-center gap-2 rounded-full bg-brand py-2 pl-4 pr-2.5
                          font-sans text-[14px] font-medium text-white transition-colors duration-300
                          hover:bg-forest sm:text-[16px]"
                      >
                        {pill.label}
                        <span
                          aria-hidden
                          className="grid h-5 w-5 place-items-center rounded-full border border-white/50
                            transition-transform duration-300 group-hover:rotate-90"
                        >
                          <X size={11} strokeWidth={2.5} />
                        </span>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                  <button
                    onClick={clearAll}
                    className="link-underline font-sans text-[14px] text-muted transition-colors hover:text-ink"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* ── Grid ───────────────────────────────────────────────────── */}
            {loading ? (
              <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-[20px] bg-cream p-3 sm:rounded-[24px] sm:p-4">
                    <Skeleton className="aspect-square w-full rounded-[12px] sm:rounded-[16px]" />
                    <Skeleton className="mt-8 h-4 w-4/5" />
                    <Skeleton className="mt-3 h-5 w-1/3" />
                  </div>
                ))}
              </div>
            ) : failed ? (
              <div className="mt-10 flex flex-col items-center justify-center rounded-[24px] border border-line bg-cream/60 px-6 py-24 text-center">
                <p className="display-card text-ink">We couldn’t load the collection</p>
                <p className="mt-2 max-w-[46ch] text-body text-muted">
                  The studio didn’t answer just now. It is usually a moment’s outage.
                </p>
                <div className="mt-8">
                  <Button variant="outline" size="sm" onClick={retry} arrow={false}>
                    Try again
                  </Button>
                </div>
              </div>
            ) : pageItems.length > 0 ? (
              <>
                {/* Keyed on the page so a page change cross-fades the whole grid
                    rather than mutating twelve cards in place. */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={safePage}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6"
                  >
                    {pageItems.map((product, i) => (
                      <Reveal key={product._id} delay={(i % 3) * 0.07}>
                        <ProductCard
                          product={product}
                        />
                      </Reveal>
                    ))}
                  </motion.div>
                </AnimatePresence>

                <Pagination
                  page={safePage}
                  totalPages={totalPages}
                  onChange={goToPage}
                  className="mt-12 lg:mt-16"
                />
              </>
            ) : (
              <div className="mt-10 flex flex-col items-center justify-center rounded-[24px] border border-dashed border-line px-6 py-24 text-center">
                <p className="display-card text-ink">
                  {scoped.length === 0 ? "Nothing here yet" : "No pieces match these filters"}
                </p>
                <p className="mt-2 max-w-[46ch] text-body text-muted">
                  {scoped.length === 0
                    ? "This collection is being prepared. Please look again shortly."
                    : "Try loosening a filter, or clear them to browse the full collection."}
                </p>
                {activePills.length > 0 && (
                  <div className="mt-8">
                    <Button variant="outline" size="sm" onClick={clearAll} arrow={false}>
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Wrapper (Suspense for useSearchParams) ─────────────────────────────────

export default function ProductBrowser(props: ProductBrowserProps) {
  return (
    <Suspense
      fallback={
        <div className="surface-light flex min-h-screen items-center justify-center bg-ivory pt-[92px]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
        </div>
      }
    >
      <BrowserContent {...props} />
    </Suspense>
  );
}
