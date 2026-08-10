"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MailCheck } from "lucide-react";
import { Button } from "../ui/Button";
import { authApiBase, authErrorMessage, type Session } from "../../lib/auth";

/**
 * Enter the code we emailed.
 *
 * Holds no password: by this point the backend has the pending registration and
 * only needs the address and the code. A refresh therefore loses nothing
 * sensitive, and the account is built from the server's record — this screen
 * cannot influence which address the account ends up with.
 */

/** mm:ss, for both countdowns. */
function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export interface PendingVerification {
  email: string;
  expiresAt: string;
  resendAvailableAt: string;
}

export default function OtpVerification({
  pending,
  onPendingChange,
  onVerified,
  onChangeEmail,
}: {
  pending: PendingVerification;
  /** A resend returns fresh deadlines. */
  onPendingChange: (next: PendingVerification) => void;
  onVerified: (session: Session) => void | Promise<void>;
  onChangeEmail: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // One ticker drives both the expiry and the resend cooldown.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const expiresIn = new Date(pending.expiresAt).getTime() - now;
  const resendIn = new Date(pending.resendAvailableAt).getTime() - now;
  const expired = expiresIn <= 0;

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (otp.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${authApiBase()}/api/v1/auth/register/verify`, {
        email: pending.email,
        otp,
      });
      const session = res.data?.data as Session | undefined;
      if (!session?.token) throw new Error("no session returned");
      await onVerified(session);
    } catch (err) {
      setError(authErrorMessage(err, "We couldn't verify that code. Please try again."));
      setOtp("");
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      const res = await axios.post(`${authApiBase()}/api/v1/auth/register/resend`, {
        email: pending.email,
      });
      const data = res.data?.data as PendingVerification | undefined;
      if (data) onPendingChange({ ...data, email: pending.email });
      setOtp("");
      setNotice("A new code is on its way.");
      inputRef.current?.focus();
    } catch (err) {
      setError(authErrorMessage(err, "Could not send a new code. Please try again."));
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <p className="eyebrow text-bronze-deep mb-5">Account</p>

      <h1 className="font-display font-light text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.08] text-ink mb-4">
        Verify your email.
      </h1>

      <p className="font-sans text-muted text-[15px] sm:text-base leading-relaxed mb-2">
        We&rsquo;ve sent a 6-digit verification code to
      </p>
      <p className="font-sans text-[15px] text-ink mb-9 flex items-center gap-2 break-all">
        <MailCheck size={16} aria-hidden className="text-bronze shrink-0" />
        {pending.email}
      </p>

      <form onSubmit={verify} noValidate className="flex flex-col gap-5">
        {error && (
          <div
            role="alert"
            className="border border-forest/40 bg-forest/[0.06] px-4 py-3 font-sans text-[13px] text-forest"
          >
            {error}
          </div>
        )}
        {notice && !error && (
          <div className="border border-line-strong bg-cream px-4 py-3 font-sans text-[13px] text-ink">
            {notice}
          </div>
        )}

        <div>
          <label
            htmlFor="otp"
            className="block font-sans text-[11px] uppercase tracking-[0.14em] text-muted mb-2"
          >
            Verification Code
          </label>
          <input
            id="otp"
            ref={inputRef}
            /* `inputMode` brings up the numeric keypad without `type=number`,
               which would add spinners and strip a leading zero. */
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError(null);
            }}
            disabled={submitting || expired}
            aria-invalid={error ? true : undefined}
            placeholder="000000"
            className={`w-full bg-cream border px-4 py-4 text-center font-sans text-[26px] tracking-[0.5em] text-ink placeholder:text-faint transition-colors focus:outline-none focus:border-ink disabled:opacity-60 ${
              error ? "border-forest" : "border-line-strong"
            }`}
          />
          <p className="mt-2 font-sans text-[12px] text-faint">
            {expired ? (
              <span className="text-forest">
                This code has expired. Request a new one below.
              </span>
            ) : (
              <>Expires in {formatRemaining(expiresIn)}</>
            )}
          </p>
        </div>

        <Button
          type="submit"
          variant="solid"
          size="md"
          arrow={!submitting}
          disabled={submitting || expired || otp.length !== 6}
          className="mt-1 w-full"
        >
          {submitting ? "Verifying…" : "Verify OTP"}
        </Button>
      </form>

      <div className="mt-8 flex flex-col gap-3 border-t border-line pt-8 text-center">
        <p className="font-sans text-sm text-muted">
          Didn&rsquo;t get it? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={resend}
            disabled={resending || resendIn > 0}
            className="link-underline font-medium text-ink transition-colors hover:text-bronze-deep disabled:cursor-not-allowed disabled:text-faint disabled:no-underline"
          >
            {resending
              ? "sending…"
              : resendIn > 0
                ? `resend in ${formatRemaining(resendIn)}`
                : "resend the code"}
          </button>
        </p>
        <button
          type="button"
          onClick={onChangeEmail}
          className="font-sans text-sm text-muted transition-colors hover:text-ink"
        >
          Wrong address?{" "}
          <span className="link-underline text-ink">Change email address</span>
        </button>
      </div>
    </div>
  );
}
