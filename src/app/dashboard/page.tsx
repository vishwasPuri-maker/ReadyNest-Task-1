import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import Sidebar from "@/components/dashboard/Sidebar";
import FormCard from "@/components/dashboard/FormCard";

export default async function DashboardPage() {
  const user = await requireUser();

  const forms = await prisma.form.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { responses: true } } },
  });

  const totalResponses = forms.reduce((sum, f) => sum + f._count.responses, 0);
  const publishedCount = forms.filter((f) => f.published).length;

  const draftCount = forms.length - publishedCount;
  const stats = [
    {
      label: "Total Forms",
      value: forms.length,
      hint: `${draftCount} draft${draftCount === 1 ? "" : "s"}`,
    },
    {
      label: "Published",
      value: publishedCount,
      hint: "Live & accepting responses",
    },
    {
      label: "Total Responses",
      value: totalResponses,
      hint: "Across all your forms",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />

      <div className="flex-1">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border px-8 py-5">
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-xs text-muted">
              Welcome back, {user.name} — here&apos;s how your forms are doing.
            </p>
          </div>
          <Link
            href="/forms/new"
            className="rounded-full bg-accent px-5 py-2.5 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-105"
          >
            ＋ CREATE FORM
          </Link>
        </header>

        <main className="animate-fade-up px-8 py-8">
          {/* Overview */}
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Overview
          </div>

          {/* Stats — unified strip with dividers */}
          <section className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {stats.map((s) => (
                <div key={s.label} className="p-6">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {s.label}
                  </div>
                  <div className="mt-3 text-4xl font-bold leading-none">
                    {s.value}
                  </div>
                  <div className="mt-2 text-xs text-muted">{s.hint}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Forms */}
          <section className="mt-10">
            <div className="mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Your Forms
              </h2>
              <p className="mt-1 text-xs text-muted">
                Create, publish and share forms — then track every response in
                one place.
              </p>
            </div>

            {forms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center">
                <p className="text-sm text-muted">
                  You haven&apos;t created any forms yet.
                </p>
                <Link
                  href="/forms/new"
                  className="mt-5 inline-block rounded-full bg-accent px-6 py-2.5 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-105"
                >
                  CREATE YOUR FIRST FORM
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {forms.map((f) => (
                  <FormCard
                    key={f.id}
                    form={{
                      id: f.id,
                      title: f.title,
                      description: f.description,
                      published: f.published,
                      responseCount: f._count.responses,
                    }}
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
