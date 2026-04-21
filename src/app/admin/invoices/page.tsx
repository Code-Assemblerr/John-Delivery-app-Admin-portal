import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { InvoicesManager } from "./invoices-manager";
import { MonthlyAggregateButton } from "./monthly-aggregate-button";

export default async function InvoicesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select(
      "*, work_order:work_orders(id, delivery_date, customer:customers(name), vendor:vendors(name))",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="All invoices across delivered work orders. Edit totals if needed."
        action={<MonthlyAggregateButton />}
      />
      <InvoicesManager data={(data as any[]) ?? []} />
    </div>
  );
}
