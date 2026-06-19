import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="w-full">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg tracking-wide">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            F
          </span>
          <span className="font-semibold">
            FORM <span className="text-muted">/</span> BUILDER
          </span>
        </Link>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-xs font-medium tracking-widest text-muted transition-colors hover:text-foreground"
          >
            LOGIN
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-accent px-5 py-2 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-105"
          >
            SIGN UP
          </Link>
        </div>
      </nav>
    </header>
  );
}
