import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { CustomersTable } from "./customers-table";
import type { Customer } from "@/types/database";

export default async function CustomersPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Directory of delivery recipients."
        action={
          <Link href="/admin/customers/new">
            <Button variant="gradient">
              <Plus className="h-4 w-4" />
              New Customer
            </Button>
          </Link>
        }
      />
      <CustomersTable data={(data as Customer[]) ?? []} />
    </div>
  );
}
