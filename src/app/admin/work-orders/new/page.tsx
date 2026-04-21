import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listPickerData } from "@/lib/queries/work-orders";
import { PageHeader } from "@/components/ui/page-header";
import { WorkOrderForm } from "../work-order-form";

export default async function NewWorkOrderPage() {
  await requireAdmin();
  const pickers = await listPickerData();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/work-orders"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Work Orders
        </Link>
      </div>
      <PageHeader
        title="New Work Order"
        description="Create a delivery order with items, returns, and distance pricing."
      />
      <WorkOrderForm pickers={pickers} />
    </div>
  );
}
