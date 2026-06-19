"use client";

import { useState } from "react";
import TemplateCard from "./TemplateCard";
import type { Template } from "@/lib/templates";

export default function TemplatesGallery({
  templates,
  purchasedIds,
}: {
  templates: Template[];
  purchasedIds: string[];
}) {
  const [tab, setTab] = useState<"premium" | "free">("premium");
  const purchased = new Set(purchasedIds);
  const shown = templates.filter((t) =>
    tab === "premium" ? t.premium : !t.premium
  );

  return (
    <div className="mx-auto max-w-6xl animate-fade-up px-6 py-12">
      {/* Hero */}
      <div className="flex flex-col items-center text-center">
        <span className="rounded-full border border-border px-4 py-1 text-[11px] font-medium tracking-widest text-muted">
          TEMPLATES
        </span>
        <h1 className="mt-5 text-4xl font-bold sm:text-5xl">
          Start Faster With Templates
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          Pick a ready-made form and make it yours in seconds — free, or unlock
          a premium one.
        </p>

        {/* Toggle */}
        <div className="mt-8 inline-flex items-center rounded-full border border-border p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab("premium")}
            className={`rounded-full px-5 py-2 tracking-widest transition-colors ${
              tab === "premium"
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            PREMIUM
          </button>
          <button
            type="button"
            onClick={() => setTab("free")}
            className={`rounded-full px-5 py-2 tracking-widest transition-colors ${
              tab === "free"
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            FREE
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            purchased={purchased.has(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
