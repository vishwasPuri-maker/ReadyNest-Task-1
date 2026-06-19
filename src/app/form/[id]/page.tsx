import { prisma } from "@/lib/prisma";
import PublicForm from "@/components/forms/PublicForm";
import type { FieldType } from "@/lib/fields";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const form = await prisma.form.findUnique({
    where: { id },
    include: { fields: { orderBy: { id: "asc" } } },
  });

  // Unpublished or missing forms are not publicly available
  if (!form || !form.published) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Form not available</h1>
        <p className="mt-2 text-sm text-muted">
          This form doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
      </div>
    );
  }

  return (
    <PublicForm
      form={{
        id: form.id,
        title: form.title,
        description: form.description,
        fields: form.fields.map((f) => ({
          id: f.id,
          label: f.label,
          type: f.type as FieldType,
          required: f.required,
          options: f.options,
        })),
      }}
    />
  );
}
