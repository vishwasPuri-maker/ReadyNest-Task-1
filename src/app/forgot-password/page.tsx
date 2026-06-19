"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setSent(true); // same message regardless, for privacy
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-fade-up rounded-2xl border border-border bg-background/80 p-8 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-foreground/30 shadow-[0_0_25px_rgba(255,255,255,0.15)]">
          <div className="h-2.5 w-2.5 rounded-full bg-accent" />
        </div>

        {sent ? (
          <>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="mt-2 text-sm text-muted">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent
              a password reset link. It expires in 1 hour.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-[1.02]"
            >
              BACK TO LOGIN
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Forgot password?</h1>
            <p className="mt-2 text-sm text-muted">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form className="mt-6 space-y-4 text-left" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-lg border border-border bg-input px-4 text-sm outline-none transition-colors focus:border-foreground/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent py-3 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {loading ? "SENDING..." : "SEND RESET LINK"}
              </button>
            </form>
            <Link
              href="/login"
              className="mt-5 inline-block text-xs text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
