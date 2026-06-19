import Link from "next/link";
import LogoutButton from "./LogoutButton";
import LiveUpdates from "./LiveUpdates";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "My Forms", href: "/dashboard", icon: "▤" },
  { label: "Templates", href: "/dashboard/templates", icon: "◫" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "▥" },
  { label: "Create Form", href: "/forms/new", icon: "＋" },
];

export default function Sidebar({
  user,
}: {
  user: { name: string; email: string };
}) {
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <aside className="flex w-60 shrink-0 flex-col justify-between border-r border-border px-5 py-6">
      {/* Background polling for live data + new-response toasts (no bell) */}
      <LiveUpdates />
      <div>
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 px-1">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            F
          </span>
          <span className="text-sm font-semibold tracking-wide">
            FORM <span className="text-muted">/</span> BUILDER
          </span>
        </Link>

        {/* Nav */}
        <nav className="mt-10 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* User + logout */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {initial}
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{user.name}</div>
            <div className="truncate text-xs text-muted">{user.email}</div>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
