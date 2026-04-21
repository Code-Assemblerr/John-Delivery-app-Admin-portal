import { createClient } from "@/lib/supabase/server";
import { requireVendor } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  Truck,
  ClipboardCheck,
  DollarSign,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function VendorDashboardPage() {
  const user = await requireVendor();
  const supabase = await createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vendor) {
    return (
      <div className="space-y-6">
        <PageHeader title="Welcome" description={user.email} />
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={ClipboardList}
              title="Vendor profile not linked"
              description="Your account is not linked to a vendor record. Please contact the admin."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const vendorId = vendor.id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: pendingCount },
    { count: shippedCount },
    { count: deliveredCount },
    recentResult,
    invoicesResult,
  ] = await Promise.all([
    supabase
      .from("work_orders")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", vendorId)
      .eq("status", "pending"),
    supabase
      .from("work_orders")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", vendorId)
      .eq("status", "shipped"),
    supabase
      .from("work_orders")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", vendorId)
      .eq("status", "delivered"),
    supabase
      .from("work_orders")
      .select(
        "id, status, delivery_date, created_at, customer:customers(name)",
      )
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("invoices")
      .select("total_amount, created_at, work_order:work_orders!inner(vendor_id)")
      .eq("work_order.vendor_id", vendorId)
      .gte("created_at", monthStart),
  ]);

  const recent = (recentResult.data ?? []) as any[];
  const monthRevenue = ((invoicesResult.data ?? []) as any[]).reduce(
    (sum, inv) => sum + Number(inv.total_amount ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${vendor.name}`}
        description="Manage your orders, invoices, and team at a glance."
        action={
          <Link href="/vendor/work-orders/new">
            <Button variant="gradient">
              <Plus className="h-4 w-4" />
              New Work Order
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending" value={pendingCount ?? 0} icon={Clock} tint="warning" />
        <StatCard label="In Transit" value={shippedCount ?? 0} icon={Truck} tint="info" />
        <StatCard
          label="Delivered"
          value={deliveredCount ?? 0}
          icon={ClipboardCheck}
          tint="success"
        />
        <StatCard
          label="This Month"
          value={formatCurrency(monthRevenue)}
          icon={DollarSign}
          tint="accent"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Work Orders</CardTitle>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Your latest orders
            </p>
          </div>
          <Link
            href="/vendor/work-orders"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            View all →
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No orders yet"
              description="Create your first work order to get started."
              action={
                <Link href="/vendor/work-orders/new">
                  <Button variant="gradient">
                    <Plus className="h-4 w-4" />
                    New Work Order
                  </Button>
                </Link>
              }
              className="py-10"
            />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {recent.map((o) => (
                <Link
                  key={o.id}
                  href={`/vendor/work-orders/${o.id}`}
                  className="flex items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-[var(--sidebar-item-hover)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[var(--foreground)]">
                      {o.customer?.name ?? "—"}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--foreground-subtle)]">
                      Delivery {formatDate(o.delivery_date)}
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
