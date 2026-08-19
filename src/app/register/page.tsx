"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import AuthField from "../../components/auth/AuthField";
import OtpVerification, {
  type PendingVerification,
} from "../../components/auth/OtpVerification";
import EditorialImage from "../../components/ui/EditorialImage";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";
import {
  PASSWORD_HINT,
  REDIRECT_PARAM,
  authApiBase,
  authErrorMessage,
  safeRedirect,
  saveSession,
  validateEmail,
  validateName,
  validatePassword,
  type Session,
} from "../../lib/auth";

/**
 * Create an account — details, then email verification. Or Google, unchanged.
 *
 * Two steps in one component rather than two routes, on purpose: the pending
 * registration lives on the server, so the only thing a navigation would have to
 * carry is the address — and a customer who refreshed a standalone verify page
 * would be stranded there with no way back to the form. Here "change email
 * address" simply returns to step one with the fields still filled in.
 *
 * Submitting the form does NOT create an account. It asks the backend to mail a
 * code; the account is created only when that code comes back verified.
 *
 * Field rules mirror `schemas.register` on the backend, which is the real gate.
 * Validating here as well means a weak password is caught before a round trip
 * and the rule shown under the field is the rule actually enforced.
 */
function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Carried from sign-in, so creating an account mid-purchase returns to the
  // piece rather than the homepage.
  const returnTo = safeRedirect(searchParams.get(REDIRECT_PARAM));
  const { showToast } = useToast();
  const { syncCartAfterLogin } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  /** Set once a code has been mailed; its presence is what shows step two. */
  const [pending, setPending] = useState<PendingVerification | null>(null);

  const clear = (key: keyof typeof errors) =>
    setErrors((p) => ({ ...p, [key]: undefined }));

  /** Shared ending for both routes in: store the session, then go home. */
  const completeSignIn = async (session: Session, message: string) => {
    saveSession(session);
    // Same post-auth step the Google flow runs: fold the guest bag into the
    // account and restore anything saved on a previous visit.
    await syncCartAfterLogin();
    showToast(message, "success");
    router.push(returnTo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const found = {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirm: !confirm
        ? "Please confirm your password."
        : confirm !== password
          ? "Passwords do not match."
          : undefined,
    };
    setErrors(found);
    if (found.name || found.email || found.password || found.confirm) return;

    setSubmitting(true);
    try {
      // Mails a code. Creates nothing — the account appears only after the code
      // entered on the next screen is verified.
      const res = await axios.post(`${authApiBase()}/api/v1/auth/register`, {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      const data = res.data?.data as PendingVerification | undefined;
      if (!data?.expiresAt) throw new Error("no verification issued");
      setPending({ ...data, email: email.trim().toLowerCase() });
    } catch (err) {
      const message = authErrorMessage(err, "Could not start registration. Please try again.");
      setFormError(message);
      // A duplicate address is the one failure the customer can act on, so it
      // also marks the field rather than only sitting in the banner.
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setErrors((p) => ({ ...p, email: message }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory pt-[68px] md:pt-[84px] flex flex-col md:flex-row">
      {/* ── Image panel: a mobile image band, a full-height column on desktop ── */}
      <div className="relative w-full h-[38vh] min-h-[260px] md:w-1/2 md:h-auto bg-sand overflow-hidden">
        <EditorialImage
          src="/images/image 20.png"
          alt="BELOVI"
          placeholderLabel="BELOVI"
          ratio=""
          zoom={false}
          className="h-full w-full"
        />
        {/* Scrim keeps the type legible over any photograph. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-14 lg:p-20 pointer-events-none">
          <p className="eyebrow text-ivory/85 mb-3">The Onam Collection · 2026</p>
          <p className="font-display font-light text-xl sm:text-2xl md:text-3xl leading-[1.15] text-ivory max-w-sm">
            Made for 32°C, humidity, and monsoon. Named for the flowers of Kerala.
          </p>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 md:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 md:p-16 lg:p-24">
        <div className="max-w-md mx-auto w-full">
          <Breadcrumbs className="mb-8" />

          {pending ? (
            <OtpVerification
              pending={pending}
              onPendingChange={setPending}
              onVerified={(session) =>
                completeSignIn(session, "Email verified. Welcome to BELOVI.")
              }
              // Back to step one with everything still typed in, so correcting a
              // mistyped address costs one edit rather than the whole form.
              onChangeEmail={() => {
                setPending(null);
                setFormError(null);
              }}
            />
          ) : (
            <>
          <p className="eyebrow text-bronze-deep mb-5">Account</p>

          <h1 className="font-display font-light text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.08] text-ink mb-4">
            Create your account.
          </h1>

          <p className="font-sans text-muted text-[15px] sm:text-base leading-relaxed mb-9">
            For a faster checkout, saved addresses, and a place to follow your orders.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {formError && (
              <div
                role="alert"
                className="border border-forest/40 bg-forest/[0.06] px-4 py-3 font-sans text-[13px] text-forest"
              >
                {formError}
              </div>
            )}

            <AuthField
              label="Full Name"
              value={name}
              onChange={(v) => {
                setName(v);
                clear("name");
              }}
              error={errors.name}
              placeholder="Your name"
              autoComplete="name"
              disabled={submitting}
            />

            <AuthField
              label="Email Address"
              type="email"
              value={email}
              onChange={(v) => {
                setEmail(v);
                clear("email");
              }}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={submitting}
            />

            <AuthField
              label="Password"
              type="password"
              value={password}
              onChange={(v) => {
                setPassword(v);
                clear("password");
                if (confirm) clear("confirm");
              }}
              error={errors.password}
              hint={PASSWORD_HINT}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={submitting}
            />

            <AuthField
              label="Confirm Password"
              type="password"
              value={confirm}
              onChange={(v) => {
                setConfirm(v);
                clear("confirm");
              }}
              error={errors.confirm}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={submitting}
            />

            <Button
              type="submit"
              variant="solid"
              size="md"
              arrow={!submitting}
              disabled={submitting}
              className="mt-1 w-full"
            >
              {submitting ? "Sending code…" : "Create Account"}
            </Button>

            <p className="font-sans text-[12px] leading-relaxed text-faint">
              We&rsquo;ll email a 6-digit code to confirm your address before the
              account is created.
            </p>
          </form>

          {/* Divider */}
          <div className="my-9 flex items-center gap-4">
            <span className="h-px flex-1 bg-line" />
            <span className="eyebrow text-faint">Or continue with</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <GoogleAuthButton mode="register" redirectTo={returnTo} />

          <div className="mt-9 border-t border-line pt-8 text-center">
            <Link
              href={
                returnTo === "/"
                  ? "/sign-in"
                  : `/sign-in?${REDIRECT_PARAM}=${encodeURIComponent(returnTo)}`
              }
              className="font-sans text-sm text-muted transition-colors hover:text-ink"
            >
              Already have an account?{" "}
              <span className="link-underline font-medium text-ink">Sign In</span>
            </Link>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Suspense boundary for `useSearchParams`, as on the sign-in page. */
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory pt-[68px] md:pt-[84px] flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
