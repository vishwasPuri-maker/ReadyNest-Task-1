import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import Sidebar from "@/components/dashboard/Sidebar";
import TemplatesGallery from "@/components/dashboard/TemplatesGallery";
import { TEMPLATES } from "@/lib/templates";

export default async function TemplatesPage() {
  const user = await requireUser();

  const purchases = await prisma.templatePurchase.findMany({
    where: { userId: user.id },
    select: { templateId: true },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-1">
        <TemplatesGallery
          templates={TEMPLATES}
          purchasedIds={purchases.map((p) => p.templateId)}
        />
      </div>
    </div>
  );
}
