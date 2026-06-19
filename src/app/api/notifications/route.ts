import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

// GET /api/notifications — recent responses across the user's forms.
// The client polls this to live-update counts and show new-response toasts.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const recent = await prisma.response.findMany({
    where: { form: { userId } },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      createdAt: true,
      formId: true,
      form: { select: { title: true } },
    },
  });

  return NextResponse.json({
    recent: recent.map((r) => ({
      id: r.id,
      formId: r.formId,
      formTitle: r.form.title,
      createdAt: r.createdAt,
    })),
  });
}
