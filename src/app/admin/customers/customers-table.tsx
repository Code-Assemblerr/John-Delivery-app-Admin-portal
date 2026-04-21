"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Users, Plus, MapPin } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/types/database";

export function CustomersTable({ data }: { data: Customer[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q),
    );
  }, [data, search]);

  const columns: ColumnDef<Customer, any>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium text-[var(--foreground)]">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="max-w-md truncate text-[var(--foreground-muted)]">
          {row.original.address}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="tabular-nums text-[var(--foreground-muted)]">
          {row.original.phone}
        </div>
      ),
    },
    {
      id: "geocoded",
      header: "Geocoded",
      cell: ({ row }) =>
        row.original.latitude != null ? (
          <Badge variant="success">
            <MapPin className="h-3 w-3" />
            Yes
          </Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search name, address, phone..."
      />
      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(c) => router.push(`/admin/customers/${c.id}`)}
        emptyState={
          <EmptyState
            icon={Users}
            title={search ? "No matching customers" : "No customers yet"}
            description={
              search ? "Try a different search." : "Add your first customer."
            }
            action={
              !search && (
                <Link href="/admin/customers/new">
                  <Button variant="gradient">
                    <Plus className="h-4 w-4" />
                    New Customer
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
