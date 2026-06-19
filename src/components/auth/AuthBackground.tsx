// A blurred, dimmed version of the home page shown behind the auth cards.
export default function AuthBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
    >
      {/* Blurred home-page hero */}
      <div className="absolute inset-0 scale-105 blur-md">
        {/* Navbar */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 text-lg">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              F
            </span>
            <span className="font-semibold">
              FORM <span className="text-muted">/</span> BUILDER
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-widest text-muted">LOGIN</span>
            <span className="rounded-full bg-accent px-5 py-2 text-xs font-semibold tracking-widest text-accent-foreground">
              SIGN UP
            </span>
          </div>
        </div>

        {/* Centered hero */}
        <div className="flex min-h-[80vh] items-center justify-center px-6">
          <div className="max-w-2xl text-center">
            <h1 className="text-5xl font-bold leading-tight sm:text-7xl">
              Build Forms
              <br />
              Effortlessly
            </h1>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted">
              Create custom forms in minutes — add any field you need, publish
              with a single click, and share a link anyone can fill without
              signing up.
            </p>
          </div>
        </div>
      </div>

      {/* Dim overlay so the card stands out */}
      <div className="absolute inset-0 bg-black/70" />
    </div>
  );
}
