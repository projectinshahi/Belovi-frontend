"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import ProductCard from "../../../components/ui/ProductCard";
import Reveal from "../../../components/ui/Reveal";
import { Button } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/States";
import { useCart } from "../../../context/CartContext";
import { isSignedIn, signInHref } from "../../../lib/auth";
import { formatINR, type Product as CardProduct } from "../../../lib/product";
import Gallery from "./_components/Gallery";
import StockPill, { isInStock } from "./_components/StockPill";
import QuantityStepper from "./_components/QuantityStepper";
import VariantSelector from "./_components/VariantSelector";
import CountUpPrice from "./_components/CountUpPrice";
import { flyToCart } from "./_components/flyToCart";

/**
 * Product detail — rebuilt to the Figma frame (node 65:3451).
 *
 * A gallery on the left, the purchase column on the right, and a rail of
 * suggestions beneath. The frame drops everything the previous page carried
 * below the buttons — six accordions, the trust row, the dimensions line, the
 * WhatsApp link — and those are gone here too. The studio still authors those
 * fields; the admin form now says they are not shown.
 *
 * THE PURCHASE LOGIC IS UNCHANGED. Every guard from the previous page survives
 * verbatim: the sign-in redirect returns to THIS piece rather than the homepage,
 * a zero-priced option cannot reach the cart, and `commitToCart` returns a real
 * boolean so Buy Now navigates on the result instead of on a timer. The redesign
 * is a redesign; it is not an excuse to reopen a settled checkout path.
 */

/** Per-order ceiling. Furniture is not bought by the dozen. */
const MAX_QTY = 10;

/** How many pieces the "Suggested for you" rail shows — Figma draws four. */
const RELATED_LIMIT = 4;

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  ""
);

interface Variant {
  size?: string;
  color?: string;
  material?: string;
  price: number;
  oldPrice?: number;
  /** Shots specific to this variant — they follow the product's own. */
  images?: string[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  status: string;
  images: string[];
  /** Short selling points the studio typed, one per line, in its order. */
  features: string[];
  variants: Variant[];
  /** Curated in the admin. These LEAD the suggestion rail; peers fill the rest. */
  relatedProducts: CardProduct[];
}

/** `null` = not found (404). `"error"` = the request itself failed. */
type LoadState = Product | null | "error";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  // This piece's own URL, so an interrupted purchase can resume here.
  const pathname = usePathname();
  const id = params?.id as string;

