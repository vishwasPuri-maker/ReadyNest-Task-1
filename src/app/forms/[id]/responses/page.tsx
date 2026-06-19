import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import ResponsesTable from "@/components/forms/ResponsesTable";
import type { FieldType } from "@/lib/fields";

export default async function ResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      fields: { orderBy: { id: "asc" } },
      responses: { orderBy: { createdAt: "desc" } },
    },
  });

  // Only the owner can view responses
  if (!form || form.userId !== user.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-xs font-medium tracking-widest text-muted transition-colors hover:text-foreground"
        >
          ← DASHBOARD
        </Link>
        <h1 className="mt-3 text-2xl font-bold">{form.title}</h1>
      </div>

      {form.responses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
          No responses yet. Share your form link to start collecting responses.
        </div>
      ) : (
        <ResponsesTable
          title={form.title}
          fields={form.fields.map((f) => ({
            id: f.id,
            label: f.label,
            type: f.type as FieldType,
            options: f.options,
          }))}
          responses={form.responses.map((r) => ({
            id: r.id,
            createdAt: r.createdAt.toISOString(),
            answers: (r.answers ?? {}) as Record<string, unknown>,
          }))}
        />
      )}
    </div>
  );
}
