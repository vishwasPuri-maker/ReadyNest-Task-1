"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthBackground from "./AuthBackground";

type Mode = "signin" | "signup";

export default function AuthCard({ mode }: { mode: Mode }) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNote("");
    setLoading(true);
    try {
      if (isSignup) {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 409) {
            setAlreadyRegistered(true);
            return;
          }
          setError(data.error ?? "Something went wrong.");
          return;
        }
        // Account created → verify email with the code we just sent
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          // Unverified account → send them to verify
          if (res.status === 403 && data.needsVerification) {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
            return;
          }
          setError(data.error ?? "Something went wrong.");
          return;
        }
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-sm animate-fade-up rounded-2xl border border-border bg-background/80 p-8 shadow-2xl backdrop-blur">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-border shadow-[0_0_25px_rgba(255,255,255,0.15)]">
            <div className="h-3 w-3 rounded-full bg-accent" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-[0.2em]">
            FORM BUILDER
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted">
            Authentication Portal
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-7 flex border-b border-border text-sm font-semibold tracking-widest">
          <Link
            href="/login"
            className={`flex-1 pb-3 text-center transition-colors ${
              !isSignup
                ? "border-b-2 border-white text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            SIGN IN
          </Link>
          <Link
            href="/signup"
            className={`flex-1 pb-3 text-center transition-colors ${
              isSignup
                ? "border-b-2 border-white text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            SIGN UP
          </Link>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {isSignup && (
            <Field label="Full Name">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={inputClass}
              />
            </Field>
          )}

          <Field label="Email Address">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@universe.com"
              className={inputClass}
            />
          </Field>

          <Field label="Password">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-widest text-muted transition-colors hover:text-foreground"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </Field>

          {!isSignup && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex cursor-pointer items-center gap-2 text-muted">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-foreground"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-muted transition-colors hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
          {note && <p className="text-xs text-muted">{note}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-3 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {loading
              ? "PLEASE WAIT..."
              : isSignup
                ? "LAUNCH SIGN UP"
                : "LAUNCH SIGN IN"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted">
          <span className="h-px flex-1 bg-border" />
          Or continue with
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Social (decorative) */}
        <div className="grid grid-cols-2 gap-3">
          {["Google", "GitHub"].map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() =>
                setNote(`${provider} login isn't set up yet.`)
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-xs font-medium transition-colors hover:border-foreground/40"
            >
              <span className="text-sm">◉</span>
              {provider}
            </button>
          ))}
        </div>
      </div>

      {/* Popup: account already exists (signup) */}
      {alreadyRegistered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-fade-up rounded-2xl border border-border bg-background p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
              !
            </div>
            <h3 className="text-lg font-bold">You are already registered</h3>
            <p className="mt-2 text-sm text-muted">
              An account with this email already exists. Please sign in instead.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full rounded-full bg-accent py-3 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-[1.02]"
              >
                GO TO SIGN IN
              </Link>
              <button
                type="button"
                onClick={() => setAlreadyRegistered(false)}
                className="text-xs text-muted underline-offset-4 hover:text-foreground hover:underline"
              >
                Use a different email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-foreground/50";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
