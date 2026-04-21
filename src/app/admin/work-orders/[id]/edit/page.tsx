import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import {
  getWorkOrderById,
  listPickerData,
} from "@/lib/queries/work-orders";
import { PageHeader } from "@/components/ui/page-header";
import { mergeItemLines, mergeReturnLines } from "@/lib/utils";
import { WorkOrderForm } from "../../work-order-form";

export default async function EditWorkOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [{ workOrder, items, returns }, pickers] = await Promise.all([
    getWorkOrderById(id),
    listPickerData(),
  ]);

  if (!workOrder) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/work-orders/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Work Order
        </Link>
      </div>
      <PageHeader
        title="Edit Work Order"
        description={`#${id.slice(0, 8)} · ${workOrder.customer?.name ?? ""}`}
      />
      <WorkOrderForm
        backHref={`/admin/work-orders/${id}`}
        pickers={pickers}
        initial={{
          id,
          customer_id: workOrder.customer_id,
          vendor_id: workOrder.vendor_id,
          driver_id: workOrder.driver_id,
          delivery_date: workOrder.delivery_date,
          notes: workOrder.notes ?? "",
          distance: workOrder.distance,
          items: mergeItemLines(
            items.map((i) => ({
              item_id: i.item_id,
              quantity: i.quantity,
              price_snapshot: Number(i.price_snapshot),
            })),
          ),
          returns: mergeReturnLines(
            returns.map((r) => ({
              return_item_id: r.return_item_id,
              quantity: r.quantity,
            })),
          ),
        }}
      />
    </div>
  );
}
