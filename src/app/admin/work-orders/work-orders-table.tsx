"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList, Plus, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type {
  WorkOrderWithRelations,
  WorkOrderStatus,
} from "@/types/database";
import { cn } from "@/lib/utils";

const statuses: { label: string; value?: WorkOrderStatus }[] = [
  { label: "All" },
  { label: "Pending", value: "pending" },
  { label: "In Transit", value: "shipped" },
  { label: "Delivered", value: "delivered" },
];

export function WorkOrdersTable({
  data,
  activeStatus,
}: {
  data: WorkOrderWithRelations[];
  activeStatus?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (wo) =>
        wo.customer?.name?.toLowerCase().includes(q) ||
        wo.vendor?.name?.toLowerCase().includes(q) ||
        wo.driver?.name?.toLowerCase().includes(q) ||
        wo.notes?.toLowerCase().includes(q),
    );
  }, [data, search]);

  const columns: ColumnDef<WorkOrderWithRelations, any>[] = [
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="font-medium text-[var(--foreground)]">
          {row.original.customer?.name ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }) => (
        <div className="text-[var(--foreground-muted)]">
          {row.original.vendor?.name ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "driver",
      header: "Driver",
      cell: ({ row }) => (
        <div className="text-[var(--foreground-muted)]">
          {row.original.driver?.name ?? (
            <span className="text-[var(--foreground-subtle)]">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "delivery_date",
      header: "Delivery Date",
      cell: ({ row }) => (
        <div className="tabular-nums text-[var(--foreground-muted)]">
          {formatDate(row.original.delivery_date)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search customer, vendor, driver..."
        />
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-1">
          {statuses.map((s) => {
            const active = activeStatus === s.value || (!s.value && !activeStatus);
            return (
              <Link
                key={s.label}
                href={
                  s.value ? `/admin/work-orders?status=${s.value}` : "/admin/work-orders"
                }
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                )}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(wo) => router.push(`/admin/work-orders/${wo.id}`)}
        emptyState={
          <EmptyState
            icon={ClipboardList}
            title={search ? "No matching orders" : "No work orders yet"}
            description={
              search
                ? "Try a different search term."
                : "Create your first work order to get started."
            }
            action={
              !search && (
                <Link href="/admin/work-orders/new">
                  <Button variant="gradient">
                    <Plus className="h-4 w-4" />
                    New Work Order
                  </Button>
                </Link>
              )
            }
          />
        }
      />
    </div>
  );
}
