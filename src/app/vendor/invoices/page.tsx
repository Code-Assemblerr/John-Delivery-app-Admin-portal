import { requireVendor } from "@/lib/auth";
import { getVendorForUser } from "@/lib/queries/vendor";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";
import { VendorInvoicesList } from "./vendor-invoices-list";

export default async function VendorInvoicesPage() {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);

  if (!vendor) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoices" />
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={Receipt}
              title="Vendor profile not linked"
              description="Contact admin to link your account."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select(
      "id, total_amount, item_total, addon_total, return_total, distance_charge, created_at, work_order:work_orders!inner(id, delivery_date, vendor_id, customer:customers(name))",
    )
    .eq("work_order.vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description={`Billing for ${vendor.name}`}
      />
      <VendorInvoicesList data={(data as any[]) ?? []} />
    </div>
  );
}
