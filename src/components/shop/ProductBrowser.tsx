"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "../ui/ProductCard";
import Reveal from "../ui/Reveal";
import { Button } from "../ui/Button";
import Breadcrumbs from "../common/Breadcrumbs";
import { type Product, fromPrice } from "../../lib/product";
import { slugify, SHOP_CATEGORY_LINKS } from "../../lib/categories";

// ─── Config ──────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { id: "popularity", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

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
}

interface ProductBrowserProps {
  /** When set, only pieces belonging to this edit section are shown. */
  scope?: BrowserScope;
  /** Fixed header for edit pages; the shop derives its own. */
  heading?: { eyebrow: string; title: string; description?: string };
}

// ─── Filter panel ─────────────────────────────────────────────────────────────

/** One checkable option in a filter group. */
interface Facet {
  id: string;
  label: string;
  count: number;
}

interface FilterPanelProps {
  categories: Facet[];
  materials: Facet[];
  selectedCategories: string[];
  selectedMaterials: string[];
  onToggleCategory: (id: string) => void;
  onToggleMaterial: (id: string) => void;
}

/** One titled group of checkboxes. Both filter groups render identically. */
function FilterGroup({
  title,
  options,
  selected,
  onToggle,
  empty,
}: {
  title: string;
  options: Facet[];
  selected: string[];
  onToggle: (id: string) => void;
  /** Shown when there are no options; omit to hide the group entirely. */
  empty?: string;
}) {
  if (options.length === 0 && !empty) return null;

  return (
    <div>
      <p className="eyebrow text-bronze-deep pb-4 mb-4 border-b border-line">{title}</p>
      <div className="flex flex-col gap-3.5">
        {options.length === 0 && <p className="font-sans text-sm text-faint">{empty}</p>}
        {options.map((opt) => (
          <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(opt.id)}
              onChange={() => onToggle(opt.id)}
              className="h-3.5 w-3.5 accent-forest cursor-pointer"
            />
            <span className="font-sans text-sm text-muted group-hover:text-ink transition-colors">
              {opt.label} <span className="text-faint">({opt.count})</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function FilterPanel({
  categories,
  materials,
  selectedCategories,
  selectedMaterials,
  onToggleCategory,
  onToggleMaterial,
}: FilterPanelProps) {
  return (
    <div className="space-y-10">
      <FilterGroup
        title="Category"
        options={categories}
        selected={selectedCategories}
        onToggle={onToggleCategory}
        empty="No categories yet."
      />

      {/* Materials come from the pieces themselves, so an untagged catalogue
          shows no group at all rather than an empty heading. */}
      <FilterGroup
        title="Material"
        options={materials}
        selected={selectedMaterials}
        onToggle={onToggleMaterial}
      />
    </div>
  );
}

// ─── Content ────────────────────────────────────────────────────────────────

function BrowserContent({ scope, heading }: ProductBrowserProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const modeParam = searchParams.get("mode") || "";
  const collectionParam = searchParams.get("collection") || "";
  const modeSlug = slugify(modeParam);
  const collectionSlug = slugify(collectionParam);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("popularity");
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Admin-editable description for this fixed edit section (null until loaded).
  const [editDesc, setEditDesc] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
          : "http://localhost:5000";

        const prodRes = await axios.get(`${baseUrl}/api/v1/products`);
        const prodJson = prodRes.data;

        if (prodJson?.success && Array.isArray(prodJson.data)) {
          const mappedProds: Product[] = prodJson.data.map((p: any) => ({
            _id: p._id,
            name: p.name,
            images: p.images && p.images.length > 0 ? p.images : ["/products/suncream-1.jpg"],
            variants: p.variants,
            offerText: p.offerText || "",
            category: p.category || "",
            garmentType: p.garmentType,
            collectionName: p.collectionName,
            season: p.season,
            lifeMode: p.lifeMode,
            editSection: p.editSection,
            limited: p.limited,
            materials: Array.isArray(p.materials) ? p.materials : [],
            description: p.keyFeatures || p.description || "",
            createdAt: p.createdAt,
          }));
          setProducts(mappedProds);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fixed edit sections carry an admin-editable description, keyed by section
  // slug. An empty value hides the description (the header guards on it).
  useEffect(() => {
    if (!scope) return;
    const KEY: Record<string, string> = {
      within: "within",
      beyond: "beyond",
      "furniture": "furniture",
      archive: "archive",
    };
    const key = KEY[scope.sectionSlugs[0]];
    if (!key) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
      : "http://localhost:5000";
    axios
      .get(`${baseUrl}/api/v1/edit-sections`)
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

  const toggleCategory = (id: string) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const toggleMaterial = (id: string) =>
    setSelectedMaterials((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );

  /**
   * The five fixed categories first, always in the same order whatever the
   * catalogue holds — so the filter list and the Shop menu agree by construction
   * — then any studio category (Category Management) that pieces are actually
   * filed under. Without that tail, a piece filed under a studio category would
   * be unreachable from the filter panel even though the homepage tile links to
   * it. Studio categories with nothing in them are left out rather than shown at
   * zero, since they are not a fixed part of the shop's shape.
   */
  const categoriesWithCounts = useMemo(() => {
    const countFor = (id: string) =>
      scoped.filter((p) => slugify(p.category) === id).length;

    const fixed = SHOP_CATEGORY_LINKS.map((c) => ({
      id: c.id,
      label: c.name,
      count: countFor(c.id),
    }));

    const fixedIds = new Set(fixed.map((c) => c.id));
    const studio = new Map<string, Facet>();
    for (const p of scoped) {
      const label = (p.category || "").trim();
      const id = slugify(label);
      if (!id || fixedIds.has(id) || studio.has(id)) continue;
      studio.set(id, { id, label, count: countFor(id) });
    }

    return [...fixed, ...[...studio.values()].sort((a, b) => a.label.localeCompare(b.label))]
      // On an edit page, hide categories with nothing in this section.
      .filter((c) => (scope ? c.count > 0 : true));
  }, [scoped, scope]);

  /**
   * Material options, built from the pieces in view rather than a fixed list —
   * a fabric the studio types into a product becomes a filter option with no
   * code change, and one that stops being used disappears on its own.
   *
   * Keyed by slug so "Cotton", "cotton" and "COTTON" collapse into one option;
   * the label shown is whichever spelling was seen first. A piece is counted
   * once per option even if it carries the same fabric twice.
   */
  const materialFacets = useMemo(() => {
    const byId = new Map<string, Facet>();
    for (const p of scoped) {
      const counted = new Set<string>();
      for (const raw of p.materials || []) {
        const label = (raw || "").trim();
        const id = slugify(label);
        if (!id || counted.has(id)) continue;
        counted.add(id);
        const existing = byId.get(id);
        if (existing) existing.count += 1;
        else byId.set(id, { id, label, count: 1 });
      }
    }
    return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [scoped]);

  const anyHasLifeMode = useMemo(() => scoped.some((p) => !!p.lifeMode), [scoped]);
  const anyHasCollection = useMemo(
    () => scoped.some((p) => !!(p.collectionName || p.season)),
    [scoped]
  );

  const filtered = useMemo(() => {
    const result = scoped.filter((p) => {
      const catOk =
        selectedCategories.length === 0 ||
        selectedCategories.includes(slugify(p.category));

      const materialOk =
        selectedMaterials.length === 0 ||
        (p.materials || []).some((m) => selectedMaterials.includes(slugify(m)));

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

      return catOk && materialOk && searchOk && modeOk && collectionOk;
    });

    switch (sortBy) {
      case "price-asc":
        return [...result].sort((a, b) => fromPrice(a) - fromPrice(b));
      case "price-desc":
        return [...result].sort((a, b) => fromPrice(b) - fromPrice(a));
      default:
        return result;
    }
  }, [
    scoped,
    selectedCategories,
    selectedMaterials,
    searchTerm,
    sortBy,
    modeSlug,
    collectionSlug,
    anyHasLifeMode,
    anyHasCollection,
    scope,
  ]);

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

  // Header: edit pages pass a fixed heading; the shop derives one from filters.
  const derived = useMemo(() => {
    if (searchTerm) return { eyebrow: "The Edit · Search", title: searchTerm };
    if (modeSlug) return { eyebrow: "The Edit · Life Mode", title: prettify(modeParam) };
    if (collectionSlug)
      return { eyebrow: "The Edit · Collection", title: prettify(collectionParam) };
    if (selectedCategories.length === 1) {
      const cat = categoriesWithCounts.find((c) => c.id === selectedCategories[0]);
      return {
        eyebrow: "The Edit · Category",
        title: cat ? cat.label : prettify(selectedCategories[0]),
      };
    }
    return { eyebrow: "The Edit · Shop All", title: "Shop All" };
  }, [
    searchTerm,
    modeSlug,
    modeParam,
    collectionSlug,
    collectionParam,
    selectedCategories,
    categoriesWithCounts,
  ]);

  const { eyebrow, title } = heading ?? derived;
  // Admin description wins once loaded (empty = hidden); else the page's default.
  const description = editDesc !== null ? editDesc : heading?.description;

  const panelProps: FilterPanelProps = {
    categories: categoriesWithCounts,
    materials: materialFacets,
    selectedCategories,
    selectedMaterials,
    onToggleCategory: toggleCategory,
    onToggleMaterial: toggleMaterial,
  };

  const countLabel = `${filtered.length} ${filtered.length === 1 ? "piece" : "pieces"}`;

  return (
    <div className="min-h-screen bg-ivory pt-[68px] lg:pt-[84px]">
      {/* Header band */}
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
        <Breadcrumbs className="pt-8" />
        <header className="pt-6 lg:pt-8 pb-8 lg:pb-10 border-b border-line">
          <p className="eyebrow text-bronze-deep">{eyebrow}</p>
          <h1 className="font-display font-light text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.08] text-ink mt-4">
            {title}
          </h1>
          {description && (
            <p className="font-sans text-[15px] leading-relaxed text-muted mt-5 max-w-2xl">
              {description}
            </p>
          )}
          <p className="font-sans text-sm text-muted mt-4">
            {loading ? "Loading the edit…" : countLabel}
          </p>
        </header>
      </div>

      {/* Body */}
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pb-24">
        <div className="flex gap-10 lg:gap-14">
          {/* Desktop filters */}
          <aside className="hidden lg:block w-60 xl:w-64 shrink-0">
            <div className="sticky top-[104px] pt-10">
              <FilterPanel {...panelProps} />
            </div>
          </aside>

          {/* Mobile drawer */}
          {drawerOpen && (
            <>
              <div
                className="fixed inset-x-0 bottom-0 top-[68px] z-40 bg-ink/30 lg:hidden"
                onClick={() => setDrawerOpen(false)}
                aria-hidden="true"
              />
              <div className="fixed bottom-0 left-0 top-[68px] z-40 w-80 max-w-full bg-cream overflow-y-auto lg:hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <span className="eyebrow text-bronze-deep">Filters</span>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close filters"
                    className="p-2 -mr-2 rounded-full hover:bg-ink/5 text-ink transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="px-6 pb-10">
                  <FilterPanel {...panelProps} />
                </div>
              </div>
            </>
          )}

          {/* Main column */}
          <main className="flex-1 min-w-0 pt-10">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 pb-8 border-b border-line">
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 font-sans uppercase tracking-[0.15em] text-[11px] text-ink border border-line px-4 py-2.5 hover:border-ink transition-colors"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              <p className="hidden lg:block font-sans text-sm text-muted">{countLabel}</p>

              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="hidden sm:inline eyebrow text-faint">
                  Sort
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-transparent border border-line text-ink font-sans uppercase tracking-[0.14em] text-[11px] px-4 py-2.5 pr-8 cursor-pointer outline-none focus:border-ink transition-colors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active search chip */}
            {searchTerm && (
              <p className="font-sans text-sm text-muted mt-6">
                Results for <span className="text-ink">&ldquo;{searchTerm}&rdquo;</span>
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-3 link-underline text-bronze-deep text-xs uppercase tracking-[0.15em]"
                >
                  Clear
                </button>
              </p>
            )}

            {/* Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
              </div>
            ) : filtered.length > 0 ? (
              // 4-up from `xl`: the card runs a compact scale now, and at three
              // columns beside the filter rail each one stretched past 370px,
              // leaving the details block adrift in it.
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mt-10">
                {filtered.map((product, i) => (
                  <Reveal key={product._id} delay={(i % 4) * 0.06}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-32">
                <p className="eyebrow text-bronze-deep">Nothing here yet</p>
                <h3 className="font-display font-light text-3xl text-ink mt-4">
                  No pieces match this edit
                </h3>
                <p className="font-sans text-sm text-muted mt-3 max-w-sm">
                  Try loosening the filters, or clear them to browse the full collection.
                </p>
                <div className="mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedMaterials([]);
                      setSearchTerm("");
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Wrapper (Suspense for useSearchParams) ─────────────────────────────────

export default function ProductBrowser(props: ProductBrowserProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory pt-[84px] flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
        </div>
      }
    >
      <BrowserContent {...props} />
    </Suspense>
  );
}
