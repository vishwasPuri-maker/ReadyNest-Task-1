import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/session";
import AuthCard from "@/components/auth/AuthCard";

export default async function SignupPage() {
  // Only redirect if a real (existing) user is logged in — avoids a loop
  // when the cookie points to a deleted user.
  if (await isLoggedIn()) {
    redirect("/dashboard");
  }
  return <AuthCard mode="signup" />;
}
