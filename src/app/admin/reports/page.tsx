import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: invoicesData } = await supabase
    .from("invoices")
    .select(
      "id, total_amount, item_total, addon_total, return_total, distance_charge, created_at, work_order:work_orders(delivery_date, customer:customers(name), vendor:vendors(name), status)",
    )
    .order("created_at", { ascending: false })
    .limit(5000);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Revenue analytics and exports across the entire delivery operation."
      />
      <ReportsClient invoices={(invoicesData as any[]) ?? []} />
    </div>
  );
}
