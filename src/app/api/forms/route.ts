import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { isFieldType, OPTION_FIELD_TYPES, type FieldType } from "@/lib/fields";

type IncomingField = {
  label?: unknown;
  type?: unknown;
  required?: unknown;
  options?: unknown;
};

// POST /api/forms — create a new form (with its fields) for the logged-in user
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: {
    title?: unknown;
    description?: unknown;
    published?: unknown;
    fields?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json(
      { error: "Form title is required." },
      { status: 400 }
    );
  }

  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;
  const published = body.published === true;

  const rawFields = Array.isArray(body.fields)
    ? (body.fields as IncomingField[])
    : [];

  // Validate & normalise each field
  const fields: {
    label: string;
    type: FieldType;
    required: boolean;
    options: string[];
  }[] = [];

  for (const f of rawFields) {
    const label = typeof f.label === "string" ? f.label.trim() : "";
    if (!label) {
      return NextResponse.json(
        { error: "Every field needs a label." },
        { status: 400 }
      );
    }
    if (!isFieldType(f.type)) {
      return NextResponse.json(
        { error: `Invalid field type: ${String(f.type)}` },
        { status: 400 }
      );
    }

    const usesOptions = OPTION_FIELD_TYPES.includes(f.type);
    const options =
      usesOptions && Array.isArray(f.options)
        ? f.options
            .map((o) => (typeof o === "string" ? o.trim() : ""))
            .filter(Boolean)
        : [];

    if (usesOptions && options.length === 0) {
      return NextResponse.json(
        { error: `"${label}" needs at least one option.` },
        { status: 400 }
      );
    }

    fields.push({
      label,
      type: f.type,
      required: f.required === true,
      options,
    });
  }

  const form = await prisma.form.create({
    data: {
      title,
      description,
      published,
      userId,
      fields: { create: fields },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: form.id }, { status: 201 });
}
