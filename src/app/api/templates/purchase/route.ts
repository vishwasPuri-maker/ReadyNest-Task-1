import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { getTemplate } from "@/lib/templates";

// POST /api/templates/purchase { templateId }
//
// NOTE: This is currently a PLACEHOLDER unlock. It records the purchase
// without charging. To make it real, integrate a payment gateway
// (Razorpay/Stripe): create an order here, verify the payment on a callback,
// and only then create the TemplatePurchase record.
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { templateId } = await request.json();
  const template = getTemplate(templateId);
  if (!template || !template.premium) {
    return NextResponse.json(
      { error: "Invalid premium template." },
      { status: 400 }
    );
  }

  // Record the unlock (idempotent)
  await prisma.templatePurchase.upsert({
    where: { userId_templateId: { userId, templateId } },
    create: { userId, templateId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
