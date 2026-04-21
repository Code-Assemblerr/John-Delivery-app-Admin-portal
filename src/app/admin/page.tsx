import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Users,
  Building2,
  Package,
  ClipboardCheck,
  Clock,
  DollarSign,
  Truck,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [
    { count: customerCount },
    { count: vendorCount },
    { count: itemCount },
    { count: pendingCount },
    { count: shippedCount },
    { count: deliveredCount },
    recentOrdersResult,
    invoicesResult,
  ] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("vendors").select("*", { count: "exact", head: true }),
    supabase.from("items").select("*", { count: "exact", head: true }),
    supabase
      .from("work_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("work_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "shipped"),
    supabase
      .from("work_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "delivered"),
    supabase
      .from("work_orders")
      .select(
        "id, status, delivery_date, created_at, customer:customers(name), vendor:vendors(name)",
      )
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("invoices")
      .select("total_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const recentOrders = (recentOrdersResult.data ?? []) as any[];
  const invoices = (invoicesResult.data ?? []) as {
    total_amount: number;
    created_at: string;
  }[];

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + Number(inv.total_amount ?? 0),
    0,
  );

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const monthRevenue = invoices
    .filter((inv) => new Date(inv.created_at) >= thisMonth)
    .reduce((sum, inv) => sum + Number(inv.total_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Operations overview across customers, vendors, and work orders."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Customers"
          value={customerCount ?? 0}
          icon={Users}
          tint="info"
        />
        <StatCard
          label="Vendors"
          value={vendorCount ?? 0}
          icon={Building2}
          tint="success"
        />
        <StatCard
          label="Catalog Items"
          value={itemCount ?? 0}
          icon={Package}
          tint="accent"
        />
        <StatCard
          label="This Month Revenue"
          value={formatCurrency(monthRevenue)}
          icon={DollarSign}
          tint="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Pending"
          value={pendingCount ?? 0}
          icon={Clock}
          tint="warning"
        />
        <StatCard
          label="In Transit"
          value={shippedCount ?? 0}
          icon={Truck}
          tint="info"
        />
        <StatCard
          label="Delivered"
          value={deliveredCount ?? 0}
          icon={ClipboardCheck}
          tint="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Work Orders</CardTitle>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Latest orders across all vendors
              </p>
            </div>
            <Link
              href="/admin/work-orders"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No work orders yet"
                description="Create your first work order to see it here."
                className="py-10"
              />
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {recentOrders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/work-orders/${o.id}`}
                    className="flex items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-[var(--sidebar-item-hover)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-[var(--foreground)]">
                          {o.customer?.name ?? "—"}
                        </span>
                        <span className="text-[var(--foreground-subtle)]">•</span>
                        <span className="truncate text-sm text-[var(--foreground-muted)]">
                          {o.vendor?.name ?? "—"}
                        </span>
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

        <Card>
          <CardHeader>
            <CardTitle>Revenue (All-time)</CardTitle>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Based on generated invoices
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-subtle)]">
                  Total
                </div>
                <div className="tabular-nums text-3xl font-bold text-gradient-accent">
                  {formatCurrency(totalRevenue)}
                </div>
              </div>
              <div className="h-px bg-[var(--border)]" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-subtle)]">
                  This Month
                </div>
                <div className="tabular-nums text-2xl font-semibold text-[var(--foreground)]">
                  {formatCurrency(monthRevenue)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-subtle)]">
                  Invoices
                </div>
                <div className="tabular-nums text-2xl font-semibold text-[var(--foreground)]">
                  {invoices.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
