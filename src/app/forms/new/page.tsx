import { requireUser } from "@/lib/session";
import FormBuilder from "@/components/forms/FormBuilder";

export default async function NewFormPage() {
  await requireUser();
  return <FormBuilder />;
}
