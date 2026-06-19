// Instant skeleton shown while a dashboard page's data loads (via loading.tsx).
export default function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border px-5 py-6 md:flex">
        <div className="h-7 w-32 animate-pulse rounded bg-foreground/10" />
        <div className="mt-10 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-lg bg-foreground/10"
            />
          ))}
        </div>
      </aside>

      {/* Content skeleton */}
      <div className="flex-1">
        <header className="border-b border-border px-8 py-5">
          <div className="h-5 w-40 animate-pulse rounded bg-foreground/10" />
          <div className="mt-2 h-3 w-64 animate-pulse rounded bg-foreground/10" />
        </header>
        <main className="px-8 py-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-foreground/10"
              />
            ))}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl bg-foreground/10"
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
