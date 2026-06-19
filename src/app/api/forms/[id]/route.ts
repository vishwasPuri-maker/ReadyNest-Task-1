import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { isFieldType, OPTION_FIELD_TYPES, type FieldType } from "@/lib/fields";

type IncomingField = {
  id?: unknown;
  label?: unknown;
  type?: unknown;
  required?: unknown;
  options?: unknown;
};

// PUT /api/forms/[id] — full update (title, description, published, fields)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.form.findUnique({
    where: { id },
    include: { fields: { select: { id: true } } },
  });

  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
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

  const existingIds = new Set(existing.fields.map((f) => f.id));
  const toUpdate: {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    options: string[];
  }[] = [];
  const toCreate: {
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

    const data = { label, type: f.type, required: f.required === true, options };
    // Keep the same id for existing fields so stored responses still map
    if (typeof f.id === "string" && existingIds.has(f.id)) {
      toUpdate.push({ id: f.id, ...data });
    } else {
      toCreate.push(data);
    }
  }

  const keepIds = toUpdate.map((f) => f.id);

  await prisma.form.update({
    where: { id },
    data: {
      title,
      description,
      published,
      fields: {
        deleteMany: { id: { notIn: keepIds } }, // remove fields the user deleted
        update: toUpdate.map((f) => ({
          where: { id: f.id },
          data: {
            label: f.label,
            type: f.type,
            required: f.required,
            options: f.options,
          },
        })),
        create: toCreate,
      },
    },
  });

  return NextResponse.json({ id });
}

// PATCH /api/forms/[id] — update a form the user owns (e.g. publish / unpublish)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const form = await prisma.form.findUnique({ where: { id } });

  if (!form || form.userId !== userId) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  let body: { published?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data: { published?: boolean } = {};
  if (typeof body.published === "boolean") {
    data.published = body.published;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const updated = await prisma.form.update({
    where: { id },
    data,
    select: { id: true, published: true },
  });

  return NextResponse.json(updated);
}

// DELETE /api/forms/[id] — remove a form the user owns
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const form = await prisma.form.findUnique({ where: { id } });

  if (!form || form.userId !== userId) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  // Fields & responses cascade-delete via the schema relations
  await prisma.form.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
