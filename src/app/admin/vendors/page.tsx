import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { VendorsTable } from "./vendors-table";
import type { Vendor } from "@/types/database";

export default async function VendorsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("vendors").select("*").order("name");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Suppliers with distance-based pricing configuration."
        action={
          <Link href="/admin/vendors/new">
            <Button variant="gradient">
              <Plus className="h-4 w-4" />
              New Vendor
            </Button>
          </Link>
        }
      />
      <VendorsTable data={(data as Vendor[]) ?? []} />
    </div>
  );
}
