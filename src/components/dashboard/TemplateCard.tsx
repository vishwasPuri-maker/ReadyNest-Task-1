"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Template } from "@/lib/templates";

const CATEGORY_ICON: Record<string, string> = {
  Recruitment: "💼",
  Survey: "📊",
  Education: "🎓",
  General: "✉️",
  Events: "📅",
};

export default function TemplateCard({
  template,
  purchased,
}: {
  template: Template;
  purchased: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const locked = template.premium && !purchased;
  const recommended = Boolean(template.recommended);

  async function useTemplate() {
    setBusy(true);
    try {
      const res = await fetch("/api/templates/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/forms/${data.id}/edit`);
    } finally {
      setBusy(false);
    }
  }

  async function unlock() {
    setBusy(true);
    try {
      await fetch("/api/templates/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`group relative flex flex-col rounded-3xl border p-7 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-foreground/40 hover:shadow-2xl ${
        recommended
          ? "border-foreground/40 bg-surface"
          : "border-border bg-surface/60"
      }`}
    >
      {recommended && (
        <span className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold tracking-widest text-accent-foreground">
          RECOMMENDED
        </span>
      )}

      {/* Icon */}
      <div className="grid h-12 w-12 place-items-center rounded-xl border border-border text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
        {CATEGORY_ICON[template.category] ?? "📄"}
      </div>

      <h3 className="mt-5 text-xl font-bold">{template.title}</h3>
      <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted">
        {template.description}
      </p>

      {/* Price */}
      <div className="mt-5 flex items-end gap-1">
        <span className="text-4xl font-bold">
          {template.premium ? `₹${template.price}` : "Free"}
        </span>
        {template.premium && (
          <span className="mb-1 text-sm text-muted">/ one-time</span>
        )}
      </div>

      <div className="my-6 border-t border-dashed border-border" />

      {/* Included fields */}
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        This template includes
      </div>
      <ul className="mt-3 flex-1 space-y-2 text-sm">
        {template.fields.map((f) => (
          <li key={f.label} className="flex items-center gap-2">
            <span className="text-foreground">✓</span>
            <span className="text-muted">{f.label}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-7">
        {locked ? (
          <button
            type="button"
            onClick={unlock}
            disabled={busy}
            className="w-full rounded-lg bg-accent py-3 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy ? "..." : `🔒 UNLOCK ₹${template.price}`}
          </button>
        ) : (
          <button
            type="button"
            onClick={useTemplate}
            disabled={busy}
            className={`w-full rounded-lg py-3 text-xs font-semibold tracking-widest transition-transform hover:scale-[1.02] disabled:opacity-60 ${
              recommended
                ? "bg-accent text-accent-foreground"
                : "border border-border hover:border-foreground/40"
            }`}
          >
            {busy ? "..." : "USE TEMPLATE"}
          </button>
        )}
      </div>
    </div>
  );
}
