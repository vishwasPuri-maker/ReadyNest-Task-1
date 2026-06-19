import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, generateCode } from "@/lib/email";

const CODE_TTL = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    // A verified account already exists → block
    if (existing && existing.emailVerified) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = generateCode();
    const verifyCodeExpiry = new Date(Date.now() + CODE_TTL);

    if (existing) {
      // Unverified account exists → refresh details + code, resend
      await prisma.user.update({
        where: { email },
        data: { name, password: hashedPassword, verifyCode: code, verifyCodeExpiry },
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          verifyCode: code,
          verifyCodeExpiry,
        },
      });
    }

    await sendVerificationEmail(email, code);

    return NextResponse.json({ ok: true, email }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
