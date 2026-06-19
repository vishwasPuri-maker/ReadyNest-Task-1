"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Notif = {
  id: string;
  formId: string;
  formTitle: string;
  createdAt: string;
};

// Polls for new responses, live-refreshes the page data, and shows a
// brief toast when a new response arrives. No bell / dropdown UI.
export default function LiveUpdates() {
  const router = useRouter();
  const [toasts, setToasts] = useState<Notif[]>([]);
  const seen = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = await res.json();
        const list: Notif[] = data.recent ?? [];

        if (!initialized.current) {
          list.forEach((n) => seen.current.add(n.id));
          initialized.current = true;
          return;
        }

        const fresh = list.filter((n) => !seen.current.has(n.id));
        if (fresh.length > 0) {
          fresh.forEach((n) => seen.current.add(n.id));
          setToasts((t) => [...fresh, ...t].slice(0, 3));
          router.refresh(); // live-update counts / tables
          fresh.forEach((n) =>
            setTimeout(
              () => setToasts((t) => t.filter((x) => x.id !== n.id)),
              6000
            )
          );
        }
      } catch {
        // ignore polling errors
      }
    }

    poll();
    const interval = setInterval(poll, 10000); // every 10s
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Link
          key={t.id}
          href={`/forms/${t.formId}/responses`}
          className="w-72 animate-fade-up rounded-xl border border-border bg-background p-4 shadow-2xl transition-colors hover:border-foreground/40"
        >
          <div className="text-sm font-semibold">New response</div>
          <div className="mt-1 text-xs text-muted">on {t.formTitle}</div>
        </Link>
      ))}
    </div>
  );
}
