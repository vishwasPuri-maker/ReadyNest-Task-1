import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import Sidebar from "@/components/dashboard/Sidebar";
import { DonutChart, FormBars } from "@/components/dashboard/Charts";

function pct(fills: number, views: number): number {
  if (views === 0) return 0;
  return Math.round((fills / views) * 100);
}

export default async function AnalyticsPage() {
  const user = await requireUser();

  const forms = await prisma.form.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { responses: true } } },
  });

  const totalViews = forms.reduce((s, f) => s + f.views, 0);
  const totalFills = forms.reduce((s, f) => s + f._count.responses, 0);
  const overallConversion = pct(totalFills, totalViews);
  const maxViews = Math.max(1, ...forms.map((f) => f.views));

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border px-8 py-5">
          <div>
            <h1 className="text-lg font-semibold">Analytics</h1>
            <p className="text-xs text-muted">
              Views, fills and conversion across your forms
            </p>
          </div>
        </header>

        <main className="animate-fade-up px-8 py-8">
          {/* Overview: donut + totals */}
          <section className="grid gap-4 lg:grid-cols-3">
            {/* Conversion donut */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-6">
              <div className="mb-4 self-start text-[10px] font-semibold uppercase tracking-wide text-muted">
                Conversion Rate
              </div>
              <DonutChart percentage={overallConversion} />
              <div className="mt-5 flex items-center gap-5 text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                  Filled
                </span>
                <span className="flex items-center gap-2 text-muted">
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
                  Not filled
                </span>
              </div>
            </div>

            {/* Totals */}
            <div className="grid gap-4 lg:col-span-2">
              <StatBig label="Total Views" value={totalViews} />
              <StatBig label="Total Fills" value={totalFills} />
            </div>
          </section>

          {/* Per-form bars */}
          <section className="mt-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              By Form
            </h2>

            {forms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
                No forms yet. Create and publish a form to start collecting
                analytics.
              </div>
            ) : (
              <div className="space-y-3">
                {forms.map((f) => (
                  <FormBars
                    key={f.id}
                    title={f.title}
                    published={f.published}
                    views={f.views}
                    fills={f._count.responses}
                    conversion={pct(f._count.responses, f.views)}
                    max={maxViews}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function StatBig({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-6">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="text-4xl font-bold leading-none">{value}</div>
    </div>
  );
}
