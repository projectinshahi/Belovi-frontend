"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Breadcrumbs from "../../../components/common/Breadcrumbs";
import axios from "axios";
import { useParams, usePathname, useRouter } from "next/navigation";
import { isSignedIn, signInHref } from "../../../lib/auth";
import { Check, Shield, Truck, MessageCircle, Loader2 } from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { formatINR } from "../../../lib/product";
import { Button } from "../../../components/ui/Button";
import Reveal from "../../../components/ui/Reveal";
import Gallery from "./_components/Gallery";
import Accordion from "./_components/Accordion";
import { useSettings } from "../../../context/SettingsContext";

const DEFAULT_SHIPPING =
  "In-stock furniture pieces are dispatched within 2-4 working days. Delivery takes 7-14 working days. White-glove delivery available.";

/** Per-order ceiling. Furniture is not bought by the dozen; the old control had
 *  no upper bound at all, so a stray key-repeat could send qty 400 to checkout. */
const MAX_QTY = 10;

/** How many pieces the "Complete the Look" rail shows. */
const RELATED_LIMIT = 4;

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  ""
);

interface Variant {
  size: string;
  color?: string;
  material?: string;
  price: number;
  oldPrice?: number;
  /** Shots specific to this variant — they lead the gallery when it is chosen. */
  images?: string[];
}

interface Spec {
  label: string;
  value: string;
}

