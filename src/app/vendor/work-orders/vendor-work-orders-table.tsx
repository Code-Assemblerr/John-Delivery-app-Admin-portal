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
import { ClipboardList, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { WorkOrderWithRelations } from "@/types/database";

export function VendorWorkOrdersTable({
  data,
}: {
  data: WorkOrderWithRelations[];
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (wo) =>
        wo.customer?.name?.toLowerCase().includes(q) ||
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
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search customer, driver, notes..."
      />
      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(wo) => router.push(`/vendor/work-orders/${wo.id}`)}
        emptyState={
          <EmptyState
            icon={ClipboardList}
            title={search ? "No matching orders" : "No work orders yet"}
            description={
              search
                ? "Try a different search."
                : "Create your first work order."
            }
            action={
              !search && (
                <Link href="/vendor/work-orders/new">
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
