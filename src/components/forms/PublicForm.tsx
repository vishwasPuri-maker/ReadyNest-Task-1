"use client";

import { useEffect, useRef, useState } from "react";
import type { FieldType } from "@/lib/fields";
import { uploadToCloudinary } from "@/lib/cloudinary";

type PublicField = {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: string[];
};

type PublicFormData = {
  id: string;
  title: string;
  description: string | null;
  fields: PublicField[];
};

export default function PublicForm({ form }: { form: PublicFormData }) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const viewCounted = useRef(false);

  async function handleFile(fieldId: string, file: File | null) {
    if (!file) return;
    setError("");
    setUploading((u) => ({ ...u, [fieldId]: true }));
    try {
      const url = await uploadToCloudinary(file);
      setValue(fieldId, url);
    } catch {
      setError("File upload failed. Please try again.");
    } finally {
      setUploading((u) => ({ ...u, [fieldId]: false }));
    }
  }

  // Count one view when the form is opened
  useEffect(() => {
    if (viewCounted.current) return;
    viewCounted.current = true;
    fetch(`/api/forms/${form.id}/view`, { method: "POST" }).catch(() => {});
  }, [form.id]);

  function setValue(fieldId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  function toggleCheckbox(fieldId: string, option: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[fieldId]) ? (prev[fieldId] as string[]) : [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [fieldId]: next };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${form.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg animate-fade-up rounded-2xl border border-border bg-background/80 p-10 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
            ✓
          </div>
          <h1 className="text-2xl font-bold">Thank you!</h1>
          <p className="mt-2 text-sm text-muted">
            Your response has been recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg animate-fade-up rounded-2xl border border-border bg-background/80 p-8 shadow-2xl backdrop-blur sm:p-10">
        {/* Header with logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full border border-border shadow-[0_0_25px_rgba(255,255,255,0.15)]">
            <div className="h-2.5 w-2.5 rounded-full bg-accent" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">{form.title}</h1>
          {form.description && (
            <p className="mt-2 text-sm text-muted">{form.description}</p>
          )}
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {form.fields.map((field) => (
            <div key={field.id}>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                {field.label}
                {field.required && <span className="ml-1 text-red-400">*</span>}
              </label>
              <FieldInput
                field={field}
                value={answers[field.id]}
                onChange={(v) => setValue(field.id, v)}
                onToggle={(opt) => toggleCheckbox(field.id, opt)}
                onFile={(file) => handleFile(field.id, file)}
                uploading={Boolean(uploading[field.id])}
              />
            </div>
          ))}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent py-3 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting ? "SUBMITTING..." : "SUBMIT"}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-muted">
          Powered by Form Builder
        </p>
      </div>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-input px-4 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-foreground/50";

function FieldInput({
  field,
  value,
  onChange,
  onToggle,
  onFile,
  uploading,
}: {
  field: PublicField;
  value: string | string[] | undefined;
  onChange: (value: string) => void;
  onToggle: (option: string) => void;
  onFile: (file: File | null) => void;
  uploading: boolean;
}) {
  switch (field.type) {
    case "file":
      return (
        <div>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border file:border-border file:bg-surface file:px-4 file:py-2 file:text-xs file:font-semibold file:text-foreground hover:file:border-foreground/40"
          />
          {uploading && (
            <p className="mt-2 text-xs text-muted">Uploading…</p>
          )}
          {!uploading && typeof value === "string" && value && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-foreground underline-offset-4 hover:underline"
            >
              ✓ Uploaded — view file
            </a>
          )}
        </div>
      );
    case "textarea":
      return (
        <textarea
          rows={4}
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none rounded-lg border border-border bg-input px-4 py-3 text-sm outline-none transition-colors focus:border-foreground/50"
        />
      );
    case "dropdown":
      return (
        <select
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          <option value="" className="bg-background">
            Select an option
          </option>
          {field.options.map((opt) => (
            <option key={opt} value={opt} className="bg-background">
              {opt}
            </option>
          ))}
        </select>
      );
    case "radio":
      return (
        <div className="space-y-2">
          {field.options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="h-4 w-4 accent-foreground"
              />
              {opt}
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <div className="space-y-2">
          {field.options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(opt)}
                onChange={() => onToggle(opt)}
                className="h-4 w-4 accent-foreground"
              />
              {opt}
            </label>
          ))}
        </div>
      );
    default:
      // text, email, number, date
      return (
        <input
          type={field.type}
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );
  }
}
