import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { requireVendor } from "@/lib/auth";
import { getVendorForUser, listVendorPickerData } from "@/lib/queries/vendor";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { VendorWorkOrderForm } from "../vendor-work-order-form";

export default async function NewVendorWorkOrderPage() {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);

  if (!vendor) {
    return (
      <div className="space-y-6">
        <PageHeader title="New Work Order" />
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

  const pickers = await listVendorPickerData(vendor.id);
  if (!pickers.vendor) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/vendor/work-orders"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Work Orders
        </Link>
      </div>
      <PageHeader
        title="New Work Order"
        description="Create a delivery order for your customers."
      />
      <VendorWorkOrderForm
        pickers={{
          customers: pickers.customers,
          items: pickers.items,
          returnItems: pickers.returnItems,
          drivers: pickers.drivers,
          blockedDates: pickers.blockedDates,
          vendor: pickers.vendor,
        }}
      />
    </div>
  );
}
