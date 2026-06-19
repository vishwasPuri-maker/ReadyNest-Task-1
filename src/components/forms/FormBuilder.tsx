"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FIELD_TYPES,
  OPTION_FIELD_TYPES,
  type FieldType,
} from "@/lib/fields";

type BuilderField = {
  key: string;
  dbId?: string; // present for existing fields (edit mode)
  label: string;
  type: FieldType;
  required: boolean;
  options: string[];
  labelEdited: boolean; // true once the user manually changes the label
};

export type InitialForm = {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  fields: {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    options: string[];
  }[];
};

const TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  email: "Email",
  number: "Number",
  dropdown: "Dropdown",
  checkbox: "Checkbox",
  radio: "Radio",
  date: "Date",
  textarea: "Textarea",
  file: "File Upload",
};

// Default label suggested when a type is chosen (based on README examples)
const DEFAULT_LABELS: Record<FieldType, string> = {
  text: "Name",
  email: "Email",
  number: "Age",
  dropdown: "Branch",
  checkbox: "Skills",
  radio: "Gender",
  date: "Date of Birth",
  textarea: "Feedback",
  file: "Upload File",
};

function makeField(type: FieldType): BuilderField {
  return {
    key: crypto.randomUUID(),
    label: DEFAULT_LABELS[type],
    type,
    required: false,
    options: OPTION_FIELD_TYPES.includes(type) ? [""] : [],
    labelEdited: false,
  };
}

function newField(): BuilderField {
  return makeField("text");
}

