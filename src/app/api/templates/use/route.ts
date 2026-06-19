import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { getTemplate } from "@/lib/templates";

// POST /api/templates/use { templateId }
// Clones a template into a new draft form for the user.
// Premium templates require a prior purchase.
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { templateId } = await request.json();
  const template = getTemplate(templateId);
  if (!template) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  // Premium → must be unlocked first
  if (template.premium) {
    const purchase = await prisma.templatePurchase.findUnique({
      where: { userId_templateId: { userId, templateId } },
    });
    if (!purchase) {
      return NextResponse.json(
        { error: "This is a premium template. Please unlock it first." },
        { status: 402 }
      );
    }
  }

  const form = await prisma.form.create({
    data: {
      title: template.title,
      description: template.description,
      published: false,
      userId,
      fields: {
        create: template.fields.map((f) => ({
          label: f.label,
          type: f.type,
          required: f.required,
          options: f.options ?? [],
        })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: form.id }, { status: 201 });
}
