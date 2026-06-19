import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// POST /api/forms/[id]/responses — public submission (no login required)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Only published forms can receive responses
  const form = await prisma.form.findUnique({
    where: { id },
    include: { fields: true },
  });

  if (!form || !form.published) {
    return NextResponse.json(
      { error: "This form is not available." },
      { status: 404 }
    );
  }

  let body: { answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const answers =
    body.answers && typeof body.answers === "object"
      ? (body.answers as Record<string, unknown>)
      : {};

  // Validate required fields have a value
  for (const field of form.fields) {
    if (!field.required) continue;
    const value = answers[field.id];
    const empty =
      value == null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0);
    if (empty) {
      return NextResponse.json(
        { error: `"${field.label}" is required.` },
        { status: 400 }
      );
    }
  }

  await prisma.response.create({
    data: { formId: id, answers: answers as Prisma.InputJsonValue },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
