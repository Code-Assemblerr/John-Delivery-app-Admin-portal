"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Download, TrendingUp, Users, Building2, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv";

interface Invoice {
  id: string;
  total_amount: number;
  item_total: number;
  addon_total: number;
  return_total: number;
  distance_charge: number;
  created_at: string;
  work_order: {
    delivery_date: string;
    customer: { name: string } | null;
    vendor: { name: string } | null;
    status: string;
  } | null;
}

export function ReportsClient({ invoices }: { invoices: Invoice[] }) {
  const monthly = React.useMemo(() => {
    const map = new Map<string, { month: string; total: number; orders: number }>();
    for (const inv of invoices) {
      const d = new Date(inv.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      const existing = map.get(key) ?? { month: label, total: 0, orders: 0 };
      existing.total += Number(inv.total_amount ?? 0);
      existing.orders += 1;
      map.set(key, existing);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([, v]) => v);
  }, [invoices]);

  const byVendor = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of invoices) {
      const name = inv.work_order?.vendor?.name;
      if (!name) continue;
      map.set(name, (map.get(name) ?? 0) + Number(inv.total_amount ?? 0));
    }
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [invoices]);

  const byCustomer = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of invoices) {
      const name = inv.work_order?.customer?.name;
      if (!name) continue;
      map.set(name, (map.get(name) ?? 0) + Number(inv.total_amount ?? 0));
    }
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [invoices]);

  const totalRevenue = invoices.reduce(
    (s, i) => s + Number(i.total_amount ?? 0),
    0,
  );
  const avgInvoice = invoices.length > 0 ? totalRevenue / invoices.length : 0;

  function exportAll() {
    downloadCsv(
      `invoices-${new Date().toISOString().slice(0, 10)}.csv`,
      invoices.map((inv) => ({
        id: inv.id,
        customer: inv.work_order?.customer?.name ?? "",
        vendor: inv.work_order?.vendor?.name ?? "",
        delivery_date: inv.work_order?.delivery_date ?? "",
        status: inv.work_order?.status ?? "",
        item_total: inv.item_total,
        addon_total: inv.addon_total,
        return_total: inv.return_total,
        distance_charge: inv.distance_charge,
        total_amount: inv.total_amount,
        created_at: inv.created_at,
      })),
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          tint="success"
        />
        <StatCard
          label="Invoices"
          value={invoices.length}
          icon={TrendingUp}
          tint="accent"
        />
        <StatCard
          label="Avg Invoice"
          value={formatCurrency(avgInvoice)}
          icon={DollarSign}
          tint="info"
        />
        <StatCard
          label="Active Months"
          value={monthly.length}
          icon={TrendingUp}
          tint="warning"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Revenue by Month</CardTitle>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Invoice totals aggregated per month
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportAll}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {monthly.length === 0 ? (
            <div className="py-16 text-center text-sm text-[var(--foreground-muted)]">
              No revenue data yet.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--foreground-muted)"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--foreground-muted)"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--panel-elevated)",
                      border: "1px solid var(--border-strong)",
                      borderRadius: 8,
                      color: "var(--foreground)",
                    }}
                    formatter={(v: any) => formatCurrency(Number(v))}
                    cursor={{ fill: "var(--sidebar-item-hover)" }}
                  />
                  <Bar
                    dataKey="total"
                    radius={[8, 8, 0, 0]}
                    fill="url(#barGradient)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopList
          title="Top Vendors"
          icon={Building2}
          items={byVendor}
          total={totalRevenue}
        />
        <TopList
          title="Top Customers"
          icon={Users}
          items={byCustomer}
          total={totalRevenue}
        />
      </div>
    </div>
  );
}

function TopList({
  title,
  icon: Icon,
  items,
  total,
}: {
  title: string;
  icon: any;
  items: { name: string; total: number }[];
  total: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="px-6 pb-6 pt-0 text-sm text-[var(--foreground-muted)]">
            No data yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {items.map((item, idx) => {
              const pct = total > 0 ? (item.total / total) * 100 : 0;
              return (
                <div key={item.name} className="relative px-6 py-3">
                  <div
                    className="absolute inset-y-0 left-0 bg-[var(--accent-soft)]"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="tabular-nums text-xs font-medium text-[var(--foreground-subtle)]">
                        #{idx + 1}
                      </span>
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="tabular-nums text-sm font-semibold text-[var(--foreground)]">
                        {formatCurrency(item.total)}
                      </div>
                      <div className="text-xs text-[var(--foreground-subtle)]">
                        {pct.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