/** Shape of a card in the related rail, from either source. */
interface RelatedCard {
  _id?: string;
  id?: string;
  name?: string;
  images?: string[];
  variants?: Variant[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  collectionName: string;
  dimensions: string;
  warranty: string;
  features: string[];
  careInstructions: string;
  shippingReturns: string;
  materials: string[];
  specs: Spec[];
  /** Product-level shots, shown for every variant. */
  images: string[];
  variants: Variant[];
  /** Curated in the admin. Empty is normal — the rail falls back to category. */
  relatedProducts: RelatedCard[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  // This piece's own URL, so an interrupted purchase can resume here.
  const pathname = usePathname();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  /** Same-category pieces, used only when nothing is curated. */
  const [categoryPeers, setCategoryPeers] = useState<RelatedCard[]>([]);

  const { addToCart } = useCart();
  const { whatsappNumber } = useSettings();

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/v1/products/${id}`);
        const json = res.data;
        if (cancelled || !json.success || !json.data) return;

        const p = json.data;
        setProduct({
          id: p._id,
          name: p.name || "",
          category: p.category || "",
          collectionName: p.collectionName || "",
          dimensions: p.dimensions || "",
          warranty: p.warranty || "",
          features: p.features || [],
          careInstructions: p.careInstructions || "",
          shippingReturns: p.shippingReturns || "",
          materials: p.materials || [],
          specs: Array.isArray(p.specifications) ? p.specifications : [],
          // Variant shots are no longer flattened in here — they are attached to
          // their own variant so choosing one actually changes the gallery.
          images: (p.images || []).filter(Boolean),
          variants: (p.variants || []).map((v: any) => ({
            size: v.size || "",
            color: v.color || "",
            material: v.material || "",
            price: v.price || 0,
            oldPrice: v.oldPrice,
            images: (v.images || []).filter(Boolean),
          })),
          relatedProducts: p.relatedProducts || [],
        });
        setSelectedVariant(0);
        setQuantity(1);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  /**
   * Fallback for the related rail.
   *
   * The rail used to render only what the studio had hand-linked, so a piece
   * with nothing curated showed no rail at all — a dead end at the bottom of
   * the page. This fills it from the same category, then the same collection,
   * excluding the piece itself. Curated links always win when they exist.
   */
  useEffect(() => {
    if (!product || product.relatedProducts.length > 0) return;
    let cancelled = false;

    axios
      .get(`${API_BASE}/api/v1/products`)
      .then((res) => {
        if (cancelled) return;
        const all: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
        const peers = all.filter(
          (p) =>
            p._id !== product.id &&
            (p.category
              ? p.category === product.category
              : product.collectionName && p.collectionName === product.collectionName)
        );
        setCategoryPeers(peers.slice(0, RELATED_LIMIT));
      })
      .catch(() => {
        // A failed lookup just leaves the rail hidden — never blocks the page.
      });

    return () => {
      cancelled = true;
    };
  }, [product]);

  const currentVariant = product?.variants[selectedVariant] ?? product?.variants[0];
  const hasVariants = (product?.variants.length ?? 0) > 0;

  /**
   * Product shots first, then the chosen variant's own. Recomputed per variant,
   * and the Gallery is keyed on the selection so it resets to the first frame
   * instead of holding an index that no longer exists.
   */
  const galleryImages = useMemo(() => {
    if (!product) return [];
    return [...product.images, ...(currentVariant?.images ?? [])];
  }, [product, currentVariant]);

  const related = product
    ? (product.relatedProducts.length > 0 ? product.relatedProducts : categoryPeers)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] pt-[68px] lg:pt-[84px] flex items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border border-line border-t-[#1a1a1a]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf9f6] pt-[68px] lg:pt-[84px] flex flex-col items-center justify-center text-center px-6">
        <p className="eyebrow text-bronze-deep mb-4">Not found</p>
        <h1 className="font-display font-light text-[clamp(2rem,4.5vw,3rem)] leading-[1.08] text-[#1a1a1a] mb-4">
          This piece has moved on
        </h1>
        <Button variant="outline" size="md" onClick={() => router.push("/products")}>
          Browse the collection
        </Button>
      </div>
    );
  }

  const price = currentVariant?.price ?? 0;
  const oldPrice =
    currentVariant?.oldPrice && currentVariant.oldPrice > price ? currentVariant.oldPrice : undefined;

  const busy = isAdding || isBuying;

  /**
   * Returns true only once the line is really in the cart, so "Buy Now" can
   * navigate on the result instead of on a timer.
   */
  const commitToCart = async (): Promise<boolean> => {
    setCartError(null);

    // Not signed in: go and sign in, then come back to THIS piece rather than
    // the homepage — the customer was mid-purchase, and dropping them on the
    // homepage means finding the product again from scratch.
    if (!isSignedIn()) {
      router.push(signInHref(pathname));
      return false;
    }
    // A piece with variants must have one chosen, and it must be priced —
    // adding a ₹0 line to the cart is how free orders reach checkout.
    if (hasVariants && !currentVariant) {
      setCartError("Choose an option before adding to your bag.");
      return false;
    }
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
    } catch (err) {
      console.error("Add to cart failed:", err);
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
        setTimeout(() => setAdded(false), 2500);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (busy) return;
    setIsBuying(true);
    try {
      // Stays busy through the navigation — resetting here would flash the
      // idle label for a frame before the route changes.
      if (await commitToCart()) {
        router.push("/checkout");
        return;
      }
    } finally {
      setIsBuying(false);
    }
  };

  const decreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQuantity = () => setQuantity((q) => Math.min(MAX_QTY, q + 1));

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#faf9f6] pt-[68px] text-[#1a1a1a] lg:pt-[84px]">
      <div className="mx-auto max-w-[1500px] px-6 sm:px-10 lg:px-16">
        <Breadcrumbs
          currentLabel={product.name}
          className="py-8 [&_a:hover]:text-[#1a1a1a] !text-[#1a1a1a]/60"
        />

        <section className="grid grid-cols-1 gap-12 pb-24 lg:grid-cols-[60fr_40fr] lg:gap-20 xl:gap-28 lg:pb-32">
          <Reveal>
            {/* Keyed on the variant so the active frame resets with the set. */}
            <Gallery key={selectedVariant} images={galleryImages} name={product.name} />
          </Reveal>

          <Reveal delay={0.12} className="flex flex-col">
            {product.collectionName && (
              <span className="eyebrow bg-[#d8c3a5] px-3 py-2 w-max text-[#1a1a1a] mb-6">
                {product.collectionName}
              </span>
            )}

            <h1 className="font-display text-[clamp(2.5rem,4vw,3.5rem)] font-light leading-[1.1] text-[#1a1a1a]">
              {product.name}
            </h1>

            <div className="mt-6 flex items-baseline gap-4">
              <span className="font-display text-4xl font-light text-[#1a1a1a]">
                {formatINR(price)}
              </span>
              {oldPrice && (
                <span className="font-display text-2xl text-[#1a1a1a]/40 line-through">
                  {formatINR(oldPrice)}
                </span>
              )}
            </div>

            {product.dimensions && (
              <p className="mt-4 font-sans text-sm tracking-wide text-[#1a1a1a]/60 uppercase">
                Dimensions: {product.dimensions}
              </p>
            )}

            {hasVariants && (
              <div className="mt-10">
                <span id="variant-label" className="eyebrow text-[#1a1a1a]/60 mb-4 block">
                  Select Variant
                </span>
                <div className="flex flex-col gap-3" role="radiogroup" aria-labelledby="variant-label">
                  {product.variants.map((v, i) => {
                    const isSelected = selectedVariant === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedVariant(i)}
                        className={`flex flex-col items-start p-4 border transition-all duration-300 ${
                          isSelected
                            ? "border-[#1a1a1a] bg-[#1a1a1a]/5"
                            : "border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30"
                        }`}
                      >
                        <span className="font-sans text-sm tracking-wide uppercase font-medium text-[#1a1a1a]">
                          {v.size}
                        </span>
                        {(v.color || v.material) && (
                          <span className="font-sans text-xs text-[#1a1a1a]/60 mt-1">
                            {v.color} {v.color && v.material && "·"} {v.material}
                          </span>
                        )}
                        {v.price > 0 && (
                          <span className="font-sans text-xs text-[#1a1a1a]/70 mt-1.5">
                            {formatINR(v.price)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-10">
              <span id="qty-label" className="eyebrow text-[#1a1a1a]/60 mb-4 block">
                Quantity
              </span>
              <div className="flex items-center w-max border border-[#1a1a1a]/20">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="px-5 py-3 hover:bg-[#1a1a1a]/5 transition-colors text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span
                  aria-live="polite"
                  aria-labelledby="qty-label"
                  className="px-5 py-3 min-w-[50px] text-center font-sans text-[#1a1a1a]"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= MAX_QTY}
                  aria-label="Increase quantity"
                  className="px-5 py-3 hover:bg-[#1a1a1a]/5 transition-colors text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              {quantity >= MAX_QTY && (
                <p className="mt-2 font-sans text-xs text-[#1a1a1a]/60">
                  {MAX_QTY} is the maximum per order. Need more? Talk to us.
                </p>
              )}
            </div>

            {cartError && (
              <p role="alert" className="mt-6 border border-[#8B0A15]/30 bg-[#8B0A15]/5 px-4 py-3 font-sans text-sm text-[#8B0A15]">
                {cartError}
              </p>
            )}

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={busy}
                aria-busy={isAdding}
                className="flex-1 py-5 bg-transparent border border-[#1a1a1a] text-[#1a1a1a] font-sans text-xs uppercase tracking-widest hover:bg-[#1a1a1a]/5 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Adding…
                  </>
                ) : added ? (
                  <>
                    <Check size={16} /> Added to Cart
                  </>
                ) : (
                  "Add to Cart"
                )}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={busy}
                aria-busy={isBuying}
                className="flex-1 py-5 bg-[#1a1a1a] border border-[#1a1a1a] text-[#faf9f6] font-sans text-xs uppercase tracking-widest hover:bg-[#1a1a1a]/90 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Taking you to checkout…
                  </>
                ) : (
                  "Buy Now"
                )}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 py-6 border-y border-[#1a1a1a]/10">
              <div className="flex items-center gap-3 text-[#1a1a1a]/70">
                <Truck size={18} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-widest">Free Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-[#1a1a1a]/70">
                <Shield size={18} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-widest">
                  {product.warranty ? product.warranty : "Secure Warranty"}
                </span>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-px bg-[#1a1a1a]/10">
              {product.features.length > 0 && (
                <div className="bg-[#faf9f6]">
                  <Accordion title="Features">
                    <ul className="list-disc pl-5 space-y-2">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="font-sans text-[14px] leading-relaxed text-[#1a1a1a]/70">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Accordion>
                </div>
              )}

              {product.specs.length > 0 && (
                <div className="bg-[#faf9f6]">
                  <Accordion title="Specifications">
                    <dl className="space-y-4">
                      {product.specs.map((spec, i) => (
                        <div key={i} className="flex justify-between border-b border-[#1a1a1a]/5 pb-3 last:border-0">
                          <dt className="font-sans text-[14px] text-[#1a1a1a]/60">{spec.label}</dt>
                          <dd className="font-sans text-[14px] text-[#1a1a1a] font-medium text-right">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </Accordion>
                </div>
              )}

              {product.materials.length > 0 && (
                <div className="bg-[#faf9f6]">
                  <Accordion title="Materials">
                    <p className="font-sans text-[14px] leading-relaxed text-[#1a1a1a]/70">
                      {product.materials.join(" · ")}
                    </p>
                  </Accordion>
                </div>
              )}

              {product.careInstructions && (
                <div className="bg-[#faf9f6]">
                  <Accordion title="Care Instructions">
                    <p className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-[#1a1a1a]/70">
                      {product.careInstructions}
                    </p>
                  </Accordion>
                </div>
              )}

              {product.warranty && (
                <div className="bg-[#faf9f6]">
                  <Accordion title="Warranty">
                    <p className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-[#1a1a1a]/70">
                      {product.warranty}
                    </p>
                  </Accordion>
                </div>
              )}

              <div className="bg-[#faf9f6]">
                <Accordion title="Shipping & Delivery">
                  <p className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-[#1a1a1a]/70">
                    {product.shippingReturns || DEFAULT_SHIPPING}
                  </p>
                </Accordion>
              </div>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                `I have a question about ${product.name}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-2.5 font-sans text-[13px] text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors"
            >
              <MessageCircle size={16} strokeWidth={1.5} />
              <span className="underline underline-offset-4">Need help deciding? Chat with us.</span>
            </a>
          </Reveal>
        </section>

        {/* Related — curated links when the studio has set them, otherwise the
            rest of the category. */}
        {related.length > 0 && (
          <section className="py-24 border-t border-[#1a1a1a]/10">
            <h2 className="font-display text-3xl font-light text-center mb-12 text-[#1a1a1a]">
              {product.relatedProducts.length > 0 ? "Complete the Look" : `More in ${product.category}`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.slice(0, RELATED_LIMIT).map((rp, idx) => (
                <Link href={`/products/${rp.id || rp._id}`} key={rp._id || rp.id || idx} className="group cursor-pointer">
                  <div className="aspect-[4/5] bg-[#1a1a1a]/5 relative overflow-hidden mb-4">
                    {rp.images && rp.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rp.images[0]}
                        alt={rp.name || ""}
                        loading="lazy"
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display text-[#1a1a1a]/20 text-sm uppercase tracking-widest">
                        Belovi
                      </div>
                    )}
                  </div>
                  <h3 className="font-display text-lg mb-1 text-[#1a1a1a]">{rp.name}</h3>
                  <p className="font-sans text-sm text-[#1a1a1a]/60">
                    {rp.variants && rp.variants[0] ? formatINR(rp.variants[0].price) : "View details"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
