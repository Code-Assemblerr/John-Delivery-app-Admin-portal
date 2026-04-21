import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { VendorForm } from "../vendor-form";

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const [vendorRes, usersRes] = await Promise.all([
    supabase.from("vendors").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("users")
      .select("id, name, email")
      .eq("role", "vendor")
      .order("name"),
  ]);

  const vendor = vendorRes.data;
  if (!vendor) notFound();

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
      <PageHeader title={vendor.name} description={vendor.address} />
      <VendorForm
        vendorUsers={usersRes.data ?? []}
        initial={{
          id: vendor.id,
          name: vendor.name,
          address: vendor.address,
          distance_free_limit: Number(vendor.distance_free_limit),
          distance_rate: Number(vendor.distance_rate),
          user_id: vendor.user_id,
        }}
      />
    </div>
  );
}
