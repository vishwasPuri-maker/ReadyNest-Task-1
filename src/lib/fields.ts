// The 8 field types supported by the form builder (per README).
export const FIELD_TYPES = [
  "text",
  "email",
  "number",
  "dropdown",
  "checkbox",
  "radio",
  "date",
  "textarea",
  "file",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

// Field types that use a list of options.
export const OPTION_FIELD_TYPES: FieldType[] = ["dropdown", "checkbox", "radio"];

export function isFieldType(value: unknown): value is FieldType {
  return (
    typeof value === "string" && FIELD_TYPES.includes(value as FieldType)
  );
}
