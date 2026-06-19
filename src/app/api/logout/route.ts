import { NextResponse } from "next/server";
import { authCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Clear the auth cookie
  res.cookies.set(authCookie.name, "", { path: "/", maxAge: 0 });
  return res;
}
