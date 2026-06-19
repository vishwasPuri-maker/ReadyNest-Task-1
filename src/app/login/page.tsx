import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/session";
import AuthCard from "@/components/auth/AuthCard";

export default async function LoginPage() {
  // Only redirect if a real (existing) user is logged in — avoids a
  // login/dashboard loop when the cookie points to a deleted user.
  if (await isLoggedIn()) {
    redirect("/dashboard");
  }
  return <AuthCard mode="signin" />;
}
