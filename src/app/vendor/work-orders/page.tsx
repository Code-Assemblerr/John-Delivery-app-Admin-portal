import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { requireVendor } from "@/lib/auth";
import { getVendorForUser, listVendorWorkOrders } from "@/lib/queries/vendor";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { VendorWorkOrdersTable } from "./vendor-work-orders-table";
import type { WorkOrderWithRelations } from "@/types/database";

export default async function VendorWorkOrdersPage() {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);

  if (!vendor) {
    return (
      <div className="space-y-6">
        <PageHeader title="Work Orders" />
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={ClipboardList}
              title="Vendor profile not linked"
              description="Contact the admin to link your account to a vendor record."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const workOrders = await listVendorWorkOrders(vendor.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Orders"
        description={`All orders for ${vendor.name}`}
        action={
          <Link href="/vendor/work-orders/new">
            <Button variant="gradient">
              <Plus className="h-4 w-4" />
              New Work Order
            </Button>
          </Link>
        }
      />
      <VendorWorkOrdersTable
        data={workOrders as unknown as WorkOrderWithRelations[]}
      />
    </div>
  );
}
