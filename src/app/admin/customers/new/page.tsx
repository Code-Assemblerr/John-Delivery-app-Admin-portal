import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { CustomerForm } from "../customer-form";

export default async function NewCustomerPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Customers
        </Link>
      </div>
      <PageHeader title="New Customer" />
      <CustomerForm />
    </div>
  );
}
