"use client";

import Link from "next/link";
import Breadcrumbs from "../../components/common/Breadcrumbs";

import { useCart } from "../../context/CartContext";
import { ButtonLink } from "../../components/ui/Button";
import Reveal from "../../components/ui/Reveal";
import { cldOptimize } from "../../lib/image";

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem } = useCart();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal;

  return (
    <div className="min-h-screen bg-ivory pt-[84px]">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 lg:pt-24 pb-24">

        {/* ── Header ── */}
        <Breadcrumbs className="mb-6" />
        <Reveal>
          <h1 className="font-display font-light text-[clamp(2.5rem,5vw,4rem)] leading-[1.08] text-ink">
            Your Cart
          </h1>
        </Reveal>

        {cartItems.length === 0 ? (
          /* ── Empty State ── */
          <Reveal delay={0.1}>
            <div className="mt-14 border border-line bg-cream py-24 px-6 flex flex-col items-center text-center">
              <p className="eyebrow text-bronze-deep mb-4">Nothing here yet</p>
              <h2 className="font-display font-light text-3xl text-ink mb-4">
                Your cart is empty
              </h2>
              <p className="text-muted max-w-md mb-8 font-sans leading-relaxed">
                Explore the Onam Collection and add the pieces you love. They will be
                waiting here when you are ready.
              </p>
              <ButtonLink href="/products" variant="outline" size="md">
                Browse the Collection
              </ButtonLink>
            </div>
          </Reveal>
        ) : (
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* ── Line Items (Left Column) ── */}
            <div className="lg:col-span-8">
              <p className="eyebrow text-bronze-deep mb-6">
                {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
              </p>
              <div className="border-t border-line">
                {cartItems.map((item, i) => (
                  <Reveal key={item.id} delay={i * 0.05}>
                    <div className="group flex gap-5 sm:gap-8 py-8 border-b border-line">
                      {/* Thumbnail */}
                      <div className="relative w-24 sm:w-28 aspect-[4/5] bg-sand overflow-hidden flex-shrink-0">
                        <img
                          src={cldOptimize(item.image, 280)}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-display font-light text-xl sm:text-2xl text-ink leading-tight">
                              {item.name}
                            </h3>
                            {item.size && (
                              <p className="font-sans text-xs text-muted mt-2 uppercase tracking-[0.14em]">
                                Size · <span className="text-ink">{item.size}</span>
                              </p>
                            )}
                          </div>
                          <p className="font-sans text-base sm:text-lg text-ink flex-shrink-0">
                            {item.currency}{item.price}
                          </p>
                        </div>

                        <div className="flex items-end justify-between gap-4 mt-auto pt-6">
                          {/* Quantity stepper */}
                          <div className="inline-flex items-center border border-line">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                              aria-label="Decrease quantity"
                              disabled={item.quantity <= 1}
                              className="w-9 h-9 flex items-center justify-center text-lg leading-none text-muted hover:text-ink hover:bg-beige/50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              −
                            </button>
                            <span className="w-10 text-center font-sans text-sm text-ink select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                              aria-label="Increase quantity"
                              className="w-9 h-9 flex items-center justify-center text-lg leading-none text-muted hover:text-ink hover:bg-beige/50 transition-colors"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => removeItem(item.id, item.size)}
                            aria-label="Remove item"
                            className="font-sans text-[11px] uppercase tracking-[0.14em] text-muted hover:text-ink link-underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/products"
                  className="font-sans text-[11px] uppercase tracking-[0.14em] text-muted hover:text-ink link-underline"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* ── Order Summary (Right Column) ── */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <Reveal delay={0.1}>
                <div className="bg-cream border border-line p-8">
                  <p className="eyebrow text-bronze-deep mb-6">Order Summary</p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center font-sans text-sm">
                      <span className="text-muted">Subtotal</span>
                      <span className="text-ink">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between items-center font-sans text-sm">
                      <span className="text-muted">Shipping</span>
                      <span className="text-forest uppercase text-[11px] tracking-[0.14em]">
                        Complimentary
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-line my-6" />

                  <div className="flex justify-between items-baseline mb-8">
                    <span className="font-sans text-sm uppercase tracking-[0.14em] text-ink">Total</span>
                    <span className="font-display font-light text-3xl text-ink">₹{total}</span>
                  </div>

                  <ButtonLink
                    href="/checkout"
                    variant="solid"
                    size="md"
                    className="w-full"
                  >
                    Proceed to Checkout
                  </ButtonLink>

                  <p className="text-center font-sans text-[11px] text-faint mt-5 leading-relaxed">
                    Secure checkout. Considered production, shipped from Kochi.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
