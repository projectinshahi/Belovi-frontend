"use client";

import { useState } from "react";
import axios from "axios";
import Reveal from "../ui/Reveal";
import { useToast } from "../../context/ToastContext";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

export default function StudioNewsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/api/v1/newsletter/subscribe`, {
        email: value,
        source: "home-studio",
      });
      if (res.data?.success) {
        showToast("Subscribed. Slow letters, on their way.", "success");
        setEmail("");
      } else {
        showToast(res.data?.message || "Could not subscribe. Try again.", "error");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not subscribe. Try again.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-ivory">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pb-16 sm:pb-24">
        <Reveal>
          <div className="border border-ink/15 bg-cream grid grid-cols-1 lg:grid-cols-2">
            {/* Left — coming soon */}
            <div className="p-8 sm:p-12 lg:p-16 lg:border-r border-ink/10">
              <p className="eyebrow text-bronze-deep mb-6">The BELOVI Studio · Coming Soon</p>
              <h3 className="font-display font-light text-[clamp(1.6rem,3vw,2.4rem)] leading-tight text-ink mb-5">
                Image consulting and personal styling, led by BELOVI.
              </h3>
              <p className="font-sans text-[14px] leading-[1.8] text-muted max-w-md">
                Opening in a considered Year One rollout.
              </p>
            </div>

            {/* Right — newsletter */}
            <div className="p-8 sm:p-12 lg:p-16 bg-tan/40">
              <p className="eyebrow text-bronze-deep mb-6">Notes from the Studio</p>
              <p className="font-display text-[19px] leading-relaxed text-ink/80 max-w-md mb-8">
                Slow letters about clothing, climate, and getting dressed for the life you're
                actually living.
              </p>
              <form onSubmit={subscribe} className="max-w-md">
                <div className="flex items-center gap-2 border-b border-ink/40 focus-within:border-ink transition-colors">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    aria-label="Email address"
                    /* min-w-0 lets the input shrink below its intrinsic width so
                       the row never forces the page wider on narrow phones. */
                    className="flex-1 min-w-0 bg-transparent py-3 font-sans text-[15px] text-ink placeholder:text-faint focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="eyebrow text-ink py-3 shrink-0 whitespace-nowrap hover:text-bronze-deep transition-colors disabled:opacity-50"
                  >
                    {submitting ? "…" : "Subscribe"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
