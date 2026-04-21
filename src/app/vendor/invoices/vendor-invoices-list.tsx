"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Receipt, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv";
import { Download } from "lucide-react";

interface InvoiceRow {
  id: string;
  total_amount: number;
  item_total: number;
  addon_total: number;
  return_total: number;
  distance_charge: number;
  created_at: string;
  work_order: {
    id: string;
    delivery_date: string;
    customer: { name: string } | null;
  } | null;
}

interface MonthGroup {
  key: string;
  label: string;
  total: number;
  invoices: InvoiceRow[];
}

export function VendorInvoicesList({ data }: { data: InvoiceRow[] }) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const months = React.useMemo(() => {
    const map = new Map<string, MonthGroup>();
    for (const inv of data) {
      const d = new Date(inv.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      const existing = map.get(key) ?? {
        key,
        label,
        total: 0,
        invoices: [],
      };
      existing.total += Number(inv.total_amount ?? 0);
      existing.invoices.push(inv);
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [data]);

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = months.find((m) => m.key === thisMonthKey);
  const allTimeTotal = data.reduce(
    (s, i) => s + Number(i.total_amount ?? 0),
    0,
  );

  function toggleMonth(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function exportMonth(month: MonthGroup) {
    downloadCsv(
      `invoices-${month.key}.csv`,
      month.invoices.map((inv) => ({
        customer: inv.work_order?.customer?.name ?? "",
        delivery_date: inv.work_order?.delivery_date ?? "",
        item_total: inv.item_total,
        addon_total: inv.addon_total,
        return_total: inv.return_total,
        distance_charge: inv.distance_charge,
        total_amount: inv.total_amount,
        created_at: inv.created_at,
      })),
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            description="Invoices appear here after drivers mark orders delivered."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="All-time Revenue"
          value={formatCurrency(allTimeTotal)}
          icon={Receipt}
          tint="success"
        />
        <StatCard
          label="This Month"
          value={formatCurrency(thisMonth?.total ?? 0)}
          icon={Receipt}
          tint="accent"
        />
        <StatCard
          label="Total Invoices"
          value={data.length}
          icon={Receipt}
          tint="info"
        />
      </div>

      <div className="space-y-3">
        {months.map((m) => {
          const isOpen = expanded.has(m.key);
          return (
            <Card key={m.key}>
              <div className="flex items-center justify-between px-6 py-4 rounded-t-xl">
                <button
                  onClick={() => toggleMonth(m.key)}
                  className="flex flex-1 items-center gap-3 text-left transition-opacity hover:opacity-80 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-[var(--foreground-subtle)] transition-transform",
                      isOpen && "rotate-90",
                    )}
                  />
                  <div>
                    <div className="font-semibold text-[var(--foreground)]">
                      {m.label}
                    </div>
                    <div className="text-xs text-[var(--foreground-subtle)]">
                      {m.invoices.length} invoice
                      {m.invoices.length !== 1 && "s"}
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-lg font-bold text-gradient-accent">
                    {formatCurrency(m.total)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportMonth(m)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    CSV
                  </Button>
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-[var(--border)]">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--panel-elevated)]/50">
                      <tr>
                        <Th>Customer</Th>
                        <Th>Delivery</Th>
                        <Th className="text-right">Items</Th>
                        <Th className="text-right">Add-ons</Th>
                        <Th className="text-right">Returns</Th>
                        <Th className="text-right">Distance</Th>
                        <Th className="text-right">Total</Th>
                        <Th></Th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.invoices.map((inv) => (
                        <tr
                          key={inv.id}
                          className="border-t border-[var(--border)]"
                        >
                          <Td>{inv.work_order?.customer?.name ?? "—"}</Td>
                          <Td className="tabular-nums text-[var(--foreground-muted)]">
                            {formatDate(inv.work_order?.delivery_date)}
                          </Td>
                          <Td className="text-right tabular-nums">
                            {formatCurrency(inv.item_total)}
                          </Td>
                          <Td className="text-right tabular-nums">
                            {formatCurrency(inv.addon_total)}
                          </Td>
                          <Td className="text-right tabular-nums">
                            {formatCurrency(inv.return_total)}
                          </Td>
                          <Td className="text-right tabular-nums">
                            {formatCurrency(inv.distance_charge)}
                          </Td>
                          <Td className="text-right tabular-nums font-semibold">
                            {formatCurrency(inv.total_amount)}
                          </Td>
                          <Td>
                            {inv.work_order?.id && (
                              <Link
                                href={`/vendor/work-orders/${inv.work_order.id}`}
                              >
                                <Button variant="ghost" size="icon-sm">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            )}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-subtle)]",
        className,
      )}
    >
      {children}
    </th>
  );
}
function Td({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3 text-[var(--foreground)]", className)}>
      {children}
    </td>
  );
}
