import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/forms/[id]/view — count a view of a published form (public)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await prisma.form.updateMany({
    where: { id, published: true },
    data: { views: { increment: 1 } },
  });

  return NextResponse.json({ ok: result.count > 0 });
}
