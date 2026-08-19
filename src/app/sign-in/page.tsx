"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import AuthField from "../../components/auth/AuthField";
import EditorialImage from "../../components/ui/EditorialImage";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";
import {
  REDIRECT_PARAM,
  authApiBase,
  authErrorMessage,
  safeRedirect,
  saveSession,
  validateEmail,
  type Session,
} from "../../lib/auth";

/**
 * Sign in — email and password, or Google.
 *
 * Both routes end identically: the backend returns the same session object, this
 * stores it under the same key and merges the guest cart the same way, so
 * nothing downstream can tell which was used.
 *
 * The password field validates only that it is present. The strength rules are
 * a registration concern; enforcing them here would lock out an account that
 * predates them and, worse, tell an attacker what a valid password looks like.
 */
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { syncCartAfterLogin } = useCart();

  /**
   * Where to go once signed in. Set by whatever sent the customer here — the
   * product page's Buy Now, for instance — so an interrupted purchase resumes
   * on the piece rather than dumping them on the homepage. Validated as a
   * same-origin path; see `safeRedirect`.
   */
  const returnTo = safeRedirect(searchParams.get(REDIRECT_PARAM));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const found = {
      email: validateEmail(email) ?? undefined,
      password: password ? undefined : "Password is required.",
    };
    setErrors(found);
    if (found.email || found.password) return;

    setSubmitting(true);
    try {
      const res = await axios.post(`${authApiBase()}/api/v1/auth/signin`, {
        email: email.trim(),
        password,
      });
      const session = res.data?.data as Session | undefined;
      if (!session?.token) throw new Error("no session returned");

      saveSession(session);
      // Same post-auth step the Google flow runs: fold the guest bag into the
      // account and restore anything saved on a previous visit.
      await syncCartAfterLogin();
      showToast("Signed in successfully.", "success");
      router.push(returnTo);
    } catch (err) {
      setFormError(authErrorMessage(err, "Could not sign you in. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory pt-[68px] md:pt-[84px] flex flex-col md:flex-row">
      {/* ── Image panel: a mobile image band, a full-height column on desktop ── */}
      <div className="relative w-full h-[38vh] min-h-[260px] md:w-1/2 md:h-auto bg-sand overflow-hidden">
        {/* The panel was never meant to be plain — it pointed at
            `/images/signin.png`, a file that does not exist, so EditorialImage
            fell through to its grey placeholder and the "BELOVI" watermark.
            That is the empty gradient; the layout around it was already right.

            EditorialImage renders `object-cover h-full w-full`, so the artwork
            fills the panel at any shape without distortion, and the wrapper's
            `overflow-hidden` crops the excess. */}
        <EditorialImage
          src="/images/Component 6.png"
          alt="BELOVI"
          placeholderLabel="BELOVI"
          ratio=""
          zoom={false}
          className="h-full w-full"
        />
        {/* Scrim keeps the type legible over any photograph. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-14 lg:p-20 pointer-events-none">
          <p className="eyebrow text-ivory/85 mb-3">BELOVI</p>
          <p className="font-display font-light text-xl sm:text-2xl md:text-3xl leading-[1.15] text-ivory max-w-sm">
            Considered clothing, designed in Kochi for the way the day actually feels.
          </p>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 md:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 md:p-16 lg:p-24">
        <div className="max-w-md mx-auto w-full">
          <Breadcrumbs className="mb-8" />
          <p className="eyebrow text-bronze-deep mb-5">Account</p>

          <h1 className="font-display font-light text-[clamp(2.25rem,7vw,3.5rem)] leading-[1.08] text-ink mb-4">
            Welcome back.
          </h1>

          <p className="font-sans text-muted text-[15px] sm:text-base leading-relaxed mb-9">
            Sign in to view orders, saved addresses, and your cart.
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
              label="Email Address"
              type="email"
              value={email}
              onChange={(v) => {
                setEmail(v);
                setErrors((p) => ({ ...p, email: undefined }));
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
                setErrors((p) => ({ ...p, password: undefined }));
              }}
              error={errors.password}
              placeholder="••••••••"
              autoComplete="current-password"
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
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-9 flex items-center gap-4">
            <span className="h-px flex-1 bg-line" />
            <span className="eyebrow text-faint">Or continue with</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          {/* Google lands back on the same page — most customers use it, so
              without this the return path would work for passwords only. */}
          <GoogleAuthButton mode="signin" redirectTo={returnTo} />

          <div className="mt-9 border-t border-line pt-8 text-center">
            <Link
              // Carried through registration too: signing up from here is still
              // the same interrupted purchase.
              href={
                returnTo === "/"
                  ? "/register"
                  : `/register?${REDIRECT_PARAM}=${encodeURIComponent(returnTo)}`
              }
              className="inline-flex items-center gap-2 font-sans text-sm text-muted transition-colors hover:text-ink"
            >
              New to BELOVI?{" "}
              <span className="link-underline font-medium text-ink">Create Account</span>
              <UserPlus size={15} aria-hidden className="text-ink" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * `useSearchParams` needs a Suspense boundary to be read in a client component
 * without opting the whole route out of static rendering — the same wrapper the
 * shop uses for its filters.
 */
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory pt-[68px] md:pt-[84px] flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
