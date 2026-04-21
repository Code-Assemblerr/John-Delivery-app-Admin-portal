import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { BlockedDatesManager } from "./blocked-dates-manager";
import type { BlockedDate } from "@/types/database";

export default async function BlockedDatesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocked_dates")
    .select("*")
    .order("date");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blocked Dates"
        description="Dates on which no deliveries can be scheduled."
      />
      <BlockedDatesManager data={(data as BlockedDate[]) ?? []} />
    </div>
  );
}
