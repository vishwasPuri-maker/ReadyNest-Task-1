"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Network error. Please try again.");
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

        {done ? (
          <>
            <h1 className="text-2xl font-bold">Password updated</h1>
            <p className="mt-2 text-sm text-muted">
              Redirecting you to login…
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Set a new password</h1>
            <form className="mt-6 space-y-4 text-left" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-border bg-input px-4 text-sm outline-none transition-colors focus:border-foreground/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-border bg-input px-4 text-sm outline-none transition-colors focus:border-foreground/50"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent py-3 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {loading ? "UPDATING..." : "UPDATE PASSWORD"}
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
