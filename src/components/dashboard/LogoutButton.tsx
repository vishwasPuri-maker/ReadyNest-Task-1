"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full rounded-lg border border-border px-4 py-2.5 text-xs font-medium tracking-widest text-muted transition-colors hover:border-foreground/40 hover:text-foreground"
    >
      LOG OUT
    </button>
  );
}
