import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listWorkOrders } from "@/lib/queries/work-orders";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WorkOrdersTable } from "./work-orders-table";

export default async function WorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;

  const workOrders = await listWorkOrders({
    status:
      status === "pending" || status === "shipped" || status === "delivered"
        ? status
        : undefined,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Orders"
        description="All delivery orders across customers and vendors."
        action={
          <Link href="/admin/work-orders/new">
            <Button variant="gradient">
              <Plus className="h-4 w-4" />
              New Work Order
            </Button>
          </Link>
        }
      />
      <WorkOrdersTable data={workOrders} activeStatus={status} />
    </div>
  );
}
