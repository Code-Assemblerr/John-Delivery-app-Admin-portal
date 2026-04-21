import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { AddonsManager } from "./addons-manager";
import type { Addon } from "@/types/database";

export default async function AddonsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("addons").select("*").order("name");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add-ons"
        description="Extra charges drivers can apply during delivery (fixed or quantity-based)."
      />
      <AddonsManager data={(data as Addon[]) ?? []} />
    </div>
  );
}