export default function FormBuilder({
  initialForm,
}: {
  initialForm?: InitialForm;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialForm);
  const [title, setTitle] = useState(initialForm?.title ?? "");
  const [description, setDescription] = useState(
    initialForm?.description ?? ""
  );
  const [fields, setFields] = useState<BuilderField[]>(
    initialForm
      ? initialForm.fields.map((f) => ({
          key: crypto.randomUUID(),
          dbId: f.id,
          label: f.label,
          type: f.type,
          required: f.required,
          options: f.options,
          labelEdited: true, // existing labels are user-chosen — don't auto-replace
        }))
      : [newField()]
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Drag & drop: what's being dragged + where the drop indicator shows
  const dragItem = useRef<
    { kind: "new"; type: FieldType } | { kind: "move"; key: string } | null
  >(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function addFieldOfType(type: FieldType) {
    setFields((prev) => [...prev, makeField(type)]);
  }

  function handleDrop(targetIndex: number) {
    const item = dragItem.current;
    dragItem.current = null;
    setDragOverIndex(null);
    if (!item) return;

    setFields((prev) => {
      const list = [...prev];
      if (item.kind === "new") {
        list.splice(targetIndex, 0, makeField(item.type));
      } else {
        const from = list.findIndex((f) => f.key === item.key);
        if (from === -1) return prev;
        const [moved] = list.splice(from, 1);
        list.splice(from < targetIndex ? targetIndex - 1 : targetIndex, 0, moved);
      }
      return list;
    });
  }

  function updateField(key: string, patch: Partial<BuilderField>) {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...patch } : f))
    );
  }

  function changeLabel(key: string, value: string) {
    // Once the user types their own label, stop auto-filling it.
    // If they clear it, auto-fill resumes on the next type change.
    updateField(key, { label: value, labelEdited: value.trim().length > 0 });
  }

  function changeType(key: string, type: FieldType) {
    setFields((prev) =>
      prev.map((f) => {
        if (f.key !== key) return f;
        const usesOptions = OPTION_FIELD_TYPES.includes(type);
        return {
          ...f,
          type,
          // Auto-fill the label from the chosen type unless the user edited it
          label: f.labelEdited ? f.label : DEFAULT_LABELS[type],
          options: usesOptions ? (f.options.length ? f.options : [""]) : [],
        };
      })
    );
  }

  function removeField(key: string) {
    setFields((prev) => prev.filter((f) => f.key !== key));
  }

  function addOption(key: string) {
    const f = fields.find((x) => x.key === key);
    if (f) updateField(key, { options: [...f.options, ""] });
  }

  function updateOption(key: string, idx: number, value: string) {
    const f = fields.find((x) => x.key === key);
    if (!f) return;
    const options = [...f.options];
    options[idx] = value;
    updateField(key, { options });
  }

  function removeOption(key: string, idx: number) {
    const f = fields.find((x) => x.key === key);
    if (!f) return;
    updateField(key, { options: f.options.filter((_, i) => i !== idx) });
  }

  async function save(published: boolean) {
    setError("");

    // Client-side validation (the API validates too)
    if (!title.trim()) {
      setError("Please enter a form title.");
      return;
    }
    if (fields.length === 0) {
      setError("Add at least one field.");
      return;
    }
    for (const f of fields) {
      if (!f.label.trim()) {
        setError("Every field needs a label.");
        return;
      }
      if (
        OPTION_FIELD_TYPES.includes(f.type) &&
        f.options.filter((o) => o.trim()).length === 0
      ) {
        setError(`"${f.label}" needs at least one option.`);
        return;
      }
    }

    setSaving(true);
    try {
      const payloadFields = fields.map((f) => ({
        id: f.dbId, // undefined for new fields
        label: f.label.trim(),
        type: f.type,
        required: f.required,
        options: f.options.map((o) => o.trim()).filter(Boolean),
      }));

      const res = await fetch(
        isEdit ? `/api/forms/${initialForm!.id}` : "/api/forms",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            published,
            fields: payloadFields,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Top bar */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xs font-medium tracking-widest text-muted transition-colors hover:text-foreground"
        >
          ← DASHBOARD
        </Link>
        <div className="flex items-center gap-3">
          {isEdit ? (
            <button
              type="button"
              onClick={() => save(initialForm!.published)}
              disabled={saving}
              className="rounded-full bg-accent px-5 py-2.5 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-105 disabled:opacity-60"
            >
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => save(false)}
                disabled={saving}
                className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold tracking-widest transition-colors hover:border-foreground/40 disabled:opacity-60"
              >
                SAVE DRAFT
              </button>
              <button
                type="button"
                onClick={() => save(true)}
                disabled={saving}
                className="rounded-full bg-accent px-5 py-2.5 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-105 disabled:opacity-60"
              >
                PUBLISH
              </button>
            </>
          )}
        </div>
      </div>

      {/* Header with logo */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full border border-border shadow-[0_0_25px_rgba(255,255,255,0.15)]">
          <div className="h-2.5 w-2.5 rounded-full bg-accent" />
        </div>
        <h1 className="mt-4 text-xl font-bold tracking-[0.15em]">
          {isEdit ? "EDIT FORM" : "CREATE FORM"}
        </h1>
        <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted">
          Design your form
        </p>
      </div>

      {/* Form meta */}
      <div className="space-y-4 rounded-2xl border border-border bg-background/80 p-6 shadow-2xl backdrop-blur">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Form title"
          className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-muted/50"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Form description (optional)"
          rows={2}
          className="w-full resize-none bg-transparent text-sm text-muted outline-none placeholder:text-muted/50"
        />
      </div>

      {/* Builder: palette + form area */}
      <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Palette */}
        <div className="h-fit rounded-2xl border border-border bg-surface p-4 md:sticky md:top-6">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            Add Fields
          </div>
          <div className="space-y-2">
            {FIELD_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                draggable
                onDragStart={() => {
                  dragItem.current = { kind: "new", type: t };
                }}
                onClick={() => addFieldOfType(t)}
                className="flex w-full cursor-grab items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-xs transition-colors hover:border-foreground/40 active:cursor-grabbing"
              >
                <span className="text-muted">⠿</span>
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-muted">
            Drag a field into the form, or click to add.
          </p>
        </div>

        {/* Form area / drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(fields.length)}
          className="space-y-4"
        >
          {fields.length === 0 ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(0);
              }}
              onDrop={(e) => {
                e.stopPropagation();
                handleDrop(0);
              }}
              className={`grid min-h-60 place-items-center rounded-2xl border-2 border-dashed text-sm text-muted transition-colors ${
                dragOverIndex === 0
                  ? "border-foreground/60 bg-surface"
                  : "border-border"
              }`}
            >
              Drag a field here to start
            </div>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDrop(index);
                }}
                className={`rounded-2xl transition-shadow ${
                  dragOverIndex === index ? "ring-2 ring-foreground/40" : ""
                }`}
              >
                <FieldEditor
                  field={field}
                  index={index}
                  typeLabels={TYPE_LABELS}
                  dragHandle={
                    <span
                      draggable
                      onDragStart={() => {
                        dragItem.current = { kind: "move", key: field.key };
                      }}
                      title="Drag to reorder"
                      className="cursor-grab text-muted active:cursor-grabbing"
                    >
                      ⠿
                    </span>
                  }
                  onChangeLabel={(v) => changeLabel(field.key, v)}
                  onChangeType={(t) => changeType(field.key, t)}
                  onToggleRequired={() =>
                    updateField(field.key, { required: !field.required })
                  }
                  onRemove={() => removeField(field.key)}
                  onAddOption={() => addOption(field.key)}
                  onUpdateOption={(i, v) => updateOption(field.key, i, v)}
                  onRemoveOption={(i) => removeOption(field.key, i)}
                />
              </div>
            ))
          )}

          {/* Trailing drop area */}
          {fields.length > 0 && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(fields.length);
              }}
              onDrop={(e) => {
                e.stopPropagation();
                handleDrop(fields.length);
              }}
              className={`rounded-2xl border-2 border-dashed py-6 text-center text-xs text-muted transition-colors ${
                dragOverIndex === fields.length
                  ? "border-foreground/60 bg-surface"
                  : "border-border"
              }`}
            >
              Drop here to add at the end
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function FieldEditor({
  field,
  index,
  typeLabels,
  dragHandle,
  onChangeLabel,
  onChangeType,
  onToggleRequired,
  onRemove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: {
  field: BuilderField;
  index: number;
  typeLabels: Record<FieldType, string>;
  dragHandle?: React.ReactNode;
  onChangeLabel: (v: string) => void;
  onChangeType: (t: FieldType) => void;
  onToggleRequired: () => void;
  onRemove: () => void;
  onAddOption: () => void;
  onUpdateOption: (idx: number, v: string) => void;
  onRemoveOption: (idx: number) => void;
}) {
  const usesOptions = OPTION_FIELD_TYPES.includes(field.type);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted">
          {dragHandle}
          FIELD {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-400 transition-colors hover:text-red-300"
        >
          Remove
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <input
          value={field.label}
          onChange={(e) => onChangeLabel(e.target.value)}
          placeholder="Field label (e.g. Full Name)"
          className="h-10 rounded-lg border border-border bg-input px-3 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-foreground/50"
        />
        <select
          value={field.type}
          onChange={(e) => onChangeType(e.target.value as FieldType)}
          className="h-10 rounded-lg border border-border bg-input px-3 text-sm outline-none focus:border-foreground/50"
        >
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t} className="bg-background">
              {typeLabels[t]}
            </option>
          ))}
        </select>
      </div>

      {/* Options editor */}
      {usesOptions && (
        <div className="mt-4 space-y-2">
          <div className="text-xs text-muted">Options</div>
          {field.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={opt}
                onChange={(e) => onUpdateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="h-9 flex-1 rounded-lg border border-border bg-input px-3 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-foreground/50"
              />
              <button
                type="button"
                onClick={() => onRemoveOption(i)}
                className="px-2 text-muted transition-colors hover:text-red-400"
                aria-label="Remove option"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddOption}
            className="text-xs text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            + Add option
          </button>
        </div>
      )}

      {/* Required toggle */}
      <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={field.required}
          onChange={onToggleRequired}
          className="h-4 w-4 accent-foreground"
        />
        Required
      </label>
    </div>
  );
}
