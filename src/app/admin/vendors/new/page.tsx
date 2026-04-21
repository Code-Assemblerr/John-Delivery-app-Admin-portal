import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { VendorForm } from "../vendor-form";

export default async function NewVendorPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, name, email")
    .eq("role", "vendor")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/vendors"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Vendors
        </Link>
      </div>
      <PageHeader title="New Vendor" />
      <VendorForm vendorUsers={users ?? []} />
    </div>
  );
}