  const [state, setState] = useState<LoadState | undefined>(undefined);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [peers, setPeers] = useState<CardProduct[]>([]);
  /** Flight origin for the add-to-cart dot. */
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const { addToCart } = useCart();
  const reduce = useReducedMotion();

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/v1/products/${id}`);
      const p = res.data?.data;
      if (!res.data?.success || !p) {
        setState(null);
        return;
      }
      setState({
        id: p._id,
        name: p.name || "",
        category: p.category || "",
        description: p.description || "",
        status: p.status || "",
        images: (p.images || []).filter(Boolean),
        features: ((p.features as string[]) || []).map((f) => (f || "").trim()).filter(Boolean),
        variants: (p.variants || []).map((v: Record<string, unknown>) => ({
          size: (v.size as string) || "",
          color: (v.color as string) || "",
          material: (v.material as string) || "",
          price: (v.price as number) || 0,
          oldPrice: v.oldPrice as number | undefined,
          images: ((v.images as string[]) || []).filter(Boolean),
        })),
        relatedProducts: (p.relatedProducts || []) as CardProduct[],
      });
      setSelectedVariant(0);
      setQuantity(1);
    } catch (err) {
      /* A 404 means the piece is gone; anything else means we couldn't ask.
         Telling a customer a product was withdrawn when the studio is simply
         unreachable loses a sale that was never lost. */
      setState(axios.isAxiosError(err) && err.response?.status === 404 ? null : "error");
    }
  }, [id]);

  useEffect(() => {
    if (id) void load();
  }, [id, load]);

  const product = state && state !== "error" ? state : null;

  /**
   * Same-category pieces for the suggestion rail.
   *
   * Fetched ALWAYS, not only when the studio curated nothing. Curated links used
   * to suppress this request entirely, which meant picking a single related
   * piece in the admin shrank the rail from four to one — manual selection made
   * the page worse. They are merged below instead: curated first, peers filling
   * whatever is left.
   */
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    const { id: selfId, category } = product;

    axios
      .get(`${API_BASE}/api/v1/products`)
      .then((res) => {
        if (cancelled) return;
        const all: CardProduct[] = Array.isArray(res.data?.data) ? res.data.data : [];
        setPeers(all.filter((p) => p._id !== selfId && (!category || p.category === category)));
      })
      .catch(() => {
        // A failed lookup just leaves the rail hidden — never blocks the page.
      });

    return () => {
      cancelled = true;
    };
  }, [product]);

  const currentVariant = product?.variants[selectedVariant] ?? product?.variants[0];

  /**
   * The chosen variant's OWN photography leads, then the product's shared
   * frames; duplicates are dropped so a shot filed in both places is not shown
   * twice.
   *
   * The shared frames used to lead. That made selecting a colourway look
   * broken: the gallery resets to frame one on every change, so a variant with
   * its own photography still opened on the same shared shot, and its images
   * sat somewhere down the thumbnail row. Leading with them is what makes
   * choosing a variant visibly do something.
   */
  const galleryImages = useMemo(() => {
    if (!product) return [];
    return [...new Set([...(currentVariant?.images ?? []), ...product.images])];
  }, [product, currentVariant]);

  // ── States ────────────────────────────────────────────────────────────────

  if (state === undefined) {
    return (
      <main className="surface-light min-h-screen bg-[#F5F5F5] pt-[92px] lg:pt-[106px]">
        <div className="section-x w-full max-w-[1280px] mx-auto py-10">
          <Skeleton className="h-4 w-56" />
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[531px_1fr] lg:gap-6">
            <div>
              <Skeleton className="aspect-[531/515] w-full rounded-[28px] lg:rounded-[58px]" />
              <div className="mt-6 flex gap-3 sm:gap-6">
                {[0, 1, 2].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-[84px] w-[84px] rounded-[16px] sm:h-[120px] sm:w-[120px] lg:h-[159px] lg:w-[159px] lg:rounded-[24px]"
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-end gap-6 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-5 w-full max-w-[520px]" />
              <Skeleton className="h-[64px] w-full max-w-[600px] rounded-[37px]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    const gone = state === null;
    return (
      <main className="surface-light flex min-h-screen flex-col items-center justify-center bg-[#F5F5F5] px-6 pt-[92px] text-center lg:pt-[106px]">
        <h1 className="display-section font-medium text-ink">
          {gone ? "This piece has moved on" : "We couldn’t load this piece"}
        </h1>
        <p className="mt-4 max-w-[46ch] text-body text-muted">
          {gone
            ? "It is no longer part of the collection. There is plenty else to see."
            : "The studio didn’t answer just now. It is usually a moment’s outage."}
        </p>
        <div className="mt-9">
          {gone ? (
            <Button variant="solid" size="md" onClick={() => router.push("/products")}>
              Browse the collection
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              arrow={false}
              onClick={() => {
                setState(undefined);
                void load();
              }}
            >
              Try again
            </Button>
          )}
        </div>
      </main>
    );
  }

  // ── Purchase ──────────────────────────────────────────────────────────────

  const price = currentVariant?.price ?? 0;
  const oldPrice =
    currentVariant?.oldPrice && currentVariant.oldPrice > price
      ? currentVariant.oldPrice
      : undefined;
  const discountPct = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  const inStock = isInStock(product.status);
  const busy = isAdding || isBuying;
  /* Curated first, in the studio's own order, then same-category pieces fill the
     rest of the row. Deduped by id so a piece that is both curated and a peer
     appears once — and keeps its curated position, since the first occurrence
     wins. Either source alone still fills the rail, so a page with no curation
     and a page with four hand-picked links both read as designed. */
  const related = [...product.relatedProducts, ...peers]
    .filter((p, i, all) => all.findIndex((o) => o._id === p._id) === i)
    .slice(0, RELATED_LIMIT);

  /** True only once the line is really in the cart, so Buy Now can act on it. */
  const commitToCart = async (): Promise<boolean> => {
    setCartError(null);

    // Mid-purchase: sign in, then come back to THIS piece rather than the
    // homepage, which would mean finding the product again from scratch.
    if (!isSignedIn()) {
      router.push(signInHref(pathname));
      return false;
    }
    if (product.variants.length > 0 && !currentVariant) {
      setCartError("Choose an option before adding to your bag.");
      return false;
    }
    // A ₹0 line is how a free order reaches checkout.
    if (price <= 0) {
      setCartError("This option is not available to order. Please choose another.");
      return false;
    }

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        image: galleryImages[0] ?? "",
        price,
        currency: "₹",
        size: currentVariant?.size,
        color: currentVariant?.color,
        quantity,
      });
      return true;
    } catch {
      setCartError("We could not add that to your bag. Please try again.");
      return false;
    }
  };

  const handleAddToCart = async () => {
    if (busy) return;
    setIsAdding(true);
    try {
      if (await commitToCart()) {
        setAdded(true);
        flyToCart(addBtnRef.current, !!reduce);
        setTimeout(() => setAdded(false), 1500);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (busy) return;
    setIsBuying(true);
    try {
      // Stays busy through the navigation — resetting here would flash the idle
      // label for a frame before the route changes.
      if (await commitToCart()) {
        router.push("/checkout");
        return;
      }
    } finally {
      setIsBuying(false);
    }
  };

  /* 14px/36px padding on a full pill, per the reference — a fixed height would
     stop the label and the spinner sharing one box cleanly. `active:scale-97`
     is the press; the lift is on hover only. */
  const ctaBase =
    "inline-flex items-center justify-center gap-2 rounded-full px-8 py-[14px] font-sans " +
    "text-[15px] font-medium transition-[background-color,transform,box-shadow] duration-300 " +
    "ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] " +
    "disabled:pointer-events-none disabled:opacity-50 sm:px-9 sm:text-[16px]";

  return (
    <main className="surface-light min-h-screen bg-[#F5F5F5] pt-[92px] lg:pt-[106px]">
      <div className="pt-[40px] pb-16 lg:pb-24 px-6 lg:px-[6vw] w-full max-w-[1280px] mx-auto">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-[32px] font-sans text-[14px] font-normal">
          <Link href="/" className="text-[#BDBDBD] hover:text-[#1A1A1A] transition-colors">Home</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[12px] w-[12px] text-[#BDBDBD] shrink-0"><path d="m9 5 7 7-7 7" /></svg>
          <Link href="/products" className="text-[#BDBDBD] hover:text-[#1A1A1A] transition-colors">Collection</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[12px] w-[12px] text-[#BDBDBD] shrink-0"><path d="m9 5 7 7-7 7" /></svg>
          <span aria-current="page" className="text-[#D32F2F]">Product Detail</span>
        </nav>

        <section className="mt-6 grid grid-cols-1 gap-10 sm:mt-8 lg:grid-cols-[45fr_55fr] lg:gap-[clamp(40px,5vw,80px)]">
          <Reveal>
            {/* Keyed on the variant so the active frame resets with the set
                rather than holding an index the new set may not have. */}
            <Gallery key={selectedVariant} images={galleryImages} name={product.name} />
          </Reveal>

          {/* Figma bottom-aligns the copy against the image. Below `lg` the two
              stack, where alignment is meaningless. */}
          {/* Each row arrives on its own beat, top to bottom, so the column
              reads in the order it should be understood: what it is, what it
              costs, what it saves, what it is like, then how to buy it. */}
          <div className="flex flex-col justify-end gap-[20px] lg:gap-[24px] lg:pb-2">
            {product.category && (
              <Reveal y={24} delay={0.08}>
                <p className="font-sans text-[14px] tracking-[0.05em] text-[#9E9E9E] uppercase mb-[8px] sm:text-[15px]">
                  {product.category}
                </p>
              </Reveal>
            )}

            <Reveal y={24} delay={0.16} className="flex flex-wrap items-center gap-[12px]">
              <h1 className="font-sans text-[clamp(22px,2.5vw,30px)] font-[500] sm:font-[600] leading-[1.3] text-[#1A1A1A]">
                {product.name}
              </h1>
              {product.status && <StockPill status={product.status} />}
            </Reveal>

            <Reveal y={24} delay={0.24} className="flex flex-wrap items-baseline gap-[16px]">
              {price > 0 ? (
                <CountUpPrice
                  value={price}
                  className="font-sans text-[28px] sm:text-[32px] font-bold text-[#1A1A1A]"
                />
              ) : (
                <span className="font-sans text-[28px] sm:text-[32px] font-bold text-[#1A1A1A]">
                  Enquire
                </span>
              )}
              {oldPrice && (
                <span className="font-sans text-[20px] text-[#BDBDBD] line-through sm:text-[22px]">
                  {formatINR(oldPrice)}
                </span>
              )}
            </Reveal>

            {discountPct > 0 && (
              <Reveal y={24} delay={0.32}>
                <span className="inline-flex w-max items-center justify-center rounded-[8px] bg-[#D32F2F] px-[16px] py-[8px] font-sans text-[13px] font-medium uppercase text-white sm:text-[14px] mt-[4px]">
                  {discountPct}% OFF
                </span>
              </Reveal>
            )}

            {product.description && (
              <Reveal y={24} delay={0.4}>
                {/* `break-words` because the 200-character cap bounds the
                    LENGTH, not the shape: 200 characters with no spaces is a
                    single word that would otherwise run straight through the
                    480px column and widen the whole purchase panel. */}
                <p className="max-w-[480px] whitespace-pre-line break-words font-sans text-[15px] leading-[1.7] text-[#9E9E9E] sm:text-[16px] mt-[8px]">
                  {product.description}
                </p>
              </Reveal>
            )}

            {/* The studio's selling points, in the order it typed them. Set as a
                real list so a screen reader announces the count, and marked
                with the brand dot rather than a bullet glyph to sit with the
                rest of the column. */}
            {product.features.length > 0 && (
              <Reveal y={24} delay={0.42}>
                <ul className="flex max-w-[480px] flex-col gap-[10px]">
                  {product.features.map((feature, i) => (
                    <li
                      key={`${feature}-${i}`}
                      className="flex items-start gap-[10px] break-words font-sans text-[15px] leading-[1.6] text-[#4A4A4A] sm:text-[16px]"
                    >
                      <span
                        aria-hidden
                        className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#D32F2F]"
                      />
                      {/* Its own box, and `min-w-0`: a flex item defaults to
                          `min-width: auto`, which refuses to shrink below its
                          longest word — so an unbroken feature would push the
                          column wide no matter what `break-words` says. */}
                      <span className="min-w-0 break-words">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <Reveal y={24} delay={0.44}>
              <VariantSelector
                variants={product.variants}
                selected={selectedVariant}
                onSelect={(i) => {
                  setSelectedVariant(i);
                  setCartError(null);
                }}
              />
            </Reveal>

            {cartError && (
              <p
                role="alert"
                className="rounded-[12px] border border-brand/30 bg-brand/5 px-4 py-3 font-sans text-[14px] text-brand"
              >
                {cartError}
              </p>
            )}

            {!inStock && (
              <p className="font-sans text-[14px] text-muted">
                This piece is not available to order right now.
              </p>
            )}

            <Reveal
              y={24}
              delay={0.52}
              className="flex flex-col gap-[12px] sm:flex-row sm:flex-wrap sm:items-center sm:gap-[16px] mt-[16px]"
            >
              <QuantityStepper
                value={quantity}
                max={MAX_QTY}
                onChange={setQuantity}
                disabled={!inStock || busy}
              />

              <button
                type="button"
                ref={addBtnRef}
                onClick={handleAddToCart}
                disabled={busy || !inStock}
                aria-busy={isAdding}
                className={`${ctaBase} bg-[#D32F2F] text-[#FFFFFF] hover:-translate-y-[1px] hover:bg-[#E53935] hover:shadow-[0_4px_16px_rgba(211,40,40,0.25)]`}
              >
                {isAdding ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden /> Adding…
                  </>
                ) : added ? (
                  <>
                    <Check size={18} aria-hidden /> Added ✓
                  </>
                ) : (
                  "Add to Cart"
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={busy || !inStock}
                aria-busy={isBuying}
                className={`${ctaBase} bg-[#1A1A1A] text-[#FFFFFF] hover:-translate-y-[1px] hover:bg-[#333333]`}
              >
                {isBuying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden /> Taking you to
                    checkout…
                  </>
                ) : (
                  "Buy Now"
                )}
              </button>
            </Reveal>
          </div>
        </section>

        {/* ── Suggested ─────────────────────────────────────────────────────
            The same ProductCard the collection grid uses, so a shopper meets
            one card design across the whole catalogue. */}
        {related.length > 0 && (
          <section className="mt-[80px]">
            <h2 className="font-sans text-[clamp(24px,3vw,32px)] font-medium text-[#1A1A1A] mb-[32px]">
              Suggested for you
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {related.map((rp, i) => (
                <Reveal key={rp._id} delay={(i % 4) * 0.07}>
                  <ProductCard product={rp} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
