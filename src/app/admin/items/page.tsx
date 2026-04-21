import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ItemsManager } from "./items-manager";
import type { Item } from "@/types/database";

export default async function ItemsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("items").select("*").order("name");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Items"
        description="Catalog of deliverable items and their prices."
      />
      <ItemsManager data={(data as Item[]) ?? []} />
    </div>
  );
}
