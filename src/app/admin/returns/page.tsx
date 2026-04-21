import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ReturnsManager } from "./returns-manager";
import type { ReturnItem } from "@/types/database";

export default async function ReturnsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("return_items").select("*").order("name");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Return Items"
        description="Items drivers can collect on delivery (e.g., old mattresses, packaging)."
      />
      <ReturnsManager data={(data as ReturnItem[]) ?? []} />
    </div>
  );
}
