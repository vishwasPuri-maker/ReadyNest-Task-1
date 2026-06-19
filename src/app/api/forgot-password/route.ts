import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendResetEmail } from "@/lib/email";

const TOKEN_TTL = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Only send if a verified account exists — but always return ok
    // so we don't reveal which emails are registered.
    if (user && user.emailVerified) {
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.user.update({
        where: { email },
        data: {
          resetToken: token,
          resetTokenExpiry: new Date(Date.now() + TOKEN_TTL),
        },
      });

      // Build the reset link from the incoming request's origin
      const origin = new URL(request.url).origin;
      await sendResetEmail(email, `${origin}/reset-password/${token}`);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
