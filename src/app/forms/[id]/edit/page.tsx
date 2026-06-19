import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import FormBuilder from "@/components/forms/FormBuilder";
import type { FieldType } from "@/lib/fields";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const form = await prisma.form.findUnique({
    where: { id },
    include: { fields: { orderBy: { id: "asc" } } },
  });

  // Only the owner can edit
  if (!form || form.userId !== user.id) {
    notFound();
  }

  return (
    <FormBuilder
      initialForm={{
        id: form.id,
        title: form.title,
        description: form.description,
        published: form.published,
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
