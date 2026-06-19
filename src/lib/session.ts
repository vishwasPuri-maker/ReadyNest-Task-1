import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken, authCookie } from "@/lib/auth";

// Returns the current user's id from the JWT cookie, or null.
// Use in API routes (returns null instead of redirecting).
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookie.name)?.value;
  const payload = token ? verifyToken(token) : null;
  return payload?.userId ?? null;
}

// True only if the token is valid AND the user still exists in the DB.
// Used by /login and /signup so a stale cookie (deleted user) doesn't
// cause a redirect loop with /dashboard.
export async function isLoggedIn(): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  return Boolean(user);
}

// Returns the logged-in user or redirects to /login.
// Use in any server component / route that requires authentication.
export async function requireUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookie.name)?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
}
