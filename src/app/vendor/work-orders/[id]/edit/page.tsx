import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireVendor } from "@/lib/auth";
import { getVendorForUser, listVendorPickerData } from "@/lib/queries/vendor";
import { getWorkOrderById } from "@/lib/queries/work-orders";
import { PageHeader } from "@/components/ui/page-header";
import { mergeItemLines, mergeReturnLines } from "@/lib/utils";
import { VendorWorkOrderForm } from "../../vendor-work-order-form";

export default async function EditVendorWorkOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);
  if (!vendor) redirect("/vendor");

  const { id } = await params;
  const [{ workOrder, items, returns }, pickers] = await Promise.all([
    getWorkOrderById(id),
    listVendorPickerData(vendor.id),
  ]);

  if (!workOrder) notFound();
  if (workOrder.vendor_id !== vendor.id) redirect("/vendor/work-orders");
  if (workOrder.status !== "pending") redirect(`/vendor/work-orders/${id}`);
  if (!pickers.vendor) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/vendor/work-orders/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Work Order
        </Link>
      </div>
      <PageHeader title="Edit Work Order" />
      <VendorWorkOrderForm
        backHref={`/vendor/work-orders/${id}`}
        pickers={{
          customers: pickers.customers,
          items: pickers.items,
          returnItems: pickers.returnItems,
          drivers: pickers.drivers,
          blockedDates: pickers.blockedDates,
          vendor: pickers.vendor,
        }}
        initial={{
          id,
          customer_id: workOrder.customer_id,
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
