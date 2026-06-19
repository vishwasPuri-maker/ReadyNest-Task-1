import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, authCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    // Same message for missing user and wrong password (don't leak which)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Block sign-in until the email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in.", needsVerification: true },
        { status: 403 }
      );
    }

    // Generate the JWT (per README, the token is created at login)
    const token = signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });

    // Store the token in an httpOnly cookie so the browser sends it automatically
    res.cookies.set(authCookie.name, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: authCookie.maxAge,
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
