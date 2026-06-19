import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/verify-email — confirm the 6-digit code from signup
export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified) {
      return NextResponse.json(
        { error: "Invalid or already verified account." },
        { status: 400 }
      );
    }

    if (
      user.verifyCode !== code ||
      !user.verifyCodeExpiry ||
      user.verifyCodeExpiry < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired code." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true, verifyCode: null, verifyCodeExpiry: null },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
