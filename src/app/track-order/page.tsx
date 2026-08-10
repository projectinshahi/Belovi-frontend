"use client";

import { useState } from "react";
import LegalPage from "../../components/common/LegalPage";
import { Button, ButtonLink } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const { showToast } = useToast();
  const { whatsappNumber } = useSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    const mail = email.trim();
    if (!id) {
      showToast("Please enter your order ID.", "warning");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      showToast("Please enter the email used on the order.", "warning");
      return;
    }
    showToast(
      "Found it. Tracking details are on their way to your inbox.",
      "success"
    );
    setOrderId("");
    setEmail("");
  };

  return (
    <LegalPage eyebrow="Customer Care" title="Track Your Order">
      <p>
        Enter the order ID from your confirmation email along with the address it
        was sent to. We will email your latest tracking link and courier details.
        Orders are usually handed to the courier within two working days of
        dispatch.
      </p>

      <form onSubmit={handleSubmit} className="not-prose max-w-md mt-10 mb-4">
        <label className="block mb-6">
          <span className="eyebrow text-bronze-deep block mb-3">Order ID</span>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="GBP-2026-XXXX"
            aria-label="Order ID"
            className="w-full bg-transparent border-b border-ink/40 focus:border-ink transition-colors py-3 font-sans text-[15px] text-ink placeholder:text-faint focus:outline-none"
          />
        </label>

        <label className="block mb-8">
          <span className="eyebrow text-bronze-deep block mb-3">Email address</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            aria-label="Email address"
            className="w-full bg-transparent border-b border-ink/40 focus:border-ink transition-colors py-3 font-sans text-[15px] text-ink placeholder:text-faint focus:outline-none"
          />
        </label>

        <Button type="submit" variant="outline" size="md" arrow>
          Track order
        </Button>
      </form>

      <h2>Prefer to ask a person?</h2>
      <p>
        Message us on WhatsApp with your order ID and we will look into it during
        studio hours, Monday to Saturday, 10am to 6pm IST. It is often the fastest
        way to sort a delivery question.
      </p>
      <div className="not-prose mt-6">
        <ButtonLink
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="solid"
          size="md"
        >
          Message on WhatsApp
        </ButtonLink>
      </div>
    </LegalPage>
  );
}
