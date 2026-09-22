"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import Reveal from "../../components/ui/Reveal";
import { cldOptimize } from "../../lib/image";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { showToast } = useToast();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddressForm, setNewAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Checkout flow step: "shipping" (address) → "payment" (choose how to pay).
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const userStr = localStorage.getItem("belovi_user");
        if (!userStr) return;
        const { token } = JSON.parse(userStr);
        if (!token) return;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "") : 'http://localhost:5000';
        const API_URL = `${baseUrl}/api`;
        const res = await axios.get(`${API_URL}/v1/users/addresses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.data.success && res.data.data) {
          const mappedAddresses = res.data.data.map((addr: any) => ({
            id: addr._id,
            name: addr.city?.toLowerCase() || 'Address',
            line1: `${addr.street ? addr.street + ", " : ""}${addr.state?.toLowerCase() || ''}`,
            line2: addr.zipCode,
          }));
          setAddresses(mappedAddresses);
          if (mappedAddresses.length > 0) {
            setSelectedAddressId(mappedAddresses[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      }
    };
    fetchAddresses();
  }, []);

  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    if (!newAddressForm.city.trim()) errors.city = "City is required.";
    if (!newAddressForm.state.trim()) errors.state = "State is required.";
    if (!newAddressForm.zip.trim()) errors.zip = "PIN code is required.";
    else if (!/^\d{5,6}$/.test(newAddressForm.zip.trim())) errors.zip = "Enter a valid 5-6 digit PIN code.";
    if (newAddressForm.street.trim() && newAddressForm.street.trim().length < 3) errors.street = "Street must be at least 3 characters.";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateAddressForm()) return;
    setIsSavingAddress(true);

    try {
      const userStr = localStorage.getItem("belovi_user");
      if (!userStr) {
        showToast("Please login to save your address.", "warning");
        setIsSavingAddress(false);
        return;
      }

      const { token } = JSON.parse(userStr);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "") : 'http://localhost:5000';
      const API_URL = `${baseUrl}/api`;

      const payload = {
        street: newAddressForm.street,
        city: newAddressForm.city,
        state: newAddressForm.state,
        zipCode: newAddressForm.zip,
        country: newAddressForm.country
      };

      const res = await axios.post(`${API_URL}/v1/users/addresses`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.data.success) {
        const newAddrs = res.data.data;
        const mappedAddresses = newAddrs.map((addr: any) => ({
          id: addr._id,
          name: addr.city?.toLowerCase() || 'Address',
          line1: `${addr.street ? addr.street + ", " : ""}${addr.state?.toLowerCase() || ''}`,
          line2: addr.zipCode,
        }));
        setAddresses(mappedAddresses);
        if (mappedAddresses.length > 0) {
          setSelectedAddressId(mappedAddresses[mappedAddresses.length - 1].id);
        }
        setIsAddressModalOpen(false);
        setNewAddressForm({ street: "", city: "", state: "", zip: "", country: "India" });
        setAddressErrors({});
      } else {
        showToast(res.data.message || "Failed to save address", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || "Error saving address", "error");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  /* The rates published on /shipping-policy, applied. `shipping = 0` was
     hardcoded here, so every order shipped free and the checkout contradicted
     the policy page's own promise that "all charges are shown at checkout
     before payment". Both numbers live in one place so the two cannot drift. */
  const FREE_SHIPPING_THRESHOLD = 2499;
  const FLAT_SHIPPING_FEE = 99;
  const COD_HANDLING_FEE = 79;

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const codFee = paymentMethod === "cod" ? COD_HANDLING_FEE : 0;
  const total = Math.max(0, subtotal + shipping + codFee);

  // Cash on Delivery requires a 10% advance paid online; the balance is collected on delivery.
  const ADVANCE_RATE = 0.1;
  const advanceAmount = Math.round(total * ADVANCE_RATE * 100) / 100;
  const balanceAmount = Math.round((total - advanceAmount) * 100) / 100;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Validates the shipping step, then reveals the payment-method selection.
  const goToPayment = () => {
    if (!selectedAddressId) {
      showToast("Please select a shipping address.", "warning");
      return;
    }
    if (cartItems.length === 0) {
      showToast("Your cart is empty.", "warning");
      return;
    }
    setStep("payment");
  };

  // When moving to the payment step, bring the payment section into view so
  // mobile users don't land mid-page and have to hunt for the payment cards.
  useEffect(() => {
    if (step === "payment") {
      paymentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  // Shared helpers for building the order payload sent to the backend.
  const getAuthToken = (): string | null => {
    const userStr = localStorage.getItem("belovi_user");
    if (!userStr) {
      showToast("Please login to proceed.", "warning");
      return null;
    }
    return JSON.parse(userStr).token;
  };

  const buildOrderPayload = () => {
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    const orderItems = cartItems.map(item => ({
      product: item.id,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
    }));
    const orderShippingAddress = {
      street: selectedAddress?.line1.split(", ")[0] || '',
      city: selectedAddress?.name || '',
      state: selectedAddress?.line1.split(", ")[1] || '',
      zipCode: selectedAddress?.line2 || '',
      country: "India",
    };
    return { orderItems, orderShippingAddress };
  };

  // Routes "Place Order" to the chosen payment method.
  // Online payment charges the full total; COD charges only the 10% advance online
  // and records the balance to be collected on delivery.
  const handlePlaceOrder = () => {
    if (paymentMethod === "cod") {
      processRazorpayPayment({ amountToCharge: advanceAmount, method: "cod" });
    } else {
      processRazorpayPayment({ amountToCharge: total, method: "razorpay" });
    }
  };

  // Shared Razorpay flow. `amountToCharge` is what gets collected online now
  // (full total for online orders, the 10% advance for COD). The order is saved
  // in the DB only after this payment is verified.
  const processRazorpayPayment = async ({
    amountToCharge,
    method,
  }: {
    amountToCharge: number;
    method: "razorpay" | "cod";
  }) => {
    if (!selectedAddressId) {
      showToast("Please select a shipping address.", "warning");
      return;
    }
    if (cartItems.length === 0) {
      showToast("Your cart is empty.", "warning");
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    const isCod = method === "cod";

    setIsPlacingOrder(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "") : 'http://localhost:5000';
      const API_URL = `${baseUrl}/api`;

      const { orderItems, orderShippingAddress } = buildOrderPayload();

      // Full order details sent to /verify so the backend saves it once payment clears.
      const buildVerifyBody = (rzp: { order_id: string; payment_id: string; signature: string }) => ({
        razorpay_order_id: rzp.order_id,
        razorpay_payment_id: rzp.payment_id,
        razorpay_signature: rzp.signature,
        items: orderItems,
        shippingAddress: orderShippingAddress,
        subtotal,
        discount: 0,
        shippingFee: shipping,
        total,
        paymentMethod: method,
        // For COD, record how much was paid now and how much is due on delivery.
        advanceAmount: isCod ? advanceAmount : 0,
        balanceAmount: isCod ? balanceAmount : 0,
      });

      // Create a Razorpay order for the amount collected now (no DB save yet).
      const createOrderRes = await axios.post(`${API_URL}/v1/payments/create-order`, {
        total: amountToCharge
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!createOrderRes.data.success) {
        showToast("Failed to create order.", "error");
        return;
      }

      const { razorpayOrder, isMock, key_id } = createOrderRes.data.data;

      if (isMock) {
        setIsVerifyingPayment(true);
        const verifyRes = await axios.post(
          `${API_URL}/v1/payments/verify`,
          buildVerifyBody({ order_id: razorpayOrder.id, payment_id: "mock_payment", signature: "mock_signature" }),
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (verifyRes.data.success) {
          clearCart();
          window.location.href = "/order-success";
        } else {
          setIsVerifyingPayment(false);
          window.location.href = "/order-failure";
        }
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        showToast("Razorpay SDK failed to load. Are you online?", "error");
        return;
      }

      const options = {
        key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourTestKey", // Use backend key first to guarantee match
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Neokart",
        description: isCod ? "Advance Payment (10%)" : "Order Payment",
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          setIsVerifyingPayment(true);
          try {
            const verifyRes = await axios.post(
              `${API_URL}/v1/payments/verify`,
              buildVerifyBody({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
              { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              clearCart();
              window.location.href = "/order-success";
            } else {
              setIsVerifyingPayment(false);
              window.location.href = "/order-failure";
            }
          } catch (err) {
            console.error(err);
            setIsVerifyingPayment(false);
            window.location.href = "/order-failure";
          }
        },
        prefill: {
          name: "Customer",
          email: "neokart007@gmail.com",
          contact: "9999999999"
        },
        theme: {
          color: "#1A1A1A"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        window.location.href = "/order-failure";
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      setIsVerifyingPayment(false);
      showToast(err.response?.data?.message || "An error occurred during checkout.", "error");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // ── Full-screen verifying overlay ──
  if (isVerifyingPayment) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 border border-line border-t-bronze rounded-full animate-spin mb-8"></div>
        <p className="eyebrow text-bronze-deep mb-3">One moment</p>
        <h2 className="font-display font-light text-3xl text-ink mb-3">Verifying Payment</h2>
        <p className="font-sans text-muted max-w-sm leading-relaxed">
          Please wait while we confirm your order. Do not close this window.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pt-[84px]">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 lg:pt-24 pb-24">

        {/* Header */}
        <Breadcrumbs className="mb-6" />
        <Reveal>
          <h1 className="font-display font-light text-[clamp(2.5rem,5vw,4rem)] leading-[1.08] text-ink">
            Checkout
          </h1>

          {/* Editorial stepper */}
          <div className="flex items-center gap-5 mt-8">
            <span
              className={`eyebrow transition-colors ${step === "shipping" ? "text-ink" : "text-faint"}`}
            >
              01 · Shipping
            </span>
            <span className="h-px w-8 bg-line" />
            <span
              className={`eyebrow transition-colors ${step === "payment" ? "text-ink" : "text-faint"}`}
            >
              02 · Payment
            </span>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* ── Left Column (Steps) ── */}
          <div className="lg:col-span-8 flex flex-col gap-12">

            {step === "shipping" && (
              <Reveal className="flex flex-col gap-8">
                {/* Step 1: SHIPPING */}
                <div>
                  <p className="eyebrow text-bronze-deep mb-3">Step One</p>
                  <h2 className="font-display font-light text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.08] text-ink">
                    Shipping Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`relative text-left border p-6 transition-colors ${
                          isSelected
                            // Selected reads as an inverted card — the light type,
                        // ring and dot inside it were written for a dark fill
                        // (`cream` used to be #111). `ink` is that fill.
                        ? "border-ink bg-ink"
                            : "border-line-strong bg-white hover:border-ink"
                        }`}
                      >
                        {/* Selection indicator */}
                        <span
                          className={`absolute top-5 right-5 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? "border-ivory" : "border-line-strong"
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-ivory" />}
                        </span>

                        <p className={`font-display text-lg capitalize mb-2 pr-6 ${isSelected ? "text-ivory" : "text-ink"}`}>
                          {addr.name}
                        </p>
                        <p className={`font-sans text-sm leading-relaxed capitalize ${isSelected ? "text-ivory/75" : "text-muted"}`}>
                          {addr.line1}<br />
                          {addr.line2}
                        </p>
                      </button>
                    );
                  })}

                  {/* New Address tile */}
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="border border-dashed border-line-strong p-6 min-h-[120px] flex flex-col items-center justify-center gap-2 text-muted hover:border-ink hover:text-ink transition-colors"
                  >
                    <span className="text-2xl font-light leading-none">+</span>
                    <span className="eyebrow">New Address</span>
                  </button>
                </div>
              </Reveal>
            )}

            {step === "payment" && (
              <div ref={paymentSectionRef} className="flex flex-col gap-8 scroll-mt-28">
                {/* Back to shipping */}
                <button
                  onClick={() => setStep("shipping")}
                  className="self-start font-sans text-[11px] uppercase tracking-[0.14em] text-muted hover:text-ink link-underline"
                >
                  ← Back to Shipping
                </button>

                <div>
                  <p className="eyebrow text-bronze-deep mb-3">Step Two</p>
                  <h2 className="font-display font-light text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.08] text-ink">
                    Payment Method
                  </h2>
                </div>

                <div className="flex flex-col gap-4 max-w-xl">
                  {/* Online Payment (Razorpay) */}
                  <button
                    onClick={() => setPaymentMethod("online")}
                    aria-pressed={paymentMethod === "online"}
                    className={`text-left border p-6 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ink ${
                      paymentMethod === "online"
                        // Selected reads as an inverted card — the light type,
                        // ring and dot inside it were written for a dark fill
                        // (`cream` used to be #111). `ink` is that fill.
                        ? "border-ink bg-ink"
                        : "border-line-strong bg-white hover:border-ink"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className={`font-sans font-medium ${paymentMethod === "online" ? "text-ivory" : "text-ink"}`}>Online Payment (Prepaid)</p>
                        <p className={`font-sans text-sm leading-relaxed mt-1 ${paymentMethod === "online" ? "text-ivory/75" : "text-muted"}`}>
                          Pay securely via card, UPI, or netbanking with Razorpay.
                        </p>
                      </div>
                      <span
                        className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          paymentMethod === "online" ? "border-ivory" : "border-line-strong"
                        }`}
                      >
                        {paymentMethod === "online" && <span className="w-2 h-2 rounded-full bg-ivory" />}
                      </span>
                    </div>
                  </button>

                  {/* Cash on Delivery */}
                  <button
                    onClick={() => setPaymentMethod("cod")}
                    aria-pressed={paymentMethod === "cod"}
                    className={`text-left border p-6 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ink ${
                      paymentMethod === "cod"
                        // Selected reads as an inverted card — the light type,
                        // ring and dot inside it were written for a dark fill
                        // (`cream` used to be #111). `ink` is that fill.
                        ? "border-ink bg-ink"
                        : "border-line-strong bg-white hover:border-ink"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className={`font-sans font-medium ${paymentMethod === "cod" ? "text-ivory" : "text-ink"}`}>Cash on Delivery</p>
                        <p className={`font-sans text-sm leading-relaxed mt-1 ${paymentMethod === "cod" ? "text-ivory/75" : "text-muted"}`}>
                          Pay a 10% advance online now; pay the balance in cash on delivery.
                        </p>
                      </div>
                      <span
                        className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          paymentMethod === "cod" ? "border-ivory" : "border-line-strong"
                        }`}
                      >
                        {paymentMethod === "cod" && <span className="w-2 h-2 rounded-full bg-ivory" />}
                      </span>
                    </div>

                    {paymentMethod === "cod" && (
                      // This breakdown only renders while COD is selected, i.e.
                      // always inside the inverted (dark) card — so it takes the
                      // light type, not the page's.
                      <div className="mt-5 pt-5 border-t border-ivory/20 flex flex-col gap-2">
                        <div className="flex justify-between font-sans text-sm">
                          <span className="text-ivory/75">Advance now (10%)</span>
                          <span className="font-medium text-ivory">₹{advanceAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-sans text-sm">
                          <span className="text-ivory/75">Balance on delivery</span>
                          <span className="font-medium text-ivory">₹{balanceAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ── Right Column (Order Bag) ── */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <Reveal delay={0.1}>
              <div className="bg-cream border border-line p-8">
                <p className="eyebrow text-bronze-deep mb-6">Order Bag</p>

                {/* Cart Items List */}
                <div className="flex flex-col gap-5 mb-8 max-h-[360px] overflow-y-auto pr-1 hide-scrollbar">
                  {cartItems.length === 0 ? (
                    <p className="font-sans text-sm text-muted">Your order bag is empty.</p>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-14 aspect-[4/5] bg-sand overflow-hidden flex-shrink-0">
                          <img
                            src={cldOptimize(item.image, 160)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-0 right-0 bg-ink text-ivory text-[10px] w-4 h-4 flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <p className="font-display text-base text-ink leading-snug line-clamp-2">
                            {item.name}
                          </p>
                          {item.size && (
                            <p className="font-sans text-[11px] text-muted mt-1 uppercase tracking-[0.14em]">
                              {item.size}
                            </p>
                          )}
                        </div>
                        <p className="font-sans text-sm text-ink flex-shrink-0">
                          {item.currency}{item.price * item.quantity}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center font-sans text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-ink">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-sans text-sm">
                    <span className="text-muted">Shipping</span>
                    {shipping === 0 ? (
                      /* `forest` (6.7:1) rather than the old #F43A45, which was
                         3.5:1 — under AA for an 11px label. */
                      <span className="text-forest uppercase text-[11px] tracking-[0.14em]">
                        Complimentary
                      </span>
                    ) : (
                      <span className="text-ink">₹{shipping.toFixed(2)}</span>
                    )}
                  </div>

                  {codFee > 0 && (
                    <div className="flex justify-between items-center font-sans text-sm">
                      <span className="text-muted">Cash on delivery handling</span>
                      <span className="text-ink">₹{codFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-line mb-6" />

                <div className="flex justify-between items-baseline mb-8">
                  <span className="font-sans text-sm uppercase tracking-[0.14em] text-ink">Total</span>
                  <span className="font-display font-light text-3xl text-ink">₹{total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={step === "shipping" ? goToPayment : handlePlaceOrder}
                  disabled={isPlacingOrder}
                  variant="solid"
                  size="md"
                  className="w-full"
                >
                  {step === "shipping"
                    ? "Continue to Payment"
                    : isPlacingOrder
                    ? "Processing..."
                    : paymentMethod === "cod"
                    ? `Pay ₹${advanceAmount.toFixed(2)} Advance`
                    : "Pay Now"}
                </Button>

                <p className="text-center font-sans text-[11px] text-muted mt-5 tracking-[0.1em] uppercase">
                  256-bit SSL Secured
                </p>
              </div>
            </Reveal>
          </div>

        </div>
      </div>

      {/* ── New Address Modal ── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setIsAddressModalOpen(false)}
          />
          <div className="relative bg-ivory border border-line w-full max-w-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-line">
              <div>
                <p className="eyebrow text-bronze-deep mb-2">Shipping</p>
                <h2 className="font-display font-light text-2xl text-ink">
                  New Address
                </h2>
              </div>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                aria-label="Close"
                className="w-9 h-9 flex items-center justify-center text-xl leading-none text-muted hover:text-ink border border-line-strong hover:border-ink transition-colors"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8 flex flex-col gap-5">
              <div>
                <label className="block font-sans text-[11px] uppercase tracking-[0.14em] text-muted mb-2">Street Address</label>
                <input
                  type="text"
                  value={newAddressForm.street}
                  onChange={(e) => { setNewAddressForm({ ...newAddressForm, street: e.target.value }); setAddressErrors(prev => ({ ...prev, street: '' })); }}
                  placeholder="e.g. 123 Marine Drive"
                  className={`w-full bg-white border rounded-none px-4 py-3 font-sans text-base text-ink focus:outline-none focus:border-ink placeholder:text-muted ${addressErrors.street ? 'border-red-400' : 'border-line-strong'}`}
                />
                {addressErrors.street && <p className="text-red-500 text-xs mt-1.5">{addressErrors.street}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-[0.14em] text-muted mb-2">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newAddressForm.city}
                    onChange={(e) => { setNewAddressForm({ ...newAddressForm, city: e.target.value }); setAddressErrors(prev => ({ ...prev, city: '' })); }}
                    placeholder="Kochi"
                    className={`w-full bg-white border rounded-none px-4 py-3 font-sans text-base text-ink focus:outline-none focus:border-ink placeholder:text-muted ${addressErrors.city ? 'border-red-400' : 'border-line-strong'}`}
                  />
                  {addressErrors.city && <p className="text-red-500 text-xs mt-1.5">{addressErrors.city}</p>}
                </div>
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-[0.14em] text-muted mb-2">State <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newAddressForm.state}
                    onChange={(e) => { setNewAddressForm({ ...newAddressForm, state: e.target.value }); setAddressErrors(prev => ({ ...prev, state: '' })); }}
                    placeholder="Kerala"
                    className={`w-full bg-white border rounded-none px-4 py-3 font-sans text-base text-ink focus:outline-none focus:border-ink placeholder:text-muted ${addressErrors.state ? 'border-red-400' : 'border-line-strong'}`}
                  />
                  {addressErrors.state && <p className="text-red-500 text-xs mt-1.5">{addressErrors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-[0.14em] text-muted mb-2">PIN Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newAddressForm.zip}
                    onChange={(e) => { setNewAddressForm({ ...newAddressForm, zip: e.target.value }); setAddressErrors(prev => ({ ...prev, zip: '' })); }}
                    placeholder="682001"
                    className={`w-full bg-white border rounded-none px-4 py-3 font-sans text-base text-ink focus:outline-none focus:border-ink placeholder:text-muted ${addressErrors.zip ? 'border-red-400' : 'border-line-strong'}`}
                  />
                  {addressErrors.zip && <p className="text-red-500 text-xs mt-1.5">{addressErrors.zip}</p>}
                </div>
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-[0.14em] text-muted mb-2">Country</label>
                  <input
                    type="text"
                    value={newAddressForm.country}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, country: e.target.value })}
                    placeholder="India"
                    className="w-full bg-white border border-line-strong rounded-none px-4 py-3 font-sans text-base text-ink focus:outline-none focus:border-ink placeholder:text-muted"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveAddress}
                disabled={isSavingAddress}
                variant="solid"
                size="md"
                className="w-full mt-4"
              >
                {isSavingAddress ? "Saving..." : "Save & Deliver Here"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
