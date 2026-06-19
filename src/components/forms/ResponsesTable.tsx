"use client";

import { useMemo, useState } from "react";
import type { FieldType } from "@/lib/fields";

type Field = {
  id: string;
  label: string;
  type: FieldType;
  options: string[];
};

type ResponseRow = {
  id: string;
  createdAt: string;
  answers: Record<string, unknown>;
};

const OPTION_TYPES: FieldType[] = ["dropdown", "radio", "checkbox"];

function formatValue(value: unknown): string {
  if (value == null) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value || "—";
  return String(value);
}

function FileCell({ value }: { value: unknown }) {
  if (typeof value !== "string" || !value) return <span>—</span>;
  const isImage = /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(value);
  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-foreground underline-offset-4 hover:underline"
    >
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="upload"
          className="h-12 w-12 rounded-md border border-border object-cover"
        />
      ) : (
        "📄 View file"
      )}
    </a>
  );
}

function csvCell(value: string): string {
  // Wrap every cell in quotes and escape inner quotes — safe for commas/newlines
  return `"${value.replace(/"/g, '""')}"`;
}

export default function ResponsesTable({
  title,
  fields,
  responses,
}: {
  title: string;
  fields: Field[];
  responses: ResponseRow[];
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filterFields = fields.filter((f) => OPTION_TYPES.includes(f.type));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return responses.filter((r) => {
      // Filters (per option field)
      for (const [fieldId, val] of Object.entries(filters)) {
        if (!val) continue;
        const ans = r.answers[fieldId];
        const matches = Array.isArray(ans)
          ? ans.includes(val)
          : ans === val;
        if (!matches) return false;
      }
      // Search across all answer values
      if (q) {
        const haystack = Object.values(r.answers)
          .map((v) => (Array.isArray(v) ? v.join(" ") : String(v ?? "")))
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [responses, query, filters]);

  function exportCsv() {
    const headers = ["Submitted", ...fields.map((f) => f.label)];
    const rows = filtered.map((r) => [
      new Date(r.createdAt).toLocaleString(),
      ...fields.map((f) => {
        const v = r.answers[f.id];
        if (Array.isArray(v)) return v.join("; ");
        return v == null ? "" : String(v);
      }),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\n");
    // BOM so Excel / Numbers read UTF-8 (special chars, ⭐ etc.) correctly
    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search responses…"
          className="h-10 w-full max-w-xs rounded-lg border border-border bg-input px-4 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-foreground/50"
        />
        {filterFields.map((f) => (
          <select
            key={f.id}
            value={filters[f.id] ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, [f.id]: e.target.value }))
            }
            className="h-10 rounded-lg border border-border bg-input px-3 text-sm outline-none focus:border-foreground/50"
          >
            <option value="" className="bg-background">
              All {f.label}
            </option>
            {f.options.map((opt) => (
              <option key={opt} value={opt} className="bg-background">
                {opt}
              </option>
            ))}
          </select>
        ))}
        {(query || Object.values(filters).some(Boolean)) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilters({});
            }}
            className="text-xs text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Clear
          </button>
        )}

        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="ml-auto rounded-lg bg-accent px-4 py-2 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          EXPORT CSV
        </button>
      </div>

      <p className="mb-3 text-xs text-muted">
        Showing {filtered.length} of {responses.length} responses
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
          No responses match your search / filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-widest text-muted">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Submitted</th>
                {fields.map((f) => (
                  <th key={f.id} className="whitespace-nowrap px-4 py-3">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  {fields.map((f) => (
                    <td key={f.id} className="px-4 py-3">
                      {f.type === "file" ? (
                        <FileCell value={r.answers[f.id]} />
                      ) : (
                        formatValue(r.answers[f.id])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
